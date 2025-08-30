package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AnalyticsEvent represents the analytics event document from MongoDB
type AnalyticsEvent struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Type            string             `bson:"type" json:"type"`
	WebsiteID       string             `bson:"websiteId" json:"websiteId"`
	SessionID       string             `bson:"sessionId" json:"sessionId"`
	URL             string             `bson:"url" json:"url"`
	Referrer        string             `bson:"referrer,omitempty" json:"referrer,omitempty"`
	ScreenWidth     *int               `bson:"screenWidth,omitempty" json:"screenWidth,omitempty"`
	Language        string             `bson:"language,omitempty" json:"language,omitempty"`
	Timestamp       time.Time          `bson:"timestamp" json:"timestamp"`
	Name            string             `bson:"name,omitempty" json:"name,omitempty"`
	Data            interface{}        `bson:"data,omitempty" json:"data,omitempty"`
	ServerTimestamp time.Time          `bson:"serverTimestamp" json:"serverTimestamp"`
	UserAgent       string             `bson:"userAgent,omitempty" json:"userAgent,omitempty"`
	IP              string             `bson:"ip" json:"ip"`
	OriginalIP      string             `bson:"originalIp,omitempty" json:"originalIp,omitempty"`
	Location        *Location          `bson:"location,omitempty" json:"location,omitempty"`
	Headers         interface{}        `bson:"headers,omitempty" json:"headers,omitempty"`
	ProcessedAt     time.Time          `bson:"processedAt" json:"processedAt"`
	MessageID       string             `bson:"messageId,omitempty" json:"messageId,omitempty"`
	CreatedAt       time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt       time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// Location represents the geographic location data
type Location struct {
	Country     *string      `bson:"country,omitempty" json:"country,omitempty"`
	Region      *string      `bson:"region,omitempty" json:"region,omitempty"`
	City        *string      `bson:"city,omitempty" json:"city,omitempty"`
	Timezone    *string      `bson:"timezone,omitempty" json:"timezone,omitempty"`
	Coordinates *Coordinates `bson:"coordinates,omitempty" json:"coordinates,omitempty"`
	IsPrivate   bool         `bson:"isPrivate" json:"isPrivate"`
}

// Coordinates represents latitude and longitude
type Coordinates struct {
	Latitude  float64 `bson:"latitude" json:"latitude"`
	Longitude float64 `bson:"longitude" json:"longitude"`
}

// AggregatedStats represents aggregated statistics for a time period
type AggregatedStats struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	WebsiteID       string             `bson:"websiteId" json:"websiteId"`
	PeriodStart     time.Time          `bson:"periodStart" json:"periodStart"`
	PeriodEnd       time.Time          `bson:"periodEnd" json:"periodEnd"`
	AggregationType string             `bson:"aggregationType" json:"aggregationType"` // "5min", "hourly", "daily"

	// Page view metrics
	Pageviews      int64 `bson:"pageviews" json:"pageviews"`
	UniqueVisitors int64 `bson:"uniqueVisitors" json:"uniqueVisitors"`
	UniqueSessions int64 `bson:"uniqueSessions" json:"uniqueSessions"`

	// Event metrics
	Events int64 `bson:"events" json:"events"`

	// Top pages
	TopPages []PageStats `bson:"topPages" json:"topPages"`

	// Top referrers
	TopReferrers []ReferrerStats `bson:"topReferrers" json:"topReferrers"`

	// Geographic data
	Countries []CountryStats `bson:"countries" json:"countries"`

	// Device/Browser data
	Browsers    []BrowserStats  `bson:"browsers" json:"browsers"`
	ScreenSizes []ScreenStats   `bson:"screenSizes" json:"screenSizes"`
	Languages   []LanguageStats `bson:"languages" json:"languages"`

	// Session metrics
	AverageSessionDuration float64 `bson:"averageSessionDuration" json:"averageSessionDuration"`
	BounceRate             float64 `bson:"bounceRate" json:"bounceRate"`

	// Timestamps
	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time `bson:"updatedAt" json:"updatedAt"`
}

// PageStats represents statistics for a specific page
type PageStats struct {
	URL       string `bson:"url" json:"url"`
	Pageviews int64  `bson:"pageviews" json:"pageviews"`
	Visitors  int64  `bson:"visitors" json:"visitors"`
}

// ReferrerStats represents statistics for referrers
type ReferrerStats struct {
	Referrer string `bson:"referrer" json:"referrer"`
	Count    int64  `bson:"count" json:"count"`
}

// CountryStats represents statistics by country
type CountryStats struct {
	Country string `bson:"country" json:"country"`
	Count   int64  `bson:"count" json:"count"`
}

// BrowserStats represents statistics by browser/user agent
type BrowserStats struct {
	Browser string `bson:"browser" json:"browser"`
	Count   int64  `bson:"count" json:"count"`
}

// ScreenStats represents statistics by screen size
type ScreenStats struct {
	ScreenWidth string `bson:"screenWidth" json:"screenWidth"`
	Count       int64  `bson:"count" json:"count"`
}

// LanguageStats represents statistics by language
type LanguageStats struct {
	Language string `bson:"language" json:"language"`
	Count    int64  `bson:"count" json:"count"`
}
