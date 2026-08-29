# Trip Runtime｜End-to-End Flow v0.1

> 這份文件描述 **從使用者手上已有一份旅行行程檔案，到生成可實際在旅途中使用的 Live Travel Site** 的完整流程。
>
> 目前以 User #0001 的真實情境為基準：
>
> - 已經有一份 `Markdown` 行程
> - 行程已經大致規劃完成
> - 不需要 AI 重新排行程
> - 目標是把既有行程轉成更適合旅途中查看的 Web UI
>
> 第一版先把流程走通，再逐步擴充 PDF / Excel / Word / Screenshot 等輸入。

---

# 0. 核心流程總覽

```text
User already has an itinerary
        ↓
Landing Page
        ↓
Upload / Import
        ↓
File Validation
        ↓
Content Extraction
        ↓
AI Parsing
        ↓
Canonical Itinerary JSON
        ↓
Validation & Confidence Check
        ↓
User Review
        ↓
User Corrections
        ↓
Place Resolution / Enrichment
        ↓
Final Trip Data
        ↓
Web Rendering
        ↓
Preview
        ↓
Publish
        ↓
Shareable Trip URL
        ↓
Pre-trip Experience
        ↓
Travel Runtime / Today Mode
        ↓
Live Updates
        ↓
Trip Completed
```

---

# 1. Stage 0｜User State

## 使用者目前擁有什麼？

例如 User #0001：

```text
osaka_uji_nara_2026-09-10_to_09-15.md
```

內容已經包含：

- 日期
- 航班
- 住宿
- 每日行程
- Remote
- 美術館
- 宇治
- 咖啡廳
- 餐廳
- 訂位
- 生駒
- 奈良
- Optional 景點
- USJ
- 備註
- 自由文字

---

## 使用者不想做什麼？

不要要求他重新：

- 建立 Trip
- 選城市
- 填日期
- 一站一站新增地點
- 再輸入航班
- 再輸入餐廳
- 再建立 Timeline

因為資料已經存在。

---

## Product Promise

> **Upload what you already have.**

系統的責任是理解既有資料。

---

# 2. Stage 1｜Landing Page

## 使用者看到

```text
Turn your itinerary into a live trip site.

Upload what you already have.

[ Upload itinerary ]

PDF · Excel · Markdown · Text
```

---

## 第一版真正支援

MVP v0：

```text
Markdown
```

UI 可以先只寫：

```text
Markdown
```

不要宣稱還沒完成的格式。

---

## Landing Page 不做

不要問：

- Where do you want to go?
- What is your budget?
- What type of traveler are you?
- How many days?
- What attractions do you like?

這是 Planner 的 onboarding。

不是 Trip Runtime。

---

# 3. Stage 2｜File Upload

使用者選擇：

```text
osaka_uji_nara_2026-09-10_to_09-15.md
```

---

## 系統動作

建立：

```text
upload_id
```

記錄：

```json
{
  "upload_id": "...",
  "filename": "...",
  "mime_type": "text/markdown",
  "size": 12345,
  "uploaded_at": "...",
  "status": "uploaded"
}
```

---

## UI 狀態

```text
Uploading itinerary…
```

成功：

```text
Upload complete
```

失敗：

```text
We couldn't upload this file.
Try again.
```

---

# 4. Stage 3｜File Validation

在進 AI 之前先做基本驗證。

---

## 驗證內容

### File Type

是否為支援格式。

第一版：

```text
.md
```

---

### File Size

避免超大檔案。

例如 MVP：

```text
Max 5 MB
```

---

### Empty File

如果沒有文字：

```text
This file looks empty.
```

---

### Encoding

確認 UTF-8 或可正常轉換。

---

## Validation Result

成功：

```text
status = validated
```

失敗：

```text
status = rejected
```

---

# 5. Stage 4｜Content Extraction

Markdown 需要先抽出可解析的 raw content。

---

## Input

```markdown
# 大阪・宇治・奈良

## 9/12
宇治...
19:30 清次郎...
```

---

## Extraction Output

保留：

- Heading
- Bullet
- Table
- Checkbox
- Paragraph
- Bold
- Links
- Raw text order

---

## 為什麼不要直接丟純文字？

因為 Markdown 本身已經提供結構訊號。

例如：

```text
# = Trip
## = Day
- = Event
[x] = Confirmed
```

這些都是 parser 很有價值的 hints。

---

# 6. Stage 5｜Document Segmentation

不要直接一次把整份文件當成一坨文字理解。

先分區。

---

## Example Segments

