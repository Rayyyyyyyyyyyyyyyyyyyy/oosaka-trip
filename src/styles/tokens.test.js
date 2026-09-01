import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { appTheme } from "../appTheme";

const css = readFileSync("src/styles/tokens.css", "utf8");

function tokenMap(block) {
  return Object.fromEntries(
    [...block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map((match) => [
      match[1],
      match[2],
    ]),
  );
}

function luminance(hex) {
  const channels = hex
    .slice(1)
    .match(/../g)
    .map((value) => parseInt(value, 16) / 255);
  const linear = channels.map((value) =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe("MVP travel visual roles", () => {
  const light = tokenMap(css.match(/^:root \{([\s\S]*?)\n\}/)?.[1] ?? "");
  const dark = tokenMap(
    css.match(
      /@media \(prefers-color-scheme: dark\) \{\s*:root \{([\s\S]*?)\n  \}/,
    )?.[1] ?? "",
  );

  it.each([
    ["light", light],
    ["dark", dark],
  ])("defines readable %s travel roles", (_, tokens) => {
    expect(tokens["trip-color-paper"]).toMatch(/^#/);
    expect(
      contrast(tokens["trip-color-ink"], tokens["trip-color-paper"]),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(tokens["trip-color-muted"], tokens["trip-color-paper"]),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(tokens["trip-color-movement"], tokens["trip-color-paper"]),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(tokens["trip-color-attention"], tokens["trip-color-paper"]),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(tokens["trip-color-readiness"], tokens["trip-color-paper"]),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(tokens["trip-color-warmth"], tokens["trip-color-travel"]),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps Alert messages on the readable text role in every appearance", () => {
    const alertRoot = appTheme.components.MuiAlert.styleOverrides.root;
    expect(alertRoot.color).toBe("var(--trip-color-ink)");
    expect(alertRoot["& .MuiAlert-message"].color).toBe(
      "var(--trip-color-ink)",
    );
    expect(alertRoot["&.MuiAlert-outlinedWarning"].borderColor).toBe(
      "var(--trip-color-warning)",
    );
    expect(alertRoot["&.MuiAlert-standardError"].backgroundColor).toBe(
      "color-mix(in srgb, var(--trip-color-attention) 14%, var(--trip-color-surface))",
    );
    expect(alertRoot["&.MuiAlert-standardWarning"].backgroundColor).toBe(
      "color-mix(in srgb, var(--trip-color-warning) 12%, var(--trip-color-surface))",
    );
  });

  it("keeps disabled buttons on the light ink role instead of MUI light-mode derivatives", () => {
    const disabled =
      appTheme.components.MuiButton.styleOverrides.root["&.Mui-disabled"];
    expect(disabled.color).toBe("var(--trip-color-ink)");
    expect(disabled.backgroundColor).toBe(
      "color-mix(in srgb, var(--trip-color-ink) 10%, transparent)",
    );
  });
});
