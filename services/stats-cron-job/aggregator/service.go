package aggregator

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/satvikg7/nanometrics/stats-cron-job/config"
	"github.com/satvikg7/nanometrics/stats-cron-job/database"
	"github.com/satvikg7/nanometrics/stats-cron-job/models"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
)

// Service handles stats-cron-job of analytics data
type Service struct {
	db     *database.Client
	config *config.Config
	logger *logrus.Logger
}

// NewService creates a new stats-cron-job service
func NewService(db *database.Client, cfg *config.Config, logger *logrus.Logger) *Service {
	return &Service{
		db:     db,
		config: cfg,
		logger: logger,
	}
}

// AggregateData performs data stats-cron-job for the specified time period
func (s *Service) AggregateData(ctx context.Context) error {
	now := time.Now()
	periodEnd := now.Truncate(s.config.AggregationWindow)
	periodStart := periodEnd.Add(-s.config.AggregationWindow)

	s.logger.WithFields(logrus.Fields{
		"periodStart": periodStart,
		"periodEnd":   periodEnd,
	}).Info("Starting data stats-cron-job")

	// Get list of unique websites that have events in this period
	websites, err := s.getWebsitesWithEvents(ctx, periodStart, periodEnd)
	if err != nil {
		return fmt.Errorf("failed to get websites with events: %w", err)
	}

	s.logger.WithField("websiteCount", len(websites)).Info("Found websites with events")

	// Aggregate data for each website
	for _, websiteID := range websites {
		if err := s.aggregateWebsiteData(ctx, websiteID, periodStart, periodEnd); err != nil {
			s.logger.WithError(err).WithField("websiteId", websiteID).Error("Failed to aggregate data for website")
			continue
		}
	}

	s.logger.Info("Data stats-cron-job completed successfully")
	return nil
}

