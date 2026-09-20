# ==========================================
# Stage 1: Build JAR with Maven & Eclipse Temurin JDK 17
# ==========================================
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package executable JAR
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# Stage 2: Lightweight Production JRE 17 Runtime
# ==========================================
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create a non-root user for container security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy built JAR from builder stage
COPY --from=builder --chown=appuser:appgroup /app/target/*.jar app.jar

# Create upload directory with proper permissions
RUN mkdir -p uploads && chown -R appuser:appgroup uploads

USER appuser

# Render dynamically sets $PORT (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
