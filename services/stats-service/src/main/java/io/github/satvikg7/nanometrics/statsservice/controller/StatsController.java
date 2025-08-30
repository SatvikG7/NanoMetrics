package io.github.satvikg7.nanometrics.statsservice.controller;

import io.github.satvikg7.nanometrics.statsservice.dto.RealTimeStatsResponse;
import io.github.satvikg7.nanometrics.statsservice.dto.StatsResponse;
import io.github.satvikg7.nanometrics.statsservice.entity.AggregatedStats;
import io.github.satvikg7.nanometrics.statsservice.entity.AnalyticsEvent;
import io.github.satvikg7.nanometrics.statsservice.service.StatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@Slf4j
public class StatsController {

  private final StatsService statsService;

  @GetMapping("/website/{websiteId}")
  public ResponseEntity<StatsResponse> getStats(
      @PathVariable String websiteId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

    log.info("Getting stats for website: {} from {} to {}", websiteId, startDate, endDate);

    // Default to last 30 days if no dates provided
    if (startDate == null || endDate == null) {
      endDate = LocalDateTime.now();
      startDate = endDate.minusDays(30);
    }

    StatsResponse stats = statsService.getStats(websiteId, startDate, endDate);
    return ResponseEntity.ok(stats);
  }

  // @GetMapping("/{siteId}")
  // public ResponseEntity<StatsResponse> getStatsBySiteId(
  // @PathVariable String siteId,
  // @RequestParam(required = false) @DateTimeFormat(iso =
  // DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
  // @RequestParam(required = false) @DateTimeFormat(iso =
  // DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
  //
  // log.info("Getting stats for site: {} from {} to {}", siteId, startDate,
  // endDate);
  //
  // // Default to last 30 days if no dates provided
  // if (startDate == null || endDate == null) {
  // endDate = LocalDateTime.now();
  // startDate = endDate.minusDays(30);
  // }
  //
  // StatsResponse stats = statsService.getStats(siteId, startDate, endDate);
  // return ResponseEntity.ok(stats);
  // }

  @GetMapping("/website/{websiteId}/summary")
  public ResponseEntity<StatsResponse.SummaryStats> getWebsiteSummary(
      @PathVariable String websiteId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

    log.info("Getting summary stats for website: {} from {} to {}", websiteId, startDate, endDate);

    // Default to last 30 days if no dates provided
    if (startDate == null || endDate == null) {
      endDate = LocalDateTime.now();
      startDate = endDate.minusDays(30);
    }

    StatsResponse.SummaryStats summary = statsService.getSummaryStats(websiteId, startDate, endDate);
    return ResponseEntity.ok(summary);
  }

  @GetMapping("/website/{websiteId}/timeseries")
  public ResponseEntity<List<StatsResponse.TimeSeriesData>> getWebsiteTimeSeries(
      @PathVariable String websiteId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

    log.info("Getting timeseries stats for website: {} from {} to {}", websiteId, startDate, endDate);

    // Default to last 30 days if no dates provided
    if (startDate == null || endDate == null) {
      endDate = LocalDateTime.now();
      startDate = endDate.minusDays(30);
    }

    List<StatsResponse.TimeSeriesData> timeSeries = statsService.getTimeSeriesStats(websiteId, startDate, endDate);
    return ResponseEntity.ok(timeSeries);
  }

  @GetMapping("/website/{websiteId}/realtime")
  public ResponseEntity<RealTimeStatsResponse> getRealTimeStats(@PathVariable String websiteId) {
    log.info("Getting real-time stats for website: {}", websiteId);

    RealTimeStatsResponse stats = statsService.getRealTimeStats(websiteId);
    return ResponseEntity.ok(stats);
  }

  @GetMapping("/website/{websiteId}/events")
  public ResponseEntity<Page<AnalyticsEvent>> getEvents(
      @PathVariable String websiteId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(defaultValue = "timestamp") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDirection) {

    log.info("Getting events for website: {} from {} to {}", websiteId, startDate, endDate);

    Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
    Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

    Page<AnalyticsEvent> events = statsService.getEvents(websiteId, startDate, endDate, pageable);
    return ResponseEntity.ok(events);
  }

  @GetMapping("/website/{websiteId}/aggregated")
  public ResponseEntity<List<AggregatedStats>> getAggregatedStats(
      @PathVariable String websiteId,
      @RequestParam(defaultValue = "daily") String periodType,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

    log.info("Getting aggregated stats for website: {} with period: {} from {} to {}",
        websiteId, periodType, startDate, endDate);

    // Default to last 30 days if no dates provided
    if (startDate == null || endDate == null) {
      endDate = LocalDate.now();
      startDate = endDate.minusDays(30);
    }

    List<AggregatedStats> stats = statsService.getAggregatedStats(websiteId, periodType, startDate, endDate);
    return ResponseEntity.ok(stats);
  }

  @GetMapping("/health")
  public ResponseEntity<String> health() {
    return ResponseEntity.ok("Stats Service is running");
  }
}
