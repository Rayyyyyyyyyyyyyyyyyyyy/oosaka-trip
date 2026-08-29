# Trip Runtime｜Result Page UI Spec v0.1

> 目的：把目前針對「旅行行程文件 → 可即時查看的 Web」的討論，整理成一份可以直接丟給 Codex 開始做 Prototype 的規格。
>
> 本版先只處理 **單次旅行的結果顯示頁**，不做完整 SaaS，不做規劃器，不做 AI 推薦。

---

# 0. 一句話定義

**把使用者已經排好的旅行，從 Excel / PDF / Markdown / txt 等文件，轉成旅行途中真的會打開來看的 Live Travel Site。**

不是：

> AI 幫你決定去哪裡。

而是：

> **你已經知道去哪裡了，我把這趟旅行變得更好用。**

---

# 1. 核心產品觀念

## 1.1 Travel Planning → Travel Execution

現有很多產品解決的是：

- 去哪裡玩？
- 幫我排三天大阪
- 推薦附近景點
- 幫我生成 itinerary

但旅行真正開始之後，使用者關心的是：

- 我今天去哪？
- 下一站是什麼？
- 幾點要出發？
- 餐廳幾點訂位？
- 現在離下一個固定行程還有多久？
- 從目前位置過去要多久？
- 今天有哪些事情不能錯過？

所以本產品的核心不是 Planning，而是：

**Execution / Runtime**

---

## 1.2 真正的產品價值

不是「Markdown 變漂亮」。

而是讓網站理解：

> **現在這個時間點，使用者最需要看到的是什麼？**

因此結果頁要有三種資訊距離：

1. **Trip Overview**：看整趟
2. **Day View**：看某一天
3. **Today / Now Mode**：看現在

---

# 2. 產品原則

## Principle 1｜不要重新安排使用者的旅行

使用者的旅行邏輯保留。

系統負責：

- 整理
- 結構化
- 顯示
- 即時提醒
- 地圖與交通
- 航班 / 訂位 / 天氣資訊

人負責：

- 要不要多待一下
- 要不要繞路
- 要不要臨時改變心意
- 想不想坐在宇治川旁發呆

---

## Principle 2｜流程化無聊的部分，不要流程化體驗本身

可以流程化：

- 時間
- 地點
- 航班
- 訂位
- 交通
- 提醒

不要流程化：

- 咖啡廳一定只能坐 90 分鐘
- 每個景點都必須完成
- Optional 沒去就顯示 Incomplete
- 自由時間也變 KPI

旅行不是 Jira。

---

## Principle 3｜Result Page 不是 Dashboard

不要一開始就塞：

- Budget
- Packing
- Explore
- AI Chat
- Expense
- Recommendation
- Social
- Discover

第一版只做：

**今天、行程、地圖、預約。**

---

# 3. 目前 Prototype 使用的真實旅行資料

## Trip

**大阪・宇治・奈良**
2026/09/10 - 2026/09/15

住宿：

**Aloft Osaka Dojima**

---

## 行程

### 9/10
- JX822
- TPE 10:15 → KIX 14:00
- 抵達大阪
- Remote
- 晚餐：野口太郎ラーメン 北新地本店

### 9/11
- Remote
- Museum of Spatial Art OSAKA
- 晚餐：回転すし さかえ 阪急東通り店

### 9/12
- 宇治
- 宇治川
- 喫茶 コンソラ
- 自由時間 / 發呆
- 19:30 清次郎 北新地店
- 已訂位

### 9/13
- 生駒山上遊樂園
- サイクルモノレール
- 奈良公園
- 東大寺
- Optional：春日大社 / 奈良町
- 晚餐：そば切り 百夜月

### 9/14
- Universal Studios Japan
- All Day

### 9/15
- JX821
- KIX 13:25 → TPE 15:20
- 回台灣

---

# 4. UI 參考方向

不是照抄任何單一產品，而是分別取不同產品最強的部分。

## TripIt
參考：

- 垂直 Timeline
- 航班 / 飯店 / Reservation 的資訊層級
- Event type 的視覺語言

不要參考：

- 過度工具感
- 老派視覺

---

## Tern
參考：

- Traveler-facing result page
- Current day 自動定位
- 日期跳轉
- Reservation detail
- Viewer 與 Editor 分離

---

