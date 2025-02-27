# core-shield-assignment
Objective:
Develop a web application that utilizes OpenStreetMap to provide the following
functionalities:
1. Real-Time Routing: Calculate and display the estimated travel time and directions from
a moving point (e.g., a rider's current location) to a static destination point.
2. Closed Ares Definition: Allow users to define a closed area on the map by clicking to
create shapes such as triangles, polygons, etc.

# Tech Stack Used: Java, JavaScript, Spring, HTML, CSS
# Library used: Leaflet.js (For displaying map with help help of Openstreetmap API
# Grasshopper API (For calculating routes and calculating distance, time between two points).

# How to Run:
1. Clone this Repo -> (Make sure java is installed on system).
2. command:  .\mvnw.cmd spring-boot:run

# Run Via Docker
1.  .\mvnw clean package --> Run this command to create the jar file for project
2.  docker build -t assignment .
3.  docker run -p 8080:8080 assignment

# Browser window
![image](https://github.com/user-attachments/assets/cb4109c9-1b87-4cae-83c7-d59343007664)
