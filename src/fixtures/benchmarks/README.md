# Sanitized parser benchmarks

Benchmark data is deliberately separate from production `ReviewSession` state.

- `*.annotations.json` describes semantic truth and ambiguity before parsing.
- `runs/<fixture>/parsed-trip-draft.json` records the original validated model draft.
- `runs/<fixture>/findings.json` records deterministic and reviewer findings.
- `runs/<fixture>/corrections.json` records only benchmark corrections.
- `runs/<fixture>/confirmed-canonical-trip.json` records the final schema-valid result.
- `runs/<fixture>/metrics.json` separates Parser Quality from Review Recovery Quality and records review time, request time, token use and correction count as observations—not arbitrary pass thresholds.

The unfamiliar Seoul fixture preserves the original six lines without structural cleanup. Its source filename was changed from `.txt` to `.md` solely because V0 intentionally rejects TXT uploads. No production source, model response, excerpt or unfinished review is copied into these files automatically.