```text
Trip Metadata
Accommodation
Flight Information
Day 1
Day 2
Day 3
Day 4
Day 5
Day 6
Checklist
Food Strategy
Notes
```

---

## 每個 Segment 記錄

```json
{
  "segment_id": "...",
  "type": "day",
  "source_heading": "Day 3｜9/12（六）",
  "raw_text": "...",
  "source_position": 42
}
```

---

## 目的

讓 parser 可以知道：

> 「19:30 清次郎」是在 9/12 下面。

而不是靠模型猜日期。

---

# 7. Stage 6｜AI Parsing

這一步才真正開始理解旅行語意。

---

## Parser 要找的 Entity

### Trip

- title
- destination
- start_date
- end_date
- timezone

### Flight

- airline
- flight_number
- origin
- destination
- departure_time
- arrival_time
- terminal

### Stay

- hotel_name
- check_in
- check_out
- location

### Event

- date
- title
- type
- start_time
- end_time
- flexible
- optional
- reservation_status
- notes

### Place

- raw_name
- area
- city

### Reservation

- reserved
- time
- booking details if available

---

# 8. Stage 7｜Event Classification

Parser 必須判斷 Event Type。

第一版：

```text
flight
hotel
work
activity
restaurant
free_time
transport
note
```

---

## Example

```text
Remote
```

→

```json
{
  "type": "work"
}
```

---

```text
喫茶 コンソラ
今天就是來發呆，不設定離開時間
```

→

```json
{
  "type": "free_time",
  "flexible": true
}
```

---

```text
19:30 清次郎
已訂位
```

→

```json
{
  "type": "restaurant",
  "start_time": "19:30",
  "reservation_status": "reserved"
}
```

---

# 9. Stage 8｜Semantic Interpretation

這一步專門處理「人話」。

例如：

```text
晚上唯一判斷標準：
我還活著嗎？
```

不能解析成：

```text
medical emergency
```

它應該是：

```json
{
  "type": "note",
  "tone": "personal",
  "text": "晚上唯一判斷標準：我還活著嗎？"
}
```

---

## 原則

Parser 不應該過度解讀。

如果不確定：

**保留原文 > 自作聰明**

---

# 10. Stage 9｜Canonical Itinerary Schema

所有輸入最後都必須變成同一份資料模型。

這是產品最重要的中介層。

---

## Core Structure

```json
{
  "trip": {},
  "days": [],
  "places": [],
  "reservations": [],
  "source": {}
}
```

---

# 11. Stage 10｜Trip Object

```json
{
  "trip": {
    "id": "trip_001",
    "title": "大阪・宇治・奈良",
    "start_date": "2026-09-10",
    "end_date": "2026-09-15",
    "timezone": "Asia/Tokyo",
    "status": "draft"
  }
}
```

---

# 12. Stage 11｜Day Object

```json
{
  "date": "2026-09-12",
  "title": "宇治",
  "subtitle": "什麼都不要做太多的一天",
  "events": []
}
```

---

# 13. Stage 12｜Event Object

```json
{
  "id": "event_001",
  "date": "2026-09-12",
  "type": "restaurant",
  "title": "清次郎 北新地店",
  "start_time": "19:30",
  "end_time": null,
  "flexible": false,
  "optional": false,
  "reservation_status": "reserved",
  "place_id": "place_001",
  "notes": []
}
```

---

# 14. Stage 13｜Source Traceability

每一筆解析資料都應該知道自己來自哪裡。

例如：

```json
{
  "source": {
    "segment_id": "segment_day_3",
    "source_text": "19:30 清次郎 北新地店",
    "source_line": 82
  }
}
```

---

## 為什麼重要？

如果使用者說：

> 這個解析錯了。

可以直接回到原始文字。

未來也方便 Debug Parser。

---

# 15. Stage 14｜Confidence Score

Parser 不應該假裝每一件事都 100% 確定。

---

## Example

```json
{
  "field": "start_time",
  "value": "19:30",
  "confidence": 0.99
}
```

---

```json
{
  "field": "place",
  "value": "百夜月",
  "confidence": 0.63
}
```

---

## Confidence 可以分三級

```text
High
Medium
Low
```

---

# 16. Stage 15｜Automatic Validation

在給使用者看之前先跑規則。

---

## Date Validation

例如：

```text
9/12 event
```

不能出現在：

```text
2026/09/13
```

---

## Trip Range Validation

所有事件應在：

```text
2026/09/10 - 2026/09/15
```

---

## Time Validation

```text
19:30
```

必須是有效時間。

---

## Duplicate Detection

避免同一個餐廳被重複解析兩次。

---

## Logical Conflict

例如：

