package com.fplpicker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Entry point: starts the embedded web server and scans this package for
// @RestController and @Service classes.
@SpringBootApplication
public class FplPickerApplication {
    public static void main(String[] args) {
        SpringApplication.run(FplPickerApplication.class, args);
    }
}
