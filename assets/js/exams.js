(() => {
  const STORAGE_KEY = "vocanest_part5_progress_v1";
  const letters = ["A", "B", "C", "D"];
  const questions = Array.isArray(window.PART5_QUESTIONS) ? window.PART5_QUESTIONS : [];

  const elements = {
    setupView: document.getElementById("setupView"),
    sessionView: document.getElementById("sessionView"),
    resultView: document.getElementById("resultView"),
    userEmail: document.getElementById("userEmail"),
    questionCount: document.getElementById("questionCount"),
    topicFilter: document.getElementById("topicFilter"),
    startExamBtn: document.getElementById("startExamBtn"),
    reviewMistakesBtn: document.getElementById("reviewMistakesBtn"),
    totalAttempts: document.getElementById("totalAttempts"),
    bestScore: document.getElementById("bestScore"),
    mistakeCount: document.getElementById("mistakeCount"),
    sessionModeLabel: document.getElementById("sessionModeLabel"),
    timerText: document.getElementById("timerText"),
    sessionProgressBar: document.getElementById("sessionProgressBar"),
    questionNumber: document.getElementById("questionNumber"),
    questionTopic: document.getElementById("questionTopic"),
    questionSentence: document.getElementById("questionSentence"),
    answerOptions: document.getElementById("answerOptions"),
    flagQuestionBtn: document.getElementById("flagQuestionBtn"),
    answerFeedback: document.getElementById("answerFeedback"),
    feedbackIcon: document.getElementById("feedbackIcon"),
    feedbackTitle: document.getElementById("feedbackTitle"),
    feedbackAnswer: document.getElementById("feedbackAnswer"),
    feedbackExplanation: document.getElementById("feedbackExplanation"),
    feedbackTip: document.getElementById("feedbackTip"),
    grammarLink: document.getElementById("grammarLink"),
    previousQuestionBtn: document.getElementById("previousQuestionBtn"),
    nextQuestionBtn: document.getElementById("nextQuestionBtn"),
    answeredCount: document.getElementById("answeredCount"),
    sessionQuestionCount: document.getElementById("sessionQuestionCount"),
    questionMap: document.getElementById("questionMap"),
    toggleMapBtn: document.getElementById("toggleMapBtn"),
    submitExamBtn: document.getElementById("submitExamBtn"),
    exitSessionBtn: document.getElementById("exitSessionBtn"),
    questionMapPanel: document.querySelector(".question-map-panel"),
    resultHeadline: document.getElementById("resultHeadline"),
    resultSummary: document.getElementById("resultSummary"),
    scoreRing: document.getElementById("scoreRing"),
    resultPercent: document.getElementById("resultPercent"),
    correctResult: document.getElementById("correctResult"),
    incorrectResult: document.getElementById("incorrectResult"),
    timeResult: document.getElementById("timeResult"),
    topicResults: document.getElementById("topicResults"),
    reviewResultBtn: document.getElementById("reviewResultBtn"),
    retryMistakesBtn: document.getElementById("retryMistakesBtn"),
    newSessionBtn: document.getElementById("newSessionBtn"),
    answerReview: document.getElementById("answerReview"),
    reviewFilter: document.getElementById("reviewFilter"),
    reviewList: document.getElementById("reviewList"),
    confirmDialog: document.getElementById("confirmDialog"),
    dialogTitle: document.getElementById("dialogTitle"),
    dialogMessage: document.getElementById("dialogMessage"),
    cancelDialogBtn: document.getElementById("cancelDialogBtn"),
    confirmDialogBtn: document.getElementById("confirmDialogBtn")
  };

  let progress = loadProgress();
  let session = null;
  let timerId = null;
  let dialogAction = null;
  let resultSnapshot = null;

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return {
        attempts: Number(saved?.attempts) || 0,
        bestScore: Number(saved?.bestScore) || 0,
        mistakeIds: Array.isArray(saved?.mistakeIds) ? saved.mistakeIds : []
      };
    } catch {
      return { attempts: 0, bestScore: 0, mistakeIds: [] };
    }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    renderOverview();
  }

  function renderOverview() {
    elements.totalAttempts.textContent = String(progress.attempts);
    elements.bestScore.textContent = progress.attempts ? `${progress.bestScore}%` : "--";
    elements.mistakeCount.textContent = String(progress.mistakeIds.length);
    elements.reviewMistakesBtn.disabled = progress.mistakeIds.length === 0;
  }

  function populateTopics() {
    const topics = [...new Set(questions.map((question) => question.topic))].sort((a, b) => a.localeCompare(b, "vi"));
    topics.forEach((topic) => {
      const option = document.createElement("option");
      option.value = topic;
      option.textContent = topic;
      elements.topicFilter.appendChild(option);
    });
    updateStartAvailability();
  }

  function updateStartAvailability() {
    const available = elements.topicFilter.value === "all"
      ? questions.length
      : questions.filter((question) => question.topic === elements.topicFilter.value).length;
    const sessionSize = Math.min(Number(elements.questionCount.value), available);
    elements.startExamBtn.disabled = sessionSize === 0;
    elements.startExamBtn.lastChild.textContent = sessionSize === Number(elements.questionCount.value)
      ? " Bắt đầu luyện"
      : ` Bắt đầu ${sessionSize} câu`;
  }

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
  }

  function selectedMode() {
    return document.querySelector('input[name="examMode"]:checked')?.value || "practice";
  }

  function buildQuestionSet({ mistakeOnly = false } = {}) {
    let pool = questions;
    if (mistakeOnly) {
      const mistakeSet = new Set(progress.mistakeIds);
      pool = questions.filter((question) => mistakeSet.has(question.id));
    } else if (elements.topicFilter.value !== "all") {
      pool = questions.filter((question) => question.topic === elements.topicFilter.value);
    }

    const requestedCount = Number(elements.questionCount.value);
    return shuffle(pool).slice(0, Math.min(requestedCount, pool.length));
  }

  function startSession(questionSet, options = {}) {
    if (!questionSet.length) return;
    const mode = options.mode || selectedMode();
    const duration = mode === "simulation" ? Math.max(4 * 60, questionSet.length * 24) : 0;

    session = {
      questions: questionSet,
      mode,
      index: 0,
      answers: {},
      flagged: new Set(),
      startedAt: Date.now(),
      duration,
      remaining: duration
    };

    resultSnapshot = null;
    elements.setupView.hidden = true;
    elements.resultView.hidden = true;
    elements.sessionView.hidden = false;
    elements.answerReview.hidden = true;
    elements.sessionModeLabel.textContent = mode === "simulation" ? "Mô phỏng có thời gian" : "Luyện tập có giải thích";
    elements.sessionQuestionCount.textContent = String(questionSet.length);
    elements.questionMapPanel.classList.remove("is-collapsed");
    createQuestionMap();
    renderQuestion();
    startTimer();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startTimer() {
    clearInterval(timerId);
    updateTimer();
    timerId = window.setInterval(() => {
      if (!session) return;
      if (session.mode === "simulation") {
        session.remaining -= 1;
        if (session.remaining <= 0) {
          session.remaining = 0;
          updateTimer();
          finishSession();
          return;
        }
      }
      updateTimer();
    }, 1000);
  }

  function elapsedSeconds() {
    if (!session) return 0;
    return Math.max(0, Math.round((Date.now() - session.startedAt) / 1000));
  }

  function formatTime(totalSeconds) {
    const safeSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function updateTimer() {
    if (!session) return;
    const value = session.mode === "simulation" ? session.remaining : elapsedSeconds();
    elements.timerText.textContent = formatTime(value);
    elements.timerText.closest(".timer-box").classList.toggle(
      "is-urgent",
      session.mode === "simulation" && session.remaining <= 60
    );
  }

  function createQuestionMap() {
    elements.questionMap.replaceChildren();
    session.questions.forEach((question, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "map-question";
      button.textContent = String(index + 1);
      button.dataset.index = String(index);
      button.setAttribute("aria-label", `Đi tới câu ${index + 1}`);
      button.addEventListener("click", () => {
        session.index = index;
        renderQuestion();
      });
      elements.questionMap.appendChild(button);
    });
  }

  function renderQuestion() {
    const question = session.questions[session.index];
    const selectedAnswer = session.answers[question.id];
    const showFeedback = session.mode === "practice" && selectedAnswer !== undefined;

    elements.questionNumber.textContent = `Câu ${session.index + 1} / ${session.questions.length}`;
    elements.questionTopic.textContent = question.topic;
    elements.questionSentence.textContent = question.sentence;
    elements.sessionProgressBar.style.width = `${((session.index + 1) / session.questions.length) * 100}%`;
    elements.flagQuestionBtn.setAttribute("aria-pressed", String(session.flagged.has(question.id)));
    elements.previousQuestionBtn.disabled = session.index === 0;
    elements.nextQuestionBtn.innerHTML = session.index === session.questions.length - 1
      ? 'Xem lại <i data-lucide="list-checks"></i>'
      : 'Câu tiếp <i data-lucide="chevron-right"></i>';

    elements.answerOptions.replaceChildren();
    question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-option";
      button.dataset.answer = String(index);
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(selectedAnswer === index));
      button.innerHTML = `<span class="answer-option__letter">${letters[index]}</span><span></span>`;
      button.lastElementChild.textContent = option;

      if (selectedAnswer === index) button.classList.add("is-selected");
      if (showFeedback && index === question.answer) button.classList.add("is-correct");
      if (showFeedback && index === selectedAnswer && index !== question.answer) button.classList.add("is-incorrect");
      if (showFeedback) button.disabled = true;

      button.addEventListener("click", () => selectAnswer(index));
      elements.answerOptions.appendChild(button);
    });

    renderFeedback(question, selectedAnswer, showFeedback);
    refreshQuestionMap();
    refreshIcons();
  }

  function selectAnswer(answerIndex) {
    const question = session.questions[session.index];
    if (session.mode === "practice" && session.answers[question.id] !== undefined) return;
    session.answers[question.id] = answerIndex;
    renderQuestion();
  }

  function renderFeedback(question, selectedAnswer, shouldShow) {
    elements.answerFeedback.hidden = !shouldShow;
    if (!shouldShow) return;

    const isCorrect = selectedAnswer === question.answer;
    elements.answerFeedback.className = `answer-feedback ${isCorrect ? "is-correct" : "is-incorrect"}`;
    elements.feedbackIcon.innerHTML = `<i data-lucide="${isCorrect ? "check" : "x"}"></i>`;
    elements.feedbackTitle.textContent = isCorrect ? "Chính xác" : "Chưa chính xác";
    elements.feedbackAnswer.textContent = `Đáp án: ${letters[question.answer]}. ${question.options[question.answer]}`;
    elements.feedbackExplanation.textContent = question.explanation;
    elements.feedbackTip.textContent = `Mẹo: ${question.tip}`;
    elements.grammarLink.href = `./grammar.html#${question.grammarId}`;
  }

  function refreshQuestionMap() {
    const answered = Object.keys(session.answers).length;
    elements.answeredCount.textContent = String(answered);

    elements.questionMap.querySelectorAll(".map-question").forEach((button, index) => {
      const question = session.questions[index];
      button.classList.toggle("is-current", index === session.index);
      button.classList.toggle("is-answered", session.answers[question.id] !== undefined);
      button.classList.toggle("is-flagged", session.flagged.has(question.id));
    });
  }

  function moveQuestion(direction) {
    const nextIndex = session.index + direction;
    if (nextIndex >= 0 && nextIndex < session.questions.length) {
      session.index = nextIndex;
      renderQuestion();
    } else if (direction > 0) {
      elements.questionMapPanel.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function toggleFlag() {
    const id = session.questions[session.index].id;
    if (session.flagged.has(id)) session.flagged.delete(id);
    else session.flagged.add(id);
    renderQuestion();
  }

  function openDialog({ title, message, confirmLabel, action }) {
    elements.dialogTitle.textContent = title;
    elements.dialogMessage.textContent = message;
    elements.confirmDialogBtn.textContent = confirmLabel;
    dialogAction = action;
    elements.confirmDialog.hidden = false;
    elements.confirmDialogBtn.focus();
  }

  function closeDialog() {
    elements.confirmDialog.hidden = true;
    dialogAction = null;
  }

  function requestSubmit() {
    const unanswered = session.questions.length - Object.keys(session.answers).length;
    openDialog({
      title: "Nộp bài ngay?",
      message: unanswered
        ? `Bạn còn ${unanswered} câu chưa trả lời. Các câu này sẽ được tính là sai.`
        : "Bạn đã trả lời tất cả câu hỏi và có thể xem kết quả.",
      confirmLabel: "Nộp bài",
      action: finishSession
    });
  }

  function finishSession() {
    if (!session) return;
    clearInterval(timerId);
    closeDialog();

    const elapsed = elapsedSeconds();
    const details = session.questions.map((question) => {
      const selected = session.answers[question.id];
      return {
        question,
        selected,
        correct: selected === question.answer,
        flagged: session.flagged.has(question.id)
      };
    });
    const correctCount = details.filter((item) => item.correct).length;
    const percent = Math.round((correctCount / details.length) * 100);
    const wrongIds = details.filter((item) => !item.correct).map((item) => item.question.id);
    const currentMistakes = new Set(progress.mistakeIds);

    details.forEach((item) => {
      if (item.correct) currentMistakes.delete(item.question.id);
      else currentMistakes.add(item.question.id);
    });

    progress.attempts += 1;
    progress.bestScore = Math.max(progress.bestScore, percent);
    progress.mistakeIds = [...currentMistakes];
    saveProgress();

    resultSnapshot = { details, correctCount, percent, elapsed, wrongIds };
    session = null;
    elements.sessionView.hidden = true;
    elements.resultView.hidden = false;
    renderResults();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderResults() {
    const { details, correctCount, percent, elapsed, wrongIds } = resultSnapshot;
    elements.resultHeadline.textContent = percent >= 85
      ? "Nền tảng Part 5 rất tốt"
      : percent >= 65
        ? "Bạn đang đi đúng hướng"
        : "Mỗi lỗi sai là một chủ điểm cần ôn";
    elements.resultSummary.textContent = `Bạn trả lời đúng ${correctCount} trên ${details.length} câu.`;
    elements.resultPercent.textContent = `${percent}%`;
    elements.scoreRing.style.setProperty("--score", `${percent * 3.6}deg`);
    elements.correctResult.textContent = String(correctCount);
    elements.incorrectResult.textContent = String(details.length - correctCount);
    elements.timeResult.textContent = formatTime(elapsed);
    elements.retryMistakesBtn.disabled = wrongIds.length === 0;
    renderTopicResults(details);
    renderReviewList("all");
    refreshIcons();
  }

  function renderTopicResults(details) {
    const topicMap = new Map();
    details.forEach((item) => {
      const value = topicMap.get(item.question.topic) || { total: 0, correct: 0 };
      value.total += 1;
      if (item.correct) value.correct += 1;
      topicMap.set(item.question.topic, value);
    });

    const sortedTopics = [...topicMap.entries()].sort((a, b) => {
      const rateA = a[1].correct / a[1].total;
      const rateB = b[1].correct / b[1].total;
      return rateA - rateB;
    });

    elements.topicResults.replaceChildren();
    sortedTopics.forEach(([topic, value]) => {
      const percent = Math.round((value.correct / value.total) * 100);
      const row = document.createElement("div");
      row.className = "topic-result";
      row.innerHTML = `<span></span><div class="topic-result__track"><span></span></div><strong>${percent}%</strong>`;
      row.firstElementChild.textContent = topic;
      row.querySelector(".topic-result__track span").style.width = `${percent}%`;
      elements.topicResults.appendChild(row);
    });
  }

  function renderReviewList(filter) {
    elements.reviewList.replaceChildren();
    const filtered = resultSnapshot.details.filter((item) => {
      if (filter === "incorrect") return !item.correct;
      if (filter === "flagged") return item.flagged;
      return true;
    });

    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Không có câu nào phù hợp với bộ lọc này.";
      elements.reviewList.appendChild(empty);
      return;
    }

    filtered.forEach((item) => {
      const originalIndex = resultSnapshot.details.indexOf(item);
      const article = document.createElement("article");
      article.className = `review-item ${item.correct ? "" : "is-incorrect"}`;
      const selectedText = item.selected === undefined
        ? "Chưa trả lời"
        : `${letters[item.selected]}. ${item.question.options[item.selected]}`;
      article.innerHTML = `
        <div class="review-item__top">
          <strong>Câu ${originalIndex + 1}</strong>
          <span>${item.question.topic}</span>
          <span>${item.correct ? "Đúng" : "Sai"}</span>
        </div>
        <h3></h3>
        <p class="review-selected"></p>
        <p class="review-correct"></p>
        <p class="review-explanation"></p>
      `;
      article.querySelector("h3").textContent = item.question.sentence;
      article.querySelector(".review-selected").textContent = `Bạn chọn: ${selectedText}`;
      article.querySelector(".review-correct").textContent =
        `Đáp án đúng: ${letters[item.question.answer]}. ${item.question.options[item.question.answer]}`;
      article.querySelector(".review-explanation").textContent = item.question.explanation;
      elements.reviewList.appendChild(article);
    });
  }

  function returnToSetup() {
    clearInterval(timerId);
    session = null;
    resultSnapshot = null;
    elements.sessionView.hidden = true;
    elements.resultView.hidden = true;
    elements.setupView.hidden = false;
    elements.answerReview.hidden = true;
    renderOverview();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function requestExit() {
    openDialog({
      title: "Thoát phiên học?",
      message: "Các câu đã trả lời trong phiên này sẽ không được lưu.",
      confirmLabel: "Thoát phiên",
      action: returnToSetup
    });
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents() {
    elements.startExamBtn.addEventListener("click", () => startSession(buildQuestionSet()));
    elements.reviewMistakesBtn.addEventListener("click", () => {
      const set = buildQuestionSet({ mistakeOnly: true });
      startSession(set, { mode: "practice" });
    });
    elements.previousQuestionBtn.addEventListener("click", () => moveQuestion(-1));
    elements.nextQuestionBtn.addEventListener("click", () => moveQuestion(1));
    elements.flagQuestionBtn.addEventListener("click", toggleFlag);
    elements.submitExamBtn.addEventListener("click", requestSubmit);
    elements.exitSessionBtn.addEventListener("click", requestExit);
    elements.toggleMapBtn.addEventListener("click", () => {
      elements.questionMapPanel.classList.toggle("is-collapsed");
      const collapsed = elements.questionMapPanel.classList.contains("is-collapsed");
      elements.toggleMapBtn.setAttribute("aria-label", collapsed ? "Mở danh sách câu" : "Thu gọn danh sách câu");
      elements.toggleMapBtn.innerHTML = `<i data-lucide="${collapsed ? "panel-right-open" : "panel-right-close"}"></i>`;
      refreshIcons();
    });
    elements.reviewResultBtn.addEventListener("click", () => {
      elements.answerReview.hidden = false;
      elements.answerReview.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    elements.retryMistakesBtn.addEventListener("click", () => {
      const wrongSet = resultSnapshot.details.filter((item) => !item.correct).map((item) => item.question);
      startSession(shuffle(wrongSet), { mode: "practice" });
    });
    elements.newSessionBtn.addEventListener("click", returnToSetup);
    elements.reviewFilter.addEventListener("change", () => renderReviewList(elements.reviewFilter.value));
    elements.topicFilter.addEventListener("change", updateStartAvailability);
    elements.questionCount.addEventListener("change", updateStartAvailability);
    elements.cancelDialogBtn.addEventListener("click", closeDialog);
    elements.confirmDialogBtn.addEventListener("click", () => {
      const action = dialogAction;
      closeDialog();
      if (action) action();
    });
    elements.confirmDialog.querySelectorAll("[data-close-dialog]").forEach((element) => {
      element.addEventListener("click", closeDialog);
    });

    document.addEventListener("keydown", (event) => {
      if (!elements.confirmDialog.hidden) {
        if (event.key === "Escape") closeDialog();
        return;
      }
      if (!session || elements.sessionView.hidden) return;
      if (/^[1-4]$/.test(event.key)) selectAnswer(Number(event.key) - 1);
      else if (event.key.toLowerCase() === "f") toggleFlag();
      else if (event.key === "ArrowLeft") moveQuestion(-1);
      else if (event.key === "ArrowRight") moveQuestion(1);
    });
  }

  async function init() {
    const user = await requireAuth();
    if (!user) return;
    elements.userEmail.textContent = user.email || "";
    populateTopics();
    renderOverview();
    bindEvents();
    refreshIcons();
  }

  init();
})();
