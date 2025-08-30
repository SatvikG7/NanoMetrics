package io.github.satvikg7.nanometrics.statsservice.repository;

import io.github.satvikg7.nanometrics.statsservice.entity.AggregatedStats;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AggregatedStatsRepository extends MongoRepository<AggregatedStats, String> {

  List<AggregatedStats> findByWebsiteId(String websiteId);

  List<AggregatedStats> findByWebsiteIdAndAggregationType(String websiteId, String aggregationType);

  List<AggregatedStats> findByWebsiteIdAndPeriodStartAfterAndPeriodEndBefore(String websiteId, LocalDateTime periodStartAfter, LocalDateTime periodEndBefore);

  List<AggregatedStats> findByWebsiteIdAndAggregationTypeAndPeriodStartBetween(
      String websiteId, String aggregationType, LocalDateTime start, LocalDateTime end);

  Optional<AggregatedStats> findByWebsiteIdAndPeriodStartAndAggregationType(String websiteId, LocalDateTime periodStart,
      String aggregationType);

  @Query("{ 'websiteId': ?0, 'aggregationType': ?1, 'periodStart': { $gte: ?2, $lte: ?3 } }")
  List<AggregatedStats> findRecentStats(String websiteId, String aggregationType, LocalDateTime start,
      LocalDateTime end);
}