## Wanderlog
參考：

- Date Rail
- Day-based itinerary
- Activity 之間插入 transit time
- 行程順序感

---

## Travefy
參考：

- Published itinerary 的交付感
- Trip Hero
- 一個網址直接分享
- Client-facing Web

---

## Polarsteps
參考：

- Trip Overview 的旅行氣氛
- Hero / Map / Route

不要讓：

- Map 成為 Day View 主體

---

## Flighty
參考：

- Now / Next
- 資訊權重隨時間變化
- 當下最重要資訊優先

---

## Citymapper
參考：

- Execution 模式
- 只告訴使用者「現在下一步要做什麼」
- Leave-by time

---

# 5. 整體資訊架構

第一版只有四個主要 View。

| View | 目的 | 優先級 |
|---|---|---:|
| Today | 旅行中每天真正打開的首頁 | ★★★★★ |
| Day | 看某一天完整行程 | ★★★★★ |
| Overview | 看整趟旅行 | ★★★★ |
| Map | 看當日或整趟地點 | ★★★ |

---

# 6. 首頁進入邏輯

## 旅行開始前

預設：

**Overview**

---

## 旅行期間

預設：

**Today**

例如使用者 9/12 打開網站：

直接顯示：

**9/12 Today View**

不是從 9/10 Day 1 開始。

---

## 旅行結束後

可以回 Overview 或 Last Day。

第一版可先簡化。

---

# 7. Mobile First

本產品的主要使用場景是：

**人在旅途中，拿手機快速查看。**

因此：

- Mobile 是主設計
- Desktop 是延伸
- 不先做 Desktop Dashboard

---

# 8. Header

手機 Header 不做大型旅遊 Hero。

建議：

```text
大阪・宇治・奈良

SEP 10 — SEP 15
6 DAYS · JAPAN

                         ⋯
```

右上 `⋯`：

- Overview
- Reservations
- Flight
- Hotel
- Share

第一版甚至可以不放 Edit。

因為這是 Viewer。

---

# 9. Date Rail

Date Rail 是整個 UI 最核心的 navigation。

Sticky 顯示：

```text
SEP 2026

 10      11      12      13      14      15
 THU     FRI     SAT     SUN     MON     TUE
                 ●
```

可以增加短標籤：

```text
10       11       12       13       14       15
大阪     藝術      宇治      奈良      USJ      回家
```

只有六天，不需要 dropdown。

直接攤平。

---

# 10. Today View

假設現在：

**9/12 14:30**

首頁不要先顯示整天全部資訊。

先顯示：

```text
SATURDAY · SEP 12

宇治
什麼都不要做太多的一天

────────────────────

NOW

☕ 喫茶 コンソラ
宇治川

Free time

「今天就是來發呆，
  不設定離開時間。」

────────────────────

NEXT

19:30
清次郎 北新地店

🥩 Yakiniku
✓ RESERVED

🚆 約 58 min

建議
17:50 前離開宇治

[ Directions ]

────────────────────

View full day ↓
```

---

# 11. Today View 核心元件

## NowCard

顯示：

- 現在正在做什麼
- 地點
- 狀態
- 備註

---

## NextCard

顯示：

- 下一個固定行程
- 時間
- Reservation 狀態
- 地點
- 交通時間

---

## LeaveByIndicator

例如：

```text
Leave before
17:50
```

這是 Runtime 感的重要來源。

---

# 12. Day View

完整 Timeline。

以 9/12 為例：

```text
SATURDAY
SEP 12

宇治，什麼都不要做太多的一天

────────────────────

10:30

●  前往宇治
│
│  🚆 Osaka → Uji
│
│
●  宇治川
│
│  Walk · Flexible
│
│
●  喫茶 コンソラ
│
│  Coffee · Free time
│
│  今天就是來發呆
│  不設定離開時間
│
│
│  🚆 約 58 min
│
│  建議 17:50 前離開
│
19:30

●  清次郎 北新地店

   Yakiniku
   ✓ RESERVED

   [ Map ]   [ Details ]
```

---

# 13. Timeline 原則

## Event 是節點

例如：

- Uji
- Consola
- Seijiro

---

## Transit 是 connective tissue

不要把交通做成一張完整 Card。

應該放在兩個 Event 之間：

```text
● Event A
│
│ 🚆 42 min
│
● Event B
```

