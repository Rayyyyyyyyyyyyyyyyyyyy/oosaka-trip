# Trip Runtime — Current Documentation Set

> 這個資料夾只放 **目前有效版本**。
>
> 不再用 `v0.2 / v0.3 / v0.4 / v0.5` 疊檔案。

---

# Current Files

## `01_CANONICAL_CONTEXT.md`

產品層 Single Source of Truth。

放：

- Product thesis
- Product boundary
- Invariants
- Current priority
- Roadmap
- Validated / unvalidated assumptions
- Kill questions

不要放：

- 每一個 sample 的細節
- parser implementation 細節
- Result page UI pattern 細節

---

## `02_INPUT_RESEARCH.md`

真實 itinerary input corpus。

目前：

```text
Formal Input Samples: 25
External Markdown Benchmarks: 1
```

放：

- Sample inventory
- Source archetypes
- Cross-sample semantics
- Semantic saturation
- Core / Preserve / Defer

---

## `03_PIPELINE_SPEC.md`

描述：

```text
Source
→ Source-specific Extract / Reconstruct
→ UnifiedSourceDocument
→ Understand
→ Review
→ Canonical Trip Data
→ Presentation Projection
→ Render
```

核心邊界：

> **Source type 影響 extraction，不應產生不同的 Result UI architecture。**

不同格式可以有不同 Source Adapter，但確認後都進入同一個 Canonical / Result UI system。

放：

- stage responsibility
- extraction rules
- validation
- review
- provenance
- failure behavior
- hosted delivery boundary

---

## `04_RESPONSE_PAGE_RESEARCH.md`

新的獨立 research track。

目前：

```text
Response Reference Pairs: 1
```

第一組：

```text
Busan.xlsx
→ https://bbmddt.github.io/busan-travel/
```

放：

- Source → Result mapping
- useful Result UI patterns
- semantic loss
- static webification vs Runtime value

---

## `05_V0_IMPLEMENTATION_PLAN.md`

工程執行順序。

目前 acceptance fixture：

```text
External Markdown Benchmark #001
= Sample #23 韓國・首爾
```

---

## `06_RESULT_UI_SPEC.md`

Result UI / Renderer 的 current working spec。

目前狀態：

> **Initial Working Draft — 尚未 freeze visual system。**

放：

- source-agnostic Renderer boundary
- Presentation Projection
- semantic UI grammar
- Overview / Today / Day composition
- visual hierarchy principles
- fallback behavior
- Skyline / Golden Screen 後才能 freeze 的 visual rules

UI 決策順序：

```text
Response Page Research
↓
UI Skyline / Visual Direction
↓
Golden Screens
↓
06_RESULT_UI_SPEC refinement / freeze
```

不要因為 06 已存在，就跳過 Skyline 直接把 typography、spacing、surface、navigation 寫死。

---

## `AGENTS.md`

Repository-level execution guardrails。

放：

- roadmap / gate constraints
- source-to-UI architecture invariants
- parser / hosted-delivery implementation boundaries
- UI Skyline / Golden Screen / 06 的執行順序
- runtime integrity
- repository / build hygiene

`AGENTS.md` 應同步 current docs 的已決策架構，但不要把 research evidence 全部複製進去。

---

# Current Architecture Shorthand

目前可用以下方式理解整條產品：

```text
Existing Itinerary
↓
Source-specific Adapter
↓
Content + Structural Signals
↓
UnifiedSourceDocument
↓
Semantic Understanding
↓
ParsedTripDraft
↓
Evidence-backed Review
↓
Confirmed CanonicalTrip
↓
Presentation Projection
↓
Source-agnostic Semantic UI Templates
↓
Travel Web
```

注意：

> **「Content + Structural Signals」不等於把所有 source flatten 成 plain text。**

Excel 的 row / column / merge、PDF / Canva 的 visual grouping、Mind Map 的 tree relation 都可能承載旅行語意。

---

# Documentation Rule

之後修改：

```text
直接更新 current file
```

不要再建立：

```text
02_INPUT_RESEARCH_v0.6.md
02_INPUT_RESEARCH_v0.7.md
...
```

需要歷史時交給：

- Git
- commit history

而不是靠資料夾堆版本。

---

# Research Numbering

兩條編號分開：

```text
Input Sample #001...
Response Reference Pair #001...
```

因此 Busan：

```text
Input Sample #24
= Busan.xlsx

Response Reference Pair #001
= Busan.xlsx → busan-travel Web
```

Result Page 不另外佔用 Input Sample 編號。

---

# Current Product Gate

```text
25-sample evidence
↓
Minimal incomplete-capable Canonical Model
↓
Markdown parser
↓
Deterministic validation
↓
Evidence-backed Review
↓
External Markdown Benchmark #001 acceptance gate
↓
Hosted Delivery Lite
↓
Narrow Spreadsheet Travel Table
↓
Continue corpus research
```
