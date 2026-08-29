/**
 * Domain presets — the whole content model of the onboarding wizard.
 *
 * A developer knows their domain instantly; nobody knows what `content_view` at
 * weight 0.20 means. So the domain is the question, and it yields the entire
 * bundle: the entity kind, the event types with their category mapping, and the
 * surfaces worth serving. Every category named below is one of the nine the
 * backend seeds — nothing invented, so `POST /event-types` never has to guess.
 *
 * `skipped` is deliberately in no preset: the seed describes it as emitted only
 * alongside a choice, i.e. SDK-derived. Offering it as something you register by
 * hand would teach the wrong model on the very first screen.
 *
 * Imported by both the client wizard and the /api/onboarding route handler, so
 * nothing here may touch the network or import "server-only".
 */

/** The nine seeded categories, minus `skipped`. Names must match the DB rows. */
export type CategoryName =
  | "screen_view"
  | "content_view"
  | "search_click"
  | "engagement"
  | "conversion"
  | "purchase"
  | "dismissed"
  | "negative_feedback";

/**
 * What the dot on a chip says. Three tiers, not eight weights: the exact number
 * is the engine's business, and showing it here invites tuning before there is
 * a single event to tune against.
 */
export type Tier = "engage" | "convert" | "reject";

export const TIER: Record<CategoryName, Tier> = {
  screen_view: "engage",
  content_view: "engage",
  search_click: "engage",
  engagement: "engage",
  conversion: "convert",
  purchase: "convert",
  dismissed: "reject",
  negative_feedback: "reject",
};

export type Engine =
  | "preference"
  | "similarity"
  | "transitions"
  | "trending"
  | "pipeline";

export interface PresetEvent {
  name: string;
  category: CategoryName;
}

export interface PresetSurface {
  name: string;
  engine: Engine;
  description: string;
}

export interface Domain {
  id: string;
  title: string;
  subtitle: string;
  /** entity_type every event and surface in this preset is scoped to. */
  kind: string;
  /**
   * Days for interest in one entity to halve. Mirrors the engine default in
   * internal/engine/preference/model.go — the wizard writes no override, so
   * this is display only, and the summary screen shows the value the API
   * actually confirms rather than this one.
   */
  halfLifeDays: number;
  events: PresetEvent[];
  surfaces: PresetSurface[];
}

const ev = (name: string, category: CategoryName): PresetEvent => ({
  name,
  category,
});
const sf = (
  name: string,
  engine: Engine,
  description: string,
): PresetSurface => ({ name, engine, description });

export const DOMAINS: Domain[] = [
  {
    id: "ecommerce",
    title: "Store",
    subtitle: "products, carts, checkout",
    kind: "product",
    halfLifeDays: 30,
    events: [
      ev("product_viewed", "content_view"),
      ev("collection_viewed", "screen_view"),
      ev("search_result_clicked", "search_click"),
      ev("added_to_wishlist", "engagement"),
      ev("added_to_cart", "conversion"),
      ev("purchased", "purchase"),
      ev("removed_from_cart", "dismissed"),
      ev("not_interested", "negative_feedback"),
    ],
    surfaces: [
      sf("Product page", "similarity", "customers also bought"),
      sf("Home feed", "pipeline", "for you"),
      sf("Cart", "transitions", "goes well with this"),
    ],
  },
  {
    id: "social",
    title: "Social",
    subtitle: "posts, feeds, follows",
    kind: "post",
    halfLifeDays: 3,
    events: [
      ev("post_viewed", "content_view"),
      ev("feed_viewed", "screen_view"),
      ev("liked", "engagement"),
      ev("commented", "engagement"),
      ev("shared", "conversion"),
      ev("followed", "conversion"),
      ev("hidden", "dismissed"),
      ev("reported", "negative_feedback"),
    ],
    surfaces: [
      sf("Home feed", "pipeline", "for you"),
      sf("Explore", "trending", "popular right now"),
      sf("More like this", "similarity", "similar posts"),
    ],
  },
  {
    id: "streaming",
    title: "Streaming",
    subtitle: "video, audio, episodes",
    kind: "video",
    halfLifeDays: 21,
    events: [
      ev("title_viewed", "content_view"),
      ev("row_viewed", "screen_view"),
      ev("playback_started", "engagement"),
      ev("playback_completed", "conversion"),
      ev("added_to_list", "engagement"),
      ev("not_interested", "negative_feedback"),
    ],
    surfaces: [
      sf("Home rows", "pipeline", "for you"),
      sf("Up next", "transitions", "what follows this"),
      sf("More like this", "similarity", "similar titles"),
    ],
  },
  {
    id: "publishing",
    title: "Publishing",
    subtitle: "articles, news, blogs",
    kind: "article",
    halfLifeDays: 7,
    events: [
      ev("article_viewed", "content_view"),
      ev("section_viewed", "screen_view"),
      ev("read_completed", "conversion"),
      ev("saved", "engagement"),
      ev("shared", "engagement"),
      ev("subscribed", "purchase"),
      ev("dismissed", "dismissed"),
    ],
    surfaces: [
      sf("Homepage", "pipeline", "for you"),
      sf("End of article", "similarity", "read next"),
      sf("Trending", "trending", "most read"),
    ],
  },
  {
    id: "marketplace",
    title: "Marketplace",
    subtitle: "listings, rentals, bookings",
    kind: "listing",
    halfLifeDays: 14,
    events: [
      ev("listing_viewed", "content_view"),
      ev("search_result_clicked", "search_click"),
      ev("saved", "engagement"),
      ev("contacted_seller", "conversion"),
      ev("booked", "purchase"),
      ev("hidden", "dismissed"),
    ],
    surfaces: [
      sf("Search results", "pipeline", "for you"),
      sf("Listing page", "similarity", "similar listings"),
      sf("Recently viewed", "transitions", "pick up where you left off"),
    ],
  },
  {
    id: "learning",
    title: "Learning",
    subtitle: "courses, lessons, tracks",
    kind: "course",
    halfLifeDays: 60,
    events: [
      ev("course_viewed", "content_view"),
      ev("catalog_viewed", "screen_view"),
      ev("lesson_started", "engagement"),
      ev("enrolled", "conversion"),
      ev("completed", "purchase"),
      ev("not_interested", "negative_feedback"),
    ],
    surfaces: [
      sf("Catalog", "pipeline", "for you"),
      sf("Course page", "similarity", "students also took"),
      sf("Continue", "transitions", "next lesson"),
    ],
  },
];

export function findDomain(id: string | null | undefined): Domain | undefined {
  return DOMAINS.find((d) => d.id === id);
}

// ---- Platforms ----

export type PlatformId = "ios" | "android" | "web" | "server";

export interface Platform {
  id: PlatformId;
  title: string;
  subtitle: string;
}

export const PLATFORMS: Platform[] = [
  { id: "ios", title: "iOS", subtitle: "swift" },
  { id: "android", title: "Android", subtitle: "kotlin" },
  { id: "web", title: "Web", subtitle: "typescript" },
  { id: "server", title: "Server", subtitle: "node · go · python" },
];

export function findPlatform(id: string | null | undefined): Platform {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0];
}

/**
 * Slug for a surface, scoped to one environment.
 *
 * Unlike a project slug this needs no random suffix: surfaces are unique within
 * an environment, and the SDK references them by this string. `home-feed` is
 * something a developer can type from memory; `home-feed-x7f2q1` is not.
 */
export function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "surface"
  );
}
