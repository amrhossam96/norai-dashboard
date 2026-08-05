/**
 * Minimal JSON syntax highlighter — editor-grade colour without pulling in Shiki
 * or Prism, which would be a large runtime dependency for two static snippets.
 *
 * Tokenises the raw source rather than JSON.parse-ing it, so a sample keeps
 * whatever hand-tuned line breaks and spacing it was written with.
 *
 * Colours are inline styles, not Tailwind classes: the values are theme data, and
 * `text-[${hex}]` would never survive the class scanner.
 */

export interface JsonTheme {
  punct: string;
  key: string;
  string: string;
  number: string;
  literal: string;
  /** Editors conventionally italicise property names. */
  italicKeys?: boolean;
}

/**
 * Palettes taken from each theme's published colour set.
 *
 * `vscode` is the default. Its string colour (#ce9178) sits in the same warm
 * family as this site's accent (#ff7a5c / #ff9d84 / #ffd9cf), so the block reads
 * as part of the page. Dracula and Tokyo Night are cool, high-saturation palettes
 * — cyan, purple, pink — which fight a warm near-black page.
 */
export const JSON_THEMES = {
  vscode: {
    punct: "#d4d4d4",
    key: "#9cdcfe",
    string: "#ce9178",
    number: "#b5cea8",
    literal: "#569cd6",
  },
  dracula: {
    punct: "#f8f8f2",
    key: "#8be9fd",
    string: "#f1fa8c",
    number: "#bd93f9",
    literal: "#ff79c6",
    italicKeys: true,
  },
  oneDark: {
    punct: "#abb2bf",
    key: "#e06c75",
    string: "#98c379",
    number: "#d19a66",
    literal: "#56b6c2",
  },
  tokyoNight: {
    punct: "#a9b1d6",
    key: "#7aa2f7",
    string: "#9ece6a",
    number: "#ff9e64",
    literal: "#bb9af7",
  },
  nightOwl: {
    punct: "#d6deeb",
    key: "#7fdbca",
    string: "#ecc48d",
    number: "#f78c6c",
    literal: "#c792ea",
  },
} satisfies Record<string, JsonTheme>;

export type JsonThemeName = keyof typeof JSON_THEMES;

interface Token {
  text: string;
  kind: keyof Omit<JsonTheme, "italicKeys"> | null;
}

const PATTERN =
  /"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\btrue\b|\bfalse\b|\bnull\b|[{}[\],:]/g;

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  PATTERN.lastIndex = 0;
  while ((match = PATTERN.exec(src)) !== null) {
    if (match.index > cursor) {
      // Whitespace and anything else uncoloured, preserved verbatim.
      tokens.push({ text: src.slice(cursor, match.index), kind: null });
    }

    const text = match[0];
    let kind: Token["kind"];

    if (text.startsWith('"')) {
      // A string is a property name only when the next thing is a colon.
      kind = /^\s*:/.test(src.slice(match.index + text.length))
        ? "key"
        : "string";
    } else if (text === "true" || text === "false" || text === "null") {
      kind = "literal";
    } else if (/^[-\d]/.test(text)) {
      kind = "number";
    } else {
      kind = "punct";
    }

    tokens.push({ text, kind });
    cursor = match.index + text.length;
  }

  if (cursor < src.length) {
    tokens.push({ text: src.slice(cursor), kind: null });
  }
  return tokens;
}

export function JsonCode({
  source,
  theme = "vscode",
}: {
  source: string;
  theme?: JsonThemeName;
}) {
  const palette = JSON_THEMES[theme];

  return (
    <>
      {tokenize(source).map((token, i) => {
        if (token.kind === null) return token.text;
        const italic = token.kind === "key" && "italicKeys" in palette;
        return (
          <span
            key={i}
            style={{
              color: palette[token.kind],
              ...(italic ? { fontStyle: "italic" } : null),
            }}
          >
            {token.text}
          </span>
        );
      })}
    </>
  );
}
