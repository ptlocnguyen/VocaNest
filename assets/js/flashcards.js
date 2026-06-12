(async () => {
  const user = await window.requireAuth();
  if (!user) return;

  const userEmailEl = document.getElementById("userEmail");
  if (userEmailEl) userEmailEl.textContent = user.email;

  const backBtn = document.getElementById("backBtn");
  const setTitleEl = document.getElementById("setTitle");
  const params = new URLSearchParams(window.location.search);
  const setId = params.get("set");

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (window.history.length > 1) window.history.back();
      else window.location.href = "./vocab-sets.html";
    });
  }

  if (!setId) {
    alert("Thiếu mã bộ từ vựng. Vui lòng chọn bộ từ vựng để học.");
    window.location.replace("./vocab-sets.html");
    return;
  }

  const flashcardEl = document.getElementById("flashcard");
  const wordEl = document.getElementById("cardWord");
  const meaningEl = document.getElementById("cardMeaning");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const shuffleBtn = document.getElementById("shuffleBtn");
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");
  const cardStatus = document.getElementById("cardStatus");
  const cardSpeakBtn = document.getElementById("cardSpeakBtn");
  const cardAutoSpeakBtn = document.getElementById("cardAutoSpeakBtn");
  const cardMarkHardBtn = document.getElementById("cardMarkHardBtn");
  const cardMarkKnownBtn = document.getElementById("cardMarkKnownBtn");
  const speedSelect = document.getElementById("speedSelect");

  let cards = [];
  let originalCards = [];
  let currentIndex = 0;
  let isFlipped = false;
  let speakRate = 1;
  let isShuffle = false;
  let gestureStart = null;
  let suppressFlip = false;

  const AUTO_SPEAK_KEY = "voca_auto_speak";
  const MARK_KEY_PREFIX = "voca_flashcard_mark_";
  let autoSpeak = localStorage.getItem(AUTO_SPEAK_KEY) === "1";

  function setPressed(button, pressed) {
    if (!button) return;
    button.classList.toggle("active", pressed);
    button.setAttribute("aria-pressed", String(pressed));
  }

  setPressed(cardAutoSpeakBtn, autoSpeak);

  function getCurrentCard() {
    return cards[currentIndex] || null;
  }

  function getMark(itemId) {
    return localStorage.getItem(`${MARK_KEY_PREFIX}${setId}_${itemId}`);
  }

  function setMark(itemId, value) {
    const key = `${MARK_KEY_PREFIX}${setId}_${itemId}`;
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  }

  function toggleMark(itemId, value) {
    const next = getMark(itemId) === value ? null : value;
    setMark(itemId, next);
    return next;
  }

  function updateMarkUI(itemId) {
    const mark = getMark(itemId);
    setPressed(cardMarkHardBtn, mark === "hard");
    setPressed(cardMarkKnownBtn, mark === "known");

    cardStatus.className = "card-status";
    if (mark === "hard") {
      cardStatus.textContent = "Từ khó";
      cardStatus.classList.add("is-hard");
    } else if (mark === "known") {
      cardStatus.textContent = "Đã nhớ";
      cardStatus.classList.add("is-known");
    } else {
      cardStatus.textContent = "Chưa đánh dấu";
    }
  }

  function speakWord(word) {
    if (!word || !("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = "en-US";
    utter.rate = speakRate;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }

  function shuffleArray(list) {
    const shuffled = [...list];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const target = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
    }
    return shuffled;
  }

  function resetCardFace() {
    flashcardEl.classList.remove("is-flipped");
    flashcardEl.setAttribute("aria-label", "Lật flashcard để xem nghĩa");
    isFlipped = false;
  }

  function flipCard() {
    const card = getCurrentCard();
    if (!card) return;

    isFlipped = !isFlipped;
    flashcardEl.classList.toggle("is-flipped", isFlipped);
    meaningEl.textContent = isFlipped ? card.meaning : "";
    flashcardEl.setAttribute(
      "aria-label",
      isFlipped ? "Lật flashcard để xem từ vựng" : "Lật flashcard để xem nghĩa"
    );
  }

  function renderCard() {
    resetCardFace();
    const card = getCurrentCard();
    if (!card) return;

    wordEl.textContent = card.word;
    meaningEl.textContent = "";
    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= cards.length - 1;
    progressText.textContent = `${currentIndex + 1} / ${cards.length}`;
    progressBar.style.width = `${((currentIndex + 1) / cards.length) * 100}%`;
    updateMarkUI(card.id);

    if (autoSpeak) speakWord(card.word);
  }

  function showPrevious() {
    if (currentIndex <= 0) return;
    currentIndex--;
    renderCard();
  }

  function showNext() {
    if (currentIndex >= cards.length - 1) return;
    currentIndex++;
    renderCard();
  }

  function toggleShuffle() {
    if (!cards.length) return;
    isShuffle = !isShuffle;
    cards = isShuffle ? shuffleArray(originalCards) : [...originalCards];
    currentIndex = 0;
    setPressed(shuffleBtn, isShuffle);
    renderCard();
  }

  function toggleAutoSpeak() {
    autoSpeak = !autoSpeak;
    setPressed(cardAutoSpeakBtn, autoSpeak);
    localStorage.setItem(AUTO_SPEAK_KEY, autoSpeak ? "1" : "0");
    if (autoSpeak) {
      const card = getCurrentCard();
      if (card) speakWord(card.word);
    }
  }

  function markCurrent(value) {
    const card = getCurrentCard();
    if (!card) return;
    toggleMark(card.id, value);
    updateMarkUI(card.id);
  }

  function setLoading(text) {
    wordEl.textContent = text || "Đang tải...";
    meaningEl.textContent = "";
    resetCardFace();
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    progressText.textContent = "0 / 0";
    progressBar.style.width = "0";
    cardStatus.textContent = "Đang chuẩn bị";
  }

  flashcardEl.addEventListener("click", () => {
    if (suppressFlip) {
      suppressFlip = false;
      return;
    }
    flipCard();
  });

  flashcardEl.addEventListener("pointerdown", event => {
    if (event.pointerType === "mouse") return;
    gestureStart = { x: event.clientX, y: event.clientY };
  });

  flashcardEl.addEventListener("pointerup", event => {
    if (!gestureStart || event.pointerType === "mouse") return;

    const deltaX = event.clientX - gestureStart.x;
    const deltaY = event.clientY - gestureStart.y;
    gestureStart = null;

    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;
    suppressFlip = true;
    if (deltaX < 0) showNext();
    else showPrevious();
  });

  flashcardEl.addEventListener("pointercancel", () => {
    gestureStart = null;
  });
  prevBtn.addEventListener("click", showPrevious);
  nextBtn.addEventListener("click", showNext);
  shuffleBtn.addEventListener("click", toggleShuffle);
  cardAutoSpeakBtn.addEventListener("click", toggleAutoSpeak);
  cardMarkHardBtn.addEventListener("click", () => markCurrent("hard"));
  cardMarkKnownBtn.addEventListener("click", () => markCurrent("known"));

  cardSpeakBtn.addEventListener("click", () => {
    const card = getCurrentCard();
    if (card) speakWord(card.word);
  });

  speedSelect.addEventListener("change", () => {
    speakRate = Number.parseFloat(speedSelect.value) || 1;
  });

  document.addEventListener("keydown", event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    const target = event.target;
    const tagName = target && target.tagName;
    if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") return;
    if (tagName === "BUTTON" && (event.key === " " || event.key === "Enter")) return;

    const key = event.key.toLowerCase();
    const actions = {
      arrowleft: showPrevious,
      arrowright: showNext,
      " ": flipCard,
      enter: flipCard,
      s: () => {
        const card = getCurrentCard();
        if (card) speakWord(card.word);
      },
      a: toggleAutoSpeak,
      h: () => markCurrent("hard"),
      k: () => markCurrent("known"),
      r: toggleShuffle
    };

    const action = actions[key];
    if (!action) return;
    event.preventDefault();
    action();
  });

  async function loadSetAndItems() {
    try {
      setLoading("Đang tải bộ từ...");
      const { data } = await window.vocaApi.authPost("getSetBundle", { setId });
      const setData = data.set;
      const items = data.items;

      document.title = `VocaNest - Flashcards: ${setData.title}`;
      setTitleEl.textContent = setData.title || "Bộ từ vựng";

      if (!items || items.length === 0) {
        setLoading("Bộ từ chưa có từ nào");
        cardStatus.textContent = "Không có dữ liệu";
        return;
      }

      cards = items
        .slice()
        .reverse()
        .map(item => ({
          id: item.id,
          word: item.word || "",
          meaning: item.meaning || ""
        }));

      originalCards = [...cards];
      currentIndex = 0;
      renderCard();
    } catch (error) {
      console.error(error);
      alert(error.message || "Có lỗi xảy ra khi tải flashcards.");
      window.location.replace("./vocab-sets.html");
    }
  }

  loadSetAndItems();
})();
