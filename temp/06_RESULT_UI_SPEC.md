# Trip Runtime — Result UI Spec

> **Status: Initial Working Draft**
>
> 這份文件是 Result UI 的第一個迭代起點，不是已 freeze 的 visual spec。
>
> 目前先固定已確認的產品 / semantic rendering 邊界；真正的 typography、spacing、surface、color、navigation 與 component appearance，接下來要透過 **UI Skyline → Golden Screens** 探索後再逐步收斂。

---

# 1. Purpose

這份文件回答：

> **Confirmed CanonicalTrip 應該如何被投影成旅行途中好用、且具有一致產品語言的 Result UI？**

它不負責：

- Source extraction
- semantic parsing
- Review
- Canonical schema 定義
- Hosted publication lifecycle
- recommendation / planning

資料邊界：

```text
Source
→ Source-specific Adapter
→ UnifiedSourceDocument
→ Understand / Review
→ Confirmed CanonicalTrip
→ Presentation Projection
→ Semantic UI Templates
→ Result UI
```

這份文件只規範 `CanonicalTrip` 之後的呈現層。

Renderer 不應重新理解原始 Markdown、XLSX、PDF 或其他 source，也不應因 source format 建立另一套 UI family。

---

# 2. Current UI Thesis

Trip Runtime 的 Result Web 不是：

- itinerary dashboard
- card gallery
- recommendation feed
- travel social app
- destination magazine
- task manager

目前 visual direction：

```text
Editorial
×
Japanese Minimal
×
Utility
```

核心目標仍是：

> **旅行開始後，使用者不需要回頭打開原始 itinerary。**

因此畫面優先級必須服務：

```text
NOW
NEXT
LEAVE BY
Reservation / Ticket readiness
Directions
```

而不是服務「看起來功能很多」。

---

# 3. Source-independent Renderer

不同 source 不產生不同 UI family。

不要：

```text
Markdown → Markdown UI
Excel → Spreadsheet UI
PDF → PDF-like UI
```

應該：

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

Trip Runtime 保留 source intent，不複製 source layout。

---

# 4. Presentation Boundary

CanonicalTrip 描述：

> **它是什麼。**

Presentation layer 決定：

> **它怎麼顯示。**

不要把純 UI 資訊寫回 CanonicalTrip，例如：

```text
cardColor
cardVariant
heroSize
roundedStyle
optionalGreenCard
```

可使用中間 presentation projection：

```text
CanonicalTrip
↓
TripViewModel / Presentation Model
↓
UI Template
```

`TripViewModel` 不是第二份旅行 truth，只是 deterministic presentation projection。

Presentation layer 可以維護：

> **Semantic Template Registry**

概念例如：

```text
flight
→ FlightBlock

accommodation
→ StayBlock / CheckInBlock

fixed activity
→ TimelineEventBlock

optional activity
→ OptionalBlock

free_time
→ FlexibleSpaceBlock

transit
→ TransitConnector

runtime instruction
→ ContextReferenceBlock
```

這些名稱目前只是 conceptual grammar，不代表 component API 已 freeze。

Template Registry 必須：

- source-agnostic
- deterministic
- semantic-driven
- tolerant of missing / approximate data
- 不把 CanonicalTrip UI 化

---

# 5. Core Views

目前主要 Result Views：

1. Overview
2. Today
3. Day
4. Map
5. Reservations

目前優先探索 / 定型：

```text
Overview
Today
Day
```

Map / Reservations 可以沿用同一 visual language，但不應阻塞前三個核心 Skyline。

---

# 6. Overview

旅行前預設入口。

應讓使用者快速知道：

- 旅行日期
- 主要城市 / phase
- 航班
- 住宿
- 每日 skeleton / theme
- 重要 reservation / readiness

Overview 不應退化成 KPI Dashboard。

方向比較接近：

> **旅行文件的 opening spread / index**

而不是：

> **管理後台首頁**

暫定 hierarchy：

```text
Trip Identity
↓
Dates / Geography
↓
Critical Travel Anchors
Flight / Hotel
↓
Day Index
↓
Important Reservations / Readiness
```

Exact composition 尚未 freeze。

---

# 7. Today

旅行中預設入口。

Today 必須在數秒內回答：

```text
NOW
NEXT
LEAVE BY
```

並快速提供：

- reservation / ticket state
- directions
- critical runtime instruction
- later-today context

暫定 information hierarchy：

