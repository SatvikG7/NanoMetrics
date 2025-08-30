package io.github.satvikg7.nanometrics.apigateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {

  @Value("${AUTH_SERVICE_URL:http://localhost:8081}")
  private String authServiceUrl;

  @Value("${PRODUCER_SERVICE_URL:http://localhost:8082}")
  private String producerServiceUrl;

  @Value("${CONSUMER_SERVICE_URL:http://localhost:8083}")
  private String consumerServiceUrl;

  @Value("${STATS_SERVICE_URL:http://localhost:8085}")
  private String statsServiceUrl;

  @Bean
  public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
    return builder.routes()
        .route("auth-service", r -> r.path("/api/auth/**")
            .uri(authServiceUrl))
        .route("sites-service", r -> r.path("/api/sites/**")
            .uri(authServiceUrl))
        .route("producer-service", r -> r.path("/track/**")
            .uri(producerServiceUrl))
        .route("consumer-service", r -> r.path("/api/events/**")
            .uri(consumerServiceUrl))
        .route("stats-service", r -> r.path("/api/stats/**")
            .uri(statsServiceUrl))
        .build();
  }
}
