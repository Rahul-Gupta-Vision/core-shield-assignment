package com.example.assignment.controllers;

import ch.qos.logback.classic.encoder.JsonEncoder;
import com.example.assignment.domain.LatLng;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.juli.JsonFormatter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class routeController {
    @Value("${Routes_API_KEY}")
    private String apiKey;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    @PostMapping("/route")
    public ResponseEntity<?> routController(@RequestBody LatLng latLng){
        double startLat = latLng.getStartLatitude();
        double startLong = latLng.getStartLongitude();
        double destLat = latLng.getDestLatitude();
        double destLong = latLng.getDestLongitude();

        String url = "https://graphhopper.com/api/1/route?point=" + startLat + "," + startLong +
                "&point=" + destLat + "," + destLong + "&vehicle=car&key=" + apiKey;
        String response = restTemplate.getForObject(url, String.class);
        try {
            // Convert the JSON response to a Map
            Map<String, Object> responseMap = objectMapper.readValue(response, Map.class);

            // Return the Map as JSON
            return new ResponseEntity<>(responseMap, HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>("Error parsing response", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