```text
JX821 departure 13:25
USJ 14:00
```

如果同一天就要警告。

---

# 17. Stage 16｜Parsing Summary

系統產生摘要：

```text
We found:

6 travel days
2 flights
1 hotel
3 reservations
14 activities
4 restaurants
2 optional places
```

---

## 目的

讓使用者快速建立信任。

---

# 18. Stage 17｜User Review Screen

這是第一個真正重要的 Trust Moment。

標題：

```text
We think your trip looks like this.
```

或：

```text
我理解的是這樣，對嗎？
```

---

## 顯示

```text
大阪・宇治・奈良
SEP 10 — SEP 15

SEP 10
JX822
Remote
野口太郎ラーメン

SEP 11
Remote
Museum of Spatial Art
回転すし さかえ

SEP 12
Uji
喫茶 コンソラ
19:30 清次郎 ✓ Reserved

SEP 13
Ikoma
Nara
百夜月

SEP 14
USJ

SEP 15
JX821
```

---

# 19. Stage 18｜Review Highlight

Low Confidence 的資料應特別標示。

例如：

```text
百夜月
Is this the restaurant in Nara?
```

---

## UI 可以提供

```text
[ Yes ]
[ Change ]
```

---

# 20. Stage 19｜User Correction

使用者可以修正：

- 名稱
- 日期
- 時間
- Event Type
- Reservation Status
- Optional
- Notes

---

## 但不要變成完整 Planner

Correction UI 的定位：

> 修 parser。

不是：

> 在這裡重新排旅行。

---

# 21. Stage 20｜Review Completion

使用者按：

```text
Looks good
```

系統將：

```text
trip.status
```

從：

```text
parsed
```

變成：

```text
reviewed
```

---

# 22. Stage 21｜Place Resolution

目前資料可能只有：

```text
清次郎 北新地店
```

系統需要解析成實際 Place。

---

## Place Resolution Output

```json
{
  "place_id": "...",
  "name": "清次郎 北新地店",
  "address": "...",
  "lat": ...,
  "lng": ...,
  "city": "Osaka",
  "country": "Japan"
}
```

---

# 23. Stage 22｜Place Disambiguation

如果有同名店：

```text
清次郎
```

系統不能直接亂選。

應該問：

```text
Which one did you mean?
```

候選：

```text
清次郎 北新地店
清次郎 ○○店
```

---

# 24. Stage 23｜Enrichment

Place 確認後可以補充：

- 地址
- Map Link
- Coordinates
- Opening Hours
- Website
- Category

未來：

- Weather
- Travel Time
- Live Flight Status

---

# 25. Stage 24｜Transport Inference

不要第一版就自動規劃整趟交通。

但可以推導：

```text
Event A
→ Event B
```

之間需要 transit。

---

## Example

```text
喫茶 コンソラ
↓
清次郎
```

生成：

```json
{
  "type": "transit",
  "from": "place_uji",
  "to": "place_seijiro"
}
```

---

# 26. Stage 25｜Final Trip Data

經過 Review + Enrichment 後：

```text
Parsed JSON
     ↓
Reviewed JSON
     ↓
Enriched JSON
     ↓
Final Trip JSON
```

Renderer 只吃：

**Final Trip JSON**

---

# 27. Stage 26｜Renderer Preparation

Renderer 根據資料決定：

- Overview
- Day View
- Today View
- Map View
- Event Card Variants

---

# 28. Stage 27｜Runtime State Calculation

Renderer 不只看資料。

還要看：

```text
current_datetime
trip_timezone
```

判斷：

```text
before_trip
during_trip
after_trip
```

---

# 29. Stage 28｜Before Trip

例如現在還沒到 9/10。

預設首頁：

```text
Overview
```

---

## 可以顯示

```text
12 days to go
```

下一個重要事件：

```text
JX822
Sep 10
10:15
```

---

# 30. Stage 29｜During Trip

如果日期：

```text
2026-09-12
```

首頁自動：

```text
Today View
```

---

# 31. Stage 30｜Current Event Detection

系統找出：

```text
NOW
```

例如 14:30：

```text
喫茶 コンソラ
Free time
```

---

## Flexible Event

如果沒有固定 end time：

不要硬判斷何時結束。

只知道：

```text
現在位於自由時間區間
```

---

# 32. Stage 31｜Next Fixed Event Detection

找到下一個不可錯過事件：

```text
19:30
清次郎
Reserved
```

---

# 33. Stage 32｜Leave-by Calculation

如果有：

- Current location / current event
- Next event
- Transit estimate

就可以算：

```text
Leave before 17:50
```

---

## 第一版

