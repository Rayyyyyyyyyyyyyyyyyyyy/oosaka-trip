# Trip Runtime — Canonical Project Context

> **Canonical context packet**
>
> 這份文件只記錄目前有效的產品上下文與決策。
> UI 細節、pipeline 細節與 sample evidence 分別放在其他文件。

---

# 1. Product Thesis

Trip Runtime 不是 AI Trip Planner。

核心是：

> **使用者已經有自己的旅行行程。把既有文件丟進來，系統理解它、轉成 Canonical Trip Data，再生成旅行途中更好用的 Live Travel Web。**

簡化：

```text
Existing Itinerary
→ Structured Trip
→ Useful Runtime UI
```

一句話：

> **Upload what you already have. Open it when you travel.**

## 1.1 Current Architecture Abstraction

目前更精簡的產品 / 技術解構是：

```text
Existing Itinerary
↓
Source-specific extraction / reconstruction
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
Source-agnostic Result UI
```

核心不是：

```text
任何檔案
→ 抽成 plain text
→ 塞進 UI
```

而是：

> **不同 source 用適合它的方式保留內容與結構訊號；一旦轉成確認後的旅行語意，Renderer 不再關心原始格式。**

因此：

```text
Source type
→ affects extraction

Canonical semantic
→ affects presentation
```

不是：

```text
Source type
→ decides Result UI family
```

---

# 2. 核心問題

很多自由行使用者不是沒有行程，而是已經把旅行資料放在：

- Excel / Google Sheets
- Markdown / txt
- PDF / Word
- Canva
- Notes
- Screenshot / Image
- Mind Map
- Google Maps
- Email / Booking confirmation
- 各種個人 shorthand

這些工具很適合 **Planning**。

真正的產品機會假設是：

> **旅行開始後，這些 planning artifacts 不一定是最適合 execution 的介面。**

Trip Runtime 想補的是：

> **Travel Execution / Runtime Layer**

---

# 3. Product Boundary

## Trip Runtime 做

- Upload / Import existing itinerary
- Extract
- Understand structure and semantics
- Normalize
- Review / Correct
- Resolve places
- Enrich verified runtime-useful data
- Render
- Publish Live Travel Web
- Today / NOW / NEXT / Leave-by
- Directions / Reservation access

## Trip Runtime 不主動做

- AI Trip Planner
- Automatic recommendation
- Explore Nearby
- Automatic replanning
- Booking
- Expense
- Budget
- Packing
- Social
- Photo journal
- Gamification
- Full collaboration suite
- General-purpose travel chatbot

加入新功能前先問：

> **它是否直接改善 Existing Itinerary → Structured Trip → Useful Runtime UI？**

若否，預設延後。

---

# 4. Product Invariants

## 4.1 不要求使用者改變排行程方式

使用者可以繼續使用自己原本的工具。

Trip Runtime 應站在 planning workflow 後面：

> **排好了？丟過來。**

---

## 4.2 Preserve intent, not layout

不需要複製原始文件的外觀。

需要保留外觀所表達的意圖。

例如：

- Excel 黃色底色若代表「備案」，保留「備案」語意
- Canva sidebar 若代表 recommendation，不要變成 event
- Mind Map branch 若代表 alternatives，保留 branch relation
- `約 10:30` 不要偷偷變成 exact 10:30

---

## 4.3 不把旅行變成任務管理

必須保留：

- Flexible
- Free Time
- Optional
- Personal Note
- Unresolved
- Tentative
- Conditional / Fallback
- 「看體力」
- 「想去再去」
- 「不想逛就回飯店」

Optional 不顯示為 incomplete task。

---

## 4.4 Parser 保守

原則：

> **保留原文 > 自作聰明**

不確定時：

- 保留 source text
- 標 confidence
- 進 Review
- 不偷偷 resolve

---

## 4.5 AI 與 deterministic code 分工

AI：

- 理解自然語言
- 理解語意
- 判斷 section / relation
- 處理 fuzzy structure

Code：

- 日期是否合法
- 時間是否合法
- midnight rollover
- trip range
- duplicate / reconciliation candidate
- impossible sequence
- logical conflict

