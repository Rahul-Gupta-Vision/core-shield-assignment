FROM openjdk:17-jdk-alpine
WORKDIR /app
COPY target/assignment-0.0.1-SNAPSHOT.jar /app/assignment-0.0.1-SNAPSHOT.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "assignment-0.0.1-SNAPSHOT.jar"]