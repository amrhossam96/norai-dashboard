import { DOMAINS } from "@/lib/onboarding/presets";

/**
 * Suggest a category for an event name Norai has never seen.
 *
 * A SUGGESTION, never a write. Classifying wrongly is not a mistake you can
 * correct later: the backend's strength backfill runs once per event name and
 * only touches rows still scored zero, so a type classified wrong has its whole
 * pre-classification history folded into the aggregate at the wrong weight, and
 * re-classifying re-scores nothing. So the guess goes in front of the one person
 * who knows whether "liked" is engagement or their conversion, at the moment
 * they are looking at their own event names.
 */

/** Every (name, category) pair the onboarding presets already encode. */
const PRESET_PAIRS: ReadonlyMap<string, string> = new Map(
  DOMAINS.flatMap((d) => d.events.map((e) => [e.name, e.category] as const)),
);

/**
 * Token -> category, ordered most specific first. Derived from the same
 * vocabulary as the presets, but keyed on what a name CONTAINS so an
 * unseen name like `post_liked` or `story_hidden` still lands somewhere.
 */
const TOKEN_RULES: ReadonlyArray<readonly [RegExp, string]> = [
  [/not[_-]?interested|report|block|dislike|hate|spam/, "negative_feedback"],
  [/dismiss|remove|hide|hidden|unfollow|unsave|close/, "dismissed"],
  [/skip|scroll(ed)?[_-]?past|ignored/, "skipped"],
  [/purchase|bought|buy|order|checkout|paid|payment/, "purchase"],
  [/add(ed)?[_-]?to[_-]?cart|subscribe|signup|sign[_-]?up|book(ed)?|reserve/, "conversion"],
  // `posted`/`publish`, never bare `post`: in a social app "post" is the NOUN
  // in almost every event name, and matching it here pre-filled post_liked and
  // post_saved as conversions. A suggestion that is wrong the same way every
  // time is worse than none.
  [/share|comment|repl(y|ied)|posted|publish|review(ed)?/, "conversion"],
  [/search|quer(y|ied)|filter/, "search_click"],
  [/like|favorite|favourite|save|bookmark|follow|react|upvote|rate/, "engagement"],
  [/watch|play|listen|read|view(ed)?|open(ed)?|click|tap|detail/, "content_view"],
  [/screen|page|tab|impression|browse/, "screen_view"],
];

export interface Suggestion {
  category: string;
  /** exact = this name is in the presets verbatim; token = matched a word in it. */
  basis: "exact" | "token";
}

export function suggestCategory(eventName: string): Suggestion | null {
  const name = eventName.trim().toLowerCase();
  const exact = PRESET_PAIRS.get(name);
  if (exact) return { category: exact, basis: "exact" };
  for (const [pattern, category] of TOKEN_RULES) {
    if (pattern.test(name)) return { category, basis: "token" };
  }
  return null;
}
