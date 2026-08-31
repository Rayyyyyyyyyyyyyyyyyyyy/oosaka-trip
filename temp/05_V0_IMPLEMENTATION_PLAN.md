# Trip Runtime — V0 Implementation Plan

> 核心目標：
> **Existing Itinerary → Structured Trip → Useful Runtime UI**
>
> Prototype 成功不是「畫面很好看」，而是：
>
> **旅行開始之後，使用者是否不再需要打開原本的行程文件。**

---

## 1. 目前產品定位

Trip Runtime 不是 AI Trip Planner。

使用者已經有自己的旅行行程，可能存在於：

- Markdown
- PDF
- Excel
- Word
- Notes
- 其他自己習慣的格式

系統不要求使用者重新排行程，也不主動優化原本的旅行邏輯。

核心流程：

```text
Upload
→ Source Adapter
→ UnifiedSourceDocument
→ Semantic Interpreter
→ ParsedTripDraft
→ Normalize
→ Deterministic Validation
→ Review
→ Resolve / Enrich
→ Confirmed CanonicalTrip
→ Render
→ Live Web
```

目前 V0 聚焦：

```text
Markdown upload
→ structure-preserving Source Adapter
→ UnifiedSourceDocument
→ Semantic Interpreter
→ ParsedTripDraft
→ deterministic validation
→ review
→ Confirmed CanonicalTrip
→ Presentation Projection
→ render
→ External Markdown Benchmark #001 gate
```

Publish 屬於 gate 通過後的 V0.1 Hosted Delivery Lite，不在 `build-trip-runtime-v0` 內。

## 目前 implementation hardening 狀態（2026-08-31）

`harden-trip-runtime-architecture` 已把目前 V0 實作補到以下 boundary：

- CanonicalTrip semantic validation：IANA timezone、HTTPS-only external link、日期關係、stable ID uniqueness、reservation / todo reference、relation consistency。
- Canonical save / load / JSON import / Review confirmation 共用 authoritative validation；invalid replacement 與 storage failure 保留舊 trip。
- Invalid persisted trip 不進 Viewer，回到 Home recovery surface，且不靜默刪除 local value。
- Review 逐筆顯示 parser warnings、broken evidence、traveler overrides 與 preserved reference block classification / reason / locator / content。
- App root 是 active-trip single owner；confirm、canonical import 與 scoped clear 不再依賴 page reload。
- Import reducer、request identity、AbortController、retry、confirmation 與 unmount cleanup 由 stable workflow hook 擁有；Drawer close 與 explicit cancel 是不同動作。
- Selectors 保留 canonical IDs，React collections 不再用 title、flight code 或 array index 當 identity。
- Viewer 已按具體責任拆成 DateRail、Overview、Today、Day、Reservations、TripMenu 與 runtime navigation；沒有加入 global store、repository abstraction 或第二套 component system。
- MUI 保留 interactive / accessibility ownership，Tailwind 保留 layout / responsive ownership，共享 visual values 由單一 CSS-variable token source 提供。

目前 automated baseline：23 個 test files、131 tests 通過。Production build 保留 parser / Review lazy chunks；main chunk 約 557.63 kB（gzip 171.70 kB），仍有 Vite 500 kB warning，先量測真實手機載入再決定是否進一步拆 chunk，不因 warning 加入 speculative dependency。

這個 hardening 不代表 External Markdown Benchmark #001 已通過，也不解除 Hosted Delivery implementation gate。

## 目前 MVP Result UI 狀態（2026-08-31）

`06_RESULT_UI_SPEC.md` 已記錄 **MVP UI Skyline #001 — Overview + Day**：

```text
Travel Notebook
×
Departure Energy
×
Runtime Clarity
```

已確認的方向包含 purposeful journey / place atmosphere、明亮但 restrained 的旅行色彩、editorial date hierarchy、單一 readiness attention、critical travel anchors、day journey index、fixed-anchor-first Day hierarchy、semantic timeline、transit connector、flexible space 與 `IF YOU STILL HAVE ENERGY` optional disclosure。