---

## 4.6 User Override 優先

```text
User Override
>
Verified External Data
>
Parser Result
>
Raw Source Inference
```

重新 parse / enrich 不可蓋掉人工修正。

---

## 4.7 Enrichment ≠ Recommendation

可以補：

- Maps
- address
- coordinates
- opening hours
- website
- future weather / flight / transit

但：

> 使用者排了一個地點，不代表系統可以自行塞附近熱門景點。

---

## 4.8 Source-specific extraction, source-agnostic rendering

新格式加入時，預設應該增加或擴充：

> **Source Adapter / extraction strategy**

而不是增加：

> **新的 Result UI family。**

例如：

```text
Markdown ─┐
XLSX ─────┤
PDF ──────┤
Notes ────┤
Visual ───┘
           ↓
   CanonicalTrip
           ↓
   same Result UI system
```

Renderer 不應出現：

```text
if source == "xlsx" → spreadsheet trip page
if source == "pdf"  → pdf trip page
```

---

## 4.9 Extract content + structure, not plain text only

「統一輸入」不代表先把所有 source 壓成純文字。

Source Adapter 應保留足以理解旅行語意的訊號，例如：

- Markdown heading / table / source order
- Spreadsheet row / column / merged cell / formula / hyperlink
- PDF / visual block position / grouping / embedded diagram relation
- Mind Map parent / child / branch relation

目標是：

> **統一 semantic understanding boundary，而不是統一 source 外觀。**

---

# 5. 三層資料架構

## Layer A — Source Data

原始文件。

例如：

```text
Markdown
XLSX
PDF
DOCX
Canva
Image
Mind Map
```

應保留原檔與 source trace。

### Source → Trip Processing Boundary

Layer A 到 Layer B 之間允許 source-specific processing：

```text
Source Data
↓
Source Adapter
↓
Extract + Reconstruct
↓
UnifiedSourceDocument
↓
Semantic Understanding
↓
ParsedTripDraft
↓
Review / Confirm
↓
CanonicalTrip
```

`UnifiedSourceDocument` 是 source-level normalized representation；`CanonicalTrip` 才是產品層 confirmed truth。

Source Adapter 是 implementation boundary，不是第四層產品資料 truth。

---

## Layer B — Trip Data

Canonical Trip Data。

這是產品的主要 Single Source of Truth。

Renderer 不直接理解原始文件。

---

## Layer C — Runtime Data

會變動的資訊：

```text
current time
weather
flight status
transit time
current location
opening status
```

---

## Renderer

```text
Trip Data + Runtime Data
↓
Presentation Projection
↓
Result UI
```

Presentation layer 決定 semantic 要如何呈現，但不能重新理解原始 source，也不能把 UI-only 欄位寫回 CanonicalTrip。

例如：

```text
Optional Activity
→ optional presentation pattern

Transit
→ connector

Free Time
→ flexible-space treatment
```

不是：

```text
XLSX
→ spreadsheet-looking Result UI
```

靜態 Trip Data 必須在 runtime API 掛掉時仍可用。

---

# 6. Review 是 Trust Layer

Parse 後不能直接宣稱理解正確。

第一個 trust moment：

> **我理解的是這樣，對嗎？**

Review 應聚焦：

- Trip range
- Flight
- Hotel
- Day skeleton
- Fixed / Reserved
- Optional / Flexible
- Low-confidence
- Conflict
- Ambiguous place

Correction UI 的用途是：

> **修 parser。**

不是完整 itinerary planner。

---

# 7. Result Web 核心

主要 View：

1. Today
2. Day
3. Overview
4. Map
5. Reservations

旅行前預設：

> Overview

旅行中預設：

> Today

Today 的第一優先：

```text
NOW
NEXT
LEAVE BY
```

使用者幾秒內要能知道：

- 現在在幹嘛
- 下一個不能錯過什麼
- 幾點要離開
- 是否已訂位
- 地圖怎麼開

Result UI 的 visual system 尚未 freeze。

目前 UI 決策流程：

