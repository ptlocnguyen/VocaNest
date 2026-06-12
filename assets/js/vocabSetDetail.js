let allItems = [];

(async () => {
  const currentUser = await requireAuth();
  if (!currentUser) return;

  const params = new URLSearchParams(window.location.search);
  const vocabSetId = params.get("id");

  if (!vocabSetId) {
    alert("Thiếu ID bộ từ vựng");
    window.location.replace("./vocab-sets.html");
    return;
  }

  const userEmailEl = document.getElementById("userEmail");
  if (userEmailEl) userEmailEl.textContent = currentUser.email;

  const setTitleEl = document.getElementById("setTitle");
  const setMetaEl = document.getElementById("setMeta");
  const addSection = document.getElementById("addSection");

  const wordInput = document.getElementById("wordInput");
  const meaningInput = document.getElementById("meaningInput");
  const addBtn = document.getElementById("addBtn");
  const vocabItemsEl = document.getElementById("vocabItems");
  const searchInput = document.getElementById("searchInput");
  const excelInput = document.getElementById("excelInput");
  const importAlert = document.getElementById("importAlert");

  let isOwner = false;
  let searchTimer = null;

  function applySetInfo(data) {
    if (setTitleEl) setTitleEl.textContent = data.title || "";

    isOwner = data.is_owner;
    if (!isOwner) {
      document.body.classList.add("viewer-mode");
    }

    if (setMetaEl) {
      setMetaEl.textContent = isOwner
        ? (data.is_public ? "Bộ công khai của bạn" : "Bộ riêng tư của bạn")
        : "Bạn đang xem bộ công khai";
    }

    if (!isOwner && addSection) {
      addSection.style.display = "none";
    }
  }

  function applyItems(data) {
    allItems = data || [];
    if (!allItems.length) {
      vocabItemsEl.innerHTML = "<p>Chưa có từ vựng</p>";
      return;
    }

    renderItems(allItems);
  }

  function renderItem(item) {
    if (!vocabItemsEl) return null;

    const row = document.createElement("div");
    row.className = "vocab-row";

    const textWrap = document.createElement("div");

    const word = document.createElement("div");
    word.className = "vocab-word";
    word.textContent = item.word || "";
    textWrap.appendChild(word);

    const meaning = document.createElement("div");
    meaning.className = "vocab-meaning";
    meaning.textContent = item.meaning || "";
    textWrap.appendChild(meaning);

    row.appendChild(textWrap);

    if (isOwner) {
      const btn = document.createElement("button");
      btn.className = "btn btn-danger";
      btn.type = "button";
      btn.textContent = "Xoá";

      btn.addEventListener("click", async () => {
        const ok = confirm("Xoá từ này?");
        if (!ok) return;

        btn.disabled = true;

        try {
          await window.vocaApi.authPost("deleteItem", {
            itemId: item.id
          });
          allItems = allItems.filter(entry => entry.id !== item.id);
          renderItems(allItems);
        } catch (err) {
          console.error(err);
          alert(err.message || "Xoá thất bại");
          btn.disabled = false;
        }
      });

      row.appendChild(btn);
    }

    return row;
  }

  function renderItems(list) {
    vocabItemsEl.innerHTML = "";

    if (!list.length) {
      vocabItemsEl.innerHTML = "<p>Không có từ phù hợp.</p>";
      return;
    }

    const fragment = document.createDocumentFragment();
    list.forEach(item => {
      const row = renderItem(item);
      if (row) fragment.appendChild(row);
    });

    vocabItemsEl.appendChild(fragment);
  }

  function showImportAlert(msg, type = "ok") {
    importAlert.textContent = msg;
    importAlert.className = `alert ${type}`;
    importAlert.style.display = "block";
  }

  async function addItem() {
    if (!isOwner) return;
    if (!wordInput || !meaningInput) return;

    const word = wordInput.value.trim();
    const meaning = meaningInput.value.trim();

    if (!word || !meaning) {
      alert("Nhập đủ từ và nghĩa");
      return;
    }

    if (addBtn) addBtn.disabled = true;

    try {
      const result = await window.vocaApi.authPost("addItem", {
        setId: vocabSetId,
        word,
        meaning
      });

      wordInput.value = "";
      meaningInput.value = "";
      allItems.unshift(result.data);
      renderItems(allItems);
      wordInput.focus();
    } catch (err) {
      console.error(err);
      alert(err.message || "Thêm từ thất bại");
    } finally {
      if (addBtn) addBtn.disabled = false;
    }
  }

  if (addBtn) {
    addBtn.addEventListener("click", addItem);
  }

  [wordInput, meaningInput].forEach(input => {
    if (!input) return;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") addItem();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        const q = searchInput.value.trim().toLowerCase();

        if (!q) {
          renderItems(allItems);
          return;
        }

        const filtered = allItems.filter(item =>
          (item.word || "").toLowerCase().includes(q) ||
          (item.meaning || "").toLowerCase().includes(q)
        );

        renderItems(filtered);
      }, 120);
    });
  }

  if (excelInput) {
    excelInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        showImportAlert("Đang đọc file Excel...", "ok");

        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          blankrows: false
        });

        if (!rows || rows.length === 0) {
          showImportAlert("File Excel rỗng", "err");
          return;
        }

        const firstRow = rows[0].map(cell => String(cell || "").trim().toLowerCase());
        const hasHeader = firstRow[0] === "word" || firstRow[0] === "từ vựng";
        const vocabRows = hasHeader ? rows.slice(1) : rows;

        const items = vocabRows
          .map(r => ({
            word: String(r[0] || "").trim(),
            meaning: String(r[1] || "").trim()
          }))
          .filter(r => r.word && r.meaning);

        if (!items.length) {
          showImportAlert("Không tìm thấy dữ liệu hợp lệ", "err");
          return;
        }

        showImportAlert(`Đang import ${items.length} từ...`, "ok");

        const result = await window.vocaApi.authPost("importItems", {
          setId: vocabSetId,
          items
        });

        showImportAlert(`Import thành công ${result.count || items.length} từ`, "ok");
        excelInput.value = "";
        allItems = [...(result.data || []), ...allItems];
        renderItems(allItems);
      } catch (err) {
        console.error(err);
        showImportAlert(err.message || "Lỗi đọc file Excel", "err");
      }
    });
  }

  try {
    vocabItemsEl.innerHTML = "<p>Đang tải...</p>";
    const { data } = await window.vocaApi.authPost("getSetBundle", {
      setId: vocabSetId
    });

    applySetInfo(data.set);
    applyItems(data.items);
  } catch (err) {
    console.error(err);
    alert(err.message || "Không tìm thấy bộ từ vựng");
    window.location.replace("./vocab-sets.html");
  }
})();
