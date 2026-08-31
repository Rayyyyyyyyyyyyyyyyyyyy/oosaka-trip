# Trip Runtime — Pipeline Spec

> 這份文件只描述：
>
> **Source → Canonical Trip Data → Renderable Trip**
>
> 不描述完整 UI，不描述商業模式。

---

# 1. Pipeline

```text
Upload
→ Validate
→ Source-specific Extract / Reconstruct
→ UnifiedSourceDocument
→ Semantic Interpreter (Classify + Interpret Intent)
→ ParsedTripDraft
→ Normalize
→ Reconcile
→ Validate
→ Review / Correct
→ Resolve / Enrich
→ Canonical Trip Data
→ Presentation Projection
→ Render
```

Hosted Delivery 是通過 External Markdown Benchmark #001 acceptance gate 後的獨立層：

```text
CanonicalTrip
→ positive-allowlist projection
→ PublishedTripSnapshot
→ TripPublication
→ read-only unlisted Viewer
```

原則：

> 不用 60 個 stage 名稱描述同一件事。

每一層只需要有清楚責任、輸入、輸出與 failure behavior。

## 1.1 Three Important Boundaries

### Source Adapter boundary

不同 source 可以有不同 extraction / reconstruction strategy：

```text
Markdown
XLSX
PDF
Image
Mind Map
...
↓
source-specific adapter
↓
UnifiedSourceDocument
```

`Source Adapter` 是 implementation abstraction，不要求增加新的產品 stage 名稱。

它的責任是：

> **取得足夠的內容與結構訊號，讓後續 Semantic Interpreter 不必直接理解檔案格式。**

### Semantic Interpreter boundary

```text
UnifiedSourceDocument
↓
Semantic Interpreter
↓
ParsedTripDraft
```

`Semantic Interpreter` 是穩定的 responsibility boundary，不是 `LLM` 的同義詞。

```text
Semantic Interpreter
├─ deterministic rules
├─ LLM
└─ hybrid
```

> **LLM 不是整個 Parser，而是 Semantic Interpreter 的其中一個 implementation。**

這個 boundary 負責理解 block / section / relation / intent，並產生可追溯 source evidence 的 `ParsedTripDraft`。Prompt Builder 與 model adapter 都是 LLM implementation 內部細節，不是另一條 top-level pipeline。

Architecture mantra：

> **程式負責讀，LLM 負責懂，Validator 負責抓錯，使用者負責確認，Renderer 負責呈現。**

### Presentation boundary

確認後：

```text
CanonicalTrip
↓
Presentation Projection
↓
Result UI
```

Renderer 不得根據 source type 選擇另一套 Result UI architecture。

因此新 source format 的預設擴充點是：

> extraction / reconstruction

不是：

> Renderer fork

---


# 2. Stage A — Upload

## Input

使用者原始 itinerary。

## Output

```json
{
  "upload_id": "...",
  "filename": "...",
  "mime_type": "...",
  "size": 0,
  "uploaded_at": "...",
  "status": "uploaded"
}
```

## Rule

原始 Source Data 在 active ReviewSession 期間必須可供 extraction、Review 與 correction 使用，但 production V0 為 memory-only，不做 durable retention。確認或放棄 Review 後，原始 bytes、完整 extracted blocks、source excerpts 與 model response 必須丟棄。

Sanitized benchmark fixture 可以另外保存 ParsedTripDraft、findings、corrections 與 Confirmed CanonicalTrip；不得把真實 production ReviewSession 當 benchmark 保存。Hosted storage 不得接收 raw source 或 Review evidence。

---

# 3. Stage B — File Validation

檢查：

- supported type
- size
- empty
- encoding / readability
- basic corruption

失敗：

> 清楚說不能讀，不要進 AI 後才爆炸。

---

# 4. Stage C — Extraction

Extraction 不是 semantic parsing。

它的責任：

> **盡可能保留原始文件提供的結構訊號。**

---

## Markdown

保留：

- raw source text
- heading
- paragraph
- list
- table
- checkbox
- links
- image / asset references
- emphasis
- source order
- source position

注意：

> Markdown AST 是 structural evidence，不是 semantic truth。

例如：

```text
A > B > C
```

可能是 itinerary sequence，而不是真正的 blockquote。

Relative image asset 缺失時必須保留 reference 並繼續 parsing，不能讓整份 itinerary fail。

---

## XLSX / Google Sheets

保留：

- workbook
- sheet
- row / column
- merged cells
- blank cells
- raw values
- formulas
- calculated / effective values
- hyperlinks
- formatting hints
- embedded images

先判斷結構更像：

- row timeline
- calendar grid
- mixed calendar grid
- multi-sheet operational workbook
- place/reference table
- reference / modeling sheet
- mixed worksheet

