const STORAGE_KEY = "wedo_korean_memory_cards_v1";
const {
  buildMemoryDraft,
  buildImagePrompt,
  buildSpeechConfig,
  cleanText,
  nextDueDate,
  normalizeProgress
} = window.KoreanMemoryUtils;

const sampleCards = [
  {
    id: "sample-chinhan-hyeong",
    korean: "친한 형",
    meaning: "親近的哥哥",
    pronunciation: "chin-han hyeong",
    tag: "諧音",
    cue: "형 聽起來像「型」，把 친한 想成很親的型男哥哥。",
    scene: "一位很親近的型男哥哥站在門口招手，外套上寫著 형。",
    image: "assets/images/cards/chinhan-hyeong.jpg",
    status: "new",
    reviewCount: 0,
    correctStreak: 0,
    createdAt: "2026-06-07T00:00:00.000Z"
  },
  {
    id: "sample-sachon",
    korean: "사촌",
    meaning: "堂表兄弟姊妹",
    pronunciation: "sa-chon",
    tag: "漢字音",
    cue: "漢字是「四寸」，把堂表親想成只隔四寸距離的親戚。",
    scene: "四位堂表兄弟姊妹站在一把四寸尺旁邊，尺上寫著 사촌。",
    image: "assets/images/cards/sachon.jpg",
    status: "new",
    reviewCount: 0,
    correctStreak: 0,
    createdAt: "2026-06-07T00:00:00.000Z"
  },
  {
    id: "sample-jari",
    korean: "자리",
    meaning: "座位",
    pronunciation: "ja-ri",
    tag: "諧音",
    cue: "자리 聽起來像「這裡」，問服務生：這裡有座位嗎？",
    scene: "餐廳裡有人指著一張椅子說「這裡」，椅背上貼著 자리。",
    image: "assets/images/cards/jari.jpg",
    status: "stuck",
    reviewCount: 1,
    correctStreak: 0,
    createdAt: "2026-06-07T00:00:00.000Z"
  },
  {
    id: "sample-yeopseo",
    korean: "엽서",
    meaning: "明信片",
    pronunciation: "yeop-seo",
    tag: "漢字音",
    cue: "漢字是「葉書」，想像把文字寫在樹葉上寄出去。",
    scene: "一片大葉子被當成明信片，葉面上寫著 엽서。",
    image: "assets/images/cards/yeopseo.jpg",
    status: "new",
    reviewCount: 0,
    correctStreak: 0,
    createdAt: "2026-06-07T00:00:00.000Z"
  },
  {
    id: "sample-bbang",
    korean: "빵",
    meaning: "麵包",
    pronunciation: "bbang",
    tag: "外來語",
    cue: "빵 的聲音像「胖」，把麵包想成胖胖一顆。",
    scene: "一顆胖胖的麵包膨起來，表面浮出 빵。",
    image: "assets/images/cards/bbang.jpg",
    status: "mastered",
    reviewCount: 2,
    correctStreak: 1,
    createdAt: "2026-06-07T00:00:00.000Z"
  }
];

const sampleCardsById = Object.fromEntries(sampleCards.map((card) => [card.id, card]));

