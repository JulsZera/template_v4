package utils

import "strings"

func DetectPlatform(userAgent string) string {

	ua := strings.ToLower(userAgent)

	switch {
	case strings.Contains(ua, "mobile"):
		return "mobile"
	case strings.Contains(ua, "android"):
		return "android"
	case strings.Contains(ua, "iphone"):
		return "ios"
	case strings.Contains(ua, "ipad"):
		return "tablet"
	case strings.Contains(ua, "windows"):
		return "desktop"
	case strings.Contains(ua, "macintosh"):
		return "desktop"
	case strings.Contains(ua, "linux"):
		return "desktop"
	case strings.Contains(ua, "bot"),
		strings.Contains(ua, "crawler"),
		strings.Contains(ua, "spider"):
		return "bot"
	default:
		return "unknown"
	}
}