```text
Response Page Research
↓
UI Skyline / Visual Direction
↓
Golden Screens
↓
06_RESULT_UI_SPEC refinement / freeze
↓
Component / Template implementation
```

`06_RESULT_UI_SPEC.md` 目前是 working draft，用來固定 Renderer boundary 與已確認的 semantic grammar；exact typography、spacing、surface、color、navigation 必須先經 Skyline / Golden Screen 驗證。

---

# 8. Prototype / Golden Result

User #0001：

**大阪・宇治・奈良**
2026/09/10–09/15

已有一個 Result Web Prototype：

`https://rayyyyyyyyyyyyyyyyyyyy.github.io/oosaka-trip/`

目前 Prototype 可視為：

> **Golden Result #001**

用途：

> 如果系統正確理解 Golden Input #001，最終 runtime experience 應接近這個方向。

已做：

- React / MUI
- GitHub Pages
- tripData.js
- phase detection
- Date Rail
- Event types
- Maps links
- Optional
- Reservation state
- NOW / NEXT prototype
- Leave-by prototype

已知技術債：

> NOW / NEXT 曾針對特定日期 hardcode，未來需由資料通用推導。

---

# 9. Real-world Input Research Current State

目前已分析：

> **25 組正式 itinerary samples**

已涵蓋：

- Google Sheets / XLSX
- Markdown / plain text / Mobile Notes
- Canva
- PDF
- JPG / infographic
- calendar grid
- detailed execution table
- operational workbook
- mind map
- research-heavy travel document

目前最重要的跨樣本結論：

1. Timeline 不是唯一結構。
2. Event 不是唯一 semantic unit。
3. Time 有多種 semantic roles，包含 open-ended time。
4. Low-detail / unresolved 可能是刻意的。
5. Layout / hierarchy 可能承載語意。
6. Source 本身可能錯。
7. 多人旅行可能 split / merge。
8. Resource 可能有 activation / validity / coverage。
9. Summary / Detail 可能是同一 conceptual event 的不同 representation。
10. Non-itinerary content 可能是 runtime-critical supporting data。
11. Markdown syntax 不等於旅行 semantic。
12. Parent activity 內可能存在 internal timetable，不能全部提升成 top-level events。

Sample #23：

> **External Markdown Benchmark #001**

是目前第一份可直接作為 Markdown V0 E2E fixture 的陌生人原生 Markdown。

Sample #24：

> **Busan.xlsx**

同時具有外部人工轉換 Web：

`https://bbmddt.github.io/busan-travel/`

因此形成：

> **Response Reference Pair #001**

Sample #25：

> **九州之旅.pdf**

沒有新增新的 trip backbone；主要補強 PDF extraction、ordered-stop semantics、resource return lifecycle / prerequisite、hard deadline，以及 embedded timetable / route diagram 作為 runtime-useful execution reference 的 evidence。這讓 cross-format semantic saturation 更接近 sufficient，但目前仍不正式宣告 reached。

完整 Input evidence：

`02_INPUT_RESEARCH.md`

完整 Result / Response Page evidence：

`04_RESPONSE_PAGE_RESEARCH.md`

---

# 10. Current Priority

## 已完成的研究轉折

舊文件曾把：

> 「第二份陌生人的 Markdown 能否直接跑完整 pipeline」

列為下一個立即實驗。

這仍然是 **V0 pipeline 必須驗證的能力**。在完成 25 組正式樣本的分析後，現有 evidence 已足以先建立保守、可擴充的 Markdown V0 邊界；研究仍持續，但不再阻塞 Markdown E2E。Sample #19～#22 帶來 derived / counterfactual data、跨日 resource economics、source day / calendar date 分離、contextual operational instruction、runtime-deferred decision 與 reference freshness；Sample #23 補上真實 Markdown parser edge；Sample #24 再補 parent activity internal timetable、booking release rule 與 open-ended time；Sample #25 沒有新增 trip backbone，主要補強 PDF、resource return prerequisite、sequence ordinal 與 deadline / execution-reference evidence。完整 Canonical Model 仍不可 freeze，但 Markdown V0 已有足夠 evidence 開始實作。