const elements = {
  totalCount: document.getElementById("totalCount"),
  masteredCount: document.getElementById("masteredCount"),
  stuckCount: document.getElementById("stuckCount"),
  activeTag: document.getElementById("activeTag"),
  cardCounter: document.getElementById("cardCounter"),
  flashcard: document.getElementById("flashcard"),
  flipButton: document.getElementById("flipButton"),
  shuffleButton: document.getElementById("shuffleButton"),
  prevButton: document.getElementById("prevButton"),
  nextButton: document.getElementById("nextButton"),
  markStuckButton: document.getElementById("markStuckButton"),
  markMasteredButton: document.getElementById("markMasteredButton"),
  copyPromptButton: document.getElementById("copyPromptButton"),
  pronounceButton: document.getElementById("pronounceButton"),
  reviewCount: document.getElementById("reviewCount"),
  correctStreak: document.getElementById("correctStreak"),
  dueLabel: document.getElementById("dueLabel"),
  cardTag: document.getElementById("cardTag"),
  frontKorean: document.getElementById("frontKorean"),
  frontPronunciation: document.getElementById("frontPronunciation"),
  frontVisual: document.getElementById("frontVisual"),
  backMeaning: document.getElementById("backMeaning"),
  backCue: document.getElementById("backCue"),
  backScene: document.getElementById("backScene"),
  panelTriggers: Array.from(document.querySelectorAll("[data-panel-trigger]")),
  sidePanes: Array.from(document.querySelectorAll("[data-panel]")),
  quickKoreanInput: document.getElementById("quickKoreanInput"),
  quickMeaningInput: document.getElementById("quickMeaningInput"),
  generateDraftButton: document.getElementById("generateDraftButton"),
  draftPreview: document.getElementById("draftPreview"),
  draftCuePreview: document.getElementById("draftCuePreview"),
  applyDraftButton: document.getElementById("applyDraftButton"),
  cardForm: document.getElementById("cardForm"),
  editorTitle: document.getElementById("editorTitle"),
  submitButton: document.getElementById("submitButton"),
  cancelEditButton: document.getElementById("cancelEditButton"),
  koreanInput: document.getElementById("koreanInput"),
  meaningInput: document.getElementById("meaningInput"),
  pronunciationInput: document.getElementById("pronunciationInput"),
  tagInput: document.getElementById("tagInput"),
  cueInput: document.getElementById("cueInput"),
  sceneInput: document.getElementById("sceneInput"),
  imagePromptInput: document.getElementById("imagePromptInput"),
  imageInput: document.getElementById("imageInput"),
  imageFileInput: document.getElementById("imageFileInput"),
  imageFileStatus: document.getElementById("imageFileStatus"),
  copyFormPromptButton: document.getElementById("copyFormPromptButton"),
  resetSamplesButton: document.getElementById("resetSamplesButton"),
  searchInput: document.getElementById("searchInput"),
  filterInput: document.getElementById("filterInput"),
  exportButton: document.getElementById("exportButton"),
  importInput: document.getElementById("importInput"),
  cardList: document.getElementById("cardList"),
  emptyState: document.getElementById("emptyState"),
  dueCount: document.getElementById("dueCount"),
  totalReviews: document.getElementById("totalReviews"),
  masteryRate: document.getElementById("masteryRate"),
  masteryMeter: document.getElementById("masteryMeter"),
  progressList: document.getElementById("progressList"),
  toast: document.getElementById("toast")
};

let cards = loadCards();
let currentIndex = 0;
let isFlipped = false;
let editingId = "";
let pendingImageData = "";
let pendingDraft = null;
let toastTimer = 0;
let koreanVoice = null;

function loadCards() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return sampleCards.map(cloneCard).map(normalizeCard);
    }
    const parsed = JSON.parse(saved);
    const source = Array.isArray(parsed) ? parsed : parsed.cards;
    if (!Array.isArray(source)) {
      return sampleCards.map(cloneCard).map(normalizeCard);
    }
    return hydrateSampleCards(source.map(normalizeCard).filter(Boolean));
  } catch {
    return sampleCards.map(cloneCard).map(normalizeCard);
  }
}

function hydrateSampleCards(loadedCards) {
  return loadedCards.map((card) => {
    const sampleCard = sampleCardsById[card.id];
    if (!sampleCard) {
      return card;
    }
    return normalizeCard({
      ...card,
      image: card.image || sampleCard.image,
      scene: card.scene || sampleCard.scene,
      imagePrompt: card.imagePrompt || sampleCard.imagePrompt
    });
  });
}

function saveCards() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function cloneCard(card) {
  return { ...card };
}

