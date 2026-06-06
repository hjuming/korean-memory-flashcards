# 韓文圖像聯想閃卡

一個可直接部署的靜態網頁，用來整理背不起來的韓文單字。核心方法是把「韓文聲音、中文意思、聯想密碼、圖像畫面」放在同一張 Flashcard 裡，讓記憶不是死背，而是有畫面可抓。

## 功能

- 新增、編輯、刪除韓文記憶卡
- 支援漢字音、諧音、情境畫面、外來語、文法片語分類
- 點擊翻面、上一張、下一張、隨機排序
- 標記「還卡住」與「記住了」
- 搜尋韓文、中文、發音、聯想文字
- 本機圖片或圖片網址
- 匯入 / 匯出 JSON，方便備份與跨裝置搬移
- 資料保存在瀏覽器 `localStorage`

## 本機預覽

直接打開 `index.html` 即可使用。若要用本機伺服器預覽：

```bash
python3 -m http.server 8788
```

然後打開：

```text
http://localhost:8788
```

## 上傳 GitHub

```bash
git init
git add .
git commit -m "Initial Korean memory flashcard app"
git branch -M main
```

建立 GitHub repo 後，把遠端網址換成你的 repo：

```bash
git remote add origin https://github.com/你的帳號/korean-memory-flashcards.git
git push -u origin main
```

## 部署 Cloudflare Pages

Cloudflare Pages 設定：

| 欄位 | 設定 |
| --- | --- |
| Framework preset | None |
| Build command | 留空 |
| Build output directory | `.` |

也可以用 Wrangler 部署：

```bash
npx wrangler pages deploy . --project-name korean-memory-flashcards
```

## 注意事項

- 這是純前端靜態網站，沒有後端資料庫。
- 大量本機圖片會佔用 `localStorage`，建議使用圖片網址或定期匯出 JSON 備份。
- 若未來要多人共用、雲端同步或大量圖片，建議升級成 Supabase + Cloudflare R2 架構。
