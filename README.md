# 關西旅行計畫

2026/09/10–09/15 的手機優先個人行程 Viewer，使用 React、Vite 與 Material UI。

## 本機預覽

```sh
npm install
npm run dev
```

開啟 Vite 顯示的本機網址。

## GitHub Pages

推送至 `main` 後，GitHub Actions 會自動部署。第一次使用時，請到 repository 的 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。

完整文字版行程與 Prototype 規格保留在 [`temp/`](./temp/) 目錄。

## 行程資料維護

網站只從 [`src/data/tripData.js`](./src/data/tripData.js) 讀取可渲染的正式行程資料。`temp/` 保留原始行程、研究與歷史版本，不由前端直接匯入；原始文件更新後，需人工比對並同步正式資料，避免參考文件的格式變動破壞頁面。