Formula 與 calculated result 是 source evidence，但不必然是 execution fact。Extractor 必須保留它們與 raw input 的關係，後續 parser 才能區分實際採用內容、derived value 與 counterfactual comparison。

---

## PDF / Canva / Image

盡量取得：

- text block
- bounding box / coordinates
- page
- grouping
- image / caption relation
- visual hierarchy

不能預設：

```text
OCR → plain text
```

就足夠。

Embedded timetable / route diagram may be runtime-useful evidence。Extraction 必須保留 visual asset 與 page / block / surrounding itinerary 的關係，不可只抽 text layer 或 OCR 後丟棄圖表結構。

---

## Mind Map

理想：

- 原始 node structure

若只能 image：

- node detection
- parent-child reconstruction
- branch relation

---

# 5. Stage D — Structural Reconstruction

回答：

> 這份 source 是怎麼組織的？

例如：

- Trip metadata
- Day
- Timeline
- Reference section
- Research section
- Packing
- Budget
- Place database
- Overview
- Detail
- Tree branch

這一步先建立 source structure，不急著產生 canonical events。

## 5.1 UnifiedSourceDocument

Extraction + Structural Reconstruction 的共同輸出應形成 source-neutral 的：

> **UnifiedSourceDocument**

它不是 CanonicalTrip，也不是 plain-text dump。

至少要能承接：

- ordered blocks
- structural role / hierarchy
- raw text or raw value
- source locator
- links / asset references
- source-specific structural hints
- unresolved visual / relational evidence

概念：

```text
Raw Source
↓
Source Adapter
↓
UnifiedSourceDocument
↓
Semantic Interpreter
↓
ParsedTripDraft
```

後續 Semantic Interpreter 應盡量依賴 `UnifiedSourceDocument`，而不是直接依賴：

```text
Markdown AST
XLSX workbook object
PDF page object
```

格式細節若仍有必要，可以透過 source hints / locator 被保留，但不得把 source-format branch 一路洩漏到 Renderer。

---

# 6. Stage E — Section / Block Classification

每個 block 先分類用途。

候選：

```text
trip_metadata
itinerary
day
transport
accommodation
reservation
reference
research
recommendation
runtime_instruction
operational_procedure
background
reference_freshness
runtime_deferred_decision
explicit_intra_source_reference
preparation
packing
budget
shopping
personal_note
unknown
```

重要：

> Non-itinerary 不代表垃圾。

可以：

- 保留為 reference
- 暫不 render
- 暫不納入 MVP

但不能誤 event 化。

---

# 7. Stage F — Semantic Interpretation

這一步才理解人話。

Stage E 的 block / section classification 與 Stage F 的 intent interpretation 共同屬於 `Semantic Interpreter` boundary。二者可以由 deterministic rules、LLM 或 hybrid 實作；V0 使用 LLM 不代表整條 parser pipeline 等於 LLM。

需要理解：

- event / activity
- time semantic
- open-ended time
- place
- address-first place
- flexibility
- optional
- alternative
- conditional
- fallback
- tentative
- participant relation
- reservation / state
- resource
- derived / calculated value
- counterfactual / comparison option
- source-day relation
- contextual runtime instruction
- operational procedure / prerequisite
- explicit intra-source reference
- runtime-deferred decision
- option-specific downstream action
- reference freshness / validity statement
- activity internal timetable
- booking release rule
- note

原則：

> 不確定就保留 raw text + confidence。

Output：

> **`ParsedTripDraft` — 可追溯、可驗證、尚未經使用者確認的 semantic interpretation。**

---

# 8. Stage G — Normalization

把不同 source 表達轉成一致 semantic representation。

Normalization 不等於補完資料。

### 可以 normalize

```text
2026/9/12
→ 2026-09-12
```

### 不應破壞

```text
約 10:30
→ exact 10:30
```

應保留：

```text
value = 10:30
precision = approximate
```

Cross-midnight normalization 必須分開保存 source representation 與 calendar interpretation。例如來源的 `24:00–06:30` 可 normalize 為下一日 `00:00–06:30`，但仍須保留原本的 `24:00` 表達與 source-day grouping；不能因 calendar rollover 就把活動移出使用者定義的那一天。


Open-ended time 也是合法輸入：

```text
18:30~
```

應 normalize 為：

```text
start = 18:30
end = null
```

而不是判為 malformed range。

---

# 9. Stage H — Reconciliation

處理：

> 不同 source block 是否在講同一件事？

例：

```text
Overview: 阿蘇神社
Detail: 10:40–11:40 阿蘇神社
```

不是兩個 events。

Reconciliation 應保留：

- source A
- source B
- merged conceptual entity
- confidence

不要只用 place name 做 naive dedupe。

---

# 10. Stage I — Deterministic Validation

