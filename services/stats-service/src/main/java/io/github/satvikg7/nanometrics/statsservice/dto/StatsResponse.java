package io.github.satvikg7.nanometrics.statsservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {
    private SummaryStats summary;
    private List<TimeSeriesData> timeSeries;
    private List<PageStats> topPages;
    private List<ReferrerStats> topReferrers;
    private List<CountryStats> topCountries;
    private List<DeviceStats> deviceStats;
    private List<EventStats> topEvents;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryStats {
        private Long totalPageViews;
        private Long uniqueVisitors;
        private Long totalSessions;
        private Double averageSessionDuration;
        private Double bounceRate;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSeriesData {
        private String date;
        private Long pageViews;
        private Long uniqueVisitors;
        private Long sessions;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageStats {
        private String url;
        private Long views;
        private Long uniqueVisitors;
        private Double averageTimeOnPage;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReferrerStats {
        private String referrer;
        private Long visits;
        private Double percentage;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CountryStats {
        private String country;
        private Long visits;
        private Double percentage;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviceStats {
        private String deviceType;
        private Long visits;
        private Double percentage;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventStats {
        private String eventName;
        private Long count;
        private Map<String, Object> additionalData;
    }
}
