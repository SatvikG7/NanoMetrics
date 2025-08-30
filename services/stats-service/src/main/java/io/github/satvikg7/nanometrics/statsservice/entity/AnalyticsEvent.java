package io.github.satvikg7.nanometrics.statsservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "analytics_events")
public class AnalyticsEvent {

  @Id
  private String id;

  // Core event data
  @Field("type")
  private String type;

  @Field("websiteId")
  private String websiteId;

  @Field("sessionId")
  private String sessionId;

  @Field("url")
  private String url;

  @Field("referrer")
  private String referrer;

  @Field("screenWidth")
  private Integer screenWidth;

  @Field("language")
  private String language;

  @Field("timestamp")
  private LocalDateTime timestamp;

  // Event-specific data (only for event type)
  @Field("name")
  private String name;

  @Field("data")
  private Map<String, Object> data;

  // Server-side enriched data
  @Field("serverTimestamp")
  private LocalDateTime serverTimestamp;

  @Field("userAgent")
  private String userAgent;

  @Field("ip")
  private String ip;

  @Field("originalIp")
  private String originalIp;

  @Field("location")
  private Location location;

  @Field("headers")
  private Map<String, Object> headers;

  // Processing metadata
  @Field("processedAt")
  private LocalDateTime processedAt;

  @Field("messageId")
  private String messageId;

  // MongoDB timestamps
  @Field("createdAt")
  private LocalDateTime createdAt;

  @Field("updatedAt")
  private LocalDateTime updatedAt;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Location {
    private String country;
    private String region;
    private String city;
    private String timezone;
    private Double latitude;
    private Double longitude;
    private String isp;
    private String org;
    private String asn;
  }
}