AI 理解完後，code 抓可判斷的問題。

---

## Date

- valid date
- trip range
- cross-midnight
- date inheritance

## Time

- valid time
- end before start
- impossible duration
- sequence conflict
- open-ended time 不得被誤判為 invalid range

## Flight / Transport

- arrival / departure sequence
- airport conflict
- terminal consistency when available

## Duplicate / Reconciliation

- suspicious duplicates
- overview/detail candidate
- repeated copy-paste candidates

## Resource

- validity window
- reservation buffer
- activation dependency
- multi-day coverage
- derived / counterfactual cost model 不可直接當成實際支出或同時發生的 events

---

# 11. Validation Output

不要偷偷改 source。

範例：

```json
{
  "severity": "warning",
  "type": "location_conflict",
  "message": "Destination says Cheongju Airport but note mentions Daegu Airport.",
  "source_refs": ["..."]
}
```

---

# 12. Stage J — Review

Review 的目的：

> **建立 trust，不是重填旅行。**

優先顯示：

- trip range
- flights
- hotel
- day skeleton
- reservations
- optional / flexible
- low confidence
- conflict
- ambiguous place
- participant split if relevant

Review finding visibility 是 acceptance behavior，不只是 UI polish：

- 每一個 blocking finding 與 warning 都要顯示 severity、message 與 affected entity / field。
- Parser ambiguity、conflict、low-confidence 與 non-itinerary note 不得只被折疊成 aggregate count。
- Preserved reference block 要能檢視 classification、reason、locator 與可用的 inert source content，但不能因此被提升為 committed event。
- Provider evidence 引用不存在的 source block 時，要標記為 broken provider evidence；不能當成已驗證 provenance。
- Traveler 在 Review 人工補上的內容保留 override identity，允許沒有 source excerpt，且 confirmation 不得替它製造 evidence。
- 以上完整 evidence 仍只存在 memory-only ReviewSession；Confirmed CanonicalTrip 與 CanonicalExport 只保留 allowlisted facts、override 與 stable provenance identifier / locator。

---

# 13. Correction

第一版只讓使用者修：

- title / name
- date
- time
- semantic type
- reserved / ticketed
- optional / tentative
- participant assignment
- notes
- place selection

不要膨脹成 planner。

---

# 14. Override Model

所有人工修正要留下：

```text
user_override = true
```

後續：

- reparse
- enrich
- resolve

都不能蓋掉。

Priority：

```text
User Override
>
Verified External Data
>
Parser Result
>
Raw Source Inference
```

---

# 15. Stage K — Place Resolution

Parser 先理解 raw place。

例如：

```text
清次郎 北新地店
```

Resolution 才找：

- canonical name
- address
- lat/lng
- maps link

若多個候選：

> 問使用者。

不要偷偷挑最熱門。

---

# 16. Enrichment

可補：

- map
- address
- coordinates
- website
- opening hours

未來：

- flight status
- weather
- transit

Rule：

> Enrichment 不能新增 itinerary intent。

---

# 17. Canonical Trip Data

Schema 尚未 finalized。

但 Canonical 層應至少能承接目前 evidence 中必要的概念，而不是只適配 Golden Input #001。

25-sample research 顯示後續模型還需處理 `Trip → Region/City Phase → Day → Event`、隨 phase 改變的 participant membership、source day 與 calendar date 分離、跨日 resource coverage、execution fact / derived value / counterfactual option 的區別，以及 contextual operational instruction、explicit intra-source reference、runtime-deferred decision 與 reference freshness。

Sample #24 另外補強 parent activity / internal timetable、booking release rule 與 open-ended time；其中 open-ended time 屬 Core，internal timetable 與 booking release rule 目前先 Preserve。

Result / Response Page evidence 另由 `04_RESPONSE_PAGE_RESEARCH.md` 維護，不讓 Renderer pattern 反過來污染 Source semantic model。

Research 的 `Core / Preserve / Defer` 是跨格式 product-modeling decision layer：

- `Core`：忽略會扭曲 itinerary 或 runtime 行為。
- `Preserve`：必須辨識、保留 source trace、避免誤 event 化，但不要求立即建立專屬 UI 或 engine。
- `Defer`：明確不讓高複雜度長尾能力主導目前版本。

這個 decision layer 不代表 Markdown-only V0 必須立即加入所有只由複雜 workbook 證實的欄位；目前 runtime schema 也不得宣稱為已 freeze 的完整跨格式模型。V0.2 只先處理 narrow Spreadsheet Travel Table，advanced workbook relationships 仍由 fixture evidence 決定。

Renderer 的產品資料來源只能是：

> **Canonical Trip Data + Runtime Data**

Renderer 前可以存在 deterministic `Presentation Projection`，但不得重新讀：

