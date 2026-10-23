package com.fplpicker;

// A clean, simplified player we send to the frontend.
// A record is an immutable data class: Java generates the constructor,
// getters, equals and toString for us. Spring turns it into JSON automatically.
public record Player(
        int id,
        String name,
        int teamId,
        String team,
        String position,    // GKP, DEF, MID or FWD
        double price,       // in millions, e.g. 7.5
        int totalPoints,
        double form,        // average points over the last few gameweeks
        String status,      // "a" means available
        String news,        // injury or suspension note, empty if none
        String photo,       // URL of the player's headshot
        String badge        // URL of the club badge
) {}