對應 planning change：

```text
openspec/changes/implement-mvp-result-ui-skyline/
```

該 change 的 proposal、design、spec 與 tasks 已完成並通過 strict validation，但 UI implementation 尚未開始。它只改 Overview + Day 的 presentation，不改 Home / Upload / Review / Today / Reservations、CanonicalTrip、parser、persistence、hosted delivery 或 External Markdown Benchmark #001 gate。

目前已取得：

> **External Markdown Benchmark #001 — Sample #23（韓國・首爾）**

下一個真正要驗證的不是「能不能再找到陌生 Markdown」，而是：

> **這份原生 Markdown 能否可靠走完整條 pipeline，且 Review correction cost 可接受。**

---

# 2. 從 AI Travel Planner 拆到的可用 Pattern

拆解對象的核心架構其實很薄：

```text
Form
→ Prompt Builder
→ Gemini
→ JSON Response
→ Parse
→ Renderer
```

它的價值不在「AI Planner」本身，而在幾個可以移植的工程 pattern。

---

## 2.1 Prompt Builder / Prompt Compiler

### 對方做法

表單本身不是核心。

真正發生的是：

```text
User Form State
→ deterministic prompt template
→ LLM
```

例如不同旅行類型會被轉成固定 pacing rule。

### Trip Runtime 採用方式

我們不會有「幫你規劃旅行」的 form。

Input 改成：

```text
UnifiedSourceDocument
+
Parser Rules
+
ParsedTripDraft Schema
+
Known Context
→ LLM Adapter Prompt
```

需要建立統一入口，例如：

```ts
buildParsePrompt({
  unifiedSourceDocument,
  schema,
  parserRules,
  context
})
```

`Prompt Builder` 是 Semantic Interpreter 選用 LLM implementation 時的內部組件，不是 Source Adapter 之後的獨立 architecture stage。

### 決策

**P0 — 採用**

不要讓 prompt 散落在不同 component 或 function 裡。

---

# 3. Structured Output

## 3.1 對方做法

對方要求 Gemini 回 JSON，並使用：

```text
responseMimeType: application/json
```

但實際上沒有完整 schema enforcement。

主要依賴：

```text
Prompt 中寫 JSON 範例
→ Gemini 回傳
→ 清理 ```json
→ JSON.parse()
```

這對 Prototype 夠用，但不適合 Trip Runtime。

---

## 3.2 Trip Runtime 做法

當 Semantic Interpreter 採用 LLM implementation 時，model output 必須經過真正的 schema validation。

流程：

```text
LLM Adapter Output
↓
JSON Decode
↓
ParsedTripDraft
↓
Schema + Deterministic Validation
↓
Review
```

不能只做到：

```js
JSON.parse()
```

### P0 Validation

至少檢查：

- required field
- enum
- date format
- time format
- stable id
- array/object structure
- trip date range
- impossible time ordering
- duplicated event
- invalid day assignment

### 決策

**P0 — 採用 structured output，但強化 validation**

---

# 4. Semantic Interpreter Strategy

`Semantic Interpreter` 接收 `UnifiedSourceDocument`，產生 `ParsedTripDraft`。

```text
Semantic Interpreter
├─ deterministic rules
├─ LLM
└─ hybrid
```

> **LLM 不是整個 Parser，而是 Semantic Interpreter 的其中一個 implementation。**

V0 可以先使用 LLM implementation，但對外 contract 應維持 provider-neutral，且不把 file reading、deterministic validation、user confirmation 或 rendering 塞進 model call。

## 4.1 V0 優先 One-shot Parse

第一版不要一開始就拆成很多 agent / stage。

如果 Markdown 規模合理：

```text
Markdown Source Adapter
↓
UnifiedSourceDocument
↓
Semantic Interpreter
↓
ParsedTripDraft
↓
Schema + Deterministic Validator
↓
Review / Confirm
↓
CanonicalTrip
```

Architecture mantra：

> **程式負責讀，LLM 負責懂，Validator 負責抓錯，使用者負責確認，Renderer 負責呈現。**

---

## 4.2 Chunking

對方會將長行程切成約 4 天一組生成，以避免：

- output token 過長
- JSON 被截斷
- 後段品質下降
- timeout

這個 pattern 值得採用，但 Trip Runtime 不能照抄「4 天」。

### Trip Runtime Chunking

```text
Small Source
→ One-shot Parse