- Markdown
- XLSX
- PDF
- extracted blocks
- UnifiedSourceDocument

Source-specific logic 必須在 extraction / reconstruction boundary 被 containment。

---

# 18. Source Traceability

Canonical entity 應保留穩定 provenance identifier 與 locator；完整 source evidence 只存在 active ReviewSession。

至少：

```json
{
  "source": {
    "source_id": "...",
    "locator": "..."
  }
}
```

用途：

- review
- correction
- parser debugging
- reconciliation
- audit

---

# 19. Runtime Data Separation

Canonical Trip Data 不應被 live state 污染。

```text
Trip Data
+
Runtime Data
→ Renderer
```

Runtime：

- current time
- current location
- flight status
- weather
- transit estimate

API 掛掉：

> Trip Data 還是要完整可看。

Active-trip 與 import lifecycle 的 implementation ownership：

```text
App root
→ active confirmed trip / sample mode

stable import workflow owner
→ reducer state / request id / AbortController / retry / confirmation

temporary Home or Drawer surface
→ presentation controls only
```

Candidate replacement 必須採 `validate → persist → update active trip`。Validation、provider、Review、serialization 或 storage failure 都不得先改掉既有 confirmed trip。關閉 temporary Drawer 只關閉呈現，不偷偷取消 request；explicit cancel 才 abort，且 stale response 永遠不能推進 workflow。

---

# 20. Presentation / Render / Hosted Delivery Boundary

經過 Review / Resolve：

```text
Canonical Trip Data
↓
Presentation Projection
↓
Renderer
↓
Local Viewer
```

`Presentation Projection` 的責任是把 Canonical semantic 轉成可 render 的 presentation model / semantic template choice，例如：

```text
Optional Activity
→ optional block

Transit
→ connective tissue

Free Time
→ flexible-space treatment

Reservation readiness
→ state metadata / badge
```

它不能：

- 重新解析 raw source
- 猜新的 itinerary intent
- 修改 CanonicalTrip
- 根據 input format 建立另一套 UI family

因此：

```text
Markdown / XLSX / PDF / ...
↓
CanonicalTrip
↓
same Result UI system
```

`06_RESULT_UI_SPEC.md` 定義這個 presentation / visual boundary；目前仍是 working draft。MVP UI Skyline #001 已固定 Overview + Day 的 hierarchy、rhythm、semantic treatment 與 surface language，接下來由 `implement-mvp-result-ui-skyline` change 產生 Golden Screens 與 implementation evidence；exact visual tokens、navigation anatomy 與 component API 仍未 freeze。

這個 Skyline 不改變 pipeline ownership：journey / place atmosphere 只能由 CanonicalTrip 的 supported facts 與 deterministic Presentation Projection 產生。Renderer 不得為了視覺稿讀 raw source、推論地標 / 天氣 / 路線，或把 `heroMood`、`routeColor`、`dayIllustration` 等 UI-only fields 寫回 CanonicalTrip。

這是 `build-trip-runtime-v0` 的終點。它不產生 `PublishedTripSnapshot`、`TripPublication`、hosted URL、recovery secret 或 expiry。

只有 stranger-Markdown acceptance gate 通過後，獨立的 `hosted-trip-delivery-lite` change 才能把 confirmed CanonicalTrip 經 positive allowlist 投影成 immutable viewer-safe snapshot，再建立 bounded-expiry、read-only、unlisted publication。

旅行前：

> Overview

旅行中：

> Today

---

# 21. V0

V0 不需要一次吃掉所有 source。

在 Input Research 接近 semantic saturation 後，先證明：

```text
Markdown
→ Extract
→ Parse
→ Validate
→ Review
→ Canonical Trip Data
→ Render
→ External Markdown Benchmark #001 acceptance gate
```

Gate 通過後才依序進入 Hosted Delivery Lite 與 narrow Spreadsheet Travel Table；PDF、visual、mind map 與 advanced spreadsheets 仍由後續 evidence 決定。

不在 Markdown V0 內直接加入：

- XLSX
- PDF
- visual
- mind map

---

# 22. Metrics

最值得追：

### Parse success
能否形成可 review 的 trip。

### Correction rate
每份要人工改多少。

### Critical correction rate
Flight / date / reservation / place 等關鍵欄位錯多少。

### Time to viewer
Upload → usable result 花多久。

### Runtime reopen rate
旅行途中是否真的回來。

---

# 23. Failure Principle

任何一層失敗都不要讓整條產品變黑箱。

例如：

### Extraction failure
> 我讀不到這份檔案。

### Parse uncertainty
> 我不確定這段是固定行程還是候選清單。

### Resolution ambiguity
> 我找到兩個同名地點。

### Runtime API failure
> Travel time currently unavailable.

但：

> 靜態 itinerary 仍可看。
