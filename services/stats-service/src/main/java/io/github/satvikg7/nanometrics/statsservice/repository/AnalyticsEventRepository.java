package io.github.satvikg7.nanometrics.statsservice.repository;

import io.github.satvikg7.nanometrics.statsservice.entity.AnalyticsEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnalyticsEventRepository extends MongoRepository<AnalyticsEvent, String> {

  List<AnalyticsEvent> findByWebsiteId(String websiteId);

  List<AnalyticsEvent> findByWebsiteIdAndTimestampBetween(String websiteId, LocalDateTime start, LocalDateTime end);

  Page<AnalyticsEvent> findByWebsiteId(String websiteId, Pageable pageable);

  Page<AnalyticsEvent> findByWebsiteIdAndTimestampBetween(String websiteId, LocalDateTime start, LocalDateTime end,
      Pageable pageable);

  @Query("{ 'websiteId': ?0, 'type': ?1 }")
  List<AnalyticsEvent> findByWebsiteIdAndType(String websiteId, String type);

  @Query("{ 'websiteId': ?0, 'type': ?1, 'timestamp': { $gte: ?2, $lte: ?3 } }")
  List<AnalyticsEvent> findByWebsiteIdAndTypeAndTimestampBetween(
      String websiteId, String type, LocalDateTime start, LocalDateTime end);

  @Query(value = "{ 'websiteId': ?0, 'timestamp': { $gte: ?1, $lte: ?2 } }", count = true)
  long countByWebsiteIdAndTimestampBetween(String websiteId, LocalDateTime start, LocalDateTime end);

  @Query("{ 'websiteId': ?0, 'timestamp': { $gte: ?1, $lte: ?2 } }")
  List<AnalyticsEvent> findDistinctUsersByWebsiteIdAndTimestampBetween(String websiteId, LocalDateTime start,
      LocalDateTime end);

  @Query("{ 'websiteId': ?0, 'sessionId': ?1 }")
  List<AnalyticsEvent> findByWebsiteIdAndSessionId(String websiteId, String sessionId);

  @Query("{ 'websiteId': ?0, 'type': 'pageview', 'timestamp': { $gte: ?1, $lte: ?2 } }")
  List<AnalyticsEvent> findPageviewsByWebsiteIdAndTimestampBetween(String websiteId, LocalDateTime start,
      LocalDateTime end);

  @Query("{ 'websiteId': ?0, 'type': 'event', 'timestamp': { $gte: ?1, $lte: ?2 } }")
  List<AnalyticsEvent> findEventsByWebsiteIdAndTimestampBetween(String websiteId, LocalDateTime start,
      LocalDateTime end);
}
