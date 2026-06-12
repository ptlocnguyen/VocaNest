(async () => {
  const user = await window.requireAuth();
  if (!user) return;

  const userEmailEl = document.getElementById("userEmail");
  if (userEmailEl) {
    userEmailEl.textContent = user.email;
  }

  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "./home.html";
      }
    });
  }

  const params = new URLSearchParams(window.location.search);
  const setId = params.get("set");

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

  const AUTO_SPEAK_KEY = "voca_auto_speak";
  let autoSpeak = localStorage.getItem(AUTO_SPEAK_KEY) === "1";

  if (cardAutoSpeakBtn) {
    cardAutoSpeakBtn.classList.toggle("active", autoSpeak);
  }

  const MARK_KEY_PREFIX = "voca_flashcard_mark_";

  function getMark(itemId) {
    return localStorage.getItem(`${MARK_KEY_PREFIX}${setId}_${itemId}`);
  }

  function setMark(itemId, value) {
    const key = `${MARK_KEY_PREFIX}${setId}_${itemId}`;
    if (!value) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  }

  function toggleMark(itemId, value) {
    const current = getMark(itemId);
    const next = current === value ? null : value;
    setMark(itemId, next);
  }

  function updateMarkUI(itemId) {
    const mark = getMark(itemId);

    if (cardMarkHardBtn) {
      cardMarkHardBtn.classList.toggle("active", mark === "hard");
    }
    if (cardMarkKnownBtn) {
      cardMarkKnownBtn.classList.toggle("active", mark === "known");
    }
  }

  function speakWord(word) {
    if (!word) return;

    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = "en-US";
    utter.rate = speakRate;

    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }

  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function setLoading(text) {
    if (wordEl) wordEl.textContent = text || "Đang tải...";
    if (meaningEl) meaningEl.textContent = " ";
    if (flashcardEl) flashcardEl.classList.remove("is-flipped");
    isFlipped = false;

    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;

    if (progressText) progressText.textContent = "0 / 0";
  }

  function resetCardFace() {
    if (isFlipped) {
      flashcardEl.classList.remove("is-flipped");
      isFlipped = false;
    }
  }

  function renderCard() {
    resetCardFace();

    const card = cards[currentIndex];
    if (!card) return;

    wordEl.textContent = card.word;
    meaningEl.textContent = "";

    if (prevBtn) prevBtn.disabled = currentIndex <= 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= cards.length - 1;

    if (progressText) {
      progressText.textContent = `${currentIndex + 1} / ${cards.length}`;
    }

    updateMarkUI(card.id);

    if (autoSpeak) {
      speakWord(card.word);
    }
  }

  flashcardEl.addEventListener("click", () => {
    if (!cards.length) return;

    isFlipped = !isFlipped;
    flashcardEl.classList.toggle("is-flipped", isFlipped);

    if (isFlipped) {
      const card = cards[currentIndex];
      if (card) meaningEl.textContent = card.meaning;
    } else {
      meaningEl.textContent = "";
    }
  });

  flashcardEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      flashcardEl.click();
    }
  });

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderCard();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentIndex < cards.length - 1) {
        currentIndex++;
        renderCard();
      }
    });
  }

  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", () => {
      if (!cards.length) return;

      isShuffle = !isShuffle;
      cards = isShuffle ? shuffleArray(originalCards) : [...originalCards];
      shuffleBtn.classList.toggle("shuffle-active", isShuffle);

      currentIndex = 0;
      renderCard();
    });
  }

  if (speedSelect) {
    speedSelect.addEventListener("change", () => {
      speakRate = parseFloat(speedSelect.value);
    });
  }

  if (cardSpeakBtn) {
    cardSpeakBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = cards[currentIndex];
      if (!card) return;
      speakWord(card.word);
    });
  }

  if (cardAutoSpeakBtn) {
    cardAutoSpeakBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      autoSpeak = !autoSpeak;
      cardAutoSpeakBtn.classList.toggle("active", autoSpeak);
      localStorage.setItem(AUTO_SPEAK_KEY, autoSpeak ? "1" : "0");
    });
  }

  if (cardMarkHardBtn) {
    cardMarkHardBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = cards[currentIndex];
      if (!card) return;
      toggleMark(card.id, "hard");
      updateMarkUI(card.id);
    });
  }

  if (cardMarkKnownBtn) {
    cardMarkKnownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = cards[currentIndex];
      if (!card) return;
      toggleMark(card.id, "known");
      updateMarkUI(card.id);
    });
  }

  async function loadSetAndItems() {
    try {
      setLoading("Đang tải bộ từ...");

      const { data: setData } = await window.vocaApi.authPost("getSet", {
        setId
      });

      document.title = `VocaNest - Flashcards: ${setData.title}`;

      setLoading("Đang tải danh sách từ...");

      const { data: items } = await window.vocaApi.authPost("listItems", {
        setId
      });

      if (!items || items.length === 0) {
        setLoading("Bộ từ chưa có từ nào");
        return;
      }

      cards = items
        .slice()
        .reverse()
        .map(it => ({
          id: it.id,
          word: it.word || "",
          meaning: it.meaning || ""
        }));

      originalCards = [...cards];
      currentIndex = 0;
      renderCard();
    } catch (err) {
      console.error(err);
      alert(err.message || "Có lỗi xảy ra khi tải flashcards.");
      window.location.replace("./vocab-sets.html");
    }
  }

  loadSetAndItems();
})();
