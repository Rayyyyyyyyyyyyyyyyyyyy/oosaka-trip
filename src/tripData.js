export const trip = {
  title: "關西",
  period: "SEP 10 — SEP 15",
  hotel: "Aloft Osaka Dojima",
  flights: [
    { code: "JX822", date: "SEP 10", route: "TPE 10:15 → KIX 14:00" },
    { code: "JX821", date: "SEP 15", route: "KIX 13:25 → TPE 15:20" },
  ],
};

const placeMaps = {
  ujiRiver:
    "https://www.google.com/maps/search/?api=1&query=%E5%AE%87%E6%B2%BB%E5%B7%9D%20%E4%BA%AC%E9%83%BD",
  ujiIsland:
    "https://www.google.com/maps/search/?api=1&query=%E5%AE%87%E6%B2%BB%E5%85%AC%E5%9C%92%20%E4%B8%AD%E3%81%AE%E5%B3%B6",
  asagiri:
    "https://www.google.com/maps/search/?api=1&query=%E6%9C%9D%E9%9C%A7%E9%80%9A%20%E5%AE%87%E6%B2%BB",
  ujigami:
    "https://www.google.com/maps/search/?api=1&query=%E5%AE%87%E6%B2%BB%E4%B8%8A%E7%A5%9E%E7%A4%BE",
  byodoin:
    "https://www.google.com/maps/search/?api=1&query=%E5%B9%B3%E7%AD%89%E9%99%A2%20%E5%AE%87%E6%B2%BB",
  consola:
    "https://www.google.com/maps/search/?api=1&query=%E5%96%AB%E8%8C%B6%20%E3%82%B3%E3%83%B3%E3%82%BD%E3%83%A9%20%E5%AE%87%E6%B2%BB",
  botaniCurry:
    "https://www.google.com/maps/search/?api=1&query=BOTANI%3ACURRY%20Osaka",
  ikomaPark:
    "https://www.google.com/maps/search/?api=1&query=%E7%94%9F%E9%A7%92%E5%B1%B1%E4%B8%8A%E9%81%8A%E6%A8%82%E5%9C%92",
  naraPark:
    "https://www.google.com/maps/search/?api=1&query=%E5%A5%88%E8%89%AF%E5%85%AC%E5%9C%92",
  todaiJi:
    "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E5%A4%A7%E5%AF%BA%20%E5%A5%88%E8%89%AF",
  kasuga:
    "https://www.google.com/maps/search/?api=1&query=%E6%98%A5%E6%97%A5%E5%A4%A7%E7%A4%BE%20%E5%A5%88%E8%89%AF",
  naramachi:
    "https://www.google.com/maps/search/?api=1&query=%E3%81%AA%E3%82%89%E3%81%BE%E3%81%A1%20%E5%A5%88%E8%89%AF",
  strawberry:
    "https://www.google.com/maps/search/?api=1&query=Strawberry%20Mania%20%E9%81%93%E9%A0%93%E5%A0%80%E5%BA%97",
};