Large Source
→ Semantic Chunk
→ Parse Each Chunk
→ Merge
→ Global Validation
```

未來不同 Source 可以有不同 chunk unit：

```text
Markdown → sections / headings
PDF      → pages / semantic sections
Excel    → sheets / logical tables
Word     → sections
```

---

## 4.3 Chunk Context

對方只保留上一 chunk 的最後狀態。

這容易造成：

- duplicate place
- duplicate restaurant
- repeated activity
- lost cross-day context

Trip Runtime merge 時需要保留最小必要 context，例如：

```json
{
  "trip_range": {},
  "known_days": [],
  "known_events": [],
  "known_places": [],
  "open_questions": [],
  "source_structure": {}
}
```

但不要把所有前文重新塞給模型。

### 決策

**P1 — 支援 chunking，但先以 One-shot 為 V0 主路徑**

---

# 5. Canonical Trip Data

這是產品 Single Source of Truth。

Renderer 不得直接理解：

- Markdown
- PDF
- Excel
- LLM raw response

只能吃 Canonical Trip Data。

---

## 5.1 三層資料架構

### Source Data

原始內容：

```text
Markdown
PDF
Excel
Word
Notes
```

### Trip Data

Canonical Trip JSON。

包含旅行本身相對穩定的結構化資訊。

### Runtime Data

會隨時間變化：

```text
Current time
Weather
Flight status
Transit time
Current location
Opening status
```

三者不可混在一起。

---

# 6. Canonical Event 必須補上的能力

AI Travel Planner 的 event 大概只有：

```json
{
  "time": "10:30",
  "type": "spot",
  "title": "...",
  "description": "...",
  "location_query": "..."
}
```

Trip Runtime 不夠。

---

## 6.1 Stable ID

每個 entity 都要有 stable ID。

例如：

```json
{
  "id": "evt_01J..."
}
```

用途：

- edit
- override
- resolution
- runtime attach
- reservation link
- source trace
- publish
- migration

### 決策

**P0**

---

## 6.2 Source Provenance

Parser 不可以只留下理解後的結果。

至少要能追溯：

```json
{
  "source": {
    "source_id": "src_...",
    "raw_text": "下午去大阪城附近晃晃",
    "location": {
      "section": "Day 2",
      "line_start": 18,
      "line_end": 18
    }
  }
}
```

V0 不一定需要 line-level 完美定位，但至少保留：

```text
source_id
source_text
source section
```

### 決策

**P0**

這是 trust layer 的核心。

---

## 6.3 Confidence / Review State

不確定時不要創造資訊。

例如：

```json
{
  "time": {
    "value": null,
    "raw": "下午",
    "confidence": 0.6
  },
  "review_status": "needs_review"
}
```

或較簡化：

```json
{
  "start_time": null,
  "source_time_text": "下午",
  "confidence": {
    "start_time": 0.4
  },
  "needs_review": true
}
```

### 決策

**P0**

---

## 6.4 Unresolved State

Place 不能只有：

```text
大阪城
```

然後假裝已經知道是哪裡。

例如：

```json
{
  "place": {
    "name": "大阪城",
    "status": "unresolved",
    "place_id": null,
    "address": null,
    "coordinates": null
  }
}
```

之後再 Resolve。

### 決策

**P0 schema support**
**P1 actual external resolution**

---

# 7. User Override

使用者人工修正永遠優先。

Priority：

```text
User Override
> Verified External Data
> Parser Result
> Raw Source Inference
```

不能像一般 Prototype 一樣直接 mutate parser result，導致不知道：

> 這是 AI 原本理解的，還是使用者後來改的？

需要保留 provenance。

---

## 7.1 V0 可以簡化實作

不一定一開始就建立完整 event sourcing。

可以：

```json
{
  "title": "大阪城公園",
  "meta": {
    "title_source": "user_override"
  }
}
```

或：

```json
{
  "parsed": {},
  "overrides": {}
}
```

Renderer 最後取 resolved value。

### 決策

**P0**

---

# 8. Deterministic Validator

Semantic Interpreter 不應負責所有 correctness，LLM 更不是整個 Parser。

Semantic Interpreter（V0 的 LLM implementation）：

```text
理解「這句話在講什麼」
```

Validator：

```text
檢查「這份資料是否合法」
```

---

## 8.1 V0 Validator

### Schema

- required fields
- enums
- correct types

### Date

- valid date
- within trip range
- day_index consistent with date

### Time

- valid HH:mm
- start/end consistency
- obvious ordering conflicts

### Duplicate

找可能重複：

```text
same date + same place
same title
same resolved place
same reservation
```

但 validator 不可自動刪除。

只產生：

```text
warning
```

---

## 8.2 Validation Result

建議：

```json
{
  "validation": {
    "errors": [],
    "warnings": [
      {
        "code": "POSSIBLE_DUPLICATE_EVENT",
        "event_ids": ["evt_1", "evt_2"]
      }
    ]
  }
}
```

### 決策

**P0**

---

# 9. Review Layer

Review 不是 Planner。

目的：

> 「我理解的是這樣，對嗎？」

而不是：

> 「要不要順便幫你把整趟旅程重新排漂亮一點？」

---

## 9.1 V0 Review 功能

需要：

- 查看 Day
- 查看 Event
- 修改解析錯誤
- 修改日期
- 修改時間
- 修改 title
- 修改 type
- 確認 / 修改 place text
- 保留原始 source text
- 顯示 needs review
- 顯示 validator warning
- delete parser mistake
- confirm

可以：

```text
+ Add missing event
```

但它的定位是：

> parser 漏掉了，使用者補回來。

不是 Planner。

---

## 9.2 暫時不要

- AI Optimize
- Regenerate Day
- Suggest Alternative
- Explore Nearby
- AI Recommendation
- Route Optimization

### 決策

**P0 Review**
**Planner capability 不做**

---

# 10. Renderer

Renderer 不直接理解 Source，也不直接把 Canonical entity 全部硬塞成 Card。

目前 presentation flow：

```text
CanonicalTrip
↓
Presentation Projection
↓
Semantic UI Templates
↓
Renderer
```

`Presentation Projection` 是 deterministic presentation layer，不是第二份旅行 truth。

它負責：

```text
Canonical semantic
→ presentation pattern
```

例如：

```text
Transit
→ connector