可以先不用真正 Live API。

用預先資料或人工 travel duration。

---

# 34. Stage 33｜Today View Rendering

第一屏：

```text
TODAY

NOW
喫茶 コンソラ

NEXT
19:30 清次郎
✓ Reserved

Leave before
17:50
```

---

## 核心原則

先顯示：

**現在與下一步**

再顯示：

**完整行程**

---

# 35. Stage 34｜Full Day Timeline

往下：

```text
● Event
│
│ Transit
│
● Event
```

---

## Status

Event 可有：

```text
past
current
upcoming
optional
```

---

# 36. Stage 35｜Past Event

已經過去的事件降低視覺權重。

例如：

```text
✓ 宇治川
```

但不要做成 Task Completed。

只是在時間上已經過去。

---

# 37. Stage 36｜Current Event

Current 要明確突出：

```text
NOW
```

---

# 38. Stage 37｜Upcoming Event

下一個固定事件突出：

```text
NEXT
```

---

# 39. Stage 38｜Optional Event

例如：

```text
春日大社
奈良町
```

放在：

```text
IF YOU STILL HAVE ENERGY
```

不要放主 Timeline。

---

# 40. Stage 39｜Special Day Rendering

如果一天只有：

```text
USJ ALL DAY
```

不要生成：

```text
09:00 USJ
10:00 USJ
11:00 USJ
...
```

Renderer 應該知道這是：

```text
all_day_activity
```

用 Special Day Layout。

---

# 41. Stage 40｜Map Rendering

Map 根據選定日期：

只顯示當天 itinerary places。

例如 9/12：

```text
Uji
Consola
Seijiro
```

---

## 不要加入

- Nearby attractions
- Recommended restaurants
- Sponsored POIs
- Discovery

除非使用者主動切到 Explore。

第一版沒有 Explore。

---

# 42. Stage 41｜Reservation View

集中顯示：

- Flight
- Hotel
- Museum
- Restaurant
- USJ

---

## Reservation Status

```text
reserved
ticketed
confirmed
unknown
```

---

# 43. Stage 42｜Preview

生成網站後先讓使用者 Preview。

```text
Your trip is ready.
```

按：

```text
Preview
```

---

## Preview 要能測

- Mobile
- Desktop

但 Mobile First。

---

# 44. Stage 43｜Publish

使用者確認：

```text
Publish trip
```

系統：

```text
trip.status = published
```

---

# 45. Stage 44｜Shareable URL

生成：

```text
tripruntime.app/t/abc123
```

第一版也可以：

```text
/trip/osaka
```

---

# 46. Stage 45｜Access Model

MVP 最簡單：

```text
Anyone with link
```

未來再做：

- Private
- Password
- Account
- Collaborators

---

# 47. Stage 46｜Pre-trip Usage

旅行前打開：

```text
Overview
```

主要用途：

- 看航班
- 看住宿
- 確認預約
- 看六天骨架

---

# 48. Stage 47｜Travel Day Usage

旅行中打開：

```text
Today
```

主要用途：

- Now
- Next
- Leave By
- Directions
- Reservations

---

# 49. Stage 48｜User Manual Update

旅行途中可能發生：

> 不想去百夜月了。

使用者可以：

```text
Edit
```

改掉該 Event。

---

## 第一版可以簡單到

只修改：

```text
Final Trip JSON
```

再重新 Render。

---

# 50. Stage 49｜Source vs User Override

非常重要。

如果原始 MD 寫：

```text
百夜月
```

但使用者後來改成：

```text
另一間餐廳
```

系統要知道：

```text
user_override = true
```

之後不要重新 Parse 又蓋回去。

---

# 51. Stage 50｜Live Data Refresh

未來：

- Flight Status
- Weather
- Transit
- Opening Hours

這些是：

```text
runtime data
```

不是 itinerary source data。

---

# 52. Stage 51｜Data Layer 分離

產品最好分三層。

## Layer A｜Source Data

使用者原始文件。

```text
Markdown
PDF
Excel
```

---

## Layer B｜Trip Data

使用者旅行本體。

```text
Canonical JSON
```

---

## Layer C｜Runtime Data

會變動的資訊。

```text
weather
flight status
travel time
current time
```

---

# 53. Stage 52｜Renderer Rule

Renderer：

```text
Trip Data + Runtime Data
```

產生 UI。

絕對不要：

```text
Renderer directly parses Markdown
```

---

# 54. Stage 53｜Error Handling

每一層都要有 Error State。

---

## Upload Error

```text
Upload failed
```

---

## Extraction Error

```text
We couldn't read this file.
```

---

