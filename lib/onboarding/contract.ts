/**
 * The wire contract between the wizard and /api/onboarding.
 *
 * Client-safe: the wizard imports the types and the validator, the route
 * handler imports the same validator so the browser and the server agree on
 * what a well-formed answer set is.
 */
import {
  DOMAINS,
  findDomain,
  type Domain,
  type PlatformId,
  PLATFORMS,
} from "./presets";
import { PROJECT_NAME_MAX, PROJECT_NAME_MIN } from "@/lib/projects";

export interface OnboardingAnswers {
  projectName: string;
  /** Domain id from DOMAINS. */
  domain: string;
  /** Event names the user left switched on — a subset of the domain's preset. */
  events: string[];
  /** Surface names the user left switched on — a subset of the domain's preset. */
  surfaces: string[];
  platform: PlatformId;
}

export interface OnboardingSuccess {
  status: "success";
  projectId: string;
  environmentId: string;
  environmentName: string;
  /** The publishable key, in plaintext. This is the only time it is readable. */
  apiKey: string | null;
  entityType: string;
  /**
   * What the engine will actually decay with, read back from the API rather
   * than echoed from the preset — the two are only equal while nothing has
   * drifted, and this screen should show the truth.
   */
  halfLifeDays: number;
  eventTypesCreated: number;
  surfacesCreated: number;
  /**
   * Non-fatal failures. The project exists either way, so the wizard reports
   * these rather than sending the user back to create a second one.
   */
  warnings: string[];
}

export interface OnboardingFailure {
  status: "error";
  message: string;
}

export type OnboardingResult = OnboardingSuccess | OnboardingFailure;

export const ONBOARDING_FAILED =
  "Couldn't finish setting up. Nothing was created — try again.";
export const ONBOARDING_OFFLINE =
  "Couldn't reach us just now. Check your connection and try again.";

/** A validated answer set, with the preset it resolves to already looked up. */
export interface ResolvedAnswers extends OnboardingAnswers {
  preset: Domain;
}

/**
 * Parse an unknown body into answers, or explain why it isn't one.
 *
 * Event and surface names are checked against the chosen preset rather than
 * merely being non-empty strings: everything registered here is written into a
 * customer's environment, and the set of names the wizard can produce is
 * closed. A name the wizard could not have offered did not come from the wizard.
 */
export function resolveAnswers(
  raw: unknown,
): { ok: true; answers: ResolvedAnswers } | { ok: false; message: string } {
  if (raw === null || typeof raw !== "object") {
    return { ok: false, message: "Malformed request." };
  }
  const body = raw as Record<string, unknown>;

  const projectName = String(body.projectName ?? "").trim();
  if (
    projectName.length < PROJECT_NAME_MIN ||
    projectName.length > PROJECT_NAME_MAX
  ) {
    return { ok: false, message: "Give your project a name." };
  }

  const preset = findDomain(String(body.domain ?? ""));
  if (!preset) {
    return {
      ok: false,
      message: `Pick one of: ${DOMAINS.map((d) => d.id).join(", ")}.`,
    };
  }

  const platform = String(body.platform ?? "") as PlatformId;
  if (!PLATFORMS.some((p) => p.id === platform)) {
    return { ok: false, message: "Pick a platform." };
  }

  const events = stringList(body.events).filter((name) =>
    preset.events.some((e) => e.name === name),
  );
  if (events.length === 0) {
    return { ok: false, message: "Keep at least one event." };
  }

  const surfaces = stringList(body.surfaces).filter((name) =>
    preset.surfaces.some((s) => s.name === name),
  );

  return {
    ok: true,
    answers: { projectName, domain: preset.id, events, surfaces, platform, preset },
  };
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}
