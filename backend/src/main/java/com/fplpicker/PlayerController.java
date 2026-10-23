package com.fplpicker;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Maps HTTP requests to Java methods. Return values are converted to JSON.
// The controller stays thin: it only reads request parameters and calls the service.
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${app.frontend-url}") // let the React app (another origin) call us
public class PlayerController {

    private final FplService fplService;

    // Constructor injection: Spring passes in the FplService it created
    public PlayerController(FplService fplService) {
        this.fplService = fplService;
    }

    // GET /api/teams
    @GetMapping("/teams")
    public List<String> teams() {
        return fplService.getTeams();
    }

    // GET /api/players?position=MID&team=Arsenal&maxPrice=8&sort=form
    @GetMapping("/players")
    public List<Player> players(@RequestParam(required = false) String position,
                                @RequestParam(required = false) String team,
                                @RequestParam(required = false) Double maxPrice,
                                @RequestParam(defaultValue = "points") String sort) {
        return fplService.getPlayers(position, team, maxPrice, sort);
    }

    // GET /api/players/123/fixtures
    @GetMapping("/players/{id}/fixtures")
    public List<Fixture> fixtures(@PathVariable int id) {
        Player player = fplService.getPlayer(id); // 404 if the id doesn't exist
        return fplService.getFixtures(player.teamId(), 5);
    }

    // GET /api/recommend?position=MID&budget=8
    @GetMapping("/recommend")
    public List<Recommendation> recommend(@RequestParam String position,
                                          @RequestParam double budget) {
        return fplService.recommend(position, budget);
    }
}
