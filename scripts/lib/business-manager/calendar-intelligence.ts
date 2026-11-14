// Real-Time Calendar Intelligence & Indian Fashion Season Radar
// Dynamically evaluates real-time date/time, Indian seasons, wedding muhurats, upcoming festivals, and posting hours.

import type { CalendarEvent, IndianSeason, PlatformTimingRecommendation } from './types.ts';

export interface CurrentTemporalContext {
  now: Date;
  dateString: string;
  timeStringIST: string;
  dayOfWeek: string;
  isWeekend: boolean;
  currentSeason: IndianSeason;
  seasonDescription: string;
  activeEvents: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  primaryEvent: CalendarEvent;
  postingRecommendations: PlatformTimingRecommendation[];
}

interface FestivalRule {
  id: string;
  name: string;
  type: CalendarEvent['type'];
  season: IndianSeason;
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number;
  endDay: number;
  fashionFocus: string[];
  recommendedGarments: string[];
  recommendedColors: string[];
  marketingAngles: string[];
}

// Deterministic calendar rules for Indian fashion retail
const FESTIVAL_RULES: FestivalRule[] = [
  {
    id: 'winter-wedding-season-1',
    name: 'Winter Wedding Season (Shaadi Muhurats - Phase 1)',
    type: 'wedding_season',
    season: 'winter',
    startMonth: 11,
    startDay: 10,
    endMonth: 12,
    endDay: 22,
    fashionFocus: ['Royal Bridal Lehengas', 'Embroidered Sherwanis', 'Banarasi Silk Sarees', 'Family Wedding Ensembles'],
    recommendedGarments: ['sherwani', 'lehenga', 'saree', 'kurta-pajama', 'anarkali'],
    recommendedColors: ['Deep Wine', 'Antique Gold', 'Crimson Red', 'Midnight Navy', 'Emerald Green'],
    marketingAngles: ['Complete Family Wedding Wardrobe', 'Bespoke Groom & Bridal Styling', 'Timeless Heritage Fits']
  },
  {
    id: 'diwali-festive',
    name: 'Diwali & Chhath Puja Festive Week',
    type: 'festival',
    season: 'festive_autumn',
    startMonth: 10,
    startDay: 25,
    endMonth: 11,
    endDay: 8,
    fashionFocus: ['Radiant Festive Kurtas', 'Handloom Sarees', 'Kids Festive Sets'],
    recommendedGarments: ['kurta-pajama', 'saree', 'anarkali', 'kids-ethnic-set'],
    recommendedColors: ['Marigold Amber', 'Royal Maroon', 'Ivory Gold', 'Rani Pink'],
    marketingAngles: ['Light Up Your Celebrations', 'Handcrafted Festive Glow', 'Pure Silk & Heritage Zari']
  },
  {
    id: 'christmas-new-year',
    name: 'Winter Festive & New Year Celebrations',
    type: 'commercial_event',
    season: 'winter',
    startMonth: 12,
    startDay: 20,
    endMonth: 1,
    endDay: 3,
    fashionFocus: ['Velvet Blazers', 'Evening Indo-Western Gowns', 'Smart Tailored Suits'],
    recommendedGarments: ['mens-blazer', 'gown', 'co-ord-set', 'mens-shirt'],
    recommendedColors: ['Midnight Slate', 'Ruby Red', 'Champagne Gold', 'Jet Black'],
    marketingAngles: ['Cocktail & Year-End Elegance', 'Modern Tailoring for Unforgettable Nights', 'Understated Luxury']
  },
  {
    id: 'makar-sankranti-pongal',
    name: 'Makar Sankranti, Lohri & Pongal Harvest Edit',
    type: 'festival',
    season: 'winter',
    startMonth: 1,
    startDay: 10,
    endMonth: 1,
    endDay: 17,
    fashionFocus: ['Bright Yellow Kurtas', 'Chanderi Sarees', 'Lohri Shararas'],
    recommendedGarments: ['kurta-pajama', 'sharara', 'saree', 'kids-ethnic-set'],
    recommendedColors: ['Sunlit Yellow', 'Mustard Amber', 'Turquoise Blue', 'Warm Coral'],
    marketingAngles: ['Harvest Sun Elegance', 'Festive Warmth and Traditional Charm', 'Family First Celebrations']
  },
  {
    id: 'republic-day-handloom',
    name: 'Republic Day & National Handloom Heritage Week',
    type: 'national_holiday',
    season: 'winter',
    startMonth: 1,
    startDay: 20,
    endMonth: 1,
    endDay: 27,
    fashionFocus: ['Khadi Silk Kurtas', 'Nehru Jackets', 'Tricolor Tonal Sarees'],
    recommendedGarments: ['nehru-jacket', 'kurta-pajama', 'saree', 'mens-trouser'],
    recommendedColors: ['Ivory Silk', 'Deep Indigo', 'Forest Green', 'Saffron Touch'],
    marketingAngles: ['Authentic Indian Craftsmanship', 'Made in India Pride', 'Tailored Heritage Classics']
  },
  {
    id: 'spring-wedding-season',
    name: 'Spring Wedding Season (Shaadi Muhurats - Phase 2)',
    type: 'wedding_season',
    season: 'spring',
    startMonth: 2,
    startDay: 1,
    endMonth: 3,
    endDay: 15,
    fashionFocus: ['Pastel Bridal Lehengas', 'Floral Brocade Sherwanis', 'Georgette Shararas'],
    recommendedGarments: ['lehenga', 'sherwani', 'sharara', 'kurta-pajama'],
    recommendedColors: ['Dusty Rose', 'Powder Blue', 'Mint Green', 'Ivory Champagne'],
    marketingAngles: ['Romantic Daytime Weddings', 'Pastel Elegance & Soft Zari', 'Subtle Royal Aesthetics']
  },
  {
    id: 'holi-festive',
    name: 'Holi Colors of Celebration',
    type: 'festival',
    season: 'spring',
    startMonth: 3,
    startDay: 16,
    endMonth: 3,
    endDay: 28,
    fashionFocus: ['Crisp White Mulmul Kurtas', 'Cotton Chikankari', 'Bright Dupattas'],
    recommendedGarments: ['kurta-pajama', 'kurti', 'kids-kurta-pajama'],
    recommendedColors: ['Crisp White', 'Soft Ivory', 'Sunset Gulal Accents'],
    marketingAngles: ['Pure Cotton Grace for Holi', 'Festive Comfort that Breathes', 'Playful Celebrations']
  },
  {
    id: 'eid-ul-fitr',
    name: 'Eid-ul-Fitr Grand Celebration',
    type: 'festival',
    season: 'spring',
    startMonth: 4,
    startDay: 1,
    endMonth: 4,
    endDay: 15,
    fashionFocus: ['Lakhnavi Chikankari Kurtas', 'Royal Ghararas', 'Embroidered Pathani Sets'],
    recommendedGarments: ['gharara', 'kurta-pajama', 'sharara', 'anarkali'],
    recommendedColors: ['Emerald Green', 'Pearl White', 'Rose Dust', 'Antique Silver'],
    marketingAngles: ['Nawabi Splendor for Eid', 'Intricate Hand-Embroidery', 'Festive Family Gatherings']
  },
  {
    id: 'summer-everyday',
    name: 'Summer Everyday Breathable Collection',
    type: 'seasonal_shift',
    season: 'summer',
    startMonth: 4,
    startDay: 20,
    endMonth: 6,
    endDay: 30,
    fashionFocus: ['Linen Shirts', 'Pure Cotton Kurtis', 'Breezy Palazzos'],
    recommendedGarments: ['mens-shirt', 'kurti', 'palazzo', 'mens-tshirt'],
    recommendedColors: ['Sky Blue', 'Crisp White', 'Sage Green', 'Warm Sand'],
    marketingAngles: ['Beat the Heat in Pure Linen', 'Effortless Everyday Polish', 'All-Day Breathable Luxury']
  },
  {
    id: 'raksha-bandhan',
    name: 'Raksha Bandhan & Teej Celebrations',
    type: 'festival',
    season: 'monsoon',
    startMonth: 8,
    startDay: 1,
    endMonth: 8,
    endDay: 20,
    fashionFocus: ['Sibling Duo Outfits', 'Festive Leheriya Sarees', 'Tailored Nehru Sets'],
    recommendedGarments: ['saree', 'kurta-pajama', 'nehru-jacket', 'anarkali'],
    recommendedColors: ['Royal Pink', 'Peacock Blue', 'Marigold', 'Bright Turquoise'],
    marketingAngles: ['Celebrate Sibling Bonds', 'Timeless Festive Gifts', 'Matching Family Coordinates']
  },
  {
    id: 'navratri-dussehra',
    name: 'Navratri & Dussehra Grand Festive Edit',
    type: 'festival',
    season: 'festive_autumn',
    startMonth: 9,
    startDay: 20,
    endMonth: 10,
    endDay: 24,
    fashionFocus: ['Mirror-Work Chaniya Cholis', 'Bandhani Kurtas', 'Draped Sarees'],
    recommendedGarments: ['lehenga', 'kurta-pajama', 'saree', 'sharara'],
    recommendedColors: ['Vibrant Scarlet', 'Royal Indigo', 'Bright Yellow', 'Aubergine'],
    marketingAngles: ['9 Nights of Divine Glamour', 'Swirl in Festive Joy', 'Handcrafted Royal Details']
  }
];