```text
Today Header
↓
NOW
↓
NEXT
├─ arrive / leave constraint
├─ reservation state
└─ directions
↓
Later Today
↓
Flexible / Optional
↓
Contextual Reference
```

不是每一層都必須是 Card。

---

# 8. Day

Day View 是完整單日 itinerary 的主要閱讀面。

應保留：

- date / day identity
- geography / day theme
- fixed anchors
- flexible space
- optional content
- alternatives
- transit connective tissue
- reservation state
- supporting notes

主要要求：

> **固定行程、可彈性內容與 supporting information 必須有不同的視覺重量。**

不能把所有 semantic 壓成等權 event list。

---

# 9. Semantic Presentation Grammar

UI template 應依旅行 semantic，而不是依 source format 選擇。

第一批需要有 presentation pattern 的 semantic：

```text
Flight
Accommodation
Fixed Event
Activity
Restaurant
Free Time
Optional
Alternative Group
Conditional / Fallback
Transit
Reservation / Readiness
Note
Runtime Instruction
Supporting Reference
Internal Timetable
```

---

# 10. Surface Types

**Template 不等於 Card。**

Result UI 至少允許：

```text
Plain block
Prominent block
Card / surface
Inline metadata
Badge
Connector
Nested content
Secondary surface
```

暫定使用原則：

### Prominent surface
只給真正需要強視覺權重的資訊，例如：

- NOW
- NEXT
- critical deadline
- critical reservation state

### Plain / restrained block
一般 itinerary content 預設使用。

### Connector
Transit 優先使用 connective treatment，而不是大型 event card。

### Nested content
Activity internal timetable 不應自動升成與 parent activity 平行的 top-level cards。

### Secondary surface
Supporting timetable、venue map、reference image、runtime instruction 可進 secondary surface。

---

# 11. Semantic Modifiers

同一 Event type 仍可能因 semantic state 呈現不同。

需要可視化但不能扭曲的 modifiers：

```text
exact
approximate
daypart
open-ended
no-time
reserved / ready
action-needed
optional
tentative
unresolved
conditional
fallback
all-day
```

核心原則：

> **visual precision 不得高於 source precision。**

例如：

```text
source: 約 10:30
```

不能在 UI 上看起來與 exact `10:30` 完全相同。

---

# 12. Free Time

Free Time 是 first-class itinerary content。

不要顯示成：

```text
☐ Free Time
```

也不要製造 incomplete / guilt state。

它應該在視覺上保留空間感，讓使用者理解：

> 這段時間本來就是留白。

Exact typography / layout 待 Skyline 決定。

---

# 13. Optional

Optional 不屬於 incomplete task。

目前保留的產品語法：

```text
IF YOU STILL HAVE ENERGY
```

Optional 應：

- 與主 timeline 區分
- 不搶 fixed anchor 的 hierarchy
- 不灰到像 disabled / unavailable
- 不顯示 completion pressure

---

# 14. Alternative / Conditional

Alternative 不應 flatten 成：

```text
A / B / C
```

如果 source semantics 能支持，UI 應讓使用者理解：

```text
Dinner
├─ Option A
├─ Option B
└─ Go back to hotel
```

Conditional / Fallback 亦應保留 relationship，而不是只塞進 note。

是否使用 cards、tabs、stack、inline choice language，待 Skyline 探索。

---

# 15. Transit

Transit 是 event 之間的 connective tissue。

預設方向：

```text
Event A
   │
   │ 24 min · Train
   ↓
Event B
```

而不是：

```text
[Event Card]
[Huge Transit Card]
[Event Card]
```

只有 transport 本身是 critical itinerary entity，例如 flight / booked long-distance transport，才提升 visual weight。

---

# 16. Reservation / Readiness

Readiness 表示：

> **旅行依賴的東西是否準備完成。**

不是：

> **景點是否完成。**

因此：

```text
ready ≠ event completed
```

適合呈現：

- reservation
- ticket
- document
- payment
- other trip dependency

Hosted Lite 的 published viewer 只顯示 snapshot state，不提供 write-back。

---

# 17. Supporting Reference

Supporting content 不應因為不是 event 就消失。

可能包含：

- timetable
- route diagram
- venue map
- operational instruction
- reference image
- booking rule

預設不塞進每一張 event card。

應探索：

```text
secondary drawer
context panel
appendix
expandable reference
contextual inline access
```

哪一種最適合 runtime 使用。

---

# 18. Visual Hierarchy Principles

目前已確認：

