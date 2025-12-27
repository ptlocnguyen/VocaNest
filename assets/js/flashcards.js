// assets/js/flashcards.js
// Flashcards: load vocab_items theo vocab_set_id (URL ?set=...)
// Supabase v1 + JS thuần

(() => {
  // ===== Auth =====
  const user = window.requireAuth();
  if (!user) return;

  // Header email
  const userEmailEl = document.getElementById("userEmail");
  if (userEmailEl) {
    userEmailEl.textContent = user.email;
  }

  // Back button (quay lại trang trước)
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

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      logoutBtn.disabled = true;
      await supabaseClient.auth.signOut();
      window.location.replace("./auth.html");
    });
  }

  // ===== Read setId from URL =====
  const params = new URLSearchParams(window.location.search);
  const setId = params.get("set");

  if (!setId) {
    alert("Thiếu mã bộ từ vựng. Vui lòng chọn bộ từ vựng để học.");
    window.location.replace("./vocab-sets.html");
    return;
  }

  // ===== Elements =====
  const flashcardEl = document.getElementById("flashcard");
  const wordEl = document.getElementById("cardWord");
  const meaningEl = document.getElementById("cardMeaning");

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const shuffleBtn = document.getElementById("shuffleBtn");
  const progressText = document.getElementById("progressText");

  // Embedded actions in card
  const cardSpeakBtn = document.getElementById("cardSpeakBtn");
  const cardAutoSpeakBtn = document.getElementById("cardAutoSpeakBtn");
  const cardMarkHardBtn = document.getElementById("cardMarkHardBtn");
  const cardMarkKnownBtn = document.getElementById("cardMarkKnownBtn");

  // Speed select
  const speedSelect = document.getElementById("speedSelect");

  // ===== State =====
  let cards = [];
  let originalCards = [];
  let currentIndex = 0;
  let isFlipped = false;

  let speakRate = 1;
  let isShuffle = false;
  let autoSpeak = false;

  // ===== Auto speak persistence =====
  const AUTO_SPEAK_KEY = "voca_auto_speak";
  autoSpeak = localStorage.getItem(AUTO_SPEAK_KEY) === "1";

  if (cardAutoSpeakBtn) {
    cardAutoSpeakBtn.classList.toggle("active", autoSpeak);
  }

  // ===== Mark persistence =====
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

  // ===== TTS =====
  function speakWord(word) {
    if (!word) return;

    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = "en-US";
    utter.rate = speakRate;

    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }

  // ===== Shuffle =====
  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ===== UI helpers =====
  function setLoading(text) {
    if (wordEl) wordEl.textContent = text || "Đang tải...";
    if (meaningEl) meaningEl.textContent = " ";
    if (flashcardEl) flashcardEl.classList.remove("is-flipped");
    isFlipped = false;

    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;

    if (progressText) progressText.textContent = "0 / 0";
  }

  function renderCard() {
    const card = cards[currentIndex];
    if (!card) return;

    wordEl.textContent = card.word;
    meaningEl.textContent = card.meaning;

    // Reset flip
    isFlipped = false;
    flashcardEl.classList.remove("is-flipped");

    // Nav state
    if (prevBtn) prevBtn.disabled = currentIndex <= 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= cards.length - 1;

    // Progress
    if (progressText) {
      progressText.textContent = `${currentIndex + 1} / ${cards.length}`;
    }

    // Mark UI
    updateMarkUI(card.id);

    // Auto speak
    if (autoSpeak) {
      speakWord(card.word);
    }
  }

  // ===== Events =====

  // Flip card
  if (flashcardEl) {
    flashcardEl.addEventListener("click", () => {
      if (!cards.length) return;
      isFlipped = !isFlipped;
      flashcardEl.classList.toggle("is-flipped", isFlipped);
    });
  }

  // Navigation
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

  // Shuffle
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

  // Speed select
  if (speedSelect) {
    speedSelect.addEventListener("change", () => {
      speakRate = parseFloat(speedSelect.value);
    });
  }

  // ===== Embedded card actions =====

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

  // ===== Load data =====
  async function loadSetAndItems() {
    try {
      setLoading("Đang tải bộ từ...");

      const { data: setData, error: setErr } = await supabaseClient
        .from("vocab_sets")
        .select("id,title,is_public,user_id")
        .eq("id", setId)
        .single();

      if (setErr || !setData) {
        alert("Không tìm thấy bộ từ vựng.");
        window.location.replace("./vocab-sets.html");
        return;
      }

      const canView = setData.user_id === user.id || setData.is_public;
      if (!canView) {
        alert("Bạn không có quyền học bộ từ này.");
        window.location.replace("./vocab-sets.html");
        return;
      }

      document.title = `VocaNest - Flashcards: ${setData.title}`;

      setLoading("Đang tải danh sách từ...");

      const { data: items, error: itemsErr } = await supabaseClient
        .from("vocab_items")
        .select("id,word,meaning")
        .eq("vocab_set_id", setId)
        .order("id", { ascending: true });

      if (itemsErr || !items) {
        alert("Lỗi tải danh sách từ.");
        window.location.replace("./vocab-set-detail.html?id=" + setId);
        return;
      }

      if (items.length === 0) {
        setLoading("Bộ từ chưa có từ nào");
        return;
      }

      cards = items.map(it => ({
        id: it.id,
        word: it.word || "",
        meaning: it.meaning || ""
      }));

      originalCards = [...cards];
      currentIndex = 0;
      renderCard();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi tải flashcards.");
      window.location.replace("./vocab-sets.html");
    }
  }

  // ===== Init =====
  loadSetAndItems();
})();