/**
 * Determines current Indian season based on month and day.
 */
export function getIndianSeason(date: Date): { season: IndianSeason; description: string } {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  if ((month === 11 && day >= 15) || month === 12 || month === 1 || (month === 2 && day <= 15)) {
    return {
      season: 'winter',
      description: 'Peak Winter & Wedding Season: Heavy silks, Banarasi brocades, velvets, pashminas, tailored sherwanis, deep jewel tones (wine, navy, emerald).'
    };
  }
  if ((month === 2 && day > 15) || month === 3) {
    return {
      season: 'spring',
      description: 'Spring Transition & Holi: Soft silks, Chanderi, pastel festive palettes, floral motifs, daytime wedding grace.'
    };
  }
  if (month >= 4 && month <= 6) {
    return {
      season: 'summer',
      description: 'High Summer: Pure Egyptian cotton, breathable linens, mulmul kurtis, lightweight breezy silhouettes, cool ivories and pastels.'
    };
  }
  if (month === 7 || month === 8) {
    return {
      season: 'monsoon',
      description: 'Monsoon & Early Festivals (Rakhi/Teej): Vibrant celebratory hues, wrinkle-resistant handlooms, lively sibling coordinates.'
    };
  }
  return {
    season: 'festive_autumn',
    description: 'Grand Autumn Festive (Navratri, Diwali, Chhath): Opulent silks, rich zardozi, radiant amber, royal maroons, high commercial intent.'
  };
}