export const days = [
  {
    date: "2026-09-10",
    n: "10",
    dow: "THU",
    label: "大阪",
    title: "抵達大阪",
    subtitle: "今天的任務只有順利抵達",
    events: [
      {
        time: "10:15",
        type: "flight",
        title: "JX822 桃園起飛",
        meta: "TPE T1 → KIX T1 · 14:00 抵達",
        status: "FLIGHT",
      },
      {
        time: "16:30",
        type: "hotel",
        title: "Aloft Osaka Dojima",
        meta: "Check-in · 堂島／北新地",
        map: "Aloft Osaka Dojima Osaka",
      },
      {
        time: "午後",
        type: "work",
        title: "Remote",
        meta: "Flexible · 飯店工作",
        flexible: true,
      },
      {
        time: "晚上",
        type: "restaurant",
        title: "花くじら 本店",
        meta: "關東煮／おでん · 福島／新福島 · ¥2,000–2,999",
        note: "Remote 結束後再走過去吃，不替第一晚安排大型行程。",
        map: "花くじら 本店 大阪",
        tabelog: "https://tabelog.com/osaka/A2701/A270108/27001230/",
      },
    ],
  },
  {
    date: "2026-09-11",
    n: "11",
    dow: "FRI",
    label: "藝術",
    title: "森之宮",
    subtitle: "Remote＋空間美術館",
    events: [
      {
        time: "白天",
        type: "work",
        title: "Remote",
        meta: "Flexible · 飯店工作",
        flexible: true,
      },
      { transit: "Osaka → 森之宮" },
      {
        time: "預約",
        type: "activity",
        title: "Museum of Spatial Art OSAKA",
        meta: "千田泰廣 Yasuhiro Chida · 森之宮",
        status: "RESERVED",
        map: "Museum of Spatial Art OSAKA 森之宮",
      },
      { transit: "森之宮 → 梅田" },
      {
        time: "Option A",
        type: "restaurant",
        title: "すし酒場 さしす 2号店",
        meta: "大阪站前ビル／北新地 · 想試推薦清單就選它",
        flexible: true,
        map: "すし酒場 さしす 2号店 大阪",
      },
      {
        time: "Option B",
        type: "restaurant",
        title: "回転すし さかえ",
        meta: "阪急東通り · 晚營業 · 時間彈性最高",
        note: "看完美術館後，看排隊、位置和當下食慾再決定。",
        flexible: true,
        map: "回転すし さかえ 阪急東通り店",
        tabelog: "https://tabelog.com/osaka/A2701/A270101/27002305/",
      },
    ],
    optionalLabel: "SPECIAL OPPORTUNITY",
    optional: [
      {
        name: "BOTANI:CURRY（公布營業且時間允許才去）",
        map: placeMaps.botaniCurry,
      },
    ],
  },
  {
    date: "2026-09-12",
    n: "12",
    dow: "SAT",
    label: "宇治",
    title: "宇治",
    subtitle: "什麼都不要做太多的一天",
    leaveBy: "17:50",
    events: [
      {
        time: "睡飽",
        type: "transport",
        title: "前往宇治",
        meta: "Osaka → Uji · 不趕時間",
      },
      {
        time: "午後",
        type: "free_time",
        title: "喫茶 コンソラ",
        meta: "宇治川 · Coffee · Free time",
        note: "今天就是來發呆，不設定離開時間。",
        flexible: true,
        runtime: "now",
        map: placeMaps.consola,
      },
      { transit: "約 58 min", tip: "建議 17:50 前離開宇治" },
      {
        time: "19:30",
        type: "restaurant",
        title: "清次郎 北新地店",
        meta: "Yakiniku · All-you-can-eat",
        status: "RESERVED",
        runtime: "next",
        map: "炭火焼肉 清次郎 北新地店",
        tabelog: "https://tabelog.com/osaka/A2701/A270101/27017667/",
      },
    ],
    optional: [
      { name: "宇治川", map: placeMaps.ujiRiver },
      { name: "宇治中之島", map: placeMaps.ujiIsland },
      { name: "朝霧通", map: placeMaps.asagiri },
      { name: "宇治上神社", map: placeMaps.ujigami },
      { name: "平等院", map: placeMaps.byodoin },
    ],
  },
  {
    date: "2026-09-13",
    n: "13",
    dow: "SUN",
    label: "奈良",
    title: "生駒山＋奈良",
    subtitle: "踩腳踏車，然後被鹿搶劫",
    events: [
      {
        time: "早上",
        type: "transport",
        title: "前往生駒山上遊樂園",
        meta: "Osaka → Ikoma · 主要指定項目先玩",
      },
      {
        time: "上午",
        type: "activity",
        title: "生駒山上遊樂園",
        meta: "主要目標：サイクルモノレール／空中腳踏車",
        note: "玩完指定項目後，不必硬刷其他遊樂設施。",
        flexible: true,
        map: placeMaps.ikomaPark,
      },
      { transit: "生駒下山 → 近鐵奈良" },
      {
        time: "午後",
        type: "activity",
        title: "奈良公園",
        meta: "近鐵奈良站 → 奈良公園 · 被鹿勒索鹿仙貝",
        flexible: true,
        map: placeMaps.naraPark,
      },
      {
        time: "午後",
        type: "activity",
        title: "東大寺＋二月堂附近",
        meta: "第一次奈良的核心散步路線",
        note: "隔天還有 USJ，不要提前把雙腳報廢。",
        flexible: true,
        map: placeMaps.todaiJi,
      },
      {
        time: "Option A",
        type: "restaurant",
        title: "そば切り 百夜月",
        meta: "近鐵奈良站附近 · 只收現金 · 清爽收尾",
        flexible: true,
        map: "そば切り 百夜月 奈良",
        tabelog: "https://tabelog.com/nara/A2901/A290101/29000692/",
      },
      {
        time: "Option B",
        type: "restaurant",
        title: "福太郎 本店",
        meta: "奈良 → 大阪難波 · 想吃大阪燒就選它",
        note: "晚餐不提前綁死，當天看腿、胃和心情決定。",
        flexible: true,
        map: "福太郎 本店 難波 大阪",
        tabelog: "https://tabelog.com/osaka/A2701/A270202/27002665/",
      },
    ],
    optional: [
      { name: "春日大社", map: placeMaps.kasuga },
      { name: "奈良町", map: placeMaps.naramachi },
      { name: "Strawberry Mania（順路甜點）", map: placeMaps.strawberry },
    ],
  },
  {
    date: "2026-09-14",
    n: "14",
    dow: "MON",
    label: "USJ",
    title: "Universal Studios Japan",
    subtitle: "今天沒有其他行程",
    special: true,
    events: [
      {
        time: "ALL DAY",
        type: "activity",
        title: "Universal Studios Japan",
        meta: "Halloween · 園區內自由活動",
        map: "Universal Studios Japan",
      },
    ],
  },
  {
    date: "2026-09-15",
    n: "15",
    dow: "TUE",
    label: "回家",
    title: "回家",
    subtitle: "不要對大阪產生任何觀光野心",
    events: [
      {
        time: "10:00",
        type: "transport",
        title: "離開大阪市區",
        meta: "Check-out · 直接前往關西機場",
      },
      { transit: "Osaka → KIX T1" },
      {
        time: "13:25",
        type: "flight",
        title: "JX821 關西起飛",
        meta: "KIX T1 → TPE T1 · 15:20 抵達",
        status: "FLIGHT",
      },
    ],
  },
];

