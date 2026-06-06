const STORAGE_KEY = "wedo_korean_memory_cards_v1";

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
  cardTag: document.getElementById("cardTag"),
  frontKorean: document.getElementById("frontKorean"),
  frontPronunciation: document.getElementById("frontPronunciation"),
  frontVisual: document.getElementById("frontVisual"),
  frontImageFallback: document.getElementById("frontImageFallback"),
  backMeaning: document.getElementById("backMeaning"),
  backCue: document.getElementById("backCue"),
  backScene: document.getElementById("backScene"),
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
  imageInput: document.getElementById("imageInput"),
  imageFileInput: document.getElementById("imageFileInput"),
  imageFileStatus: document.getElementById("imageFileStatus"),
  resetSamplesButton: document.getElementById("resetSamplesButton"),
  searchInput: document.getElementById("searchInput"),
  filterInput: document.getElementById("filterInput"),
  exportButton: document.getElementById("exportButton"),
  importInput: document.getElementById("importInput"),
  cardList: document.getElementById("cardList"),
  emptyState: document.getElementById("emptyState"),
  toast: document.getElementById("toast")
};

let cards = loadCards();
let currentIndex = 0;
let isFlipped = false;
let editingId = "";
let pendingImageData = "";
let toastTimer = 0;

function loadCards() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return sampleCards.map(cloneCard);
    }
    const parsed = JSON.parse(saved);
    const source = Array.isArray(parsed) ? parsed : parsed.cards;
    if (!Array.isArray(source)) {
      return sampleCards.map(cloneCard);
    }
    return hydrateSampleCards(source.map(normalizeCard).filter(Boolean));
  } catch {
    return sampleCards.map(cloneCard);
  }
}

function hydrateSampleCards(loadedCards) {
  return loadedCards.map((card) => {
    const sampleCard = sampleCardsById[card.id];
    if (!sampleCard) {
      return card;
    }
    return {
      ...card,
      image: card.image || sampleCard.image,
      scene: card.scene || sampleCard.scene
    };
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
  return {
    id: cleanText(card.id) || createId(),
    korean,
    meaning,
    pronunciation: cleanText(card.pronunciation),
    tag: cleanText(card.tag) || "情境畫面",
    cue,
    scene: cleanText(card.scene) || cue,
    image: safeImageSource(card.image),
    status: ["new", "stuck", "mastered"].includes(card.status) ? card.status : "new",
    reviewCount: Number.isFinite(Number(card.reviewCount)) ? Number(card.reviewCount) : 0,
    createdAt: cleanText(card.createdAt) || new Date().toISOString(),
    updatedAt: cleanText(card.updatedAt)
  };
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
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
    const matchesFilter = filter === "all" || card.status === filter || card.tag === filter;
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
    elements.copyPromptButton
  ].forEach((button) => {
    button.disabled = !hasCards;
  });

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
  fallback.id = "frontImageFallback";
  fallback.textContent = text;
  elements.frontVisual.appendChild(fallback);
  elements.frontImageFallback = fallback;
}

function renderLibrary(active) {
  const activeCard = active[currentIndex] || null;
  elements.cardList.replaceChildren();
  elements.emptyState.classList.toggle("hidden", active.length > 0);

  active.forEach((card, index) => {
    const item = document.createElement("article");
    item.className = `library-card${activeCard && activeCard.id === card.id ? " is-active" : ""}`;

    const content = document.createElement("button");
    content.className = "link-button";
    content.type = "button";
    content.classList.add("library-select-button");
    content.addEventListener("click", () => {
      currentIndex = index;
      isFlipped = false;
      render();
    });

    const title = document.createElement("strong");
    title.textContent = card.korean;
    const meta = document.createElement("span");
    meta.textContent = `${card.meaning} · ${card.tag} · ${statusLabel(card.status)}`;
    content.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "library-card-actions";
    actions.append(
      tinyButton("✎", "編輯", () => startEdit(card.id)),
      tinyButton("×", "刪除", () => deleteCard(card.id))
    );

    item.append(content, actions);
    elements.cardList.appendChild(item);
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
  const payload = normalizeCard({
    id: editingId || createId(),
    korean: elements.koreanInput.value,
    meaning: elements.meaningInput.value,
    pronunciation: elements.pronunciationInput.value,
    tag: elements.tagInput.value,
    cue: elements.cueInput.value,
    scene: elements.sceneInput.value,
    image,
    status: existingCard?.status || "new",
    reviewCount: existingCard?.reviewCount || 0,
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
  isFlipped = false;
  render();
}

function getActiveIndexById(id) {
  const active = getActiveCards();
  return Math.max(active.findIndex((card) => card.id === id), 0);
}

function resetForm() {
  elements.cardForm.reset();
  editingId = "";
  pendingImageData = "";
  elements.editorTitle.textContent = "新增一張記憶卡";
  elements.submitButton.textContent = "加入記憶庫";
  elements.cancelEditButton.classList.add("hidden");
  elements.imageFileStatus.textContent = "未選擇圖片";
}

function startEdit(id) {
  const card = cards.find((item) => item.id === id);
  if (!card) {
    return;
  }
  editingId = id;
  pendingImageData = "";
  elements.editorTitle.textContent = "編輯記憶卡";
  elements.submitButton.textContent = "儲存修改";
  elements.cancelEditButton.classList.remove("hidden");
  elements.koreanInput.value = card.korean;
  elements.meaningInput.value = card.meaning;
  elements.pronunciationInput.value = card.pronunciation;
  elements.tagInput.value = card.tag;
  elements.cueInput.value = card.cue;
  elements.sceneInput.value = card.scene;
  elements.imageInput.value = card.image && !card.image.startsWith("data:image/") ? card.image : "";
  elements.imageFileStatus.textContent = card.image && card.image.startsWith("data:image/") ? "已使用本機圖片" : "未選擇圖片";
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
  card.status = status;
  card.reviewCount += 1;
  card.updatedAt = new Date().toISOString();
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

function copyImagePrompt() {
  const card = currentCard();
  if (!card) {
    return;
  }
  const prompt = [
    `請生成一張韓文單字圖像記憶卡插圖。`,
    `單字：${card.korean}`,
    `中文意思：${card.meaning}`,
    `發音拆解：${card.pronunciation || "無"}`,
    `聯想密碼：${card.cue}`,
    `畫面：${card.scene || card.cue}`,
    `風格：溫暖極簡、清楚可記、不要文字堆疊，只保留必要韓文字。`
  ].join("\n");

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(prompt).then(
      () => showToast("圖像 Prompt 已複製。"),
      () => fallbackCopy(prompt)
    );
    return;
  }
  fallbackCopy(prompt);
}

function fallbackCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.className = "clipboard-fallback";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
  showToast("圖像 Prompt 已複製。");
}

function exportCards() {
  const payload = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), cards }, null, 2);
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
  if (file.size > 600 * 1024) {
    showToast("圖片超過 600KB，建議改用圖片網址。");
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
  const missing = sampleCards.filter((card) => !ids.has(card.id)).map(cloneCard);
  cards = [...missing, ...cards];
  saveCards();
  currentIndex = 0;
  showToast(`已補回 ${missing.length} 張範例卡。`);
  render();
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
  elements.cardForm.addEventListener("submit", submitCard);
  elements.cancelEditButton.addEventListener("click", resetForm);
  elements.flashcard.addEventListener("click", () => {
    isFlipped = !isFlipped;
    render();
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
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) {
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

bindEvents();
render();