`02_INPUT_RESEARCH.md` 的 `Core / Preserve / Defer` 是跨格式 product-modeling decision layer，不等於目前 `build-trip-runtime-v0` 必須一次實作所有來源中出現的語意。Markdown V0 必須可靠理解會扭曲陌生 Markdown 行程的 Core semantics；只由複雜 workbook 證實、尚未由 Markdown fixture 驗證的 relationship 仍保留為後續 evidence。Preserve semantics 必須先被辨識、保留 source trace 並避免誤 event 化，但不代表 V0 要提供通用 knowledge-base UI、procedure engine 或 freshness verifier。

第二份陌生 Markdown 不是下一階段，而是目前 V0 的 acceptance gate。只有在原始 parser draft 達到零遺漏 critical event、零虛構 critical event、零 unsupported exact critical fact，且 fixture 已知 ambiguity 全部被送進 Review，才可開始 Hosted Delivery implementation。完整 draft / findings / corrections 僅保存在 sanitized benchmark fixtures；真實 production ReviewSession 仍為 memory-only。

## 目前順序

使用者後續決定：

> **先收集，再找怎麼解析。**

因此目前執行順序是：

```text
25-sample semantic inventory
↓
Minimal incomplete-capable canonical model
↓
Parser + deterministic validation
↓
Evidence-backed Review
↓
Stranger Markdown acceptance gate
↓
Hosted Delivery Lite
↓
Spreadsheet Travel Table
↓
Continue corpus research
```

理由：

> 避免先根據 User #0001 的資料形狀定 schema，再逼真實世界配合。

---

# 11. Roadmap

## Research 0 — Input Discovery（第一輪完成，持續收集）

目標：

- 收真實原始 itinerary
- 不要求整理
- 不統一格式
- 記錄新增 semantic case
- 觀察 semantic saturation

第一輪 exit condition：

> 現有 25 組樣本已足以避免只依 Golden Input #001 定義 Markdown V0；Sample 數量不等於獨立使用者數，完整 semantic saturation 尚未宣告，Canonical Model 尚不可 freeze，V0.2 extractor 仍須由後續樣本 evidence 驅動。

---

## V0 — Understand + Trust

```text
Markdown upload
→ structure-preserving extract
→ UnifiedSourceDocument
→ ParsedTripDraft
→ normalize
→ deterministic validation
→ evidence-backed Review
→ Confirmed CanonicalTrip
→ Presentation Projection
→ render
→ stranger Markdown acceptance gate
```

目的：

> 證明通用 understanding + trust pipeline，不是只服務 Golden Input #001。

Gate 必須分開量測：

```text
Parser Quality
= original ParsedTripDraft vs annotated fixture

Recovery Quality
= Confirmed CanonicalTrip vs annotated fixture
```

Hosted Delivery 可以提前設計或做 technical spike，但不得阻塞或擴大 `build-trip-runtime-v0`。

---

## V0.1 — Hosted Trip Delivery Lite

```text
Confirmed CanonicalTrip
→ positive allowlist projection
→ immutable PublishedTripSnapshot
→ TripPublication
→ stable unlisted slug
→ read-only hosted Viewer
```

邊界：

- `TripPublication` 只負責 where / whether / until when，不存 trip content。
- `PublishedTripSnapshot` 只負責 what is published，不等於 CanonicalExport。
- Publish / republish 必須用 positive allowlist。
- Republish 建立新 snapshot、驗證、atomic pointer swap，再刪除舊 snapshot。
- URL 是 unlisted，不是 private；任何持有連結者都能讀取。
- Viewer read-only；readiness 只是 publish 當下的 snapshot，不是 event completion。
- One-time recovery secret 支援 republish / revoke / delete / bounded expiry extension；不做 email recovery。
- 預設有 expiry，不承諾永久 URL或 snapshot history。

Hosted Delivery 是 Deliver capability，不是 Account / Persist capability。

---

## V0.2 — Spreadsheet Travel Table

先限定最小、有 evidence 的 spreadsheet 範圍：

