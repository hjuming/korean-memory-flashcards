# 韓文圖像聯想閃卡

一個可直接部署的靜態網頁，用來整理背不起來的韓文單字。核心方法是把「韓文聲音、中文意思、聯想密碼、圖像畫面」放在同一張 Flashcard 裡，讓記憶不是死背，而是有畫面可抓。

正式網址：

```text
https://korean.wedopr.com/
```

## 功能

- 新增、編輯、刪除韓文記憶卡
- 支援漢字音、諧音、情境畫面、外來語、文法片語分類
- 點擊翻面、上一張、下一張、隨機排序
- 點選閃卡上的「發音」播放韓文朗讀
- 標記「還卡住」與「記住了」
- 搜尋韓文、中文、發音、聯想文字
- 本機圖片或圖片網址
- 輸入韓文後產生可編輯的聯想密碼、圖像畫面與圖像 Prompt
- 側邊欄管理新增卡片、記憶庫與學習進度
- 待複習、練習次數、連續記住與完成率追蹤
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

`wrangler.toml` 的 `compatibility_date` 需小於或等於 Cloudflare 建置當下的 UTC 日期；若設定成台灣日期但 UTC 還在前一天，Cloudflare Functions 會拒絕發布。

正式分享網址使用 Cloudflare Pages 自訂網域：

```text
korean.wedopr.com
```

社交分享設定已固定使用正式網址：

| 欄位 | 設定 |
| --- | --- |
| `og:url` | `https://korean.wedopr.com/` |
| `og:image` | `https://korean.wedopr.com/assets/images/og-korean-memory-flashcards.jpg` |
| `twitter:image` | `https://korean.wedopr.com/assets/images/og-korean-memory-flashcards.jpg` |
| `canonical` | `https://korean.wedopr.com/` |

## AI 生成設定

目前前端已會呼叫 Cloudflare Pages Function：

```text
/api/generate-card
```

若還沒有設定 API key，Function 會回傳本機 fallback 草稿；功能仍可使用。

之後要接 OpenAI API 時，在 Cloudflare Pages 的環境變數新增：

| 變數 | 用途 |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI API key，請只放在 Cloudflare 環境變數，不要寫進前端檔案 |
| `OPENAI_MODEL` | 可選，未設定時使用 `gpt-5` |

也可以用 Wrangler 部署：

```bash
npx wrangler pages deploy . --project-name korean-memory-flashcards
```

## 注意事項

- 這是純前端靜態網站，沒有後端資料庫。
- 發音功能使用瀏覽器內建 Web Speech API，不需要 API key；韓文聲音品質取決於使用者裝置是否有 `ko-KR` 語音。
- 大量本機圖片會佔用 `localStorage`，建議使用圖片網址或定期匯出 JSON 備份。
- 若未來要多人共用、雲端同步或大量圖片，建議升級成 Supabase + Cloudflare R2 架構。
- API key 不應提交到 GitHub，也不要放在 `index.html` 或 `assets/app.js`。

## 下一階段建議

詳細規劃見：

```text
docs/development-roadmap.md
```
