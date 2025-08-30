package io.github.satvikg7.nanometrics.statsservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "stats")
public class AggregatedStats {
    
    @Id
    private String id;
    
    @Field("websiteId")
    private String websiteId;
    
    @Field("periodStart")
    private LocalDateTime periodStart;
    
    @Field("periodEnd")
    private LocalDateTime periodEnd;
    
    @Field("aggregationType")
    private String aggregationType; // "5min", "hourly", "daily"
    
    // Page view metrics
    @Field("pageviews")
    private Long pageviews;
    
    @Field("uniqueVisitors")
    private Long uniqueVisitors;
    
    @Field("uniqueSessions")
    private Long uniqueSessions;
    
    // Event metrics
    @Field("events")
    private Long events;
    
    // Top pages
    @Field("topPages")
    private List<PageStats> topPages;
    
    // Top referrers
    @Field("topReferrers")
    private List<ReferrerStats> topReferrers;
    
    // Geographic data
    @Field("countries")
    private List<CountryStats> countries;
    
    // Device/Browser data
    @Field("browsers")
    private List<BrowserStats> browsers;
    
    @Field("screenSizes")
    private List<ScreenStats> screenSizes;
    
    @Field("languages")
    private List<LanguageStats> languages;
    
    // Session metrics
    @Field("averageSessionDuration")
    private Double averageSessionDuration;
    
    @Field("bounceRate")
    private Double bounceRate;
    
    // Timestamps
    @Field("createdAt")
    private LocalDateTime createdAt;
    
    @Field("updatedAt")
    private LocalDateTime updatedAt;
}
