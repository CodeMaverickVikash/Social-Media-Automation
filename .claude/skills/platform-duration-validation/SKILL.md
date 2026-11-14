---
name: platform-duration-validation
description: "Dynamically calculate and validate the maximum publishable video duration across Instagram, Facebook, and WhatsApp based on official platform limits, API restrictions, and processing capabilities."
---

# Platform Duration Validation — Monavi Collection

Reusable service to dynamically calculate the maximum technically publishable video duration across Instagram, Facebook, and WhatsApp.

## Master Formula

```text
Maximum Video Duration = MIN(
  Platform Duration Limit,
  Publishing API Limit,
  Video Generation Capability,
  Processing Limit
)
```

## Platform Specifications

| Platform & Format | Native Limit | API Limit | Recommended Sweetspot | Aspect Ratio | Max Payload | Publishing Channel |
|---|---|---|---|---|---|---|
| **Instagram Reel** | 90s | 90s | 15s–30s | 9:16 (1080×1920) | 100 MB | Buffer GraphQL API |
| **Instagram Story** | 60s | 60s | 15s | 9:16 (1080×1920) | 100 MB | Buffer GraphQL API |
| **Facebook Reel** | 90s | 90s | 20s | 9:16 (1080×1920) | 100 MB | Buffer GraphQL API |
| **Facebook Feed** | 240m | 600s | 30s | 9:16 / 4:5 | 1000 MB | Buffer GraphQL API |
| **WhatsApp Status** | 60s | 60s | 15s | 9:16 (1080×1920) | 16 MB | Manual Share (Prepared) |

## Usage in Code

```typescript
import { calculatePlatformVideoDuration, calculateMultiPlatformDurations } from './scripts/lib/video-specs.ts';

// Calculate duration for a single platform
const igDuration = calculatePlatformVideoDuration({
  platform: 'instagram',
  format: 'reel',
  preference: 'max' // or 'recommended' or exact seconds
});

// Calculate separate durations across all active platforms
const multi = calculateMultiPlatformDurations(['instagram', 'facebook', 'whatsapp'], 'max');
```

## Rules

- Never assume native app upload limits and API publishing limits are identical.
- Always observe WhatsApp's strict 16MB file size ceiling.
- Inform the user whenever a platform or API imposes a technical restriction.
