package com.fplpicker;

import java.util.List;

// A recommended player plus why they were picked.
public record Recommendation(
        Player player,
        double score,
        String reason,
        List<Fixture> nextFixtures
) {}
