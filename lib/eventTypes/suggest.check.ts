/**
 * Expectations for the category suggestions. Run with:  npx tsx lib/eventTypes/suggest.check.ts
 *
 * The social-app rows are the ones that matter. "post" is a NOUN in almost
 * every event name a community app sends, and an earlier version matched it as
 * the verb, pre-filling post_liked and post_saved as conversions — wrong the
 * same way every time, for exactly the first design partner.
 */
import { suggestCategory } from "./suggest";

const CASES: ReadonlyArray<readonly [string, string | null]> = [
  ["post_liked", "engagement"],
  ["post_saved", "engagement"],
  ["post_viewed", "content_view"],
  ["post_shared", "conversion"],
  ["post_hidden", "dismissed"],
  ["posted_status", "conversion"],
  ["profile_followed", "engagement"],
  ["user_blocked", "negative_feedback"],
  ["reported_content", "negative_feedback"],
  ["feed_scrolled_past", "skipped"],
  ["purchased", "purchase"],
  ["added_to_cart", "conversion"],
  ["not_interested", "negative_feedback"],
  // No vocabulary for these, and saying so is the right answer.
  ["message_sent", null],
  ["widget_frobnicated", null],
];

let failed = 0;
for (const [name, want] of CASES) {
  const got = suggestCategory(name)?.category ?? null;
  if (got !== want) {
    console.error(`  ${name}: got ${got ?? "none"}, want ${want ?? "none"}`);
    failed++;
  }
}
console.log(failed === 0 ? `${CASES.length} suggestions as expected` : `${failed} wrong`);
process.exit(failed === 0 ? 0 : 1);
