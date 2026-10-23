# FPL Picker

A small web app that recommends Fantasy Premier League players.

- **Backend:** Java 17+ / Spring Boot 4 (REST API)
- **Frontend:** React 19 + Vite
- **Data:** the official FPL API (`fantasy.premierleague.com/api`), free and needs no key

## Features

1. **Players** – browse players, filter by position, team and max price, sort by points/form/price
2. **Recommend** – pick a position and budget, get the top 5 players by a simple score
3. **Player popup** – click any player to see their next 5 fixtures, colour-coded by difficulty
4. **Watchlist** – star players to save them (stored in the browser's localStorage)

## How it works

```
React (localhost:5173)  --HTTP/JSON-->  Spring Boot (localhost:8080)  --HTTP-->  FPL API
```

The browser can't call the FPL API directly (it blocks other websites via CORS),
so Spring Boot fetches the data, caches it for 30 minutes, filters/scores it,
and serves simple endpoints to React.

| Endpoint | Returns |
|---|---|
| `GET /api/teams` | Team names |
| `GET /api/players?position=MID&team=Arsenal&maxPrice=8&sort=form` | Up to 100 players |
| `GET /api/players/{id}/fixtures` | That player's next 5 fixtures |
| `GET /api/recommend?position=MID&budget=8` | Top 5 picks with score and reason |

**Recommendation score** (only available players within budget):

```
score = 0.5 × form + 0.3 × (total points ÷ price) + 1.0 × (5 − average difficulty of next 3 fixtures)
```

## Project structure

```
fpl-picker/
├── backend/
│   ├── pom.xml                          Maven build file (dependencies)
│   ├── mvnw, mvnw.cmd, .mvn/            Maven Wrapper (no Maven install needed)
│   └── src/main/
│       ├── resources/application.properties
│       └── java/com/fplpicker/
│           ├── FplPickerApplication.java  starts the server
│           ├── PlayerController.java      HTTP endpoints
│           ├── FplService.java            fetching, caching, filtering, scoring
│           ├── Player.java                data records sent as JSON
│           ├── Fixture.java
│           └── Recommendation.java
└── frontend/
    ├── index.html
    └── src/
        ├── main.jsx                    mounts React
        ├── App.jsx                     tabs, watchlist state, popup
        ├── api.js                      one helper to call the backend
        ├── index.css
        └── components/
            ├── Players.jsx             filters + table
            ├── PlayerTable.jsx         reusable table
            ├── Recommend.jsx           recommendation form + cards
            ├── PlayerDetail.jsx        popup with fixtures
            └── FixtureList.jsx         coloured fixture chips
```

## Running locally

You need **JDK 17 or newer** and **Node.js 20+**. Maven does not need to be installed:
the Maven Wrapper (`mvnw` / `mvnw.cmd`) downloads it automatically on first run.

```
java -version
node -v
```

Terminal 1 – backend:

```
cd backend
.\mvnw.cmd spring-boot:run      # Windows PowerShell
./mvnw spring-boot:run           # macOS / Linux
```

Test it in the browser: http://localhost:8080/api/recommend?position=MID&budget=8

Terminal 2 – frontend:

```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173
