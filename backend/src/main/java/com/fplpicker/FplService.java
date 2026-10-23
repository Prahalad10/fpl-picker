package com.fplpicker;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// All the "business logic" lives here: fetching FPL data, filtering and scoring.
// @Service makes Spring create one instance and inject it into the controller.
@Service
public class FplService {

    // FPL numbers positions 1-4; index 0 is unused
    private static final String[] POSITIONS = {"", "GKP", "DEF", "MID", "FWD"};
    private static final Duration CACHE_TIME = Duration.ofMinutes(30);
    // Premier League image server; files are named by the "code" fields in the FPL data
    private static final String IMAGES = "https://resources.premierleague.com/premierleague25";

    // HTTP client for the official (free, no key needed) FPL API
    private final RestClient fpl = RestClient.builder()
            .baseUrl("https://fantasy.premierleague.com/api")
            .defaultHeader("User-Agent", "fpl-picker")
            .build();

    // In-memory cache so we don't call FPL on every request
    private List<Player> players = List.of();
    private Map<Integer, String> teamNames = Map.of();
    private JsonNode fixtures;
    private Instant lastLoaded = Instant.EPOCH;

    // Re-download the data only if our copy is older than CACHE_TIME
    private synchronized void loadIfStale() {
        if (Instant.now().isBefore(lastLoaded.plus(CACHE_TIME))) return;

        // One big JSON with all teams and players
        JsonNode data = fpl.get().uri("/bootstrap-static/").retrieve().body(JsonNode.class);

        Map<Integer, String> teams = new HashMap<>();
        Map<Integer, String> badges = new HashMap<>();
        for (JsonNode t : data.get("teams")) {
            teams.put(t.get("id").asInt(), t.get("name").asString());
            badges.put(t.get("id").asInt(), IMAGES + "/badges/" + t.get("code").asInt() + ".svg");
        }

        List<Player> list = new ArrayList<>();
        for (JsonNode e : data.get("elements")) {
            int type = e.get("element_type").asInt();
            if (type > 4) continue; // skip anything that isn't a player

            int teamId = e.get("team").asInt();
            list.add(new Player(
                    e.get("id").asInt(),
                    e.get("web_name").asString(),
                    teamId,
                    teams.get(teamId),
                    POSITIONS[type],
                    e.get("now_cost").asInt() / 10.0,  // FPL stores 7.5m as 75
                    e.get("total_points").asInt(),
                    Double.parseDouble(e.get("form").asString()),
                    e.get("status").asString(),
                    e.get("news").asString(),
                    IMAGES + "/photos/players/110x140/" + e.get("code").asInt() + ".png",
                    badges.get(teamId)));
        }

        // Every match that hasn't been played yet
        fixtures = fpl.get().uri("/fixtures/?future=1").retrieve().body(JsonNode.class);
        teamNames = teams;
        players = list;
        lastLoaded = Instant.now();
    }

    public List<String> getTeams() {
        loadIfStale();
        return teamNames.values().stream().sorted().toList();
    }

    // Filters are optional (null means "don't filter"); returns the top 100
    public List<Player> getPlayers(String position, String team, Double maxPrice, String sort) {
        loadIfStale();
        Comparator<Player> order = switch (sort) {
            case "form" -> Comparator.comparingDouble(Player::form);
            case "price" -> Comparator.comparingDouble(Player::price);
            default -> Comparator.comparingInt(Player::totalPoints);
        };
        return players.stream()
                .filter(p -> position == null || p.position().equals(position))
                .filter(p -> team == null || p.team().equals(team))
                .filter(p -> maxPrice == null || p.price() <= maxPrice)
                .sorted(order.reversed()) // highest first
                .limit(100)
                .toList();
    }

    public Player getPlayer(int id) {
        loadIfStale();
        return players.stream()
                .filter(p -> p.id() == id)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found"));
    }

    // A team's next `count` matches, seen from that team's side
    public List<Fixture> getFixtures(int teamId, int count) {
        loadIfStale();
        List<Fixture> result = new ArrayList<>();
        for (JsonNode f : fixtures) {
            if (f.get("event").isNull()) continue; // postponed, no gameweek yet

            boolean home = f.get("team_h").asInt() == teamId;
            boolean away = f.get("team_a").asInt() == teamId;
            if (!home && !away) continue;

            int opponentId = home ? f.get("team_a").asInt() : f.get("team_h").asInt();
            int difficulty = home ? f.get("team_h_difficulty").asInt() : f.get("team_a_difficulty").asInt();
            result.add(new Fixture(f.get("event").asInt(), teamNames.get(opponentId), home, difficulty));

            if (result.size() == count) break;
        }
        return result;
    }

    // Score every available player in the position and budget, return the best 5
    public List<Recommendation> recommend(String position, double budget) {
        loadIfStale();
        List<Recommendation> result = new ArrayList<>();

        for (Player p : players) {
            if (!p.position().equals(position) || p.price() > budget || !p.status().equals("a")) continue;

            List<Fixture> next = getFixtures(p.teamId(), 3);
            double avgDifficulty = next.stream().mapToInt(Fixture::difficulty).average().orElse(3);
            double fixtureEase = 5 - avgDifficulty;           // 0 = very hard, 3 = very easy
            double pointsPerMillion = p.totalPoints() / p.price();

            // Simple weighted formula: recent form matters most, then value, then fixtures
            double score = 0.5 * p.form() + 0.3 * pointsPerMillion + 1.0 * fixtureEase;

            String reason = String.format("Form %.1f, %.1f pts per £m, avg fixture difficulty %.1f",
                    p.form(), pointsPerMillion, avgDifficulty);
            result.add(new Recommendation(p, Math.round(score * 10) / 10.0, reason, next));
        }

        result.sort(Comparator.comparingDouble(Recommendation::score).reversed());
        return result.subList(0, Math.min(5, result.size()));
    }
}