export const reservations = [
  {
    date: "SEP 11",
    type: "activity",
    title: "Museum of Spatial Art",
    todoId: "museum",
    completeStatus: "Reserved",
  },
  {
    date: "SEP 12 · 19:30",
    type: "restaurant",
    title: "清次郎 北新地店",
    todoId: "seijiro",
    completeStatus: "Reserved",
  },
  {
    date: "SEP 14",
    type: "activity",
    title: "USJ 門票／事前票券",
    todoId: "usj-ticket",
    completeStatus: "Ticket ready",
    pendingStatus: "Action needed",
  },
  {
    date: "SEP 10—15",
    type: "hotel",
    title: "Aloft Osaka Dojima",
    todoId: "hotel",
    completeStatus: "Confirmed",
  },
  {
    date: "SEP 10 / 15",
    type: "flight",
    title: "JX822 · JX821",
    todoId: "flights",
    completeStatus: "Confirmed",
  },
];

export const initialTodos = [
  { id: "hotel", label: "住宿：Aloft Osaka Dojima", done: true },
  { id: "museum", label: "9/11 森之宮空間美術館", done: true },
  { id: "uji", label: "9/12 宇治", done: true },
  { id: "seijiro", label: "9/12 19:30 清次郎燒肉", done: true },
  { id: "ikoma", label: "9/13 生駒山上遊樂園", done: true },
  { id: "nara", label: "9/13 奈良", done: true },
  { id: "usj-day", label: "9/14 USJ", done: true },
  { id: "hanakujira", label: "9/10 晚餐：花くじら 本店", done: true },
  {
    id: "dinner-0911",
    label: "9/11 晚餐：さしす／さかえ（當天選）",
    done: false,
  },
  {
    id: "dinner-0913",
    label: "9/13 晚餐：百夜月／福太郎（當天選）",
    done: false,
  },
  { id: "usj-ticket", label: "USJ 門票／事前票券", done: false },
  { id: "flights", label: "機票：JX822 / JX821", done: true },
];