Optional
→ optional block

Free Time
→ flexible-space treatment

Fixed reservation
→ priority event treatment
```

它完全不知道：

- input 是 Markdown、Excel、PDF 還是其他格式
- parser 用 Gemini 還是 GPT
- source 原本長什麼樣

禁止：

```text
sourceType === "xlsx" → ExcelTripPage
sourceType === "pdf"  → PdfTripPage
```

新格式應優先擴充 Source Adapter，而不是 fork Renderer。

---

## 10.1 V0 Views

先做：

### Overview

旅行前預設。

需要快速看到：

- trip range
- cities
- flights
- hotels
- daily summary
- major reservations

### Day

單日 timeline。

需要呈現：

- date
- city
- events
- free time
- optional
- notes
- transit connective tissue

### Today

旅行中預設。V0 先使用 Canonical Trip Data 與當前 Japan time 提供：

```text
NOW
NEXT
source-derived Leave-by
```

只有 source data 足以支持時才可標示 `NOW` 或精確 Leave-by；不得補出來源沒有的時間精度。

### Runtime access

- reservations access
- directions fallback

Map 與完整 Reservations View 可在 gate 後擴充，但 directions 與 reservation 關鍵資訊的基本存取不可從 V0 Renderer 丟失。

---

## 10.2 External Result Baseline #001

目前已有一組 paired evidence：

```text
Busan.xlsx
→ https://bbmddt.github.io/busan-travel/
```

這份 Result 證明：

> Spreadsheet → mobile-friendly Web 本身已有價值。

值得參考：

- sticky day navigation
- day theme
- time + main content hierarchy
- reservation / Pass badge
- supporting images appendix

但它仍主要是 static webification。

Trip Runtime 不能只做到同樣的效果。

需要額外證明：

```text
Canonical semantics
+
Runtime context
→
NOW / NEXT / Leave-by / Reservation / Directions
```

以及：

> Alternative / Conditional / Flexible 不會被 flatten 成 display string。

完整 evidence 見：

`04_RESPONSE_PAGE_RESEARCH.md`

---

## 10.3 Visual Specification Dependency

Renderer architecture 已有 functional baseline；MVP Result UI 也已完成第一輪 Skyline，但 final visual system 仍不能在 Golden Screens / implementation evidence 前 freeze。

目前決策：

```text
Response Page Research
↓
MVP UI Skyline #001                    ✓ recorded
↓
implement-mvp-result-ui-skyline
↓
Golden UI #001 Overview / #002 Day
↓
06_RESULT_UI_SPEC refinement / freeze
↓
Component / Template refinement
```

`06_RESULT_UI_SPEC.md` 目前是 working draft，已固定 MVP hierarchy、rhythm、semantic treatment 與 surface language。

因此：

- Parser / Validator / Review 不需要等待 Golden Screen implementation。
- 現有 Overview / Day / Today prototype 可繼續作 functional baseline。
- Overview + Day visual implementation 依 `implement-mvp-result-ui-skyline` 的 spec / tasks 進行，不把 preview switch 當成 production navigation contract。
- Today、NOW / NEXT、Map、Reservations 不在這個 MVP visual change 內；既有 functional behavior 不得被移除或重定義。
- Exact typography / spacing / token values / navigation anatomy 由 prototype 與 browser evidence 收斂，不靠 agent 自行腦補。
- Golden Screens 成立後，再把驗證過的細節回寫 06 並決定 freeze 範圍。

---

# 11. Google Maps Fallback

對方做法很便宜：

```text
location_query
→ Google Maps search URL
```

Prototype 很實用。

Trip Runtime V0 可以採類似 fallback：

```text
unresolved place
→ Open Google Maps search
```

但 Canonical Data 必須標記：

```text
status = unresolved
```

不可假裝已完成 Place Resolution。

### 決策

**P0 fallback**
**P1 Place Resolution**

---

# 12. Lazy Enrichment

這是非常值得採用的 pattern。

不要 Parse 時就把所有東西查完。

流程：

```text
Parse
↓
Review
↓
Canonical
↓
Resolve / Enrich
```

未來可補：

- Google Maps
- address
- coordinates
- opening hours
- website
- flight data
- weather
- transit

Enrichment 不等於 Recommendation。

---

## 12.1 Enrichment 原則

只有補：

> 使用者原本已經排的東西。

不要因為：

```text
使用者排了大阪城
```

就順便加：

```text
附近推薦三間咖啡
附近人氣景點
```

### 決策

**P1**

---

# 13. Runtime Data

對方有一個明顯問題：

Weather 是 AI 生成的文字，而不是可信任的即時資料。

Trip Runtime 不可這樣做。

例如 Weather 必須是：

```json
{
  "weather": {
    "provider": "...",
    "fetched_at": "...",
    "forecast_for": "...",
    "data": {}
  }
}
```

Flight / Transit 同理。

### 決策

**V0 不做 Runtime API**
**但資料架構從一開始保持 Trip / Runtime 分離**

---

# 14. Local Persistence

目前不需要為了「像 SaaS」先做 Account / DB。

對方證明：

```text
localStorage
+
JSON export/import
```

已經足以支撐 Prototype。

---

## 14.1 V0 建議

Browser persistence：

```text
Source Data
Parsed Data
Review State
Canonical Trip Data
```

可以先存在 localStorage / IndexedDB。

---

## 14.2 JSON Import / Export

很值得現在就做。

不是給一般使用者炫技，而是：

- debug
- parser regression test
- fixture
- compare parse versions
- schema migration
- sharing test data

Export：

```json
{
  "schema_version": "0.1",
  "trip": {}
}
```

### 決策

**P0 / P1**

---

# 15. Schema Version

從第一版就加：

```json
{
  "schema_version": "0.1"
}
```

未來 Canonical Schema 一定會變。

沒有 version，後面 migration 會很痛。

### 決策

**P0**

---

# 16. 現階段不要做的東西

從 AI Travel Planner 拆到很多功能，但 Trip Runtime 不應照單全收。

---

## No — 明確不做

```text
AI Trip Planner
Regenerate itinerary
Recommendation Engine
Explore Nearby
Automatic Optimization
Automatic Replanning
Expense Tracking
Budget
Packing
Photo Journal
Social
Automatic Booking
Complex Collaboration
AI Chatbot
```

---

## Later — 不阻塞核心驗證

```text
City Guide
Menu Helper
Detailed AI attraction guide
Real Weather
Flight Status
Transit Runtime
Place Resolution API
Share
Account
PDF Export
```

加入前先問：

> **這個功能是否直接改善 Existing Itinerary → Structured Trip → Useful Runtime UI？**

如果沒有：

> 延後。

---

# 17. V0 建議 Architecture

```text
┌──────────────────────────────┐
│       Markdown Upload        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   Markdown Source Adapter    │
│ extract + reconstruct        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   UnifiedSourceDocument      │
│ content + structure + trace  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│    Semantic Interpreter      │
│ deterministic / LLM / hybrid │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       ParsedTripDraft        │
│ unconfirmed + source-traced  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Deterministic Validation    │
│ schema/date/time/conflict    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│           Review             │
│ source ↔ parsed correction   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Confirmed CanonicalTrip     │
│    Single Source of Truth    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   Presentation Projection    │
│ semantic → presentation      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          Renderer            │
│ Overview / Today / Day       │
└──────────────────────────────┘
```

---

# 18. P0 開發清單

下一版應優先完成：

## Data

- [ ] Canonical Trip Schema v0.1
- [ ] stable Trip / Day / Event IDs
- [ ] source_text / source_ref / source position
- [ ] source asset reference
- [ ] confidence
- [ ] review status
- [ ] unresolved state
- [ ] schema_version
- [ ] user override provenance

## Source Adapter / Semantic Interpreter

- [ ] Markdown structure-preserving extract
- [ ] Markdown AST ≠ semantic truth handling
- [ ] mixed time notation normalization
- [ ] open-ended time handling
- [ ] `UnifiedSourceDocument` contract
- [ ] provider-neutral `Semantic Interpreter` contract
- [ ] LLM implementation: Prompt Builder + structured parse
- [ ] deterministic / hybrid implementation seam
- [ ] malformed JSON handling

## Validator

- [ ] date validation
- [ ] time validation
- [ ] trip-range validation
- [ ] duplicate detection
- [ ] basic conflict detection

## Review

- [ ] Day / Event review
- [ ] original source visibility
- [ ] edit parsed fields
- [ ] mark confirmed
- [ ] warning display
- [ ] add parser-missed event
- [ ] delete parser-created mistake

## Renderer / Presentation

- [ ] deterministic Presentation Projection
- [ ] source-agnostic semantic template mapping
- [ ] no source-type branch in Result UI
- [ ] Overview
- [ ] Day
- [ ] Today functional baseline
- [ ] event-type rendering
- [ ] free_time rendering
- [ ] optional rendering
- [ ] transit connective-tissue rendering
- [ ] note rendering
- [ ] Google Maps search fallback

Visual refinement follows:

```text
MVP UI Skyline #001 ✓
→ implement-mvp-result-ui-skyline
→ Golden UI #001 Overview / #002 Day
→ 06_RESULT_UI_SPEC refinement
```

這個 visual track 不阻塞 Parser / Review acceptance。

## Persistence / Debug

- [ ] local persistence
- [ ] Canonical JSON export
- [ ] Canonical JSON import

---

# 19. P1

External Markdown Benchmark #001 acceptance gate 通過後：

### Hosted Delivery Lite
- [ ] positive allowlist projection
- [ ] immutable PublishedTripSnapshot
- [ ] TripPublication
- [ ] stable unlisted slug
- [ ] bounded expiry
- [ ] republish / revoke boundary

### Parser / Enrichment
- [ ] semantic chunking
- [ ] global merge validation
- [ ] Place Resolution
- [ ] verified Google Maps data
- [ ] better transit representation
- [ ] lazy enrichment
- [ ] Reservations View
- [ ] Map View

---

# 20. Later Live Runtime APIs

Today / NOW / NEXT / source-derived Leave-by 屬於核心 Runtime UX primitives，不依賴以下 live APIs。

確認「使用者旅行途中真的願意用」之後，再加入：

- [ ] Weather
- [ ] Flight Status
- [ ] Live Transit
- [ ] current location
- [ ] opening status

---

# 21. 第二個陌生人 Markdown 測試

Sample #23 已經提供 fixture。現在最重要的是跑完整 validation。

不要先測：

> 網站漂不漂亮？

要測：

```text
陌生人 Markdown
↓
系統理解
↓
使用者 Review
↓
修正成本
↓
結果是否可信
```

---

## 21.1 建議 Metrics

### Schema Validity

```text
LLM response 有多少比例可直接通過 schema？
```

### Field Extraction Accuracy

```text
日期 / 時間 / 地點 / event type / note
有多少抓對？
```

### Semantic Preservation

```text
Flexible
Free Time
Optional
Personal Note
是否被正確保留？
```

### Hallucination Rate

```text
AI 是否創造原文不存在的：
時間
地點
預約
交通
資訊
```

### Review Rate

```text
有多少 event 被標記需要確認？
```

### Correction Rate

```text
使用者需要改多少 field？
```

### Missing Event Rate

```text
原始 Markdown 中的 event 有多少被漏掉？
```

### False Event Rate

```text
Parser 多創造多少不存在的 event？
```

---

# 22. V0 成功門檻

真正要回答的不是：

> AI 看起來會解析。

而是：

> **External Markdown Benchmark #001 在不重新整理原始文件的情況下，能不能可靠變成可確認、可修正、可 render 的 Canonical Trip Data？**

如果答案還不穩：

不要加：

- Weather
- Flight
- Recommendation
- Account
- Expense
- Photos
- fancy AI features

繼續處理 Parser / Review / Canonical。

---

# 23. 建議開發順序

```text
1. Canonical Schema v0.1
      ↓
2. Markdown Source Adapter + UnifiedSourceDocument
      ↓
3. Semantic Interpreter contract
      ↓
4. V0 LLM implementation (Prompt Builder + structured output)
      ↓
5. Schema + Deterministic Validator
      ↓
6. Review UI
      ↓
7. Canonical persistence
      ↓
8. Presentation Projection + Overview / Day functional Renderer
      ↓
9. JSON import/export
      ↓
10. External Markdown Benchmark #001 acceptance test
```

只有第 10 步通過後：

```text
→ Place Resolution
→ Map
→ Reservations
→ Today Runtime
```

---

# 24. 一句話總結

AI Travel Planner 值得借的，是：

```text
Prompt Compiler
Structured Output
Chunking
Lazy Enrichment
Data-driven Renderer
Local Persistence
JSON Import / Export
```

Trip Runtime 真正必須補上的，是：

```text
Provenance
Stable IDs
Confidence
Review
Unresolved State
Deterministic Validation
User Override Priority
Trip / Runtime Separation
```

真正的產品差異不在：

> **用了哪個 AI。**

而在：

> **系統如何讓使用者相信，它沒有偷偷改掉、補掉或誤解原本的旅行。**