## Parsing Error

```text
We couldn't confidently understand this itinerary.
```

---

## Resolution Error

```text
We found multiple places with this name.
```

---

## Runtime API Error

不要讓頁面死掉。

例如：

```text
Travel time currently unavailable.
```

Timeline 還是能看。

---

# 55. Stage 54｜Fallback Principle

Live Data 掛掉時：

**靜態行程仍必須可用。**

這很重要。

旅途中不能因為 Weather API 掛了：

整個 itinerary 都不能開。

---

# 56. Stage 55｜Offline / Cached Future

未來應支援：

- Latest Trip Data cache
- Reservation cache
- Basic itinerary offline

但不是 Prototype P0。

---

# 57. Stage 56｜Trip Completion

9/15 結束後：

```text
Trip completed
```

---

## 可以保留

- Timeline
- Places
- Notes

未來才做：

- Memories
- Photos
- Travel journal

不是現在。

---

# 58. Stage 57｜Analytics

第一版至少記：

### Upload

```text
upload_started
upload_completed
```

### Parsing

```text
parse_completed
parse_failed
```

### Review

```text
review_started
field_corrected
review_completed
```

### Generate

```text
trip_generated
```

### Usage

```text
trip_opened
today_view_opened
day_changed
map_opened
directions_clicked
```

---

# 59. Stage 58｜最重要的 Product Metrics

## Parse Success Rate

多少文件成功變成 Trip。

---

## Correction Rate

AI 解析後要改多少？

---

## Time to Live Site

從：

```text
Upload
```

到：

```text
Open my trip
```

花多久？

---

## Runtime Reopen Rate

旅行途中使用者有沒有真的回來看？

---

## Today View Usage

Today 是否真的成為主要入口？

---

# 60. Stage 59｜User #0001 Golden Path

目前第一個測試流程應該是：

```text
1.
User 打開 Trip Runtime

2.
Upload:
osaka_uji_nara_2026-09-10_to_09-15.md

3.
系統驗證 Markdown

4.
抽取內容與 Markdown 結構

5.
按日期切 Segment

6.
AI 解析 Trip / Day / Event / Place / Reservation

7.
轉成 Canonical JSON

8.
跑 Validation

9.
顯示 Parsing Summary

10.
User Review

11.
修正任何錯誤

12.
Resolve Places

13.
補 Map / Address

14.
生成 Final Trip JSON

15.
Renderer 生成 Overview / Day / Today / Map

16.
User Preview

17.
Publish

18.
得到 Trip URL

19.
旅行前：
預設 Overview

20.
9/10：
預設 Today

21.
9/12 下午：
顯示 NOW = 宇治自由時間

22.
顯示 NEXT = 19:30 清次郎

23.
顯示 Leave By

24.
9/15：
顯示回程 Flight

25.
Trip Completed
```

---

# 61. MVP P0

真正必做：

```text
Landing
Upload Markdown
Extract Markdown
Parse
Canonical JSON
Validation
Review
Correction
Place Resolution
Final Trip JSON
Overview
Date Rail
Day Timeline
Today / Now / Next
Reservation Status
Publish URL
Mobile UI
```

---

# 62. MVP P1

下一層：

```text
Map
Transit duration
Leave-by
Reservation Drawer
Desktop layout
```

---

# 63. MVP P2

之後：

```text
Weather
Live flights
Live transit
Current location
Notifications
PDF
Excel
Word
Screenshot
Multi-user
```

---

# 64. 現在不要做

```text
AI Trip Planner
Recommendation Engine
Explore Nearby
Social
Expense
Packing
Budget
Chatbot
Travel Journal
Photo Album
Automatic Replanning
Booking
```

全部先砍。

---

# 65. 最後收斂

整個產品現在最重要的是證明這一條：

```text
Existing itinerary
        ↓
Structured trip
        ↓
Useful runtime UI
```

第一版最大的成功不是：

> 網頁很好看。

而是：

> **使用者上傳自己原本的行程後，不再需要打開原始檔案。**

---

# 66. User #0001 的驗收問題

等 Prototype 出來後，只問：

### Parsing

- 它有沒有真的看懂我的 Markdown？
- 哪些地方解析錯？
- 修正麻不麻煩？

### UI

- 我在手機上三秒能不能知道今天要幹嘛？
- 我能不能快速知道下一件不能錯過的事？
- Reserved / Flexible / Optional 是否一眼能分辨？

### Runtime

- 我人在宇治時，還會不會想打開原本的 Markdown？
- 還是打開 Trip Runtime 就夠了？

如果答案是後者：

**第一版產品成立。**
