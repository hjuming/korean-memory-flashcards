# AI 開發控制日誌

## 任務目標

- 2026-06-07 追加：在閃卡上加入點選發音功能，完成後更新 README、開發文件、下一階段建議並推上 GitHub。
- 將「韓文圖像聯想閃卡」從單純三欄工具，推進成可日常使用的 Flashcard Studio。
- 使用者可直接輸入韓文，先由本機草稿生成器產生聯想密碼、圖像畫面與圖像 Prompt。
- 新增記憶卡、記憶庫管理、匯入匯出、圖片上傳與學習進度改由側邊欄管理。
- 首頁主要畫面保留給最重要的圖像聯想閃卡練習。
- 暫不接入任何 API key；保留未來 Cloudflare Function / AI API 接入點。

## 非目標

- 發音功能先不接第三方 TTS API，不新增任何語音 API key。
- 不新增真實 AI API 呼叫。
- 不保存或要求任何 API key、token、service role key。
- 不導入資料庫、登入、雲端同步或 Cloudflare R2。
- 不刪除使用者現有 localStorage 資料；新資料結構必須相容舊卡片。

## 明確需求

- 可在閃卡上點選發音。
- 更新 README 與開發文件。
- 提供下一階段開發建議。
- Git 推上線。
- 可自己新增韓文單字。
- 可生成聯想密碼與圖像提示詞。
- 可上傳圖像並存入記憶庫。
- 新增記憶卡與記憶庫要以側邊欄方式管理。
- 首頁保留給圖像聯想閃卡練習。
- 可掌握學習進度。
- 功能完善後回報，API key 由使用者後續設定。

## 假設

- 目前仍以 Cloudflare Pages 靜態站部署為主。
- 第一版可用本機 deterministic generator 取代真實 AI，讓流程先完整。
- 本機圖片仍沿用 data URL 儲存，但會提示圖片大小限制，避免 localStorage 爆量。

## 成功標準

- 閃卡正面有「發音」按鈕，點擊後播放目前韓文單字，且不觸發翻面。
- 無 Web Speech API 或無韓文語音時，以 toast 提示使用者。
- 使用者打開首頁即可練習閃卡，不需要先看到新增表單與記憶庫大欄位。
- 側邊欄可切換「新增卡片 / 記憶庫 / 學習進度」。
- 輸入韓文後可生成可編輯草稿，並能存成新卡。
- 每張卡可複製圖像 Prompt、上傳圖片、編輯、刪除、匯入匯出。
- 進度資料可保存並以統計與待複習狀態呈現。
- `node --check` 與核心純函式測試通過。

## 高風險閘門

- 不觸碰 production secrets：通過。
- 不改 Cloudflare production config：目前不做。
- 不刪除使用者資料：以相容與保留為原則。
- 不進行不可逆外部副作用：部署前需再確認與執行。

## AI 決策記錄

- 2026-06-07：選擇先做靜態可用版本，而不是直接新增後端 AI API。原因是使用者明確表示之後再接 API KEY，且前端不可暴露 key。
- 2026-06-07：新增純函式測試層，覆蓋本機草稿與 Prompt 生成，讓未來接 API 時有 fallback 行為基準。
- 2026-06-07：新增 Cloudflare Pages Function `/api/generate-card`。無 `OPENAI_API_KEY` 時回 fallback，有 key 時才呼叫 OpenAI Responses API，避免前端暴露 secrets。
- 2026-06-07：手機版分頁改成 520px 以下直向三列，優先保證可讀與可點擊。
- 2026-06-07：發音功能採瀏覽器內建 Web Speech API，先不接第三方 TTS。原因是可立即部署、不需要 secrets；音質與韓文語音可用性列為限制。
- 2026-06-07：將閃卡本體從 `<button>` 改成 `role="button"` 的可聚焦區塊，避免在按鈕內嵌發音按鈕造成無效 HTML。

## 觸碰檔案

- `implementation-control-log.md`：記錄本次非 trivial AI-assisted 開發任務的範圍、風險與驗證。
- `tests/card-utils.test.js`：建立韓文草稿與圖像 Prompt 生成的行為測試。
- `assets/card-utils.js`：新增本機草稿、Prompt 與進度日期純函式。
- `assets/app.js`：重構側邊欄互動、AI 草稿 fallback、Prompt 複製、圖片上傳與進度追蹤。
- `assets/styles.css`：重構練習主畫面與 Studio 側邊欄響應式樣式。
- `index.html`：調整資訊架構，新增側邊欄分頁、草稿生成區與進度面板。
- `functions/api/generate-card.js`：新增 Cloudflare Pages Function 的 API 接入點。
- `README.md`：補上新功能與 API key 設定說明。
- `docs/development-roadmap.md`：新增下一階段開發建議。

## 驗證記錄

- ✅ 已真實驗證：`node tests/card-utils.test.js` 通過。
- ✅ 已真實驗證：`node --check assets/card-utils.js` 通過。
- ✅ 已真實驗證：`node --check assets/app.js` 通過。
- ✅ 已真實驗證：`node --check functions/api/generate-card.js` 通過。
- ✅ 已真實驗證：`node tests/card-utils.test.js` 新增發音設定測試並通過。
- ✅ 已真實驗證：以 headless Chrome 截圖檢查桌機與手機版 UI，輸出 `/private/tmp/korean-audio-desktop.png` 與 `/private/tmp/korean-audio-mobile.png`。
- ⚠️ 部分驗證：Cloudflare Function 尚未在 Pages 環境帶 `OPENAI_API_KEY` 實測。
- ⚠️ 部分驗證：Web Speech API 實際聲音播放需在使用者瀏覽器互動後由裝置語音引擎播放；本地驗證可確認按鈕與語法，音色依裝置而定。

## 回滾路徑

- 若 UI 重構不符合預期，可用 Git 回到本次提交前版本。
- localStorage key 會維持原名稱，使用者資料不需遷移；若新欄位有問題，舊欄位仍可被 normalize。