這樣 Timeline 不會全部變成方塊。

---

# 14. Event Types

第一版六種足夠。

```text
flight
hotel
work
activity
restaurant
free_time
```

---

## Flight

```text
✈ JX822

Taipei → Osaka

10:15        14:00
TPE T1       KIX T1

Sep 10 · Thursday
```

---

## Hotel

```text
🏨 Aloft Osaka Dojima

Sep 10 → Sep 15

Dojima · Osaka

[ Directions ]
```

---

## Work

```text
💻 Remote

Afternoon
Flexible
```

不要做成企業管理 UI。

---

## Activity

```text
🎨 Museum of Spatial Art Osaka

森之宮

✓ RESERVED

[ Directions ]
```

---

## Restaurant

```text
🥩 清次郎 北新地店

19:30

✓ RESERVED

Yakiniku · All-you-can-eat

[ Directions ]
```

---

## Free Time

```text
☕ 宇治自由時間

Flexible

宇治川散步
喫茶 コンソラ

「不要設定離開時間」
```

Free Time 本身必須是正式 Event Type。

---

# 15. Optional

9/13：

春日大社 / 奈良町不是固定行程。

不要顯示成一般 Event。

建議：

```text
IF YOU STILL HAVE ENERGY

＋ 春日大社

＋ 奈良町
```

視覺：

- 灰底
- 次要文字
- 不進 Timeline 主線
- 不顯示 Completed / Incomplete

---

# 16. Special Day Type

9/14 只有 USJ。

這天不需要硬生成空洞 Timeline。

可以直接：

```text
MONDAY · SEP 14

UNIVERSAL STUDIOS JAPAN

🎃 HALLOWEEN

ALL DAY

今天沒有其他行程。

[ Open Map ]
[ Official Website ]
```

下面：

```text
Dinner

Flexible
園區內解決

晚上唯一判斷標準：

「我還活著嗎？」
```

UI 應該依資料密度變化。

---

# 17. Overview

Overview 的用途：

**10 秒看懂整趟旅行。**

```text
大阪・宇治・奈良

SEP 10 — SEP 15
6 DAYS

[ MAP / HERO ]

────────────────────

✈ FLIGHTS

JX822
SEP 10
TPE 10:15 → KIX 14:00

JX821
SEP 15
KIX 13:25 → TPE 15:20

────────────────────

🏨 STAY

Aloft Osaka Dojima
Sep 10 — Sep 15

────────────────────

ITINERARY

10 THU
Arrival · Remote

11 FRI
Museum of Spatial Art

12 SAT
Uji · Yakiniku

13 SUN
Ikoma · Nara

14 MON
USJ

15 TUE
Home
```

Overview 可以比較有旅行氣氛。

但不要影響 Day View 的 utility。

---

# 18. Map View

手機上不要 persistent map。

用按鈕切換：

```text
[ 🗺 Map ]
```

Full screen Map。

上方仍保留 Date Rail。

例如 9/12：

```text
① Uji
② 喫茶 コンソラ
③ 清次郎
```

不要顯示：

- 附近熱門景點
- 推薦餐廳
- Sponsor POI
- Discovery pins

這是：

**我的旅行**

不是：

**Google Maps Explore**

---

# 19. Reservation Drawer

右上 `⋯ → Reservations`

```text
RESERVATIONS

SEP 11
🎨 Museum of Spatial Art
✓ Reserved

SEP 12 · 19:30
🥩 清次郎
✓ Reserved

SEP 14
🎢 Universal Studios Japan
Ticket

────────────────────

FLIGHTS

JX822
JX821

────────────────────

HOTEL

Aloft Osaka Dojima
Sep 10 — Sep 15
```

未來可以加入：

- QR Code
- Booking confirmation
- PDF
- Ticket

---

# 20. Desktop

Desktop 不重新設計產品。

採：

**60% Timeline / 40% Map**

```text
┌──────────────────────────────────────┐
│ Osaka · Uji · Nara                   │
│ Sep 10 — Sep 15                     │
├──────────────────────────────────────┤
│ [10][11][12][13][14][15]             │
├──────────────────────┬───────────────┤
│                      │               │
│    DAY TIMELINE      │      MAP      │
│                      │               │
│ ● Uji                │    ①          │
│ │                    │               │
│ ● Consola            │       ②       │
│ │                    │               │
│ ● Seijiro            │    ③          │
│                      │               │
└──────────────────────┴───────────────┘
```