/**
 * Calculates days difference between current date and a target month/day.
 */
function calculateDaysDifference(now: Date, targetMonth: number, targetDay: number): number {
  const currentYear = now.getFullYear();
  let targetDate = new Date(currentYear, targetMonth - 1, targetDay);

  // If the target date already passed by more than 10 days, look at next year
  const diffMs = targetDate.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < -10) {
    targetDate = new Date(currentYear + 1, targetMonth - 1, targetDay);
    return Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
  return diffDays;
}

/**
 * Evaluates whether an event is currently active or upcoming.
 */
function evaluateEventWindow(now: Date, rule: FestivalRule): CalendarEvent {
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Check if date falls in [start, end]
  let isCurrent = false;
  if (rule.startMonth === rule.endMonth) {
    isCurrent = month === rule.startMonth && day >= rule.startDay && day <= rule.endDay;
  } else if (rule.startMonth < rule.endMonth) {
    isCurrent =
      (month === rule.startMonth && day >= rule.startDay) ||
      (month === rule.endMonth && day <= rule.endDay) ||
      (month > rule.startMonth && month < rule.endMonth);
  } else {
    // Window wraps around new year (e.g., Nov to Jan)
    isCurrent =
      (month === rule.startMonth && day >= rule.startDay) ||
      (month === rule.endMonth && day <= rule.endDay) ||
      month > rule.startMonth ||
      month < rule.endMonth;
  }

  const daysAway = isCurrent ? 0 : calculateDaysDifference(now, rule.startMonth, rule.startDay);
  const isUpcoming = !isCurrent && daysAway > 0 && daysAway <= 35;

  let urgency: CalendarEvent['urgency'] = 'informational';
  if (isCurrent) urgency = 'immediate';
  else if (daysAway <= 7) urgency = 'immediate';
  else if (daysAway <= 18) urgency = 'high';
  else if (daysAway <= 35) urgency = 'planning';

  return {
    id: rule.id,
    name: rule.name,
    type: rule.type,
    season: rule.season,
    window: {
      startMonth: rule.startMonth,
      startDay: rule.startDay,
      endMonth: rule.endMonth,
      endDay: rule.endDay
    },
    daysAway,
    isCurrent,
    isUpcoming,
    urgency,
    fashionFocus: rule.fashionFocus,
    recommendedGarments: rule.recommendedGarments,
    recommendedColors: rule.recommendedColors,
    marketingAngles: rule.marketingAngles
  };
}

