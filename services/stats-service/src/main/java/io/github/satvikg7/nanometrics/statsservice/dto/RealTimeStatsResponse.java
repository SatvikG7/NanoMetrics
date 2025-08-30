package io.github.satvikg7.nanometrics.statsservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RealTimeStatsResponse {
  private String websiteId;
  private Long activeUsers;
  private Long pageViewsLastHour;
  private List<PageView> recentPageViews;
  private List<String> topPagesRealTime;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class PageView {
    private String url;
    private String pageTitle;
    private LocalDateTime timestamp;
    private String country;
    private String browser;
  }
}
