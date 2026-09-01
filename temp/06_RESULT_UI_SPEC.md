# Trip Runtime — Result UI Spec

> **Status: Working Draft — MVP Skyline #001 recorded**
>
> 這份文件是 Result UI 的第一個迭代起點，不是已 freeze 的 visual spec。
>
> 目前已固定產品 / semantic rendering 邊界，並記錄第一個 MVP UI Skyline。Skyline 固定的是 hierarchy、rhythm、semantic treatment 與 surface language；exact typography、spacing、color token、navigation anatomy 與 component API 仍需經 Golden Screens 驗證後再 freeze。

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

Skyline 已確認它需要較多留白與較柔和、低壓力的 treatment；exact typography / layout 待 Golden Screen / implementation prototype 決定。

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

是否使用 cards、tabs、stack、inline choice language，待 Golden Screen stress case / implementation prototype 探索。

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

MVP Skyline 已固定 editorial date / trip typography 與 utility event / metadata typography 的角色分工；Golden Screens 仍需收斂：

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

Exact max-width、columns、navigation behavior 待 implementation prototype；不得因此把 desktop 改造成 dashboard。

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

# 23. MVP UI Skyline #001 — Overview + Day

> **Recorded: 2026-08-31**
>
> **Scope: MVP Result UI only**
>
> **Status: Direction accepted; exact visual tokens are not frozen**

這一輪先固定：

```text
Travel Notebook
×
Departure Energy
×
Runtime Clarity
```

第一版只呈現克制的 editorial itinerary document，資訊清楚但缺少「要出去玩」的情緒，因此不採用為 MVP Skyline。

採用版保留 Japanese-minimal 與 utility hierarchy，但增加與旅行內容直接相關的期待感：

- 明亮的天空、日光、河流與移動路線語彙
- 城市之間正在展開的 journey，而不是靜態資料表
- 少量具有旅行手帳感的 stamp / caption
- 真實 itinerary 的幽默與留白，不套用通用旅遊宣傳文案
- 深色模式仍保留可辨識的旅行色彩，不退化成全黑管理介面

目的不是增加 decoration，而是讓第一個 viewport 同時傳達：

> **這是一趟即將發生的旅行，而且重要資訊已經準備好可以使用。**

## 23.1 Overall silhouette

- Mobile-first 的窄幅 travel folio，而不是 dashboard shell。
- 首屏直接出現 trip identity、日期與 itinerary，不放 marketing hero 或 onboarding explanation。
- Desktop 延展為同一份較寬的旅行文件；不增加 KPI、sidebar dashboard 或多欄管理面板。
- 頁面以 section rhythm、rule、色塊與留白組織；card 只留給真正需要 bounded emphasis 的狀態。

## 23.2 Color and mood roles

目前 Skyline 使用的角色，而非最終 token 值：

```text
Warm paper / night blue
→ primary reading surface

Sky blue
→ movement, place transition, travel atmosphere

Sun yellow
→ anticipation and warmth

Coral
→ fixed anchor, attention, active day, action needed

Moss green
→ readiness and flexible / restorative space
```

顏色不依 event type 做彩虹分類。所有 semantic meaning 必須同時由 label、hierarchy 或 structure 表達。

## 23.3 Typography

- Large editorial serif 用於 trip date、day number 與少量 travel identity。
- Clean sans-serif 用於 event、time、metadata、status 與 controls。
- Traditional Chinese、Japanese 與 Latin 必須在同一 hierarchy 中保持可讀。
- Exact font family、size 與 line-height 尚未 freeze。

## 23.4 Overview skyline

Overview 的閱讀順序：

```text
Compact Product Header
↓
Trip Date + One-line Character
↓
Purposeful Route / Destination Illustration
↓
Single Readiness Attention State
↓
Travel Anchors
Flight / Hotel / Flight
↓
Day Journey Index
```

主要決策：

- Hero 要有出發感，但不用 destination photography wallpaper。
- Route illustration 必須表達 Osaka → Uji → Nara → USJ 的移動，不是無意義 decorative blob。
- Readiness 只突出目前真正需要處理的事項；不建立 KPI dashboard。
- Flight / Hotel 使用 restrained anchor rows，不把每項做成大卡片。
- Day Index 以 date、day theme、secondary context 與 geography 建立快速 scan path。
- 行程本身的語氣可以出現，例如「什麼都不要做太多」與「被鹿搶劫」，避免 generic travel copy。

## 23.5 Day skyline

Day 的閱讀順序：

```text
Overview Back / Day Identity
↓
Compact Date Rail
↓
Large Date + Day Character
↓
Day-specific Place / Mood Illustration
↓
Nearest Fixed Anchor
↓
Semantic Timeline
↓
Optional Disclosure
↓
Personal Note / Closing Line
```

主要決策：

