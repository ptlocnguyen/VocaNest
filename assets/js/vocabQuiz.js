(() => {
  const STORAGE_PREFIX = "vocanest_vocab_quiz_";
  const params = new URLSearchParams(window.location.search);
  const setId = params.get("set");
  const letters = ["A", "B", "C", "D"];

  const elements = {
    userEmail: document.getElementById("userEmail"),
    loadingView: document.getElementById("loadingView"),
    setupView: document.getElementById("setupView"),
    quizView: document.getElementById("quizView"),
    resultView: document.getElementById("resultView"),
    backToSetLink: document.getElementById("backToSetLink"),
    backResultLink: document.getElementById("backResultLink"),
    setTitle: document.getElementById("setTitle"),
    setDescription: document.getElementById("setDescription"),
    totalWords: document.getElementById("totalWords"),
    bestScore: document.getElementById("bestScore"),
    questionCount: document.getElementById("questionCount"),
    startBtn: document.getElementById("startBtn"),
    modeLabel: document.getElementById("modeLabel"),
    questionProgress: document.getElementById("questionProgress"),
    liveScore: document.getElementById("liveScore"),
    progressBar: document.getElementById("progressBar"),
    questionPrompt: document.getElementById("questionPrompt"),
    questionText: document.getElementById("questionText"),
    answerOptions: document.getElementById("answerOptions"),
    feedbackBox: document.getElementById("feedbackBox"),
    quitBtn: document.getElementById("quitBtn"),
    nextBtn: document.getElementById("nextBtn"),
    resultTitle: document.getElementById("resultTitle"),
    resultSummary: document.getElementById("resultSummary"),
    resultPercent: document.getElementById("resultPercent"),
    resultCorrect: document.getElementById("resultCorrect"),
    resultWrong: document.getElementById("resultWrong"),
    retryWrongBtn: document.getElementById("retryWrongBtn"),
    restartBtn: document.getElementById("restartBtn")
  };

  let setData = null;
  let items = [];
  let session = null;
  let lastWrongItems = [];

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function storageKey() {
    return `${STORAGE_PREFIX}${setId}`;
  }

  function loadStats() {
    try {
      return JSON.parse(localStorage.getItem(storageKey()) || "{}");
    } catch {
      return {};
    }
  }

  function saveStats(stats) {
    localStorage.setItem(storageKey(), JSON.stringify(stats));
  }

  function showView(name) {
    elements.loadingView.hidden = name !== "loading";
    elements.setupView.hidden = name !== "setup";
    elements.quizView.hidden = name !== "quiz";
    elements.resultView.hidden = name !== "result";
  }

  function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function selectedMode() {
    return document.querySelector('input[name="quizMode"]:checked')?.value || "word-to-meaning";
  }

  function modeText(mode) {
    return mode === "meaning-to-word" ? "Nghĩa -> từ" : "Từ -> nghĩa";
  }

  function questionPrompt(mode) {
    return mode === "meaning-to-word" ? "Chọn từ tiếng Anh đúng với nghĩa" : "Chọn nghĩa đúng của từ";
  }

  function answerValue(item, mode) {
    return mode === "meaning-to-word" ? item.word : item.meaning;
  }

  function questionValue(item, mode) {
    return mode === "meaning-to-word" ? item.meaning : item.word;
  }

  function cleanItems(rawItems) {
    const seen = new Set();
    return (rawItems || [])
      .map((item) => ({
        id: String(item.id || `${item.word}-${item.meaning}`),
        word: String(item.word || "").trim(),
        meaning: String(item.meaning || "").trim()
      }))
      .filter((item) => {
        const key = `${item.word.toLowerCase()}::${item.meaning.toLowerCase()}`;
        if (!item.word || !item.meaning || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function buildQuestionPool(sourceItems, count, mode, optionSource = items) {
    const selected = shuffle(sourceItems).slice(0, count);
    return selected.map((item) => {
      const distractors = shuffle(optionSource)
        .filter((entry) => entry.id !== item.id)
        .map((entry) => answerValue(entry, mode))
        .filter((value, index, list) => value && list.indexOf(value) === index)
        .slice(0, 3);
      const correct = answerValue(item, mode);
      const options = shuffle([correct, ...distractors]);

      return {
        item,
        prompt: questionValue(item, mode),
        correct,
        options,
        selected: null,
        isCorrect: false
      };
    });
  }

  function populateQuestionCounts() {
    elements.questionCount.replaceChildren();
    const total = items.length;
    const options = [5, 10, 20, total]
      .filter((value, index, list) => value <= total && list.indexOf(value) === index);

    options.forEach((value) => {
      const option = document.createElement("option");
      option.value = String(value);
      option.textContent = `${value} câu`;
      elements.questionCount.appendChild(option);
    });

    elements.questionCount.value = String(options.includes(10) ? 10 : options[0] || total);
  }

  function renderSetup() {
    document.title = `VocaNest - Quiz: ${setData.title}`;
    elements.setTitle.textContent = setData.title || "Quiz từ vựng";
    elements.setDescription.textContent = setData.description || "Kiểm tra nhanh mức độ ghi nhớ của bạn.";
    elements.totalWords.textContent = String(items.length);

    const stats = loadStats();
    elements.bestScore.textContent = Number.isFinite(stats.bestPercent) ? `${stats.bestPercent}%` : "--";
    populateQuestionCounts();
    showView("setup");
    refreshIcons();
  }

  function renderQuestion() {
    const question = session.questions[session.index];
    const total = session.questions.length;
    const progress = ((session.index + 1) / total) * 100;

    elements.modeLabel.textContent = modeText(session.mode);
    elements.questionProgress.textContent = `Câu ${session.index + 1} / ${total}`;
    elements.liveScore.textContent = `${session.correctCount} đúng`;
    elements.progressBar.style.width = `${progress}%`;
    elements.questionPrompt.textContent = questionPrompt(session.mode);
    elements.questionText.textContent = question.prompt;
    elements.feedbackBox.hidden = true;
    elements.feedbackBox.className = "quiz-feedback";
    elements.nextBtn.disabled = true;
    elements.nextBtn.innerHTML = session.index === total - 1
      ? 'Xem kết quả <i data-lucide="list-checks"></i>'
      : 'Câu tiếp <i data-lucide="chevron-right"></i>';

    elements.answerOptions.replaceChildren();
    question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.className = "btn answer-btn";
      button.type = "button";
      button.dataset.index = String(index);
      button.innerHTML = `<strong>${letters[index]}</strong><span></span>`;
      button.lastElementChild.textContent = option;
      button.addEventListener("click", () => selectAnswer(index));
      elements.answerOptions.appendChild(button);
    });

    refreshIcons();
  }

  function selectAnswer(index) {
    const question = session?.questions[session.index];
    if (!question || question.selected !== null) return;

    const selected = question.options[index];
    question.selected = selected;
    question.isCorrect = selected === question.correct;
    if (question.isCorrect) session.correctCount += 1;

    elements.answerOptions.querySelectorAll(".answer-btn").forEach((button) => {
      const option = question.options[Number(button.dataset.index)];
      button.disabled = true;
      if (option === question.correct) button.classList.add("is-correct");
      else if (option === selected) button.classList.add("is-wrong");
    });

    elements.feedbackBox.hidden = false;
    elements.feedbackBox.className = `quiz-feedback ${question.isCorrect ? "is-correct" : "is-wrong"}`;
    elements.feedbackBox.textContent = question.isCorrect
      ? "Chính xác."
      : `Chưa đúng. Đáp án đúng là: ${question.correct}`;
    elements.liveScore.textContent = `${session.correctCount} đúng`;
    elements.nextBtn.disabled = false;
  }

  function finishQuiz() {
    const total = session.questions.length;
    const correct = session.correctCount;
    const percent = Math.round((correct / total) * 100);
    lastWrongItems = session.questions
      .filter((question) => !question.isCorrect)
      .map((question) => question.item);

    const stats = loadStats();
    const nextStats = {
      attempts: (Number(stats.attempts) || 0) + 1,
      bestPercent: Math.max(Number(stats.bestPercent) || 0, percent),
      lastPercent: percent,
      updatedAt: new Date().toISOString()
    };
    saveStats(nextStats);

    elements.resultTitle.textContent = percent >= 90 ? "Rất tốt" : percent >= 70 ? "Ổn định" : "Cần ôn lại";
    elements.resultSummary.textContent = `${setData.title}: đúng ${correct}/${total} câu.`;
    elements.resultPercent.textContent = `${percent}%`;
    elements.resultCorrect.textContent = String(correct);
    elements.resultWrong.textContent = String(total - correct);
    elements.retryWrongBtn.disabled = !lastWrongItems.length;
    elements.bestScore.textContent = `${nextStats.bestPercent}%`;
    session = null;
    showView("result");
    refreshIcons();
  }

  function nextQuestion() {
    if (!session) return;
    if (session.index >= session.questions.length - 1) {
      finishQuiz();
      return;
    }
    session.index += 1;
    renderQuestion();
  }

  function startQuiz(sourceItems = items) {
    if (items.length < 4 || !sourceItems.length) {
      showView("setup");
      elements.setDescription.textContent = "Cần ít nhất 4 từ hợp lệ để tạo quiz 4 đáp án.";
      return;
    }

    const mode = selectedMode();
    const count = Math.min(Number(elements.questionCount.value) || 10, sourceItems.length);
    session = {
      mode,
      index: 0,
      correctCount: 0,
      questions: buildQuestionPool(sourceItems, count, mode, items)
    };
    showView("quiz");
    renderQuestion();
  }

  function retryWrong() {
    if (!lastWrongItems.length) return;
    startQuiz(lastWrongItems);
  }

  function bindEvents() {
    elements.startBtn.addEventListener("click", () => startQuiz());
    elements.restartBtn.addEventListener("click", renderSetup);
    elements.retryWrongBtn.addEventListener("click", retryWrong);
    elements.nextBtn.addEventListener("click", nextQuestion);
    elements.quitBtn.addEventListener("click", renderSetup);

    document.addEventListener("keydown", (event) => {
      if (elements.quizView.hidden || !session) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target?.tagName)) return;

      if (/^[1-4]$/.test(event.key)) {
        event.preventDefault();
        selectAnswer(Number(event.key) - 1);
      } else if (event.key === "Enter" && !elements.nextBtn.disabled) {
        event.preventDefault();
        nextQuestion();
      }
    });
  }

  async function init() {
    const user = await window.requireAuth();
    if (!user) return;
    if (elements.userEmail) elements.userEmail.textContent = user.email;

    if (!setId) {
      window.location.replace("./vocab-sets.html");
      return;
    }

    elements.backToSetLink.href = `./vocab-set-detail.html?id=${encodeURIComponent(setId)}`;
    elements.backResultLink.href = elements.backToSetLink.href;

    try {
      showView("loading");
      const { data } = await window.vocaApi.authPost("getSetBundle", { setId });
      setData = data.set;
      items = cleanItems(data.items);

      if (items.length < 4) {
        elements.loadingView.innerHTML = `
          <i data-lucide="circle-alert"></i>
          <h1>Chưa đủ dữ liệu để tạo quiz</h1>
          <p>Bộ từ cần ít nhất 4 từ có đủ từ vựng và nghĩa để tạo câu hỏi trắc nghiệm.</p>
          <a class="btn primary" href="${elements.backToSetLink.href}">Quay lại thêm từ</a>
        `;
        refreshIcons();
        return;
      }

      renderSetup();
    } catch (error) {
      console.error(error);
      elements.loadingView.innerHTML = `
        <i data-lucide="cloud-off"></i>
        <h1>Không tải được quiz</h1>
        <p>${error.message || "Vui lòng thử lại sau."}</p>
        <a class="btn" href="./vocab-sets.html">Về thư viện bộ từ</a>
      `;
      refreshIcons();
    }
  }

  bindEvents();
  init();
})();