function normalizeCard(card) {
  if (!card || typeof card !== "object") {
    return null;
  }
  const korean = cleanText(card.korean || card.kor);
  const meaning = cleanText(card.meaning);
  const cue = cleanText(card.cue || card.hint);
  if (!korean || !meaning || !cue) {
    return null;
  }
  const scene = cleanText(card.scene) || cue;
  const progress = normalizeProgress(card);
  return {
    id: cleanText(card.id) || createId(),
    korean,
    meaning,
    pronunciation: cleanText(card.pronunciation),
    tag: cleanText(card.tag) || "情境畫面",
    cue,
    scene,
    imagePrompt: cleanText(card.imagePrompt) || buildImagePrompt({ ...card, korean, meaning, cue, scene }),
    image: safeImageSource(card.image),
    status: progress.status,
    reviewCount: progress.reviewCount,
    correctStreak: progress.correctStreak,
    lastReviewedAt: progress.lastReviewedAt,
    dueAt: progress.dueAt,
    createdAt: cleanText(card.createdAt) || new Date().toISOString(),
    updatedAt: cleanText(card.updatedAt)
  };
}

function createId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `card-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeImageSource(value) {
  const source = cleanText(value);
  if (!source) {
    return "";
  }
  if (source.startsWith("data:image/")) {
    return source;
  }
  if (/^\.?\/?assets\/images\//.test(source) && !source.includes("..")) {
    return source.replace(/^\.\//, "").replace(/^\//, "");
  }
  try {
    const url = new URL(source);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function filteredCards() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const filter = elements.filterInput.value;
  return cards.filter((card) => {
    const text = `${card.korean} ${card.meaning} ${card.pronunciation} ${card.tag} ${card.cue} ${card.scene}`.toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesFilter = filter === "all" || (filter === "due" && isDue(card)) || card.status === filter || card.tag === filter;
    return matchesQuery && matchesFilter;
  });
}

function getActiveCards() {
  return filteredCards();
}

function currentCard() {
  const active = getActiveCards();
  if (currentIndex >= active.length) {
    currentIndex = Math.max(active.length - 1, 0);
  }
  return active[currentIndex] || null;
}

function render() {
  const active = getActiveCards();
  renderStats();
  renderFlashcard(active);
  renderLibrary(active);
  renderProgress();
}

function renderStats() {
  elements.totalCount.textContent = String(cards.length);
  elements.masteredCount.textContent = String(cards.filter((card) => card.status === "mastered").length);
  elements.stuckCount.textContent = String(cards.filter((card) => card.status === "stuck").length);
}

function renderFlashcard(active) {
  const card = active[currentIndex] || null;
  const hasCards = Boolean(card);
  [
    elements.flashcard,
    elements.flipButton,
    elements.shuffleButton,
    elements.prevButton,
    elements.nextButton,
    elements.markStuckButton,
    elements.markMasteredButton,
    elements.copyPromptButton,
    elements.pronounceButton
  ].forEach((button) => {
    button.disabled = !hasCards;
  });
  elements.flashcard.setAttribute("aria-disabled", String(!hasCards));
  elements.flashcard.classList.toggle("is-disabled", !hasCards);

  if (!card) {
    elements.activeTag.textContent = "沒有符合條件";
    elements.cardCounter.textContent = "0 / 0";
    elements.cardTag.textContent = "空";
    elements.frontKorean.textContent = "尚無單字";
    elements.frontPronunciation.textContent = "先新增一張卡片";
    renderTextVisual("記憶庫會保存在這台瀏覽器");
    elements.backMeaning.textContent = "無資料";
    elements.backCue.textContent = "請調整搜尋條件或新增單字。";
    elements.backScene.textContent = "每張卡都可以放一個畫面，幫大腦抓住聲音與意思。";
    elements.reviewCount.textContent = "0";
    elements.correctStreak.textContent = "0";
    elements.dueLabel.textContent = "今天";
    elements.flashcard.classList.remove("is-flipped");
    return;
  }

  elements.activeTag.textContent = `${card.tag} · ${statusLabel(card.status)}`;
  elements.cardCounter.textContent = `${currentIndex + 1} / ${active.length}`;
  elements.cardTag.textContent = card.tag;
  elements.frontKorean.textContent = card.korean;
  elements.frontPronunciation.textContent = card.pronunciation || "未填發音拆解";
  elements.backMeaning.textContent = card.meaning;
  elements.backCue.textContent = card.cue;
  elements.backScene.textContent = card.scene || card.cue;
  elements.reviewCount.textContent = String(card.reviewCount || 0);
  elements.correctStreak.textContent = String(card.correctStreak || 0);
  elements.dueLabel.textContent = formatDueLabel(card.dueAt);
  renderVisual(card);
  elements.flashcard.classList.toggle("is-flipped", isFlipped);
}

function renderVisual(card) {
  elements.frontVisual.replaceChildren();
  elements.frontVisual.classList.toggle("has-image", Boolean(card.image));
  if (card.image) {
    const image = document.createElement("img");
    image.src = card.image;
    image.alt = `${card.korean} 的圖像記憶`;
    elements.frontVisual.appendChild(image);
    return;
  }
  renderTextVisual(card.scene || card.cue);
}

function renderTextVisual(text) {
  elements.frontVisual.replaceChildren();
  elements.frontVisual.classList.remove("has-image");
  const fallback = document.createElement("span");
  fallback.textContent = text;
  elements.frontVisual.appendChild(fallback);
}

function renderLibrary(active) {
  const activeCard = active[currentIndex] || null;
  elements.cardList.replaceChildren();
  elements.emptyState.classList.toggle("hidden", active.length > 0);

  active.forEach((card, index) => {
    const item = document.createElement("article");
    item.className = `library-card${activeCard && activeCard.id === card.id ? " is-active" : ""}`;

    const content = document.createElement("button");
    content.className = "link-button library-select-button";
    content.type = "button";
    content.addEventListener("click", () => {
      currentIndex = index;
      isFlipped = false;
      render();
    });

    const title = document.createElement("strong");
    title.textContent = card.korean;
    const meta = document.createElement("span");
    meta.textContent = `${card.meaning} · ${card.tag} · ${statusLabel(card.status)} · ${formatDueLabel(card.dueAt)}`;
    content.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "library-card-actions";
    actions.append(
      tinyButton("✎", "編輯", () => startEdit(card.id)),
      tinyButton("⧉", "複製 Prompt", () => copyPromptForCard(card)),
      tinyButton("×", "刪除", () => deleteCard(card.id))
    );

    item.append(content, actions);
    elements.cardList.appendChild(item);
  });
}

function renderProgress() {
  const dueCards = cards.filter(isDue);
  const totalReviews = cards.reduce((sum, card) => sum + (card.reviewCount || 0), 0);
  const mastered = cards.filter((card) => card.status === "mastered").length;
  const masteryRate = cards.length ? Math.round((mastered / cards.length) * 100) : 0;
  elements.dueCount.textContent = String(dueCards.length);
  elements.totalReviews.textContent = String(totalReviews);
  elements.masteryRate.textContent = `${masteryRate}%`;
  elements.masteryMeter.style.width = `${masteryRate}%`;
  elements.progressList.replaceChildren();

  cards
    .slice()
    .sort((a, b) => dueSortValue(a) - dueSortValue(b))
    .slice(0, 8)
    .forEach((card) => {
      const item = document.createElement("button");
      item.className = "progress-item";
      item.type = "button";
      item.addEventListener("click", () => {
        switchPanel("library");
        elements.searchInput.value = card.korean;
        elements.filterInput.value = "all";
        currentIndex = getActiveIndexById(card.id);
        isFlipped = false;
        render();
      });

      const title = document.createElement("strong");
      title.textContent = card.korean;
      const meta = document.createElement("span");
      meta.textContent = `${statusLabel(card.status)} · ${card.reviewCount || 0} 次 · ${formatDueLabel(card.dueAt)}`;
      item.append(title, meta);
      elements.progressList.appendChild(item);
    });
}

function tinyButton(text, label, handler) {
  const button = document.createElement("button");
  button.className = "tiny-button";
  button.type = "button";
  button.textContent = text;
  button.setAttribute("aria-label", label);
  button.title = label;
  button.addEventListener("click", handler);
  return button;
}

function statusLabel(status) {
  if (status === "mastered") {
    return "熟了";
  }
  if (status === "stuck") {
    return "卡住";
  }
  return "新卡";
}

function submitCard(event) {
  event.preventDefault();
  const existingCard = editingId ? cards.find((card) => card.id === editingId) : null;
  const image = pendingImageData || safeImageSource(elements.imageInput.value) || existingCard?.image || "";
  const imagePrompt = cleanText(elements.imagePromptInput.value) || buildImagePrompt(formDraftSource());
  const payload = normalizeCard({
    id: editingId || createId(),
    korean: elements.koreanInput.value,
    meaning: elements.meaningInput.value,
    pronunciation: elements.pronunciationInput.value,
    tag: elements.tagInput.value,
    cue: elements.cueInput.value,
    scene: elements.sceneInput.value,
    imagePrompt,
    image,
    status: existingCard?.status || "new",
    reviewCount: existingCard?.reviewCount || 0,
    correctStreak: existingCard?.correctStreak || 0,
    lastReviewedAt: existingCard?.lastReviewedAt || "",
    dueAt: existingCard?.dueAt || new Date().toISOString(),
    createdAt: existingCard?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  if (!payload) {
    showToast("請至少填入韓文、中文意思與聯想密碼。");
    return;
  }

  const existingIndex = cards.findIndex((card) => card.id === editingId);
  if (existingIndex >= 0) {
    cards.splice(existingIndex, 1, payload);
    currentIndex = getActiveIndexById(payload.id);
    showToast("已更新這張記憶卡。");
  } else {
    cards.push(payload);
    currentIndex = getActiveIndexById(payload.id);
    showToast("已加入記憶庫。");
  }

  saveCards();
  resetForm();
  switchPanel("library");
  isFlipped = false;
  render();
}

function formDraftSource() {
  return {
    korean: elements.koreanInput.value,
    meaning: elements.meaningInput.value,
    pronunciation: elements.pronunciationInput.value,
    tag: elements.tagInput.value,
    cue: elements.cueInput.value,
    scene: elements.sceneInput.value
  };
}

function getActiveIndexById(id) {
  const active = getActiveCards();
  return Math.max(active.findIndex((card) => card.id === id), 0);
}

function resetForm() {
  elements.cardForm.reset();
  editingId = "";
  pendingImageData = "";
  pendingDraft = null;
  elements.editorTitle.textContent = "新增一張記憶卡";
  elements.submitButton.textContent = "加入記憶庫";
  elements.cancelEditButton.classList.add("hidden");
  elements.imageFileStatus.textContent = "未選擇圖片";
  elements.draftPreview.classList.add("hidden");
  elements.draftCuePreview.textContent = "";
}

function startEdit(id) {
  const card = cards.find((item) => item.id === id);
  if (!card) {
    return;
  }
  editingId = id;
  pendingImageData = "";
  pendingDraft = null;
  elements.editorTitle.textContent = "編輯記憶卡";
  elements.submitButton.textContent = "儲存修改";
  elements.cancelEditButton.classList.remove("hidden");
  elements.koreanInput.value = card.korean;
  elements.meaningInput.value = card.meaning;
  elements.pronunciationInput.value = card.pronunciation;
  elements.tagInput.value = card.tag;
  elements.cueInput.value = card.cue;
  elements.sceneInput.value = card.scene;
  elements.imagePromptInput.value = card.imagePrompt || buildImagePrompt(card);
  elements.imageInput.value = card.image && !card.image.startsWith("data:image/") ? card.image : "";
  elements.imageFileStatus.textContent = card.image && card.image.startsWith("data:image/") ? "已使用本機圖片" : "未選擇圖片";
  switchPanel("builder");
  elements.koreanInput.focus();
}

function deleteCard(id) {
  const card = cards.find((item) => item.id === id);
  if (!card || !window.confirm(`確定刪除「${card.korean}」？`)) {
    return;
  }
  cards = cards.filter((item) => item.id !== id);
  currentIndex = Math.min(currentIndex, Math.max(getActiveCards().length - 1, 0));
  saveCards();
  showToast("已刪除。");
  render();
}

function setCardStatus(status) {
  const card = currentCard();
  if (!card) {
    return;
  }
  const reviewedAt = new Date();
  card.status = status;
  card.reviewCount += 1;
  card.correctStreak = status === "mastered" ? (card.correctStreak || 0) + 1 : 0;
  card.lastReviewedAt = reviewedAt.toISOString();
  card.dueAt = nextDueDate(status, card.correctStreak, reviewedAt);
  card.updatedAt = reviewedAt.toISOString();
  saveCards();
  showToast(status === "mastered" ? "標記為熟了。" : "標記為還卡住。");
  render();
}

function moveCard(direction) {
  const active = getActiveCards();
  if (!active.length) {
    return;
  }
  currentIndex = (currentIndex + direction + active.length) % active.length;
  isFlipped = false;
  render();
}

function shuffleCards() {
  const active = getActiveCards();
  if (active.length < 2) {
    return;
  }
  const activeIds = new Set(active.map((card) => card.id));
  const shuffled = active.map(cloneCard).sort(() => Math.random() - 0.5);
  let cursor = 0;
  cards = cards.map((card) => (activeIds.has(card.id) ? shuffled[cursor++] : card));
  currentIndex = 0;
  isFlipped = false;
  saveCards();
  showToast("已隨機排序目前篩選結果。");
  render();
}

function playCurrentPronunciation() {
  const card = currentCard();
  if (!card) {
    return;
  }
  playKoreanSpeech(card.korean);
}

function playKoreanSpeech(korean) {
  const config = buildSpeechConfig(korean);
  if (!config) {
    showToast("目前沒有可朗讀的韓文。");
    return;
  }
  if (!("speechSynthesis" in window) || typeof window.SpeechSynthesisUtterance !== "function") {
    showToast("這個瀏覽器暫不支援內建發音。");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(config.text);
  utterance.lang = config.lang;
  utterance.rate = config.rate;
  utterance.pitch = config.pitch;
  const voice = getKoreanVoice();
  if (voice) {
    utterance.voice = voice;
  }
  utterance.addEventListener("error", () => {
    showToast("發音播放失敗，請確認裝置是否有韓文語音。");
  });

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  showToast(voice ? "正在播放韓文發音。" : "正在播放；若發音不準，請安裝韓文語音。");
}

function getKoreanVoice() {
  if (koreanVoice) {
    return koreanVoice;
  }
  if (!("speechSynthesis" in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  koreanVoice = voices.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith("ko")) || null;
  return koreanVoice;
}

function primeVoices() {
  if (!("speechSynthesis" in window)) {
    return;
  }
  getKoreanVoice();
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    koreanVoice = null;
    getKoreanVoice();
  });
}

async function generateDraft() {
  const korean = cleanText(elements.quickKoreanInput.value || elements.koreanInput.value);
  const meaning = cleanText(elements.quickMeaningInput.value || elements.meaningInput.value);
  if (!korean) {
    showToast("請先輸入韓文。");
    elements.quickKoreanInput.focus();
    return;
  }
  elements.generateDraftButton.disabled = true;
  elements.generateDraftButton.textContent = "生成中...";
  pendingDraft = await requestDraft({ korean, meaning });
  elements.draftCuePreview.textContent = pendingDraft.cue;
  elements.draftPreview.classList.remove("hidden");
  applyDraft();
  elements.generateDraftButton.disabled = false;
  elements.generateDraftButton.textContent = "生成聯想密碼 / 圖像 Prompt";
  showToast("已生成可編輯草稿。");
}

async function requestDraft(input) {
  try {
    const response = await fetch("/api/generate-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!response.ok) {
      throw new Error("Draft API unavailable");
    }
    const data = await response.json();
    if (data && data.draft) {
      return data.draft;
    }
  } catch {
    return buildMemoryDraft(input);
  }
  return buildMemoryDraft(input);
}

function applyDraft() {
  if (!pendingDraft) {
    return;
  }
  elements.koreanInput.value = pendingDraft.korean;
  elements.meaningInput.value = pendingDraft.meaning === "待補中文意思" ? "" : pendingDraft.meaning;
  elements.pronunciationInput.value = pendingDraft.pronunciation;
  elements.tagInput.value = pendingDraft.tag;
  elements.cueInput.value = pendingDraft.cue;
  elements.sceneInput.value = pendingDraft.scene;
  elements.imagePromptInput.value = pendingDraft.imagePrompt;
}

function copyImagePrompt() {
  const card = currentCard();
  if (!card) {
    return;
  }
  copyText(card.imagePrompt || buildImagePrompt(card), "圖像 Prompt 已複製。");
}

function copyPromptForCard(card) {
  copyText(card.imagePrompt || buildImagePrompt(card), "這張卡的 Prompt 已複製。");
}

function copyFormPrompt() {
  const prompt = cleanText(elements.imagePromptInput.value) || buildImagePrompt(formDraftSource());
  elements.imagePromptInput.value = prompt;
  copyText(prompt, "表單 Prompt 已複製。");
}

function copyText(text, successMessage) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      () => showToast(successMessage),
      () => fallbackCopy(text, successMessage)
    );
    return;
  }
  fallbackCopy(text, successMessage);
}

function fallbackCopy(text, successMessage = "已複製。") {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.className = "clipboard-fallback";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
  showToast(successMessage);
}

function exportCards() {
  const payload = JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), cards }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "korean-memory-cards.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("已匯出 JSON。");
}

function importCards(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const source = Array.isArray(parsed) ? parsed : parsed.cards;
      if (!Array.isArray(source)) {
        throw new Error("Invalid card data");
      }
      const imported = source.map(normalizeCard).filter(Boolean);
      if (!imported.length) {
        throw new Error("No cards");
      }
      const existingIds = new Set(cards.map((card) => card.id));
      imported.forEach((card) => {
        if (existingIds.has(card.id)) {
          card.id = createId();
        }
      });
      cards = [...cards, ...imported];
      currentIndex = Math.max(getActiveCards().length - imported.length, 0);
      saveCards();
      showToast(`已匯入 ${imported.length} 張卡。`);
      render();
    } catch {
      showToast("JSON 格式無法匯入。");
    } finally {
      elements.importInput.value = "";
    }
  });
  reader.readAsText(file);
}

function handleImageFile(event) {
  const file = event.target.files[0];
  pendingImageData = "";
  if (!file) {
    elements.imageFileStatus.textContent = "未選擇圖片";
    return;
  }
  if (!file.type.startsWith("image/")) {
    showToast("請選擇圖片檔。");
    event.target.value = "";
    return;
  }
  if (file.size > 800 * 1024) {
    showToast("圖片超過 800KB，建議壓縮後再上傳。");
    event.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    pendingImageData = String(reader.result);
    elements.imageFileStatus.textContent = `${file.name} 已暫存`;
    elements.imageInput.value = "";
  });
  reader.readAsDataURL(file);
}

function resetSamples() {
  if (!window.confirm("重載範例會保留你自己的卡片，並補回缺少的範例。是否繼續？")) {
    return;
  }
  const ids = new Set(cards.map((card) => card.id));
  const missing = sampleCards.filter((card) => !ids.has(card.id)).map(cloneCard).map(normalizeCard);
  cards = [...missing, ...cards];
  saveCards();
  currentIndex = 0;
  showToast(`已補回 ${missing.length} 張範例卡。`);
  render();
}

function switchPanel(name) {
  elements.panelTriggers.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.panelTrigger === name);
  });
  elements.sidePanes.forEach((pane) => {
    pane.classList.toggle("is-active", pane.dataset.panel === name);
  });
}

function isDue(card) {
  if (!card.dueAt) {
    return true;
  }
  const time = new Date(card.dueAt).getTime();
  return !Number.isFinite(time) || time <= Date.now();
}

function dueSortValue(card) {
  if (!card.dueAt) {
    return 0;
  }
  const time = new Date(card.dueAt).getTime();
  return Number.isFinite(time) ? time : 0;
}

function formatDueLabel(value) {
  if (!value) {
    return "今天";
  }
  const due = new Date(value);
  if (!Number.isFinite(due.getTime())) {
    return "今天";
  }
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startDue = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const days = Math.round((startDue - startToday) / (24 * 60 * 60 * 1000));
  if (days <= 0) {
    return "今天";
  }
  if (days === 1) {
    return "明天";
  }
  return `${days} 天後`;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2200);
}

function bindEvents() {
  elements.panelTriggers.forEach((button) => {
    button.addEventListener("click", () => switchPanel(button.dataset.panelTrigger));
  });
  elements.generateDraftButton.addEventListener("click", generateDraft);
  elements.applyDraftButton.addEventListener("click", () => {
    applyDraft();
    showToast("草稿已套用。");
  });
  elements.cardForm.addEventListener("submit", submitCard);
  elements.cancelEditButton.addEventListener("click", resetForm);
  elements.copyFormPromptButton.addEventListener("click", copyFormPrompt);
  elements.flashcard.addEventListener("click", () => {
    if (elements.flashcard.getAttribute("aria-disabled") === "true") {
      return;
    }
    isFlipped = !isFlipped;
    render();
  });
  elements.flashcard.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }
    if (elements.flashcard.getAttribute("aria-disabled") === "true") {
      return;
    }
    event.preventDefault();
    isFlipped = !isFlipped;
    render();
  });
  elements.pronounceButton.addEventListener("click", (event) => {
    event.stopPropagation();
    playCurrentPronunciation();
  });
  elements.flipButton.addEventListener("click", () => {
    isFlipped = !isFlipped;
    render();
  });
  elements.prevButton.addEventListener("click", () => moveCard(-1));
  elements.nextButton.addEventListener("click", () => moveCard(1));
  elements.shuffleButton.addEventListener("click", shuffleCards);
  elements.markStuckButton.addEventListener("click", () => setCardStatus("stuck"));
  elements.markMasteredButton.addEventListener("click", () => setCardStatus("mastered"));
  elements.copyPromptButton.addEventListener("click", copyImagePrompt);
  elements.searchInput.addEventListener("input", () => {
    currentIndex = 0;
    isFlipped = false;
    render();
  });
  elements.filterInput.addEventListener("change", () => {
    currentIndex = 0;
    isFlipped = false;
    render();
  });
  elements.exportButton.addEventListener("click", exportCards);
  elements.importInput.addEventListener("change", importCards);
  elements.imageFileInput.addEventListener("change", handleImageFile);
  elements.resetSamplesButton.addEventListener("click", resetSamples);
  window.addEventListener("keydown", (event) => {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      event.target instanceof HTMLButtonElement
    ) {
      return;
    }
    if (event.key === "ArrowLeft") {
      moveCard(-1);
    }
    if (event.key === "ArrowRight") {
      moveCard(1);
    }
    if (event.key === " ") {
      event.preventDefault();
      isFlipped = !isFlipped;
      render();
    }
  });
}

primeVoices();
bindEvents();
render();
