package io.github.satvikg7.nanometrics.statsservice.service;

import io.github.satvikg7.nanometrics.statsservice.dto.RealTimeStatsResponse;
import io.github.satvikg7.nanometrics.statsservice.dto.StatsResponse;
import io.github.satvikg7.nanometrics.statsservice.entity.AggregatedStats;
import io.github.satvikg7.nanometrics.statsservice.entity.AnalyticsEvent;
import io.github.satvikg7.nanometrics.statsservice.repository.AggregatedStatsRepository;
import io.github.satvikg7.nanometrics.statsservice.repository.AnalyticsEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatsService {

  private final AnalyticsEventRepository analyticsEventRepository;
  private final AggregatedStatsRepository aggregatedStatsRepository;

  public StatsResponse getStats(String websiteId, LocalDateTime startDate, LocalDateTime endDate) {
    log.info("--------------");
    log.info("Fetching stats for website: {} between {} and {}", websiteId, startDate, endDate);
    // log.info("count: {}", aggregatedStatsRepository.count());
    // log.info("data: {}", aggregatedStatsRepository.findAll());

    // Try to get aggregated stats first
    List<AggregatedStats> aggregatedStats = aggregatedStatsRepository
        .findByWebsiteIdAndPeriodStartAfterAndPeriodEndBefore(websiteId, startDate, endDate);
    if (!aggregatedStats.isEmpty()) {
      return buildStatsFromAggregated(websiteId, startDate, endDate, aggregatedStats);
    }

    log.info("No aggregated stats found. Fetching events instead.");
    // Fallback to raw events if no aggregated data
    List<AnalyticsEvent> events = analyticsEventRepository
        .findByWebsiteIdAndTimestampBetween(websiteId, startDate, endDate);

    return buildStatsFromEvents(websiteId, startDate, endDate, events);
  }

  public StatsResponse.SummaryStats getSummaryStats(String websiteId, LocalDateTime startDate, LocalDateTime endDate) {
    log.info("Fetching summary stats for website: {} between {} and {}", websiteId, startDate, endDate);

    List<AnalyticsEvent> events = analyticsEventRepository
        .findByWebsiteIdAndTimestampBetween(websiteId, startDate, endDate);

    long totalPageViews = events.size();
    long uniqueVisitors = events.stream()
        .map(AnalyticsEvent::getSessionId)
        .distinct()
        .count();

    long totalSessions = events.stream()
        .map(AnalyticsEvent::getSessionId)
        .distinct()
        .count();

    return new StatsResponse.SummaryStats(
        totalPageViews, uniqueVisitors, totalSessions, 0.0, 0.0 // Default values for now
    );
  }

  public List<StatsResponse.TimeSeriesData> getTimeSeriesStats(String websiteId, LocalDateTime startDate,
      LocalDateTime endDate) {
    log.info("Fetching timeseries stats for website: {} between {} and {}", websiteId, startDate, endDate);

    List<AnalyticsEvent> events = analyticsEventRepository
        .findByWebsiteIdAndTimestampBetween(websiteId, startDate, endDate);

    Map<String, List<AnalyticsEvent>> eventsByDate = events.stream()
        .collect(Collectors.groupingBy(event -> event.getTimestamp().toLocalDate().toString()));

    return eventsByDate.entrySet().stream()
        .map(entry -> {
          String date = entry.getKey();
          List<AnalyticsEvent> dayEvents = entry.getValue();
          long pageViews = dayEvents.size();
          long uniqueVisitors = dayEvents.stream()
              .map(AnalyticsEvent::getSessionId)
              .distinct()
              .count();
          long sessions = uniqueVisitors; // Simplified for now

          return new StatsResponse.TimeSeriesData(date, pageViews, uniqueVisitors, sessions);
        })
        .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
        .collect(Collectors.toList());
  }

  public RealTimeStatsResponse getRealTimeStats(String websiteId) {
    log.info("Fetching real-time stats for website: {}", websiteId);

    LocalDateTime now = LocalDateTime.now();
    LocalDateTime oneHourAgo = now.minusHours(1);
    LocalDateTime fifteenMinutesAgo = now.minusMinutes(15);

    // Get events from the last hour
    List<AnalyticsEvent> lastHourEvents = analyticsEventRepository
        .findByWebsiteIdAndTimestampBetween(websiteId, oneHourAgo, now);

    // Get events from the last 15 minutes for active users
    List<AnalyticsEvent> activeUserEvents = analyticsEventRepository
        .findByWebsiteIdAndTimestampBetween(websiteId, fifteenMinutesAgo, now);

    long activeUsers = activeUserEvents.stream()
        .map(AnalyticsEvent::getSessionId)
        .distinct()
        .count();

    long pageViewsLastHour = lastHourEvents.size();

    List<RealTimeStatsResponse.PageView> recentPageViews = lastHourEvents.stream()
        .limit(10)
        .map(event -> new RealTimeStatsResponse.PageView(
            event.getUrl(),
            "", // pageTitle not available in new schema
            event.getTimestamp(),
            event.getLocation() != null ? event.getLocation().getCountry() : "Unknown",
            event.getUserAgent() != null ? event.getUserAgent() : "Unknown"))
        .collect(Collectors.toList());

    List<String> topPagesRealTime = lastHourEvents.stream()
        .collect(Collectors.groupingBy(AnalyticsEvent::getUrl, Collectors.counting()))
        .entrySet().stream()
        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
        .limit(5)
        .map(Map.Entry::getKey)
        .collect(Collectors.toList());

    return new RealTimeStatsResponse(websiteId, activeUsers, pageViewsLastHour, recentPageViews, topPagesRealTime);
  }

  public Page<AnalyticsEvent> getEvents(String websiteId, LocalDateTime startDate, LocalDateTime endDate,
      Pageable pageable) {
    log.info("Fetching events for website: {} between {} and {}", websiteId, startDate, endDate);

    if (startDate != null && endDate != null) {
      return analyticsEventRepository.findByWebsiteIdAndTimestampBetween(websiteId, startDate, endDate, pageable);
    } else {
      return analyticsEventRepository.findByWebsiteId(websiteId, pageable);
    }
  }

  public List<AggregatedStats> getAggregatedStats(String websiteId, String periodType, LocalDate startDate,
      LocalDate endDate) {
    log.info("Fetching aggregated stats for website: {} with period: {} between {} and {}",
        websiteId, periodType, startDate, endDate);

    if (startDate != null && endDate != null) {
      return aggregatedStatsRepository.findByWebsiteIdAndAggregationTypeAndPeriodStartBetween(websiteId, periodType,
          startDate.atStartOfDay(), endDate.atStartOfDay());
    } else {
      return aggregatedStatsRepository.findByWebsiteIdAndAggregationType(websiteId, periodType);
    }
  }

  private StatsResponse buildStatsFromAggregated(String websiteId, LocalDateTime startDate, LocalDateTime endDate,
      List<AggregatedStats> aggregatedStats) {
    long totalPageViews = aggregatedStats.stream()
        .mapToLong(AggregatedStats::getPageviews)
        .sum();

    long uniqueVisitors = aggregatedStats.stream()
        .mapToLong(AggregatedStats::getUniqueVisitors)
        .sum();

    double avgBounceRate = aggregatedStats.stream()
        .mapToDouble(AggregatedStats::getBounceRate)
        .average()
        .orElse(0.0);

    double avgSessionDuration = aggregatedStats.stream()
        .mapToDouble(AggregatedStats::getAverageSessionDuration)
        .average()
        .orElse(0.0);

    StatsResponse.SummaryStats summary = new StatsResponse.SummaryStats(
        totalPageViews, uniqueVisitors, uniqueVisitors, avgSessionDuration, avgBounceRate);

    // Build time series from aggregated stats
    List<StatsResponse.TimeSeriesData> timeSeries = aggregatedStats.stream()
        .map(stat -> new StatsResponse.TimeSeriesData(
            stat.getPeriodStart().toLocalDate().toString(),
            stat.getPageviews(),
            stat.getUniqueVisitors(),
            stat.getUniqueVisitors() // Simplified
        ))
        .collect(Collectors.toList());

    // Convert aggregated maps to a list format
    List<StatsResponse.PageStats> topPages = convertTopPages(aggregatedStats);
    List<StatsResponse.ReferrerStats> topReferrers = convertTopReferrers(aggregatedStats);
    List<StatsResponse.CountryStats> topCountries = convertTopCountries(aggregatedStats);
    List<StatsResponse.DeviceStats> deviceStats = convertDeviceStats(aggregatedStats);

    return new StatsResponse(summary, timeSeries, topPages, topReferrers, topCountries, deviceStats, List.of());
  }

  private StatsResponse buildStatsFromEvents(String websiteId, LocalDateTime startDate, LocalDateTime endDate,
      List<AnalyticsEvent> events) {
    long totalPageViews = events.size();

    long uniqueVisitors = events.stream()
        .map(AnalyticsEvent::getSessionId)
        .distinct()
        .count();

    StatsResponse.SummaryStats summary = new StatsResponse.SummaryStats(
        totalPageViews, uniqueVisitors, uniqueVisitors, 0.0, 0.0 // Simplified calculations
    );

    // Build time series from events
    Map<String, List<AnalyticsEvent>> eventsByDate = events.stream()
        .collect(Collectors.groupingBy(event -> event.getTimestamp().toLocalDate().toString()));

    List<StatsResponse.TimeSeriesData> timeSeries = eventsByDate.entrySet().stream()
        .map(entry -> {
          String date = entry.getKey();
          List<AnalyticsEvent> dayEvents = entry.getValue();
          long pageViews = dayEvents.size();
          long visitors = dayEvents.stream()
              .map(AnalyticsEvent::getSessionId)
              .distinct()
              .count();

          return new StatsResponse.TimeSeriesData(date, pageViews, visitors, visitors);
        })
        .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
        .collect(Collectors.toList());

    // Convert event data to list format
    List<StatsResponse.PageStats> topPages = convertEventsToPageStats(events);
    List<StatsResponse.ReferrerStats> topReferrers = convertEventsToReferrerStats(events);
    List<StatsResponse.CountryStats> topCountries = convertEventsToCountryStats(events);
    List<StatsResponse.DeviceStats> deviceStats = convertEventsToDeviceStats(events);

    return new StatsResponse(summary, timeSeries, topPages, topReferrers, topCountries, deviceStats, List.of());
  }

  // Helper methods for converting aggregated data
  private List<StatsResponse.PageStats> convertTopPages(List<AggregatedStats> stats) {
    Map<String, Long> merged = new HashMap<>();
    stats.stream()
        .filter(stat -> stat.getTopPages() != null)
        .flatMap(stat -> stat.getTopPages().stream())
        .forEach(page -> merged.merge(page.getUrl(), page.getPageviews(), Long::sum));

    return merged.entrySet().stream()
        .map(entry -> new StatsResponse.PageStats(entry.getKey(), entry.getValue(), 0L, 0.0))
        .sorted((a, b) -> Long.compare(b.getViews(), a.getViews()))
        .limit(10)
        .collect(Collectors.toList());
  }

  private List<StatsResponse.ReferrerStats> convertTopReferrers(List<AggregatedStats> stats) {
    Map<String, Long> merged = new HashMap<>();
    stats.stream()
        .filter(stat -> stat.getTopReferrers() != null)
        .flatMap(stat -> stat.getTopReferrers().stream())
        .forEach(referrer -> merged.merge(referrer.getReferrer(), referrer.getCount(), Long::sum));

    long total = merged.values().stream().mapToLong(Long::longValue).sum();

    return merged.entrySet().stream()
        .map(entry -> new StatsResponse.ReferrerStats(
            entry.getKey(),
            entry.getValue(),
            total > 0 ? (entry.getValue() * 100.0 / total) : 0.0))
        .sorted((a, b) -> Long.compare(b.getVisits(), a.getVisits()))
        .limit(10)
        .collect(Collectors.toList());
  }

  private List<StatsResponse.CountryStats> convertTopCountries(List<AggregatedStats> stats) {
    Map<String, Long> merged = new HashMap<>();
    stats.stream()
        .filter(stat -> stat.getCountries() != null)
        .flatMap(stat -> stat.getCountries().stream())
        .forEach(country -> merged.merge(country.getCountry(), country.getCount(), Long::sum));

    long total = merged.values().stream().mapToLong(Long::longValue).sum();

    return merged.entrySet().stream()
        .map(entry -> new StatsResponse.CountryStats(
            entry.getKey(),
            entry.getValue(),
            total > 0 ? (entry.getValue() * 100.0 / total) : 0.0))
        .sorted((a, b) -> Long.compare(b.getVisits(), a.getVisits()))
        .limit(10)
        .collect(Collectors.toList());
  }

  private List<StatsResponse.DeviceStats> convertDeviceStats(List<AggregatedStats> stats) {
    Map<String, Long> merged = new HashMap<>();
    stats.stream()
        .filter(stat -> stat.getBrowsers() != null)
        .flatMap(stat -> stat.getBrowsers().stream())
        .forEach(browser -> merged.merge(browser.getBrowser(), browser.getCount(), Long::sum));

    long total = merged.values().stream().mapToLong(Long::longValue).sum();

    return merged.entrySet().stream()
        .map(entry -> new StatsResponse.DeviceStats(
            entry.getKey(),
            entry.getValue(),
            total > 0 ? (entry.getValue() * 100.0 / total) : 0.0))
        .sorted((a, b) -> Long.compare(b.getVisits(), a.getVisits()))
        .limit(10)
        .collect(Collectors.toList());
  }

  // Helper methods for converting event data
  private List<StatsResponse.PageStats> convertEventsToPageStats(List<AnalyticsEvent> events) {
    Map<String, Long> pageViews = events.stream()
        .collect(Collectors.groupingBy(AnalyticsEvent::getUrl, Collectors.counting()));

    return pageViews.entrySet().stream()
        .map(entry -> new StatsResponse.PageStats(entry.getKey(), entry.getValue(), 0L, 0.0))
        .sorted((a, b) -> Long.compare(b.getViews(), a.getViews()))
        .limit(10)
        .collect(Collectors.toList());
  }

  private List<StatsResponse.ReferrerStats> convertEventsToReferrerStats(List<AnalyticsEvent> events) {
    Map<String, Long> referrers = events.stream()
        .filter(event -> event.getReferrer() != null && !event.getReferrer().isEmpty())
        .collect(Collectors.groupingBy(AnalyticsEvent::getReferrer, Collectors.counting()));

    long total = referrers.values().stream().mapToLong(Long::longValue).sum();

    return referrers.entrySet().stream()
        .map(entry -> new StatsResponse.ReferrerStats(
            entry.getKey(),
            entry.getValue(),
            total > 0 ? (entry.getValue() * 100.0 / total) : 0.0))
        .sorted((a, b) -> Long.compare(b.getVisits(), a.getVisits()))
        .limit(10)
        .collect(Collectors.toList());
  }

  private List<StatsResponse.CountryStats> convertEventsToCountryStats(List<AnalyticsEvent> events) {
    Map<String, Long> countries = events.stream()
        .filter(event -> event.getLocation() != null && event.getLocation().getCountry() != null)
        .collect(Collectors.groupingBy(event -> event.getLocation().getCountry(), Collectors.counting()));

    long total = countries.values().stream().mapToLong(Long::longValue).sum();

    return countries.entrySet().stream()
        .map(entry -> new StatsResponse.CountryStats(
            entry.getKey(),
            entry.getValue(),
            total > 0 ? (entry.getValue() * 100.0 / total) : 0.0))
        .sorted((a, b) -> Long.compare(b.getVisits(), a.getVisits()))
        .limit(10)
        .collect(Collectors.toList());
  }

  private List<StatsResponse.DeviceStats> convertEventsToDeviceStats(List<AnalyticsEvent> events) {
    Map<String, Long> devices = events.stream()
        .filter(event -> event.getUserAgent() != null)
        .collect(
            Collectors.groupingBy(event -> extractBrowserFromUserAgent(event.getUserAgent()), Collectors.counting()));

    long total = devices.values().stream().mapToLong(Long::longValue).sum();

    return devices.entrySet().stream()
        .map(entry -> new StatsResponse.DeviceStats(
            entry.getKey(),
            entry.getValue(),
            total > 0 ? (entry.getValue() * 100.0 / total) : 0.0))
        .sorted((a, b) -> Long.compare(b.getVisits(), a.getVisits()))
        .limit(10)
        .collect(Collectors.toList());
  }

  // Helper method to extract browser from user agent
  private String extractBrowserFromUserAgent(String userAgent) {
    if (userAgent == null || userAgent.isEmpty()) {
      return "Unknown";
    }

    String lowerUserAgent = userAgent.toLowerCase();
    if (lowerUserAgent.contains("chrome"))
      return "Chrome";
    if (lowerUserAgent.contains("firefox"))
      return "Firefox";
    if (lowerUserAgent.contains("safari"))
      return "Safari";
    if (lowerUserAgent.contains("edge"))
      return "Edge";
    if (lowerUserAgent.contains("opera"))
      return "Opera";

    return "Other";
  }
}
