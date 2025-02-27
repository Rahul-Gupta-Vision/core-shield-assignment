package com.example.assignment.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@Builder
public class LatLng {
    double startLatitude;
    double startLongitude;
    double destLatitude;
    double destLongitude;
}