- Time 使用窄欄，event content 使用寬欄，維持一手掃讀。
- Fixed anchor 在 day header 後先曝光，避免被 flexible content 埋住。
- Flexible space 使用較多留白與較柔和的 surface，不看起來像 incomplete task。
- Transit 使用細線與 connector treatment，不升成大型 event card。
- Reserved event 可以提高 visual weight，並提供 directions / reservation action capacity。
- Optional 收在 `IF YOU STILL HAVE ENERGY` disclosure，下層存在但不和主行程競爭。
- Day illustration 必須對應該日語意，例如宇治的河流、陽光與慢節奏；不做通用景點 banner。

## 23.6 Navigation boundary

- MVP Golden Screens 先驗證 Overview 與 Day。
- Overview / Day preview switch 只是 Skyline review control，不直接等於 production navigation API。
- Date rail 是目前採用的 Day-to-Day orientation pattern，但 exact sticky behavior、overflow 與 desktop treatment 留待 implementation prototype 驗證。
- Today、NOW / NEXT、Map、Reservations 不由這個 MVP Skyline 決定。

---

# 24. MVP Golden Screens

MVP 先要求兩張主要 Golden Screen：

```text
Golden UI #001 — Overview
Golden UI #002 — Day
```

`Today` 保留為下一階段的 Runtime Skyline，不以縮小版 Day View 代替。

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

## 24.1 Implementation evidence — 2026-09-01

`implement-mvp-result-ui-skyline` 已完成 Overview 與 Uji Day 的 implementation prototype 與 Golden Screen browser capture。驗證環境：

```text
Mobile       390 × 844
Desktop     1280 × 900
Desktop folio measure   832 px
Horizontal overflow      none
Minimum mobile control   44 px
Browser console errors   none
```

Golden UI #001 — Overview 驗證：

- 讀序為 trip identity / date → 明示為 schematic 的 ordered journey → 最多一個 readiness attention → flight / stay anchors → day journey index。
- Journey labels 只由 Canonical destination 與受支援的 place code 衍生；沒有座標、距離、routing、live location 或外部 enrichment。
- 已完成的 readiness 不會留下空殼；目前若所有本機 checklist 都 ready，attention section 會誠實省略。
- 缺少 flight 或 accommodation 的 fixture 仍保留完整 hero、journey 與 day index，不顯示 placeholder card。

Golden UI #002 — Uji Day 驗證：

- Date Rail、large date/day character、canonical day cues、19:30 fixed-anchor pointer、semantic timeline、collapsed optional disclosure 與 closing context 形成同一份 travel folio。
- Fixed-anchor summary 指向唯一的 `event-seijiro` timeline article；沒有建立第二個 reservation 或 event identity。
- Transit 維持 connector，flexible space 使用 moss/readiness role，optional places 保持在 `IF YOU STILL HAVE ENERGY` disclosure 外層。
- Day navigation 會回到 document start，避免從 Overview 下方選日後落在新 Day 的中段。

Theme / accessibility 驗證：

- 實際 browser dark appearance 保留 sky、sun、coral、moss roles；primary action 改用 sky/movement，不與 night travel surface 混在一起。
- Home dark appearance 的 MUI 衍生色另以實際 computed style 驗證：所有 standard / outlined Alert message 使用近白 ink text role；severity color 只承擔 icon、border 與低強度深色背景。Warning message 從錯誤的 1.34:1 修正為 11.74:1；disabled button 也不再繼承 light-mode 黑字，而是使用近白 ink、低強度 ink surface 與明確 disabled cursor。Outlined input 同步使用 hairline / focus roles。
- Home 的空 status node 不再保留行高；API key status 到 Markdown heading 的 section rhythm 從不明的疊加空白收斂成 `16 px margin + hairline + 16 px padding`，兩個 key controls 維持同列、44 px 高。
- Tailwind 正式擁有 folio width、置中、responsive padding、section spacing、flex/grid 與 breakpoint layout；MUI 保留互動元件、severity/state selector 與需要 component-slot ownership 的樣式。純 layout wrapper 使用 semantic HTML，避免 MUI `Stack` 注入的方向樣式覆蓋 Tailwind。
- Light / dark token contract tests 對 primary text、muted text、movement、attention、readiness 與 warmth/travel pairs 維持至少 4.5:1 contrast。
- Keyboard focus ring 為 3 px 且可見；Date Rail、Overview back、fixed-anchor pointer、optional disclosure、Directions 與 reservation/checklist controls 可由 keyboard 操作。
- Directions 與 restaurant actions 保留 exact canonical URL，使用 `_blank` 與 `noopener noreferrer`。

Stress fixtures 已涵蓋：optional-heavy、reservation-heavy、all-day、approximate/open-ended、alternative/conditional、missing anchors、no fixed anchor 與 runtime-unavailable。這次 prototype 驗證了 hierarchy、rhythm、semantic treatment、surface language 與 navigation behavior；第 25 節列出的 exact values 仍保留為可迭代 implementation choices，不升級為跨版本不可變規則。

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
- date rail sticky / overflow behavior
- Today composition details
- desktop layout
- reference / appendix interaction
- component library anatomy

MVP Skyline 已固定 hierarchy、rhythm、semantic treatment 與 surface language。上列細節在 Golden Screens 與 implementation prototype 驗證完成前，不應被寫成不可變 implementation rule。

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