Map：

- sticky

Timeline：

- scroll

---

# 21. Component Architecture

```text
TripPage

├── TripHeader
│
├── DateRail
│
├── TodayView
│   ├── NowCard
│   ├── NextCard
│   └── LeaveByIndicator
│
├── DayView
│   ├── DayHeader
│   ├── Timeline
│   │   ├── EventCard
│   │   └── TransitSegment
│   └── OptionalSection
│
├── OverviewView
│   ├── FlightSummary
│   ├── StaySummary
│   └── DaySummaryList
│
├── MapView
│
└── ReservationDrawer
```

---

# 22. EventCard Variant

不要拆成六種 component。

統一：

```text
EventCard
```

用：

```text
type:
  flight
  hotel
  work
  activity
  restaurant
  free_time
```

決定內容與 icon。

---

# 23. 建議 URL

Prototype：

```text
/trip/osaka
```

Overview：

```text
/trip/osaka?view=overview
```

指定日期：

```text
/trip/osaka?date=2026-09-12
```

Map：

```text
/trip/osaka?date=2026-09-12&view=map
```

先不要花時間做漂亮 routing。

---

# 24. Visual Direction

風格：

**Editorial + Japanese Minimal + Utility**

---

## 要

- 大量留白
- 日期 Typography
- 清楚資訊層級
- 少量 Accent
- 細線 Timeline
- 少量圖片
- 柔和 Card
- Mobile readability

---

## 不要

- 藍綠旅遊 SaaS 漸層
- 巨大飛機 Icon
- 每個 Event 都放照片
- 每個東西都圓角 Card
- Adventure awaits 類文案
- 小紅書式大量圖片
- Dashboard 感

---

# 25. 圖片使用

圖片只建議出現在：

- Trip Overview Hero
- 特殊 Activity Detail
- Optional destination detail

Day Timeline 以文字資訊為主。

例如 9/12 不需要同時塞：

- 宇治照片
- 咖啡照片
- 電車照片
- 燒肉照片

否則會失去 Runtime 感。

---

# 26. Prototype 第一版只做 7 個 Component

如果現在直接叫 Codex 開工：

1. `TripHero`
2. `DateRail`
3. `DayHeader`
4. `TimelineEventCard`
5. `TransitSegment`
6. `NowNextCard`
7. `StickyMapToggle`

其他全部先不要。

---

# 27. 第一版功能 Priorities

## P0

- Trip Overview
- Sticky Date Rail
- Day Timeline
- Event Types
- Today / Now / Next
- Reservation status
- Mobile layout

---

## P1

- Map View
- Leave-by
- Desktop 60/40 layout
- Reservation Drawer

---

## P2

- Weather
- Live transport
- Flight status
- Current location
- Smart reminder

---

# 28. Prototype Definition

第一版的目標不是證明 SaaS。

只證明：

> **這個 Web 是否比原本的 Markdown 更值得在旅行途中打開？**

判斷標準：

- 手機上 3 秒知道今天要幹嘛
- 5 秒知道下一個固定行程
- 一眼看出 Reserved / Flexible / Optional
- 不需要打開原本 Markdown
- 不需要反覆搜尋行程資訊

---

# 29. 未來才處理的產品化架構

未來完整 SaaS pipeline：

```text
Upload
  ↓
File Extraction
  ↓
AI Parser
  ↓
Canonical Itinerary Schema
  ↓
User Review
  ↓
Enrichment
  ↓
Web Renderer
  ↓
Live Site
```

但現在 Prototype 先從：

```text
Current Osaka Markdown
        ↓
      JSON
        ↓
    Web Renderer
```

開始。

---

# 30. 最重要的一句

規劃工具會問：

> 你的旅行有哪些東西？

Trip Runtime 要回答：

> **你現在需要知道什麼？**

---

# 31. Prototype 成功畫面

如果 9/12 真的人在宇治打開網站，第一眼看到的是：

```text
NOW
喫茶 コンソラ

NEXT
19:30 清次郎 北新地店
✓ RESERVED

🚆 約 58 min
Leave before 17:50
```

而不是一份六天的 Markdown。

做到這裡，這個 Prototype 就已經成立。
