(() => {
  const CATALOG_URL = "../assets/data/exams/catalog.json";
  const DATA_ROOT = "../assets/data/exams/";
  const STORAGE_KEY = "vocanest_exam_progress_v2";
  const LEGACY_STORAGE_KEY = "vocanest_part5_progress_v1";
  const letters = ["A", "B", "C", "D"];
  const difficultyLabels = {
    basic: "Cơ bản",
    intermediate: "Trung cấp",
    advanced: "Nâng cao"
  };

  const elements = {
    libraryView: document.getElementById("libraryView"),
    setupView: document.getElementById("setupView"),
    sessionView: document.getElementById("sessionView"),
    resultView: document.getElementById("resultView"),
    userEmail: document.getElementById("userEmail"),
    catalogTestCount: document.getElementById("catalogTestCount"),
    catalogQuestionCount: document.getElementById("catalogQuestionCount"),
    catalogAttemptCount: document.getElementById("catalogAttemptCount"),
    catalogSummary: document.getElementById("catalogSummary"),
    difficultyFilter: document.getElementById("difficultyFilter"),
    testCatalog: document.getElementById("testCatalog"),
    catalogError: document.getElementById("catalogError"),
    retryCatalogBtn: document.getElementById("retryCatalogBtn"),
    backToLibraryBtn: document.getElementById("backToLibraryBtn"),
    selectedTestEyebrow: document.getElementById("selectedTestEyebrow"),
    selectedTestTitle: document.getElementById("selectedTestTitle"),
    selectedTestDescription: document.getElementById("selectedTestDescription"),
    selectedTestTags: document.getElementById("selectedTestTags"),
    selectedQuestionCount: document.getElementById("selectedQuestionCount"),
    selectedDuration: document.getElementById("selectedDuration"),
    questionCount: document.getElementById("questionCount"),
    topicFilter: document.getElementById("topicFilter"),
    startExamBtn: document.getElementById("startExamBtn"),
    reviewMistakesBtn: document.getElementById("reviewMistakesBtn"),
    draftResumePanel: document.getElementById("draftResumePanel"),
    totalAttempts: document.getElementById("totalAttempts"),
    bestScore: document.getElementById("bestScore"),
    mistakeCount: document.getElementById("mistakeCount"),
    syncStatus: document.getElementById("syncStatus"),
    attemptHistoryList: document.getElementById("attemptHistoryList"),
    sessionModeLabel: document.getElementById("sessionModeLabel"),
    sessionTestTitle: document.getElementById("sessionTestTitle"),
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

  let catalog = [];
  let currentTest = null;
  let questions = [];
  let progress = loadProgress();
  let session = null;
  let timerId = null;
  let draftSyncTimer = null;
  let lastDraftSyncAt = 0;
  let dialogAction = null;
  let resultSnapshot = null;

  function loadProgress() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      saved = null;
    }

    const normalized = saved && typeof saved.tests === "object"
      ? {
        tests: saved.tests,
        drafts: saved.drafts && typeof saved.drafts === "object" ? saved.drafts : {},
        history: Array.isArray(saved.history) ? saved.history : []
      }
      : { tests: {}, drafts: {}, history: [] };

    if (!normalized.tests["part5-test-001"]) {
      try {
        const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
        if (legacy) {
          normalized.tests["part5-test-001"] = {
            attempts: Number(legacy.attempts) || 0,
            bestScore: Number(legacy.bestScore) || 0,
            mistakeIds: Array.isArray(legacy.mistakeIds)
              ? legacy.mistakeIds.map((id) => {
                const number = String(id).match(/(\d+)$/)?.[1];
                return number ? `part5-test-001-q${number.padStart(3, "0")}` : id;
              })
              : [],
            lastAttemptAt: null
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        }
      } catch {
        // Ignore malformed legacy progress.
      }
    }

    return normalized;
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function attemptId() {
    return `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function getTestProgress(testId) {
    const saved = progress.tests[testId];
    return {
      attempts: Number(saved?.attempts) || 0,
      bestScore: Number(saved?.bestScore) || 0,
      mistakeIds: Array.isArray(saved?.mistakeIds) ? saved.mistakeIds : [],
      lastAttemptAt: saved?.lastAttemptAt || null
    };
  }

  function setTestProgress(testId, value) {
    progress.tests[testId] = value;
    saveProgress();
    renderOverview();
    renderCatalog();
  }

  function getAttemptHistory(testId = currentTest?.id) {
    if (!testId) return [];
    return (progress.history || [])
      .filter((attempt) => attempt.testId === testId)
      .sort((a, b) => Date.parse(b.submittedAt || "") - Date.parse(a.submittedAt || ""));
  }

  function addAttemptHistory(attempt) {
    progress.history = [attempt, ...(progress.history || [])].slice(0, 50);
    saveProgress();
  }

  function setSyncStatus(status, message) {
    if (!elements.syncStatus) return;
    const icons = {
      synced: "cloud-check",
      local: "cloud-off",
      syncing: "refresh-cw"
    };
    elements.syncStatus.className = `sync-status is-${status}`;
    elements.syncStatus.innerHTML = `<i data-lucide="${icons[status] || "cloud"}"></i><span></span>`;
    elements.syncStatus.lastElementChild.textContent = message;
    refreshIcons();
  }

  function normalizeAttempt(raw) {
    if (!raw || !raw.id || !raw.testId) return null;
    return {
      schemaVersion: 1,
      id: String(raw.id),
      testId: String(raw.testId),
      testTitle: String(raw.testTitle || ""),
      mode: raw.mode === "simulation" ? "simulation" : "practice",
      percent: Number(raw.percent) || 0,
      correctCount: Number(raw.correctCount) || 0,
      totalQuestions: Number(raw.totalQuestions) || 0,
      elapsedSeconds: Number(raw.elapsedSeconds) || 0,
      questionIds: Array.isArray(raw.questionIds) ? raw.questionIds : [],
      answers: raw.answers && typeof raw.answers === "object" ? raw.answers : {},
      flaggedIds: Array.isArray(raw.flaggedIds) ? raw.flaggedIds : [],
      wrongIds: Array.isArray(raw.wrongIds) ? raw.wrongIds : [],
      submittedAt: raw.submittedAt || new Date().toISOString()
    };
  }

  function rebuildProgressFromHistory() {
    const grouped = new Map();
    (progress.history || []).forEach((raw) => {
      const attempt = normalizeAttempt(raw);
      if (!attempt) return;
      if (!grouped.has(attempt.testId)) grouped.set(attempt.testId, []);
      grouped.get(attempt.testId).push(attempt);
    });

    grouped.forEach((attempts, testId) => {
      const sorted = attempts.sort((a, b) => Date.parse(a.submittedAt) - Date.parse(b.submittedAt));
      const mistakes = new Set();
      let bestScore = 0;
      let lastAttemptAt = null;

      sorted.forEach((attempt) => {
        bestScore = Math.max(bestScore, attempt.percent);
        lastAttemptAt = attempt.submittedAt;
        const wrongSet = new Set(attempt.wrongIds);
        attempt.questionIds.forEach((questionId) => {
          if (wrongSet.has(questionId)) mistakes.add(questionId);
          else mistakes.delete(questionId);
        });
      });

      progress.tests[testId] = {
        attempts: sorted.length,
        bestScore,
        mistakeIds: [...mistakes],
        lastAttemptAt
      };
    });
  }

  function mergeAttemptHistory(remoteAttempts) {
    const merged = new Map();
    (progress.history || []).forEach((attempt) => {
      const normalized = normalizeAttempt(attempt);
      if (normalized) merged.set(normalized.id, normalized);
    });
    (remoteAttempts || []).forEach((attempt) => {
      const normalized = normalizeAttempt(attempt);
      if (normalized) merged.set(normalized.id, normalized);
    });
    progress.history = [...merged.values()]
      .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))
      .slice(0, 100);
    rebuildProgressFromHistory();
    saveProgress();
  }

  async function loadRemoteHistory() {
    setSyncStatus("syncing", "Đang đồng bộ lịch sử với Google Drive...");
    try {
      const response = await window.vocaApi.authPost("listExamAttempts");
      mergeAttemptHistory(response.data || []);
      setSyncStatus("synced", "Lịch sử làm bài đã đồng bộ với Google Drive.");
    } catch (error) {
      setSyncStatus("local", "Chưa đồng bộ được lịch sử. Kết quả tạm lưu trên thiết bị này.");
      console.warn("Could not sync remote exam history", error);
    }
  }

  function syncAttempt(attempt) {
    setSyncStatus("syncing", "Đang lưu lịch sử làm bài lên Google Drive...");
    window.vocaApi.authPost("saveExamAttempt", { attempt })
      .then(() => setSyncStatus("synced", "Lịch sử làm bài đã đồng bộ với Google Drive."))
      .catch((error) => {
        setSyncStatus("local", "Chưa đồng bộ được lịch sử. Kết quả tạm lưu trên thiết bị này.");
        console.warn("Could not save exam attempt remotely", error);
      });
  }

  function normalizeDraft(raw) {
    if (!raw || !raw.testId || !Array.isArray(raw.questionIds) || !raw.questionIds.length) return null;
    return {
      schemaVersion: 1,
      testId: String(raw.testId),
      mode: raw.mode === "simulation" ? "simulation" : "practice",
      questionIds: raw.questionIds,
      index: Number.isInteger(raw.index) ? raw.index : 0,
      answers: raw.answers && typeof raw.answers === "object" ? raw.answers : {},
      flaggedIds: Array.isArray(raw.flaggedIds) ? raw.flaggedIds : [],
      elapsedSeconds: Number(raw.elapsedSeconds) || 0,
      duration: Number(raw.duration) || 0,
      remaining: Number.isFinite(raw.remaining) ? Number(raw.remaining) : null,
      updatedAt: raw.updatedAt || new Date().toISOString()
    };
  }

  function mergeDrafts(remoteDrafts) {
    (remoteDrafts || []).forEach((raw) => {
      const remote = normalizeDraft(raw);
      if (!remote) return;
      const local = getDraft(remote.testId);
      const remoteTime = Date.parse(remote.updatedAt || "");
      const localTime = Date.parse(local?.updatedAt || "");
      if (!local || remoteTime >= localTime) {
        progress.drafts[remote.testId] = remote;
      }
    });
    saveProgress();
  }

  async function loadRemoteDrafts() {
    setSyncStatus("syncing", "Đang đồng bộ draft và lịch sử với Google Drive...");
    try {
      const response = await window.vocaApi.authPost("listExamDrafts");
      mergeDrafts(response.data || []);
      setSyncStatus("synced", "Lịch sử và draft đã đồng bộ với Google Drive.");
    } catch (error) {
      setSyncStatus("local", "Chưa đồng bộ được draft. Draft tạm lưu trên thiết bị này.");
      console.warn("Could not sync remote exam drafts", error);
    }
  }

  function syncDraft(draft) {
    const normalized = normalizeDraft(draft);
    if (!normalized) return;
    window.vocaApi.authPost("saveExamDraft", { draft: normalized })
      .then(() => setSyncStatus("synced", "Draft phiên học đã đồng bộ với Google Drive."))
      .catch((error) => {
        setSyncStatus("local", "Chưa đồng bộ được draft. Draft tạm lưu trên thiết bị này.");
        console.warn("Could not save exam draft remotely", error);
      });
  }

  function scheduleDraftSync(draft) {
    const now = Date.now();
    clearTimeout(draftSyncTimer);
    if (now - lastDraftSyncAt > 10000) {
      lastDraftSyncAt = now;
      setSyncStatus("syncing", "Đang lưu draft lên Google Drive...");
      syncDraft(draft);
      return;
    }

    draftSyncTimer = window.setTimeout(() => {
      lastDraftSyncAt = Date.now();
      setSyncStatus("syncing", "Đang lưu draft lên Google Drive...");
      syncDraft(draft);
    }, 2500);
  }

  function deleteRemoteDraft(testId) {
    clearTimeout(draftSyncTimer);
    window.vocaApi.authPost("deleteExamDraft", { testId })
      .catch((error) => {
        setSyncStatus("local", "Chưa xóa được draft trên Drive. Bạn có thể thử lại sau.");
        console.warn("Could not delete exam draft remotely", error);
      });
  }

  function getDraft(testId) {
    const draft = progress.drafts?.[testId];
    if (!draft || !Array.isArray(draft.questionIds) || !draft.questionIds.length) return null;
    return draft;
  }

  function setDraft(testId, draft) {
    progress.drafts[testId] = draft;
    saveProgress();
  }

  function clearDraft(testId, { remote = true } = {}) {
    if (!progress.drafts?.[testId]) return;
    delete progress.drafts[testId];
    saveProgress();
    if (remote) deleteRemoteDraft(testId);
  }

  function totalAttempts() {
    return Object.values(progress.tests).reduce((sum, item) => sum + (Number(item?.attempts) || 0), 0);
  }

  function draftSummary(draft) {
    const answered = Object.keys(draft.answers || {}).length;
    const total = draft.questionIds?.length || 0;
    const mode = draft.mode === "simulation" ? "mô phỏng" : "luyện tập";
    return `${answered}/${total} câu · ${mode}`;
  }

  function formatRelativeTime(value) {
    const timestamp = Date.parse(value || "");
    if (!Number.isFinite(timestamp)) return "vừa xong";
    const diffSeconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
    if (diffSeconds < 60) return "vừa xong";
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${Math.round(diffHours / 24)} ngày trước`;
  }

  function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Không rõ thời gian";
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async function fetchExamCatalog() {
    try {
      const response = await window.vocaApi.authPost("getExamCatalog");
      const tests = validateCatalog(response.data || { tests: [] });
      if (tests.length) return tests.map((test) => ({ ...test, source: "remote" }));
      throw new Error("Remote exam catalog is empty");
    } catch (error) {
      console.warn("Falling back to local exam catalog", error);
      const data = await fetchJson(CATALOG_URL);
      return validateCatalog(data).map((test) => ({ ...test, source: "local" }));
    }
  }

  async function fetchExamTest(entry) {
    if (entry.source !== "local") {
      try {
        const response = await window.vocaApi.authPost("getExamTest", { testId: entry.id });
        return validateTest(response.data, entry.id);
      } catch (error) {
        console.warn("Falling back to local exam test", error);
      }
    }

    if (!entry.dataFile) {
      throw new Error("Local exam data file is missing");
    }
    return validateTest(await fetchJson(`${DATA_ROOT}${entry.dataFile}`), entry.id);
  }

  function validateCatalog(data) {
    if (!data || !Array.isArray(data.tests)) throw new Error("Catalog không hợp lệ");
    return data.tests.filter((test) => test.published !== false && test.part === 5 && test.id);
  }

  function validateTest(data, expectedId) {
    if (!data || data.id !== expectedId || data.part !== 5 || !Array.isArray(data.questions) || !data.questions.length) {
      throw new Error("Dữ liệu đề không hợp lệ");
    }

    const seenIds = new Set();
    data.questions.forEach((question) => {
      const valid = question.id
        && !seenIds.has(question.id)
        && typeof question.sentence === "string"
        && Array.isArray(question.options)
        && question.options.length === 4
        && Number.isInteger(question.answer)
        && question.answer >= 0
        && question.answer <= 3;
      if (!valid) throw new Error(`Câu hỏi không hợp lệ trong đề ${expectedId}`);
      seenIds.add(question.id);
    });
    return data;
  }

  function createIcon(name) {
    const icon = document.createElement("i");
    icon.dataset.lucide = name;
    icon.setAttribute("aria-hidden", "true");
    return icon;
  }

  function createBadge(text, className = "") {
    const badge = document.createElement("span");
    badge.className = `test-badge ${className}`.trim();
    badge.textContent = text;
    return badge;
  }

  function renderCatalog() {
    if (!catalog.length) return;
    const difficulty = elements.difficultyFilter.value;
    const visible = difficulty === "all"
      ? catalog
      : catalog.filter((test) => test.difficulty === difficulty);

    elements.catalogTestCount.textContent = String(catalog.length);
    elements.catalogQuestionCount.textContent = String(catalog.reduce((sum, test) => sum + test.questionCount, 0));
    elements.catalogAttemptCount.textContent = String(totalAttempts());
    elements.catalogSummary.textContent = `${visible.length} đề phù hợp · Nội dung tự biên soạn`;
    elements.testCatalog.replaceChildren();

    visible.forEach((test) => {
      const testProgress = getTestProgress(test.id);
      const draft = getDraft(test.id);
      const article = document.createElement("article");
      article.className = "test-card";
      article.dataset.testId = test.id;

      const top = document.createElement("div");
      top.className = "test-card__top";
      const part = createBadge(`Part ${test.part}`, "test-badge--part");
      const difficultyBadge = createBadge(difficultyLabels[test.difficulty] || test.difficulty);
      const status = createBadge(
        draft ? "Đang làm dở" : testProgress.attempts ? `Tốt nhất ${testProgress.bestScore}%` : "Chưa làm",
        draft ? "test-badge--draft" : testProgress.attempts ? "test-badge--complete" : ""
      );
      top.append(part, difficultyBadge, status);

      const title = document.createElement("h3");
      title.textContent = test.title;
      const description = document.createElement("p");
      description.textContent = test.description;

      const tags = document.createElement("div");
      tags.className = "test-card__tags";
      (test.tags || []).forEach((tag) => tags.appendChild(createBadge(tag)));

      const metrics = document.createElement("div");
      metrics.className = "test-card__metrics";
      metrics.innerHTML = `
        <span><i data-lucide="list-checks"></i>${test.questionCount} câu</span>
        <span><i data-lucide="clock-3"></i>${test.durationMinutes} phút</span>
        <span><i data-lucide="history"></i>${testProgress.attempts} lượt</span>
      `;

      const actions = document.createElement("div");
      actions.className = "test-card__actions";
      if (draft) {
        const resumeAction = document.createElement("button");
        resumeAction.type = "button";
        resumeAction.className = "btn primary test-card__action";
        resumeAction.append(createIcon("play"));
        resumeAction.append(document.createTextNode(" Tiếp tục"));
        resumeAction.addEventListener("click", () => openTest(test, resumeAction, { resume: true }));

        const restartAction = document.createElement("button");
        restartAction.type = "button";
        restartAction.className = "btn test-card__action";
        restartAction.append(createIcon("rotate-ccw"));
        restartAction.append(document.createTextNode(" Làm lại"));
        restartAction.addEventListener("click", () => openTest(test, restartAction));
        actions.append(resumeAction, restartAction);
      } else {
        const action = document.createElement("button");
        action.type = "button";
        action.className = "btn primary block test-card__action";
        action.append(createIcon(testProgress.attempts ? "rotate-ccw" : "play"));
        action.append(document.createTextNode(testProgress.attempts ? " Luyện lại đề" : " Bắt đầu đề"));
        action.addEventListener("click", () => openTest(test, action));
        actions.appendChild(action);
      }

      article.append(top, title, description, tags, metrics, actions);
      elements.testCatalog.appendChild(article);
    });

    if (!visible.length) {
      const empty = document.createElement("div");
      empty.className = "catalog-empty";
      empty.append(createIcon("search-x"));
      const text = document.createElement("p");
      text.textContent = "Chưa có đề ở cấp độ này.";
      empty.appendChild(text);
      elements.testCatalog.appendChild(empty);
    }
    refreshIcons();
  }

  async function loadCatalog() {
    elements.catalogError.hidden = true;
    elements.testCatalog.classList.add("is-loading");
    elements.testCatalog.innerHTML = `
      <div class="test-skeleton"></div>
      <div class="test-skeleton"></div>
    `;
    try {
      catalog = await fetchExamCatalog();
      renderCatalog();
      const requestedTest = new URLSearchParams(window.location.search).get("test");
      const entry = requestedTest ? catalog.find((test) => test.id === requestedTest) : null;
      if (entry) await openTest(entry);
    } catch (error) {
      console.error(error);
      elements.testCatalog.replaceChildren();
      elements.catalogError.hidden = false;
      elements.catalogSummary.textContent = "Không thể đọc catalog.json";
      refreshIcons();
    } finally {
      elements.testCatalog.classList.remove("is-loading");
    }
  }

  async function openTest(entry, button, options = {}) {
    const originalContent = button?.innerHTML;
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i data-lucide="loader-circle"></i> Đang tải đề';
      refreshIcons();
    }

    try {
      const data = await fetchExamTest(entry);
      currentTest = { ...entry, ...data, tags: entry.tags || [] };
      questions = data.questions;
      prepareSetup();
      const url = new URL(window.location.href);
      url.searchParams.set("test", entry.id);
      window.history.replaceState({}, "", url);
      if (options.resume) {
        resumeDraft();
      } else {
        showView("setup");
      }
    } catch (error) {
      console.error(error);
      openDialog({
        title: "Không mở được đề",
        message: "File dữ liệu của đề bị thiếu hoặc không đúng định dạng.",
        confirmLabel: "Đóng",
        action: closeDialog,
        cancelHidden: true
      });
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = originalContent;
        refreshIcons();
      }
    }
  }

  function prepareSetup() {
    elements.selectedTestEyebrow.textContent =
      `TOEIC Reading · Part ${currentTest.part} · ${difficultyLabels[currentTest.difficulty] || currentTest.difficulty}`;
    elements.selectedTestTitle.textContent = currentTest.title;
    elements.selectedTestDescription.textContent = currentTest.description;
    elements.selectedQuestionCount.textContent = String(questions.length);
    elements.selectedDuration.textContent = String(currentTest.durationMinutes);
    elements.selectedTestTags.replaceChildren();
    currentTest.tags.forEach((tag) => elements.selectedTestTags.appendChild(createBadge(tag)));
    populateQuestionCounts();
    populateTopics();
    renderOverview();
    renderDraftPanel();
    refreshIcons();
  }

  function renderDraftPanel() {
    const draft = currentTest ? getDraft(currentTest.id) : null;
    elements.draftResumePanel.hidden = !draft;
    elements.draftResumePanel.replaceChildren();
    if (!draft) return;

    const top = document.createElement("div");
    top.className = "draft-resume-panel__top";
    top.append(createIcon("bookmark-check"));
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = "Bạn có bài đang làm dở";
    const detail = document.createElement("span");
    detail.textContent = `${draftSummary(draft)} · lưu ${formatRelativeTime(draft.updatedAt)}`;
    copy.append(title, detail);
    top.appendChild(copy);

    const actions = document.createElement("div");
    actions.className = "draft-resume-panel__actions";
    const resume = document.createElement("button");
    resume.type = "button";
    resume.className = "btn primary";
    resume.append(createIcon("play"));
    resume.append(document.createTextNode(" Tiếp tục"));
    resume.addEventListener("click", resumeDraft);

    const discard = document.createElement("button");
    discard.type = "button";
    discard.className = "btn";
    discard.append(createIcon("trash-2"));
    discard.append(document.createTextNode(" Xóa draft"));
    discard.addEventListener("click", () => {
      clearDraft(currentTest.id);
      renderDraftPanel();
      renderCatalog();
    });
    actions.append(resume, discard);
    elements.draftResumePanel.append(top, actions);
  }

  function populateQuestionCounts() {
    const total = questions.length;
    const counts = [10, 20, 30].filter((count) => count <= total);
    if (!counts.includes(total)) counts.push(total);
    elements.questionCount.replaceChildren();
    counts.forEach((count) => {
      const option = document.createElement("option");
      option.value = String(count);
      option.textContent = count === total ? `${count} câu · Toàn bộ đề` : `${count} câu · Luyện nhanh`;
      if (count === total) option.selected = true;
      elements.questionCount.appendChild(option);
    });
  }

  function populateTopics() {
    elements.topicFilter.innerHTML = '<option value="all">Tất cả chủ điểm</option>';
    const topics = [...new Set(questions.map((question) => question.topic))].sort((a, b) => a.localeCompare(b, "vi"));
    topics.forEach((topic) => {
      const option = document.createElement("option");
      option.value = topic;
      option.textContent = topic;
      elements.topicFilter.appendChild(option);
    });
    updateStartAvailability();
  }

  function renderOverview() {
    if (!currentTest) return;
    const testProgress = getTestProgress(currentTest.id);
    elements.totalAttempts.textContent = String(testProgress.attempts);
    elements.bestScore.textContent = testProgress.attempts ? `${testProgress.bestScore}%` : "--";
    elements.mistakeCount.textContent = String(testProgress.mistakeIds.length);
    elements.reviewMistakesBtn.disabled = testProgress.mistakeIds.length === 0;
    renderAttemptHistory();
  }

  function renderAttemptHistory() {
    if (!elements.attemptHistoryList || !currentTest) return;
    const attempts = getAttemptHistory(currentTest.id).slice(0, 8);
    elements.attemptHistoryList.replaceChildren();

    if (!attempts.length) {
      const empty = document.createElement("div");
      empty.className = "attempt-history__empty";
      empty.append(createIcon("clipboard-list"));
      const copy = document.createElement("p");
      copy.textContent = "Chưa có lịch sử cho đề này. Hoàn thành một phiên học để bắt đầu theo dõi tiến bộ.";
      empty.appendChild(copy);
      elements.attemptHistoryList.appendChild(empty);
      refreshIcons();
      return;
    }

    attempts.forEach((attempt) => {
      const item = document.createElement("article");
      item.className = "attempt-item";

      const score = document.createElement("div");
      score.className = "attempt-item__score";
      score.innerHTML = `<strong>${attempt.percent}%</strong><span>${attempt.correctCount}/${attempt.totalQuestions}</span>`;

      const body = document.createElement("div");
      body.className = "attempt-item__body";
      const title = document.createElement("strong");
      title.textContent = attempt.mode === "simulation" ? "Mô phỏng TOEIC" : "Luyện tập";
      const meta = document.createElement("span");
      meta.textContent = `${formatDateTime(attempt.submittedAt)} · ${formatTime(attempt.elapsedSeconds)} · ${attempt.wrongIds.length} câu sai`;
      body.append(title, meta);

      const actions = document.createElement("div");
      actions.className = "attempt-item__actions";
      const review = document.createElement("button");
      review.type = "button";
      review.className = "icon-command";
      review.title = "Xem lại kết quả";
      review.setAttribute("aria-label", "Xem lại kết quả");
      review.append(createIcon("eye"));
      review.addEventListener("click", () => openAttemptReview(attempt));
      actions.appendChild(review);

      if (attempt.wrongIds.length) {
        const retry = document.createElement("button");
        retry.type = "button";
        retry.className = "icon-command";
        retry.title = "Ôn câu sai của lần này";
        retry.setAttribute("aria-label", "Ôn câu sai của lần này");
        retry.append(createIcon("rotate-ccw"));
        retry.addEventListener("click", () => startSession(questions.filter((question) => attempt.wrongIds.includes(question.id)), {
          mode: "practice"
        }));
        actions.appendChild(retry);
      }

      item.append(score, body, actions);
      elements.attemptHistoryList.appendChild(item);
    });
    refreshIcons();
  }

  function updateStartAvailability() {
    const available = elements.topicFilter.value === "all"
      ? questions.length
      : questions.filter((question) => question.topic === elements.topicFilter.value).length;
    const requested = Number(elements.questionCount.value);
    const sessionSize = Math.min(requested, available);
    elements.startExamBtn.disabled = sessionSize === 0;
    elements.startExamBtn.lastChild.textContent = sessionSize === requested
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
      const mistakeSet = new Set(getTestProgress(currentTest.id).mistakeIds);
      pool = questions.filter((question) => mistakeSet.has(question.id));
    } else if (elements.topicFilter.value !== "all") {
      pool = questions.filter((question) => question.topic === elements.topicFilter.value);
    }
    return shuffle(pool).slice(0, Math.min(Number(elements.questionCount.value), pool.length));
  }

  function startSession(questionSet, options = {}) {
    if (!questionSet.length) return;
    const mode = options.mode || selectedMode();
    const fullDuration = Math.max(1, Number(currentTest.durationMinutes)) * 60;
    const proportionalDuration = Math.round(fullDuration * (questionSet.length / questions.length));
    const duration = mode === "simulation" ? Math.max(120, proportionalDuration) : 0;

    session = {
      testId: currentTest.id,
      testTitle: currentTest.title,
      questions: questionSet,
      mode,
      index: Number.isInteger(options.index) ? Math.min(Math.max(options.index, 0), questionSet.length - 1) : 0,
      answers: options.answers || {},
      flagged: new Set(options.flaggedIds || []),
      startedAt: Date.now() - ((Number(options.elapsedSeconds) || 0) * 1000),
      duration,
      remaining: Number.isFinite(options.remaining) ? Math.max(0, Math.min(options.remaining, duration || options.remaining)) : duration
    };

    if (!options.fromDraft) {
      clearDraft(currentTest.id, { remote: false });
    }
    resultSnapshot = null;
    elements.answerReview.hidden = true;
    elements.sessionModeLabel.textContent = mode === "simulation" ? "Mô phỏng có thời gian" : "Luyện tập có giải thích";
    elements.sessionTestTitle.textContent = currentTest.title;
    elements.sessionQuestionCount.textContent = String(questionSet.length);
    elements.questionMapPanel.classList.remove("is-collapsed");
    showView("session");
    createQuestionMap();
    renderQuestion();
    startTimer();
    saveSessionDraft();
  }

  function saveSessionDraft() {
    if (!session) return;
    const draft = {
      schemaVersion: 1,
      testId: session.testId,
      mode: session.mode,
      questionIds: session.questions.map((question) => question.id),
      index: session.index,
      answers: session.answers,
      flaggedIds: [...session.flagged],
      elapsedSeconds: elapsedSeconds(),
      duration: session.duration,
      remaining: session.mode === "simulation" ? session.remaining : null,
      updatedAt: new Date().toISOString()
    };
    setDraft(session.testId, draft);
    scheduleDraftSync(draft);
  }

  function resumeDraft() {
    if (!currentTest) return;
    const draft = getDraft(currentTest.id);
    if (!draft) return;
    const questionById = new Map(questions.map((question) => [question.id, question]));
    const questionSet = draft.questionIds.map((id) => questionById.get(id)).filter(Boolean);
    if (!questionSet.length || questionSet.length !== draft.questionIds.length) {
      clearDraft(currentTest.id);
      renderDraftPanel();
      renderCatalog();
      openDialog({
        title: "Draft đã cũ",
        message: "Đề này đã thay đổi nên phiên làm dở không còn khớp với dữ liệu hiện tại.",
        confirmLabel: "Đóng",
        action: closeDialog,
        cancelHidden: true
      });
      return;
    }
    startSession(questionSet, {
      fromDraft: true,
      mode: draft.mode,
      index: draft.index,
      answers: draft.answers || {},
      flaggedIds: draft.flaggedIds || [],
      elapsedSeconds: draft.elapsedSeconds,
      remaining: draft.remaining
    });
  }

  function startTimer() {
    clearInterval(timerId);
    updateTimer();
    timerId = window.setInterval(() => {
      if (!session) return;
      if (session.mode === "simulation") {
        session.remaining -= 1;
        saveSessionDraft();
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
    return session ? Math.max(0, Math.round((Date.now() - session.startedAt) / 1000)) : 0;
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
    saveSessionDraft();
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
    elements.answeredCount.textContent = String(Object.keys(session.answers).length);
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
      saveSessionDraft();
      renderQuestion();
    } else if (direction > 0) {
      elements.questionMapPanel.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function toggleFlag() {
    const id = session.questions[session.index].id;
    if (session.flagged.has(id)) session.flagged.delete(id);
    else session.flagged.add(id);
    saveSessionDraft();
    renderQuestion();
  }

  function openDialog({ title, message, confirmLabel, action, cancelHidden = false }) {
    elements.dialogTitle.textContent = title;
    elements.dialogMessage.textContent = message;
    elements.confirmDialogBtn.textContent = confirmLabel;
    elements.cancelDialogBtn.hidden = cancelHidden;
    dialogAction = action;
    elements.confirmDialog.hidden = false;
    elements.confirmDialogBtn.focus();
  }

  function closeDialog() {
    elements.confirmDialog.hidden = true;
    elements.cancelDialogBtn.hidden = false;
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
    const submittedAt = new Date().toISOString();
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
    const testProgress = getTestProgress(session.testId);
    const currentMistakes = new Set(testProgress.mistakeIds);

    details.forEach((item) => {
      if (item.correct) currentMistakes.delete(item.question.id);
      else currentMistakes.add(item.question.id);
    });

    setTestProgress(session.testId, {
      attempts: testProgress.attempts + 1,
      bestScore: Math.max(testProgress.bestScore, percent),
      mistakeIds: [...currentMistakes],
      lastAttemptAt: submittedAt
    });
    const attempt = {
      schemaVersion: 1,
      id: attemptId(),
      testId: session.testId,
      testTitle: session.testTitle,
      mode: session.mode,
      percent,
      correctCount,
      totalQuestions: details.length,
      elapsedSeconds: elapsed,
      questionIds: session.questions.map((question) => question.id),
      answers: { ...session.answers },
      flaggedIds: [...session.flagged],
      wrongIds,
      submittedAt
    };
    addAttemptHistory(attempt);
    syncAttempt(attempt);
    renderOverview();
    clearDraft(session.testId);
    renderCatalog();

    resultSnapshot = {
      testId: session.testId,
      testTitle: session.testTitle,
      details,
      correctCount,
      percent,
      elapsed,
      wrongIds,
      submittedAt
    };
    session = null;
    showView("result");
    renderResults();
  }

  function renderResults() {
    const { details, correctCount, percent, elapsed, wrongIds, testTitle, submittedAt, fromHistory } = resultSnapshot;
    elements.resultHeadline.textContent = percent >= 85
      ? "Nền tảng Part 5 rất tốt"
      : percent >= 65
        ? "Bạn đang đi đúng hướng"
        : "Mỗi lỗi sai là một chủ điểm cần ôn";
    elements.resultSummary.textContent = fromHistory
      ? `${testTitle}: đúng ${correctCount} trên ${details.length} câu · ${formatDateTime(submittedAt)}.`
      : `${testTitle}: đúng ${correctCount} trên ${details.length} câu.`;
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

  function openAttemptReview(attempt) {
    const questionById = new Map(questions.map((question) => [question.id, question]));
    const flaggedSet = new Set(attempt.flaggedIds || []);
    const details = (attempt.questionIds || []).map((id) => {
      const question = questionById.get(id);
      if (!question) return null;
      const selected = attempt.answers?.[id];
      return {
        question,
        selected,
        correct: selected === question.answer,
        flagged: flaggedSet.has(id)
      };
    }).filter(Boolean);

    if (!details.length) {
      openDialog({
        title: "Không xem lại được",
        message: "Đề này đã thay đổi quá nhiều nên lịch sử cũ không còn khớp với dữ liệu hiện tại.",
        confirmLabel: "Đóng",
        action: closeDialog,
        cancelHidden: true
      });
      return;
    }

    const correctCount = details.filter((item) => item.correct).length;
    const wrongIds = details.filter((item) => !item.correct).map((item) => item.question.id);
    resultSnapshot = {
      testId: attempt.testId,
      testTitle: attempt.testTitle,
      details,
      correctCount,
      percent: Math.round((correctCount / details.length) * 100),
      elapsed: Number(attempt.elapsedSeconds) || 0,
      wrongIds,
      submittedAt: attempt.submittedAt,
      fromHistory: true
    };
    elements.answerReview.hidden = true;
    showView("result");
    renderResults();
  }

  function renderTopicResults(details) {
    const topicMap = new Map();
    details.forEach((item) => {
      const value = topicMap.get(item.question.topic) || { total: 0, correct: 0 };
      value.total += 1;
      if (item.correct) value.correct += 1;
      topicMap.set(item.question.topic, value);
    });

    const sortedTopics = [...topicMap.entries()].sort((a, b) =>
      (a[1].correct / a[1].total) - (b[1].correct / b[1].total)
    );
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

  function showView(view) {
    elements.libraryView.hidden = view !== "library";
    elements.setupView.hidden = view !== "setup";
    elements.sessionView.hidden = view !== "session";
    elements.resultView.hidden = view !== "result";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function returnToSetup() {
    clearInterval(timerId);
    session = null;
    resultSnapshot = null;
    elements.answerReview.hidden = true;
    renderOverview();
    renderDraftPanel();
    showView("setup");
  }

  function returnToLibrary() {
    clearInterval(timerId);
    session = null;
    resultSnapshot = null;
    currentTest = null;
    questions = [];
    const url = new URL(window.location.href);
    url.searchParams.delete("test");
    window.history.replaceState({}, "", url);
    renderCatalog();
    showView("library");
  }

  function requestExit() {
    saveSessionDraft();
    openDialog({
      title: "Tạm dừng phiên học?",
      message: "Các câu đã trả lời và câu đã đánh dấu sẽ được lưu để bạn tiếp tục sau.",
      confirmLabel: "Tạm dừng",
      action: returnToSetup
    });
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents() {
    elements.difficultyFilter.addEventListener("change", renderCatalog);
    elements.retryCatalogBtn.addEventListener("click", loadCatalog);
    elements.backToLibraryBtn.addEventListener("click", returnToLibrary);
    elements.startExamBtn.addEventListener("click", () => startSession(buildQuestionSet()));
    elements.reviewMistakesBtn.addEventListener("click", () => {
      startSession(buildQuestionSet({ mistakeOnly: true }), { mode: "practice" });
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
    bindEvents();
    refreshIcons();
    await loadRemoteHistory();
    await loadRemoteDrafts();
    await loadCatalog();
  }

  init();
})();
