package com.fplpicker;

// One upcoming match from a player's point of view.
public record Fixture(
        int gameweek,
        String opponent,
        boolean home,
        int difficulty      // 1 (easy) to 5 (hard), as rated by FPL
) {}
