# =============================================================
# Stage 1: Build
# Uses Maven with JDK 17 to compile source code and package
# the Spring Boot application into an executable JAR file.
# Dependencies are downloaded first (cached layer) to speed up
# subsequent builds when only source code changes.
# =============================================================
FROM maven:3.9-eclipse-temurin-17 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven project file first to leverage Docker layer caching
COPY pom.xml .

# Download all project dependencies (cached unless pom.xml changes)
RUN mvn dependency:go-offline -B

# Copy the application source code into the container
COPY src ./src

# Package the application into a JAR, skipping tests for faster builds
RUN mvn package -DskipTests -B

# =============================================================
# Stage 2: Run
# Uses a lightweight JRE-only image to run the application.
# Only the compiled JAR is copied from the build stage,
# resulting in a smaller and more secure production image.
# =============================================================
FROM eclipse-temurin:17-jre

# Set the working directory for the runtime container
WORKDIR /app

# Copy the packaged JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080 for the Spring Boot embedded Tomcat server
EXPOSE 8080

# Define the command to run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