// getWebsitesWithEvents returns a list of website IDs that have events in the specified period
func (s *Service) getWebsitesWithEvents(ctx context.Context, start, end time.Time) ([]string, error) {
	collection := s.db.GetCollection("analytics_events")

	pipeline := []bson.M{
		{
			"$match": bson.M{
				"serverTimestamp": bson.M{
					"$gte": start,
					"$lt":  end,
				},
			},
		},
		{
			"$group": bson.M{
				"_id": "$websiteId",
			},
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var websites []string
	for cursor.Next(ctx) {
		var result struct {
			ID string `bson:"_id"`
		}
		if err := cursor.Decode(&result); err != nil {
			continue
		}
		websites = append(websites, result.ID)
	}

	return websites, cursor.Err()
}

// aggregateWebsiteData aggregates data for a specific website
func (s *Service) aggregateWebsiteData(ctx context.Context, websiteID string, start, end time.Time) error {
	s.logger.WithField("websiteId", websiteID).Info("Aggregating data for website")

	// Check if stats-cron-job already exists
	if exists, err := s.aggregationExists(ctx, websiteID, start, end); err != nil {
		return err
	} else if exists {
		s.logger.WithField("websiteId", websiteID).Info("Aggregation already exists, skipping")
		return nil
	}

	stats := &models.AggregatedStats{
		WebsiteID:       websiteID,
		PeriodStart:     start,
		PeriodEnd:       end,
		AggregationType: "5min",
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// Aggregate basic metrics
	if err := s.aggregateBasicMetrics(ctx, stats); err != nil {
		return fmt.Errorf("failed to aggregate basic metrics: %w", err)
	}

	// Aggregate top pages
	if err := s.aggregateTopPages(ctx, stats); err != nil {
		return fmt.Errorf("failed to aggregate top pages: %w", err)
	}

	// Aggregate top referrers
	if err := s.aggregateTopReferrers(ctx, stats); err != nil {
		return fmt.Errorf("failed to aggregate top referrers: %w", err)
	}

	// Aggregate geographic data
	if err := s.aggregateGeographicData(ctx, stats); err != nil {
		return fmt.Errorf("failed to aggregate geographic data: %w", err)
	}

	// Aggregate device/browser data
	if err := s.aggregateDeviceData(ctx, stats); err != nil {
		return fmt.Errorf("failed to aggregate device data: %w", err)
	}

	// Aggregate session metrics
	if err := s.aggregateSessionMetrics(ctx, stats); err != nil {
		return fmt.Errorf("failed to aggregate session metrics: %w", err)
	}

	// Save aggregated stats
	if err := s.saveAggregatedStats(ctx, stats); err != nil {
		return fmt.Errorf("failed to save aggregated stats: %w", err)
	}

	s.logger.WithField("websiteId", websiteID).Info("Successfully aggregated data for website")
	return nil
}

// aggregationExists checks if stats-cron-job already exists for the given parameters
func (s *Service) aggregationExists(ctx context.Context, websiteID string, start, end time.Time) (bool, error) {
	collection := s.db.GetCollection("stats")

	filter := bson.M{
		"websiteId":       websiteID,
		"periodStart":     start,
		"periodEnd":       end,
		"aggregationType": "5min",
	}

	count, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// aggregateBasicMetrics aggregates basic metrics like pageviews, unique visitors, etc.
func (s *Service) aggregateBasicMetrics(ctx context.Context, stats *models.AggregatedStats) error {
	collection := s.db.GetCollection("analytics_events")

	pipeline := []bson.M{
		{
			"$match": bson.M{
				"websiteId": stats.WebsiteID,
				"serverTimestamp": bson.M{
					"$gte": stats.PeriodStart,
					"$lt":  stats.PeriodEnd,
				},
			},
		},
		{
			"$group": bson.M{
				"_id": nil,
				"pageviews": bson.M{
					"$sum": bson.M{
						"$cond": bson.M{
							"if":   bson.M{"$eq": []interface{}{"$type", "pageview"}},
							"then": 1,
							"else": 0,
						},
					},
				},
				"events": bson.M{
					"$sum": bson.M{
						"$cond": bson.M{
							"if":   bson.M{"$eq": []interface{}{"$type", "event"}},
							"then": 1,
							"else": 0,
						},
					},
				},
				"uniqueVisitors": bson.M{"$addToSet": "$ip"},
				"uniqueSessions": bson.M{"$addToSet": "$sessionId"},
			},
		},
		{
			"$project": bson.M{
				"pageviews":      1,
				"events":         1,
				"uniqueVisitors": bson.M{"$size": "$uniqueVisitors"},
				"uniqueSessions": bson.M{"$size": "$uniqueSessions"},
			},
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	if cursor.Next(ctx) {
		var result struct {
			Pageviews      int64 `bson:"pageviews"`
			Events         int64 `bson:"events"`
			UniqueVisitors int64 `bson:"uniqueVisitors"`
			UniqueSessions int64 `bson:"uniqueSessions"`
		}
		if err := cursor.Decode(&result); err != nil {
			return err
		}

		stats.Pageviews = result.Pageviews
		stats.Events = result.Events
		stats.UniqueVisitors = result.UniqueVisitors
		stats.UniqueSessions = result.UniqueSessions
	}

	return nil
}

// aggregateTopPages aggregates top pages by pageviews
func (s *Service) aggregateTopPages(ctx context.Context, stats *models.AggregatedStats) error {
	collection := s.db.GetCollection("analytics_events")

	pipeline := []bson.M{
		{
			"$match": bson.M{
				"websiteId": stats.WebsiteID,
				"type":      "pageview",
				"serverTimestamp": bson.M{
					"$gte": stats.PeriodStart,
					"$lt":  stats.PeriodEnd,
				},
			},
		},
		{
			"$group": bson.M{
				"_id":       "$url",
				"pageviews": bson.M{"$sum": 1},
				"visitors":  bson.M{"$addToSet": "$ip"},
			},
		},
		{
			"$project": bson.M{
				"url":       "$_id",
				"pageviews": 1,
				"visitors":  bson.M{"$size": "$visitors"},
			},
		},
		{
			"$sort": bson.M{"pageviews": -1},
		},
		{
			"$limit": 10,
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	var topPages []models.PageStats
	for cursor.Next(ctx) {
		var page models.PageStats
		if err := cursor.Decode(&page); err != nil {
			continue
		}
		topPages = append(topPages, page)
	}

	stats.TopPages = topPages
	return nil
}

// aggregateTopReferrers aggregates top referrers
func (s *Service) aggregateTopReferrers(ctx context.Context, stats *models.AggregatedStats) error {
	collection := s.db.GetCollection("analytics_events")

	pipeline := []bson.M{
		{
			"$match": bson.M{
				"websiteId": stats.WebsiteID,
				"type":      "pageview",
				"referrer":  bson.M{"$ne": ""},
				"serverTimestamp": bson.M{
					"$gte": stats.PeriodStart,
					"$lt":  stats.PeriodEnd,
				},
			},
		},
		{
			"$group": bson.M{
				"_id":   "$referrer",
				"count": bson.M{"$sum": 1},
			},
		},
		{
			"$project": bson.M{
				"referrer": "$_id",
				"count":    1,
			},
		},
		{
			"$sort": bson.M{"count": -1},
		},
		{
			"$limit": 10,
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	var topReferrers []models.ReferrerStats
	for cursor.Next(ctx) {
		var referrer models.ReferrerStats
		if err := cursor.Decode(&referrer); err != nil {
			continue
		}
		topReferrers = append(topReferrers, referrer)
	}

	stats.TopReferrers = topReferrers
	return nil
}

// aggregateGeographicData aggregates geographic data
func (s *Service) aggregateGeographicData(ctx context.Context, stats *models.AggregatedStats) error {
	collection := s.db.GetCollection("analytics_events")

	pipeline := []bson.M{
		{
			"$match": bson.M{
				"websiteId":        stats.WebsiteID,
				"location.country": bson.M{"$ne": nil},
				"serverTimestamp": bson.M{
					"$gte": stats.PeriodStart,
					"$lt":  stats.PeriodEnd,
				},
			},
		},
		{
			"$group": bson.M{
				"_id":   "$location.country",
				"count": bson.M{"$sum": 1},
			},
		},
		{
			"$project": bson.M{
				"country": "$_id",
				"count":   1,
			},
		},
		{
			"$sort": bson.M{"count": -1},
		},
		{
			"$limit": 10,
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	var countries []models.CountryStats
	for cursor.Next(ctx) {
		var country models.CountryStats
		if err := cursor.Decode(&country); err != nil {
			continue
		}
		countries = append(countries, country)
	}

	stats.Countries = countries
	return nil
}

// aggregateDeviceData aggregates device and browser data
func (s *Service) aggregateDeviceData(ctx context.Context, stats *models.AggregatedStats) error {
	// Aggregate browsers
	if err := s.aggregateBrowsers(ctx, stats); err != nil {
		return err
	}

	// Aggregate screen sizes
	if err := s.aggregateScreenSizes(ctx, stats); err != nil {
		return err
	}

	// Aggregate languages
	if err := s.aggregateLanguages(ctx, stats); err != nil {
		return err
	}

	return nil
}

// aggregateBrowsers aggregates browser data from user agents
func (s *Service) aggregateBrowsers(ctx context.Context, stats *models.AggregatedStats) error {
	collection := s.db.GetCollection("analytics_events")

	pipeline := []bson.M{
		{
			"$match": bson.M{
				"websiteId": stats.WebsiteID,
				"userAgent": bson.M{"$ne": ""},
				"serverTimestamp": bson.M{
					"$gte": stats.PeriodStart,
					"$lt":  stats.PeriodEnd,
				},
			},
		},
		{
			"$group": bson.M{
				"_id":   "$userAgent",
				"count": bson.M{"$sum": 1},
			},
		},
		{
			"$project": bson.M{
				"browser": "$_id",
				"count":   1,
			},
		},
		{
			"$sort": bson.M{"count": -1},
		},
		{
			"$limit": 10,
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	var browsers []models.BrowserStats
	for cursor.Next(ctx) {
		var result struct {
			Browser string `bson:"browser"`
			Count   int64  `bson:"count"`
		}
		if err := cursor.Decode(&result); err != nil {
			continue
		}

		// Extract browser name from user agent (simplified)
		browserName := extractBrowserName(result.Browser)
		browsers = append(browsers, models.BrowserStats{
			Browser: browserName,
			Count:   result.Count,
		})
	}

	stats.Browsers = browsers
	return nil
}

// aggregateScreenSizes aggregates screen size data
func (s *Service) aggregateScreenSizes(ctx context.Context, stats *models.AggregatedStats) error {
	collection := s.db.GetCollection("analytics_events")

	pipeline := []bson.M{
		{
			"$match": bson.M{
				"websiteId":   stats.WebsiteID,
				"screenWidth": bson.M{"$ne": nil},
				"serverTimestamp": bson.M{
					"$gte": stats.PeriodStart,
					"$lt":  stats.PeriodEnd,
				},
			},
		},
		{
			"$group": bson.M{
				"_id":   "$screenWidth",
				"count": bson.M{"$sum": 1},
			},
		},
		{
			"$project": bson.M{
				"screenWidth": bson.M{"$toString": "$_id"},
				"count":       1,
			},
		},
		{
			"$sort": bson.M{"count": -1},
		},
		{
			"$limit": 10,
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	var screenSizes []models.ScreenStats
	for cursor.Next(ctx) {
		var screen models.ScreenStats
		if err := cursor.Decode(&screen); err != nil {
			continue
		}
		screenSizes = append(screenSizes, screen)
	}

	stats.ScreenSizes = screenSizes
	return nil
}

// aggregateLanguages aggregates language data
func (s *Service) aggregateLanguages(ctx context.Context, stats *models.AggregatedStats) error {
	collection := s.db.GetCollection("analytics_events")

	pipeline := []bson.M{
		{
			"$match": bson.M{
				"websiteId": stats.WebsiteID,
				"language":  bson.M{"$ne": ""},
				"serverTimestamp": bson.M{
					"$gte": stats.PeriodStart,
					"$lt":  stats.PeriodEnd,
				},
			},
		},
		{
			"$group": bson.M{
				"_id":   "$language",
				"count": bson.M{"$sum": 1},
			},
		},
		{
			"$project": bson.M{
				"language": "$_id",
				"count":    1,
			},
		},
		{
			"$sort": bson.M{"count": -1},
		},
		{
			"$limit": 10,
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	var languages []models.LanguageStats
	for cursor.Next(ctx) {
		var language models.LanguageStats
		if err := cursor.Decode(&language); err != nil {
			continue
		}
		languages = append(languages, language)
	}

	stats.Languages = languages
	return nil
}

// aggregateSessionMetrics aggregates session-related metrics
func (s *Service) aggregateSessionMetrics(ctx context.Context, stats *models.AggregatedStats) error {
	collection := s.db.GetCollection("analytics_events")

	// Calculate average session duration and bounce rate
	pipeline := []bson.M{
		{
			"$match": bson.M{
				"websiteId": stats.WebsiteID,
				"serverTimestamp": bson.M{
					"$gte": stats.PeriodStart,
					"$lt":  stats.PeriodEnd,
				},
			},
		},
		{
			"$group": bson.M{
				"_id":        "$sessionId",
				"events":     bson.M{"$sum": 1},
				"firstEvent": bson.M{"$min": "$serverTimestamp"},
				"lastEvent":  bson.M{"$max": "$serverTimestamp"},
			},
		},
		{
			"$project": bson.M{
				"events": 1,
				"duration": bson.M{
					"$subtract": []interface{}{"$lastEvent", "$firstEvent"},
				},
			},
		},
		{
			"$group": bson.M{
				"_id":           nil,
				"totalSessions": bson.M{"$sum": 1},
				"bouncedSessions": bson.M{
					"$sum": bson.M{
						"$cond": bson.M{
							"if":   bson.M{"$eq": []interface{}{"$events", 1}},
							"then": 1,
							"else": 0,
						},
					},
				},
				"totalDuration": bson.M{"$sum": "$duration"},
			},
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	if cursor.Next(ctx) {
		var result struct {
			TotalSessions   int64 `bson:"totalSessions"`
			BouncedSessions int64 `bson:"bouncedSessions"`
			TotalDuration   int64 `bson:"totalDuration"`
		}
		if err := cursor.Decode(&result); err != nil {
			return err
		}

		if result.TotalSessions > 0 {
			stats.BounceRate = float64(result.BouncedSessions) / float64(result.TotalSessions) * 100
			stats.AverageSessionDuration = float64(result.TotalDuration) / float64(result.TotalSessions) / 1000 // Convert to seconds
		}
	}

	return nil
}

// saveAggregatedStats saves the aggregated statistics to the database
func (s *Service) saveAggregatedStats(ctx context.Context, stats *models.AggregatedStats) error {
	collection := s.db.GetCollection("stats")

	_, err := collection.InsertOne(ctx, stats)
	if err != nil {
		return err
	}

	s.logger.WithFields(logrus.Fields{
		"websiteId":      stats.WebsiteID,
		"periodStart":    stats.PeriodStart,
		"periodEnd":      stats.PeriodEnd,
		"pageviews":      stats.Pageviews,
		"uniqueVisitors": stats.UniqueVisitors,
		"uniqueSessions": stats.UniqueSessions,
	}).Info("Saved aggregated statistics")

	return nil
}

// extractBrowserName extracts browser name from user agent string (simplified)
func extractBrowserName(userAgent string) string {
	userAgent = strings.ToLower(userAgent)

	if strings.Contains(userAgent, "chrome") {
		return "Chrome"
	} else if strings.Contains(userAgent, "firefox") {
		return "Firefox"
	} else if strings.Contains(userAgent, "safari") {
		return "Safari"
	} else if strings.Contains(userAgent, "edge") {
		return "Edge"
	} else if strings.Contains(userAgent, "opera") {
		return "Opera"
	} else {
		return "Other"
	}
}