```text
.xlsx
→ sheet enumeration
→ used ranges
→ raw / displayed values
→ merged cells
→ hyperlinks
→ basic formatting hints
→ travel-table semantic parse
→ same Draft / Review / Canonical pipeline
```

優先支援 one / few relevant sheets 的 travel table，不承諾 universal spreadsheet understanding。

---

## Later — Advanced Structured / Visual Sources

逐步加入：

- calendar grids
- cross-sheet reconciliation
- formula / derived / counterfactual semantics
- operational workbooks
- PDF
- visual documents
- image
- mind map

不是同時做完。

依 sample evidence 選 extractor。

---

## Evidence Required — Persist / Commercialization

只有真實使用 evidence 支持後才評估：

- Weather
- Flight status
- Live transit
- Account
- Email / identity recovery
- Cross-device ownership
- Multi-trip
- Mutable hosted readiness
- Cached / offline
- Platform AI billing
- Subscription

Runtime UX 不再單獨當作後續版本；Today、NOW / NEXT、leave-by、directions、reservations 已是 Golden Result 並必須貫穿每一個交付階段。

---

# 12. Current Status

```text
Product thesis                         ✓
Product boundary                       ✓
Golden Input #001                      ✓
Golden Result #001                     ✓
Published prototype                    ✓
Three-layer architecture direction     ✓
Review / override philosophy           ✓
Real-world input sample collection     ✓ ongoing
25 samples analyzed                    ✓
External Markdown Benchmark #001       ✓ collected
Response Reference Pair #001           ✓ collected
Markdown V0 research boundary          ✓ sufficient to proceed
Cross-format semantic saturation       not reached
Canonical Trip Data                    not finalized
Generic parser                         not built
Generic review UI                      not built
Markdown E2E                           not validated
XLSX / PDF extractor                   not built
Place resolution pipeline              not built
Runtime engine                         prototype only
UI Skyline                             not completed
Golden Screens                         not completed
06 Result UI Spec                      working draft, not frozen
Willingness to pay                     not tested
Business model                         not validated
```

---

# 13. 尚未驗證技術假設

- 是否需要 source-type-specific extractors
- layout understanding 成本
- spreadsheet structure reconstruction
- tree reconstruction
- semantic reconciliation
- parser accuracy / cost
- confidence 是否足以降低 review burden
- place resolution accuracy
- live data dependency design

---

# 14. 尚未驗證產品假設

## Runtime value

> 旅行開始後，使用者是否真的不再打開原始文件？

## Review tolerance

> 使用者願不願意 review，而且 correction 是否夠少？

## WTP

> 「把行程轉成 Live Travel Web」是否痛到值得付錢？

## Product vs Feature

> 這是不是 ChatGPT / Claude / Notion 很容易吸收的一個 feature？

## Frequency

> 低頻旅行是否讓 B2C retention 太弱？

## B2B

> 旅行社 / tour operator 的 white-label runtime itinerary 是否更合理？

---

# 15. 商業假設

尚未驗證。

### B2C
比月訂閱更合理的候選：

```text
Trip Pass
Free basic
NT$99–299 / trip
```

### B2B
可能價值：

> 旅行社繼續用 Word / Excel / PDF 製作行程，Trip Runtime 把既有行程單轉成 white-label live itinerary。

都不是已確認方向。

---

# 16. Kill Questions

任何 adversarial review 都應主動問：

1. 這是不是 feature，不是 product？
2. 為什麼不直接用 ChatGPT / Claude / Notion？
3. 原始文件真的有「旅行途中不好用」到需要另一層產品嗎？
4. Review friction 是否抵消 runtime benefit？
5. Parser / layout / resolution 成本是否過高？
6. 使用頻率是否太低？
7. 付費意願是否存在？
8. B2B 是否比 B2C 更合理？
9. Prototype 是否只是開發者自己覺得好用？
10. 何種實驗結果應該讓我們停止？

---

# 17. Prototype Success Definition

不是：

> 網頁很好看。

而是：

> **旅行開始後，使用者不再需要打開原始 itinerary。**

這是目前所有架構、UI、parser、runtime 討論的最高優先驗收標準。