/**
 * Returns platform posting timing recommendations tailored for Indian social media audiences.
 */
export function getPlatformTimingRecommendations(now: Date): PlatformTimingRecommendation[] {
  const day = now.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = day === 0 || day === 6;

  return [
    {
      platform: 'instagram',
      recommendedTimes: isWeekend
        ? ['02:00 PM - 04:30 PM IST (Weekend Leisure Surge)', '08:00 PM - 10:00 PM IST (Prime Reel Discovery)']
        : ['12:30 PM - 02:00 PM IST (Lunchtime Scroll)', '07:30 PM - 09:30 PM IST (Peak Evening Engagement)'],
      bestDays: ['Wednesday', 'Friday', 'Saturday', 'Sunday'],
      audienceActivityLevel: isWeekend ? 'peak' : 'high',
      rationale: isWeekend
        ? 'Weekend engagement surges in mid-afternoon and late evening for wedding/festive inspiration browsing.'
        : 'Indian working professionals and brides browse fashion feeds during lunch and post-7:30 PM commute/relaxation.'
    },
    {
      platform: 'facebook',
      recommendedTimes: ['09:30 AM - 11:30 AM IST (Morning Community Browse)', '06:30 PM - 08:30 PM IST (Family Decision Hours)'],
      bestDays: ['Thursday', 'Friday', 'Saturday', 'Sunday'],
      audienceActivityLevel: 'high',
      rationale: 'Facebook caters heavily to elder family decision-makers, mothers, and family groups planning wedding and festival shopping.'
    },
    {
      platform: 'whatsapp',
      recommendedTimes: ['09:00 AM - 10:30 AM IST (Status Updates)', '05:30 PM - 07:30 PM IST (VIP Customer Showcase)'],
      bestDays: ['Daily for Status', 'Tuesday & Friday for VIP Broadcasts'],
      audienceActivityLevel: 'peak',
      rationale: 'WhatsApp Status achieves immediate direct visibility. Strictly avoid broadcasting after 08:30 PM to respect customer privacy.'
    }
  ];
}

/**
 * Evaluates the full real-time temporal context.
 */
export function getCurrentTemporalContext(referenceDate?: Date): CurrentTemporalContext {
  const now = referenceDate ?? new Date();

  // Convert to IST representation
  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };

  const dateString = new Intl.DateTimeFormat('en-IN', dateOptions).format(now);
  const timeStringIST = `${new Intl.DateTimeFormat('en-IN', timeOptions).format(now)} IST`;
  const dayOfWeek = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long' }).format(now);
  const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';

  const { season: currentSeason, description: seasonDescription } = getIndianSeason(now);

  const evaluatedEvents = FESTIVAL_RULES.map(rule => evaluateEventWindow(now, rule));
  const activeEvents = evaluatedEvents.filter(e => e.isCurrent);
  const upcomingEvents = evaluatedEvents
    .filter(e => e.isUpcoming)
    .sort((a, b) => a.daysAway - b.daysAway);

  // Pick primary driver event
  const primaryEvent = activeEvents[0] ?? upcomingEvents[0] ?? evaluatedEvents[0]!;
  const postingRecommendations = getPlatformTimingRecommendations(now);

  return {
    now,
    dateString,
    timeStringIST,
    dayOfWeek,
    isWeekend,
    currentSeason,
    seasonDescription,
    activeEvents,
    upcomingEvents,
    primaryEvent,
    postingRecommendations
  };
}