- whitespace 是主要結構工具
- typography 比大量 decoration 更重要
- date hierarchy 必須清楚
- surfaces restrained
- mobile-first
- utility > decoration
- exact / flexible / optional / critical 必須有不同重量

避免：

- card-everything
- dashboard overload
- 藍綠旅遊 SaaS gradient
- destination photo wallpaper
- recommendation feed
- social feed
- gamification
- 「Adventure awaits」式旅行 template
- 每個 event 用不同彩色分類

---

# 19. Color Direction

**尚未 freeze。**

目前只先固定策略：

```text
Neutral-dominant base
+
restrained accent
+
semantic state when necessary
```

顏色優先表達：

- critical state
- warning
- readiness
- unresolved
- optional / secondary hierarchy

不要預設：

```text
flight = blue
hotel = purple
restaurant = orange
activity = green
```

Event type 應主要靠 hierarchy、label、iconography 與 structure 辨認。

---

# 20. Typography Direction

**尚未 freeze。**

Skyline 要探索：

- date hero scale
- trip title scale
- event title scale
- time treatment
- metadata scale
- note line-height
- eyebrow / section label
- multilingual Japanese / Traditional Chinese / Latin readability

重要原則：

> 同一畫面不可讓所有資訊看起來同等重要。

---

# 21. Mobile / Desktop

Mobile 是 primary runtime surface。

假設使用者可能：

- 一手拿手機
- 站在月台
- 邊走邊看
- 只看三秒

Desktop 不應因此變成另一套 dashboard architecture。

目前方向：

> Desktop 是同一份 travel document / runtime interface 的較寬版本，而不是管理後台。

Exact max-width、columns、navigation behavior 待 Skyline。

---

# 22. Motion

Motion 只服務 orientation / state change。

可以探索：

- subtle view transition
- accordion / reference expansion
- sticky navigation state
- NOW / NEXT state transition

避免：

- event card entrance animation everywhere
- parallax
- decorative carousel motion
- animation that slows urgent access

---

# 23. Skyline Before Freeze

目前 06 的 visual rules 只到「方向與邊界」。

下一個工作不是直接把這份文件變成 Design Token Bible。

應先做：

```text
Reference Research
↓
UI Skyline
↓
Golden Screens
↓
Update / Freeze 06_RESULT_UI_SPEC
```

UI Skyline 要回答：

1. 頁面整體輪廓是什麼？
2. Date / Day hierarchy 長什麼樣？
3. NOW / NEXT 到底多 prominent？
4. Event 是 timeline、document block、card，還是混合？
5. Whitespace rhythm 是什麼？
6. Navigation 長什麼樣？
7. Color / type 的情緒是什麼？
8. Desktop 如何延展但不 dashboard 化？

---

# 24. First Golden Screens

先只要求三張主要 Golden Screen：

```text
Golden UI #001 — Overview
Golden UI #002 — Today
Golden UI #003 — Day
```

接著用 stress cases 驗證語言是否成立：

```text
Free-time-heavy Day
Optional-heavy Day
Reservation-heavy Day
Alternative / Conditional Day
Flight / Hotel transition Day
All-day Activity
Unresolved / approximate-time Day
```

Golden Screen 的用途不是讓每一趟旅行長一模一樣。

而是固定：

- hierarchy
- rhythm
- semantic treatment
- surface language
- navigation behavior

---

# 25. What Is Not Frozen Yet

目前明確未定：

- exact font family
- font sizes / line heights
- spacing scale
- container width
- border radius
- shadows
- exact colors
- icon set
- day navigation pattern
- Today composition details
- desktop layout
- reference / appendix interaction
- component library anatomy

在 Skyline / Golden Screens 完成前，不應把這些寫成不可變 implementation rule。

---

# 26. Iteration Rule

每次 UI iteration 先問：

> **這次是在改善 runtime comprehension，還是在增加 decoration？**

採用一個 pattern 前再問：

> **它是否能一致地承接 Canonical semantics，而不是只對 Golden Input #001 好看？**

如果不能：

> 不升級成 Result UI rule。

---

# 27. Current Success Test

Result UI 的核心驗收不是：

> 網站漂不漂亮？

而是：

```text
我現在在做什麼？
下一個不能錯過的是什麼？
幾點要走？
票 / 預約準備好了嗎？
怎麼去？
```

使用者是否能在幾秒內得到答案。

最終仍以這句為最高標準：

> **旅行開始後，使用者是否不再需要打開原始 itinerary。**
