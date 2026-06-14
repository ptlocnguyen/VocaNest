(() => {
  const params = new URLSearchParams(window.location.search);
  const setId = params.get("set");
  const MARK_KEY_PREFIX = "voca_flashcard_mark_";
  const QUIZ_STORAGE_PREFIX = "vocanest_vocab_quiz_";

  const elements = {
    userEmail: document.getElementById("userEmail"),
    loadingView: document.getElementById("loadingView"),
    studyView: document.getElementById("studyView"),
    setMeta: document.getElementById("setMeta"),
    setTitle: document.getElementById("setTitle"),
    setDescription: document.getElementById("setDescription"),
    manageLink: document.getElementById("manageLink"),
    flashcardsLink: document.getElementById("flashcardsLink"),
    quizLink: document.getElementById("quizLink"),
    wordCount: document.getElementById("wordCount"),
    hardCount: document.getElementById("hardCount"),
    knownCount: document.getElementById("knownCount"),
    bestQuiz: document.getElementById("bestQuiz"),
    previewCount: document.getElementById("previewCount"),
    wordPreview: document.getElementById("wordPreview")
  };

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function getQuizStats() {
    try {
      return JSON.parse(localStorage.getItem(`${QUIZ_STORAGE_PREFIX}${setId}`) || "{}");
    } catch {
      return {};
    }
  }

  function getMark(itemId) {
    return localStorage.getItem(`${MARK_KEY_PREFIX}${setId}_${itemId}`);
  }

  function countMarks(items) {
    return items.reduce((stats, item) => {
      const mark = getMark(item.id);
      if (mark === "hard") stats.hard += 1;
      if (mark === "known") stats.known += 1;
      return stats;
    }, { hard: 0, known: 0 });
  }

  function renderPreview(items) {
    elements.wordPreview.replaceChildren();
    const fragment = document.createDocumentFragment();
    items.slice(0, 12).forEach((item) => {
      const chip = document.createElement("div");
      chip.className = "word-chip";

      const word = document.createElement("strong");
      word.textContent = item.word || "";

      const meaning = document.createElement("span");
      meaning.textContent = item.meaning || "";

      chip.append(word, meaning);
      fragment.appendChild(chip);
    });

    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Bộ này chưa có từ nào.";
      fragment.appendChild(empty);
    }

    elements.wordPreview.appendChild(fragment);
    elements.previewCount.textContent = `${items.length} từ`;
  }

  function renderStudy(set, items) {
    const marks = countMarks(items);
    const quizStats = getQuizStats();

    document.title = `VocaNest - Học: ${set.title || "Bộ từ"}`;
    elements.setMeta.textContent = set.is_owner
      ? (set.is_public ? "Bộ công khai của bạn" : "Bộ riêng tư của bạn")
      : "Bộ công khai";
    elements.setTitle.textContent = set.title || "Bộ từ vựng";
    elements.setDescription.textContent = set.description || "Chọn một chế độ học để bắt đầu.";

    elements.wordCount.textContent = String(items.length);
    elements.hardCount.textContent = String(marks.hard);
    elements.knownCount.textContent = String(marks.known);
    elements.bestQuiz.textContent = Number.isFinite(quizStats.bestPercent) ? `${quizStats.bestPercent}%` : "--";

    elements.manageLink.href = `./vocab-set-detail.html?id=${encodeURIComponent(setId)}`;
    elements.manageLink.innerHTML = set.is_owner
      ? '<i data-lucide="settings"></i> Quản lý từ'
      : '<i data-lucide="list"></i> Xem danh sách từ';
    elements.flashcardsLink.href = `./flashcards.html?set=${encodeURIComponent(setId)}`;
    elements.quizLink.href = `./vocab-quiz.html?set=${encodeURIComponent(setId)}`;

    renderPreview(items);
    elements.loadingView.hidden = true;
    elements.studyView.hidden = false;
    refreshIcons();
  }

  async function init() {
    const user = await window.requireAuth();
    if (!user) return;
    if (elements.userEmail) elements.userEmail.textContent = user.email;

    if (!setId) {
      window.location.replace("./vocab-sets.html");
      return;
    }

    try {
      const { data } = await window.vocaApi.authPost("getSetBundle", { setId });
      renderStudy(data.set, data.items || []);
    } catch (error) {
      console.error(error);
      elements.loadingView.innerHTML = `
        <i data-lucide="cloud-off"></i>
        <h1>Không tải được bộ từ</h1>
        <p>${error.message || "Vui lòng thử lại sau."}</p>
        <a class="btn" href="./vocab-sets.html">Về thư viện bộ từ</a>
      `;
      refreshIcons();
    }
  }

  init();
})();
