(() => {
  const MAX_FILE_SIZE = 2 * 1024 * 1024;
  const requiredQuestionColumns = [
    "question_id", "topic", "grammar_id", "difficulty", "sentence",
    "option_a", "option_b", "option_c", "option_d", "answer",
    "explanation", "tip"
  ];
  const difficultyValues = new Set(["basic", "intermediate", "advanced"]);
  const difficultyLabels = {
    basic: "Cơ bản",
    intermediate: "Trung cấp",
    advanced: "Nâng cao"
  };

  const elements = {
    userEmail: document.getElementById("userEmail"),
    downloadTemplateBtn: document.getElementById("downloadTemplateBtn"),
    excelModeBtn: document.getElementById("excelModeBtn"),
    manualModeBtn: document.getElementById("manualModeBtn"),
    uploadPanel: document.getElementById("uploadPanel"),
    manualPanel: document.getElementById("manualPanel"),
    manualMetaForm: document.getElementById("manualMetaForm"),
    manualQuestionForm: document.getElementById("manualQuestionForm"),
    manualQuestionCount: document.getElementById("manualQuestionCount"),
    manualQuestionList: document.getElementById("manualQuestionList"),
    validateManualBtn: document.getElementById("validateManualBtn"),
    resultPanel: document.getElementById("resultPanel"),
    dropZone: document.getElementById("dropZone"),
    fileInput: document.getElementById("examFileInput"),
    chooseAnotherBtn: document.getElementById("chooseAnotherBtn"),
    fileName: document.getElementById("fileName"),
    fileMeta: document.getElementById("fileMeta"),
    validationBanner: document.getElementById("validationBanner"),
    previewTitle: document.getElementById("previewTitle"),
    previewDescription: document.getElementById("previewDescription"),
    previewQuestionCount: document.getElementById("previewQuestionCount"),
    previewDuration: document.getElementById("previewDuration"),
    previewDifficulty: document.getElementById("previewDifficulty"),
    questionPreview: document.getElementById("questionPreview"),
    errorCount: document.getElementById("errorCount"),
    warningCount: document.getElementById("warningCount"),
    validationList: document.getElementById("validationList"),
    exportStatus: document.getElementById("exportStatus"),
    saveDriveBtn: document.getElementById("saveDriveBtn"),
    downloadJsonBtn: document.getElementById("downloadJsonBtn"),
    toast: document.getElementById("toast")
  };

  let importState = null;
  let manualRows = [];
  let toastTimer = null;

  function text(value) {
    return String(value ?? "").trim();
  }

  function slug(value) {
    return text(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function normalizeHeader(value) {
    return text(value).toLowerCase().replace(/\s+/g, "_");
  }

  function parseAnswer(value) {
    const normalized = text(value).toUpperCase();
    if (["A", "B", "C", "D"].includes(normalized)) return normalized.charCodeAt(0) - 65;
    const number = Number(normalized);
    if (Number.isInteger(number) && number >= 1 && number <= 4) return number - 1;
    return null;
  }

  function normalizeJsonFileName(value, testId) {
    const requested = text(value).replace(/\\/g, "/").split("/").pop().replace(/\.json$/i, "");
    const safeName = slug(requested) || slug(testId.replace("part5-", "")) || "new-test";
    return `${safeName}.json`;
  }

  function readInfoSheet(sheet) {
    if (!sheet) return {};
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
    const info = {};
    rows.forEach((row) => {
      const key = normalizeHeader(row[0]);
      if (key) info[key] = text(row[1]);
    });
    return info;
  }

  function readQuestionsSheet(sheet) {
    if (!sheet) return { rows: [], headers: [] };
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
    const headers = (matrix[0] || []).map(normalizeHeader);
    const rows = matrix.slice(1)
      .filter((row) => row.some((cell) => text(cell)))
      .map((row, index) => {
        const item = { _row: index + 2 };
        headers.forEach((header, columnIndex) => {
          if (header) item[header] = text(row[columnIndex]);
        });
        return item;
      });
    return { rows, headers };
  }

  function validateWorkbook(info, questionData) {
    const errors = [];
    const warnings = [];
    const testId = text(info.test_id);
    const title = text(info.title);
    const difficulty = text(info.difficulty).toLowerCase();
    const durationMinutes = Number(info.duration_minutes);

    if (!testId) errors.push({ scope: "Test_Info", message: "Thiếu test_id." });
    else if (!/^part5-test-[a-z0-9-]+$/.test(testId)) {
      errors.push({ scope: "Test_Info", message: "test_id phải bắt đầu bằng part5-test- và chỉ chứa chữ thường, số, dấu gạch ngang." });
    }
    if (!title) errors.push({ scope: "Test_Info", message: "Thiếu title." });
    if (!text(info.description)) warnings.push({ scope: "Test_Info", message: "Nên thêm description để thẻ đề rõ nội dung." });
    if (!difficultyValues.has(difficulty)) {
      errors.push({ scope: "Test_Info", message: "difficulty phải là basic, intermediate hoặc advanced." });
    }
    if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 180) {
      errors.push({ scope: "Test_Info", message: "duration_minutes phải là số nguyên từ 1 đến 180." });
    }

    const missingColumns = requiredQuestionColumns.filter((column) => !questionData.headers.includes(column));
    if (missingColumns.length) {
      errors.push({ scope: "Questions", message: `Thiếu cột: ${missingColumns.join(", ")}.` });
    }
    if (!questionData.rows.length) errors.push({ scope: "Questions", message: "Chưa có câu hỏi nào." });

    const seenIds = new Set();
    const questions = questionData.rows.map((row, index) => {
      const rowNumber = row._row;
      const generatedId = testId ? `${testId}-q${String(index + 1).padStart(3, "0")}` : "";
      const questionId = text(row.question_id) || generatedId;
      const answer = parseAnswer(row.answer);
      const rowErrors = [];

      if (!text(row.question_id)) {
        warnings.push({ scope: `Dòng ${rowNumber}`, message: `Thiếu question_id, sẽ tự tạo ${generatedId || "sau khi có test_id"}.` });
      }
      if (!questionId) rowErrors.push("Không xác định được question_id");
      else if (seenIds.has(questionId)) rowErrors.push(`question_id trùng: ${questionId}`);
      seenIds.add(questionId);
      if (!text(row.topic)) rowErrors.push("Thiếu topic");
      if (!text(row.grammar_id)) rowErrors.push("Thiếu grammar_id");
      if (!difficultyValues.has(text(row.difficulty).toLowerCase())) rowErrors.push("difficulty không hợp lệ");
      if (!text(row.sentence)) rowErrors.push("Thiếu sentence");
      ["option_a", "option_b", "option_c", "option_d"].forEach((key) => {
        if (!text(row[key])) rowErrors.push(`Thiếu ${key}`);
      });
      if (answer === null) rowErrors.push("answer phải là A-D hoặc 1-4");
      if (!text(row.explanation)) rowErrors.push("Thiếu explanation");
      if (!text(row.tip)) rowErrors.push("Thiếu tip");

      rowErrors.forEach((message) => errors.push({ scope: `Dòng ${rowNumber}`, message }));
      return {
        id: questionId,
        topic: text(row.topic),
        grammarId: text(row.grammar_id),
        difficulty: text(row.difficulty).toLowerCase(),
        sentence: text(row.sentence),
        options: [text(row.option_a), text(row.option_b), text(row.option_c), text(row.option_d)],
        answer,
        explanation: text(row.explanation),
        tip: text(row.tip)
      };
    });

    if (questions.length !== 30) {
      warnings.push({ scope: "Questions", message: `Đề hiện có ${questions.length} câu; format Part 5 đầy đủ thường có 30 câu.` });
    }

    const tags = text(info.tags).split(",").map((tag) => tag.trim()).filter(Boolean);
    const version = Math.max(1, Number.parseInt(info.version, 10) || 1);
    const test = {
      schemaVersion: 1,
      id: testId,
      part: 5,
      title,
      description: text(info.description),
      difficulty,
      durationMinutes,
      version,
      questions
    };
    const catalogEntry = {
      id: testId,
      part: 5,
      title,
      description: test.description,
      difficulty,
      questionCount: questions.length,
      durationMinutes,
      tags,
      dataFile: `part5/${normalizeJsonFileName(info.file_name, testId)}`,
      published: true
    };
    return { test, catalogEntry, errors, warnings };
  }

  function formDataObject(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function setMode(mode) {
    const manual = mode === "manual";
    elements.excelModeBtn.classList.toggle("is-active", !manual);
    elements.manualModeBtn.classList.toggle("is-active", manual);
    elements.uploadPanel.hidden = manual;
    elements.manualPanel.hidden = !manual;
    elements.resultPanel.hidden = true;
    updateSteps(1);
  }

  function addManualQuestion(event) {
    event.preventDefault();
    const row = formDataObject(elements.manualQuestionForm);
    manualRows.push(row);
    elements.manualQuestionForm.reset();
    elements.manualQuestionForm.elements.difficulty.value = "intermediate";
    elements.manualQuestionForm.elements.answer.value = "A";
    renderManualQuestions();
  }

  function renderManualQuestions() {
    elements.manualQuestionCount.textContent = String(manualRows.length);
    elements.manualQuestionList.replaceChildren();
    if (!manualRows.length) {
      const empty = document.createElement("p");
      empty.className = "manual-empty";
      empty.textContent = "Chưa có câu hỏi nào.";
      elements.manualQuestionList.appendChild(empty);
      return;
    }

    manualRows.forEach((row, index) => {
      const item = document.createElement("article");
      item.className = "manual-question-item";
      item.innerHTML = `
        <div>
          <strong></strong>
          <span></span>
        </div>
        <button class="icon-command" type="button" aria-label="Xóa câu hỏi">
          <i data-lucide="trash-2"></i>
        </button>
      `;
      item.querySelector("strong").textContent = `Câu ${index + 1}: ${text(row.topic) || "Chưa có chủ điểm"}`;
      item.querySelector("span").textContent = text(row.sentence) || "Chưa có nội dung câu hỏi";
      item.querySelector("button").addEventListener("click", () => {
        manualRows.splice(index, 1);
        renderManualQuestions();
      });
      elements.manualQuestionList.appendChild(item);
    });
    refreshIcons();
  }

  function validateManualExam() {
    const info = formDataObject(elements.manualMetaForm);
    const questionData = {
      headers: requiredQuestionColumns,
      rows: manualRows.map((row, index) => ({ ...row, _row: index + 1 }))
    };
    const validation = validateWorkbook(info, questionData);
    importState = {
      file: {
        name: "Đề nhập thủ công",
        size: JSON.stringify(validation.test).length
      },
      info,
      ...validation
    };
    renderResult();
  }

  async function processFile(file) {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      showToast("File vượt quá giới hạn 2 MB.");
      return;
    }
    if (!/\.xlsx?$/i.test(file.name)) {
      showToast("Vui lòng chọn file Excel .xlsx hoặc .xls.");
      return;
    }

    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const info = readInfoSheet(workbook.Sheets.Test_Info);
      const questionData = readQuestionsSheet(workbook.Sheets.Questions);
      const validation = validateWorkbook(info, questionData);
      importState = { file, info, ...validation };
      renderResult();
    } catch (error) {
      console.error(error);
      showToast("Không thể đọc file Excel này.");
    }
  }

  function renderResult() {
    const { file, test, errors, warnings } = importState;
    elements.uploadPanel.hidden = true;
    elements.resultPanel.hidden = false;
    elements.fileName.textContent = file.name;
    elements.fileMeta.textContent = `${(file.size / 1024).toFixed(1)} KB · ${test.questions.length} dòng dữ liệu`;
    elements.previewTitle.textContent = test.title || "Đề chưa có tiêu đề";
    elements.previewDescription.textContent = test.description || "Chưa có mô tả.";
    elements.previewQuestionCount.textContent = String(test.questions.length);
    elements.previewDuration.textContent = Number.isFinite(test.durationMinutes) ? String(test.durationMinutes) : "--";
    elements.previewDifficulty.textContent = difficultyLabels[test.difficulty] || "--";
    elements.errorCount.textContent = String(errors.length);
    elements.warningCount.textContent = String(warnings.length);

    const valid = errors.length === 0;
    elements.validationBanner.className = `validation-banner ${valid ? "is-valid" : "is-invalid"}`;
    elements.validationBanner.innerHTML = `<i data-lucide="${valid ? "circle-check" : "circle-x"}"></i><span></span>`;
    elements.validationBanner.lastElementChild.textContent = valid
      ? `File hợp lệ. ${test.questions.length} câu đã sẵn sàng xuất JSON.`
      : `Cần sửa ${errors.length} lỗi trước khi xuất JSON.`;
    elements.exportStatus.textContent = valid ? "Sẵn sàng xuất file" : "Chưa thể xuất file";
    elements.downloadJsonBtn.disabled = !valid;
    elements.saveDriveBtn.disabled = !valid;
    renderQuestions(test.questions);
    renderValidation(errors, warnings);
    updateSteps(valid ? 3 : 2);
    refreshIcons();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderQuestions(questions) {
    elements.questionPreview.replaceChildren();
    questions.slice(0, 5).forEach((question, index) => {
      const article = document.createElement("article");
      article.className = "preview-question";
      article.innerHTML = `
        <div class="preview-question__meta">
          <strong>Câu ${index + 1}</strong>
          <span></span>
          <span></span>
        </div>
        <h3></h3>
        <div class="preview-options"></div>
      `;
      const meta = article.querySelectorAll(".preview-question__meta span");
      meta[0].textContent = question.topic || "Chưa có chủ điểm";
      meta[1].textContent = question.id || "Chưa có ID";
      article.querySelector("h3").textContent = question.sentence || "Chưa có nội dung câu hỏi";
      question.options.forEach((option, optionIndex) => {
        const value = document.createElement("span");
        value.classList.toggle("is-answer", optionIndex === question.answer);
        value.textContent = `${String.fromCharCode(65 + optionIndex)}. ${option || "Chưa có đáp án"}`;
        article.querySelector(".preview-options").appendChild(value);
      });
      elements.questionPreview.appendChild(article);
    });

    if (questions.length > 5) {
      const more = document.createElement("p");
      more.className = "preview-more";
      more.textContent = `Còn ${questions.length - 5} câu khác trong file JSON xuất ra.`;
      elements.questionPreview.appendChild(more);
    }
  }

  function renderValidation(errors, warnings) {
    elements.validationList.replaceChildren();
    const messages = [
      ...errors.map((item) => ({ ...item, type: "error" })),
      ...warnings.map((item) => ({ ...item, type: "warning" }))
    ];
    if (!messages.length) messages.push({ type: "ok", scope: "Hoàn tất", message: "Không phát hiện lỗi hoặc cảnh báo." });

    messages.forEach((item) => {
      const row = document.createElement("div");
      row.className = `validation-item is-${item.type}`;
      row.innerHTML = `<i data-lucide="${item.type === "error" ? "circle-x" : item.type === "warning" ? "triangle-alert" : "circle-check"}"></i><div><strong></strong><span></span></div>`;
      row.querySelector("strong").textContent = item.scope;
      row.querySelector("span").textContent = item.message;
      elements.validationList.appendChild(row);
    });
  }

  function downloadTemplate() {
    const infoRows = [
      ["field", "value", "description"],
      ["test_id", "part5-test-003", "ID duy nhất, bắt đầu bằng part5-test-"],
      ["title", "Part 5 Test 03", "Tên hiển thị trong thư viện"],
      ["description", "Đề luyện tổng hợp theo ngữ cảnh công việc.", "Mô tả ngắn"],
      ["difficulty", "intermediate", "basic, intermediate hoặc advanced"],
      ["duration_minutes", "12", "Thời gian mô phỏng"],
      ["version", "1", "Tăng khi sửa nội dung đề"],
      ["tags", "Tổng hợp, Công việc", "Các nhãn, phân cách bằng dấu phẩy"],
      ["file_name", "test-003.json", "Tên file JSON muốn xuất"]
    ];
    const questionRows = [
      requiredQuestionColumns,
      [
        "part5-test-003-q001",
        "Từ loại",
        "word-forms",
        "basic",
        "The manager gave a _____ explanation of the updated policy.",
        "clarity",
        "clear",
        "clearly",
        "clarify",
        "B",
        "\"Clear\" là tính từ bổ nghĩa cho danh từ \"explanation\".",
        "Trước danh từ thường cần một tính từ."
      ],
      [
        "part5-test-003-q002",
        "Giới từ",
        "prepositions",
        "intermediate",
        "All applications must be submitted _____ Friday.",
        "at",
        "by",
        "during",
        "among",
        "B",
        "\"By Friday\" diễn tả hạn chót không muộn hơn thứ Sáu.",
        "By dùng cho deadline; until dùng cho hành động kéo dài."
      ]
    ];
    const guideRows = [
      ["VocaNest - Template import đề TOEIC Part 5"],
      ["1. Điền metadata trong sheet Test_Info."],
      ["2. Mỗi câu hỏi là một dòng trong sheet Questions."],
      ["3. answer nhận A-D hoặc 1-4."],
      ["4. Giữ nguyên tên sheet và tên các cột."],
      ["5. Import file tại pages/exam-import.html để kiểm tra và lưu lên Drive."],
      [""],
      ["difficulty", "basic | intermediate | advanced"],
      ["grammar_id", "ID chuyên đề trong assets/js/grammar.js"],
      ["question_id", "Có thể để trống để importer tự sinh theo test_id"]
    ];

    const workbook = XLSX.utils.book_new();
    const guideSheet = XLSX.utils.aoa_to_sheet(guideRows);
    const infoSheet = XLSX.utils.aoa_to_sheet(infoRows);
    const questionsSheet = XLSX.utils.aoa_to_sheet(questionRows);
    guideSheet["!cols"] = [{ wch: 72 }, { wch: 34 }];
    infoSheet["!cols"] = [{ wch: 22 }, { wch: 42 }, { wch: 48 }];
    questionsSheet["!cols"] = [
      { wch: 26 }, { wch: 18 }, { wch: 22 }, { wch: 14 }, { wch: 55 },
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 10 },
      { wch: 55 }, { wch: 45 }
    ];
    guideSheet["!freeze"] = { xSplit: 0, ySplit: 1 };
    infoSheet["!freeze"] = { xSplit: 0, ySplit: 1 };
    questionsSheet["!freeze"] = { xSplit: 0, ySplit: 1 };
    questionsSheet["!autofilter"] = { ref: `A1:L${questionRows.length}` };
    XLSX.utils.book_append_sheet(workbook, guideSheet, "Instructions");
    XLSX.utils.book_append_sheet(workbook, infoSheet, "Test_Info");
    XLSX.utils.book_append_sheet(workbook, questionsSheet, "Questions");
    XLSX.writeFile(workbook, "VocaNest-Part5-Import-Template.xlsx", { compression: true });
    showToast("Đã tạo Excel mẫu.");
  }

  function updateSteps(active) {
    document.querySelectorAll(".import-steps > div").forEach((step, index) => {
      step.classList.toggle("is-active", index + 1 <= active);
    });
  }

  function resetImporter() {
    importState = null;
    elements.fileInput.value = "";
    elements.resultPanel.hidden = true;
    updateSteps(1);
  }

  function downloadJson() {
    if (!importState || importState.errors.length) return;
    const json = `${JSON.stringify(importState.test, null, 2)}\n`;
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = importState.catalogEntry.dataFile.split("/").pop();
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast("Đã xuất file JSON.");
  }

  async function saveToDrive() {
    if (!importState || importState.errors.length) return;
    elements.saveDriveBtn.disabled = true;
    elements.saveDriveBtn.innerHTML = '<i data-lucide="loader-circle"></i> Đang lưu';
    refreshIcons();
    try {
      await window.vocaApi.authPost("saveExamTest", {
        test: importState.test,
        tags: importState.catalogEntry.tags || [],
        published: true
      });
      showToast("Đã lưu đề vào Google Sheet exam_tests.");
      elements.exportStatus.textContent = "Đã lưu lên Drive";
    } catch (error) {
      console.error(error);
      showToast(error.message || "Không lưu được đề lên Drive.");
    } finally {
      elements.saveDriveBtn.disabled = false;
      elements.saveDriveBtn.innerHTML = '<i data-lucide="cloud-upload"></i> Lưu lên Drive';
      refreshIcons();
    }
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.hidden = false;
    toastTimer = window.setTimeout(() => {
      elements.toast.hidden = true;
    }, 2400);
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function bindEvents() {
    elements.downloadTemplateBtn.addEventListener("click", downloadTemplate);
    elements.excelModeBtn.addEventListener("click", () => setMode("excel"));
    elements.manualModeBtn.addEventListener("click", () => setMode("manual"));
    elements.manualQuestionForm.addEventListener("submit", addManualQuestion);
    elements.validateManualBtn.addEventListener("click", validateManualExam);
    elements.fileInput.addEventListener("change", () => processFile(elements.fileInput.files[0]));
    ["dragenter", "dragover"].forEach((eventName) => {
      elements.dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        elements.dropZone.classList.add("is-dragging");
      });
    });
    ["dragleave", "drop"].forEach((eventName) => {
      elements.dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        elements.dropZone.classList.remove("is-dragging");
      });
    });
    elements.dropZone.addEventListener("drop", (event) => processFile(event.dataTransfer.files[0]));
    elements.chooseAnotherBtn.addEventListener("click", resetImporter);
    elements.downloadJsonBtn.addEventListener("click", downloadJson);
    elements.saveDriveBtn.addEventListener("click", saveToDrive);
  }

  async function init() {
    const user = await requireAuth();
    if (!user) return;
    elements.userEmail.textContent = user.email || "";
    bindEvents();
    renderManualQuestions();
    refreshIcons();
  }

  init();
})();
