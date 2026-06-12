(async () => {
  const userEmailEl = document.getElementById("userEmail");
  const currentUser = await requireAuth();
  if (!currentUser) return;

  if (userEmailEl) userEmailEl.textContent = currentUser.email;

  let mySetsCache = [];
  let publicSetsCache = [];

  const myVocabList = document.getElementById("myVocabList");
  const publicVocabList = document.getElementById("publicVocabList");

  const openBtn = document.getElementById("openCreateModal");
  const modal = document.getElementById("modal");
  const closeBtn = document.getElementById("closeModal");
  const closeBtnX = document.getElementById("closeModalX");

  const titleInput = document.getElementById("titleInput");
  const descInput = document.getElementById("descInput");
  const publicCheckbox = document.getElementById("publicCheckbox");
  const createBtn = document.getElementById("createBtn");

  const mySearchInput = document.getElementById("mySearchInput");
  const publicSearchInput = document.getElementById("publicSearchInput");

  function openModal() {
    modal.classList.remove("hidden");
    titleInput.focus();
  }

  function closeModal() {
    modal.classList.add("hidden");
    titleInput.value = "";
    descInput.value = "";
    publicCheckbox.checked = false;
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  if (closeBtnX) closeBtnX.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  async function loadLists() {
    myVocabList.innerHTML = "<p>Đang tải...</p>";
    publicVocabList.innerHTML = "<p>Đang tải...</p>";

    try {
      const { data } = await window.vocaApi.authPost("listSets");
      mySetsCache = data.filter(set => set.user_id === currentUser.id);
      publicSetsCache = data.filter(set => set.user_id !== currentUser.id && set.is_public);

      renderMySets(mySetsCache);
      renderPublicSets(publicSetsCache);
    } catch (err) {
      console.error(err);
      myVocabList.innerHTML = "<p>Lỗi tải bộ từ vựng.</p>";
      publicVocabList.innerHTML = "<p>Lỗi tải bộ công khai.</p>";
    }
  }

  function appendText(parent, tag, text, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = text;
    parent.appendChild(el);
    return el;
  }

  function renderSet(set, container, isOwner) {
    const el = document.createElement("div");
    el.className = "card vocab-card";

    appendText(el, "h3", set.title || "");
    appendText(el, "p", set.description || "Không có mô tả");

    const meta = document.createElement("div");
    meta.className = "set-meta";

    const metaLeft = document.createElement("div");
    metaLeft.className = "set-meta__left";

    const statusBadge = document.createElement("span");
    statusBadge.className = "badge " + (set.is_public ? "badge--public" : "badge--private");
    statusBadge.textContent = set.is_public ? "Công khai" : "Riêng tư";
    metaLeft.appendChild(statusBadge);

    const countBadge = document.createElement("span");
    countBadge.className = "badge badge--count";
    countBadge.textContent = `${set.word_count || 0} từ`;
    metaLeft.appendChild(countBadge);

    meta.appendChild(metaLeft);

    const createdAt = set.created_at
      ? new Date(set.created_at).toLocaleDateString("vi-VN")
      : "";
    const creator = document.createElement("span");

    if (!isOwner && set.creator_email) {
      creator.className = "set-meta__creator";
      creator.textContent = `Tạo bởi ${set.creator_email}${createdAt ? ` · ${createdAt}` : ""}`;
    }

    meta.appendChild(creator);
    el.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "row row--actions";

    const openLink = document.createElement("a");
    openLink.className = "btn";
    openLink.href = `./vocab-set-detail.html?id=${encodeURIComponent(set.id)}`;
    openLink.textContent = "Mở bộ từ vựng";
    actions.appendChild(openLink);

    const flashcardsLink = document.createElement("a");
    flashcardsLink.className = "btn primary";
    flashcardsLink.href = `./flashcards.html?set=${encodeURIComponent(set.id)}`;
    flashcardsLink.textContent = "Flashcards";
    actions.appendChild(flashcardsLink);

    if (isOwner) {
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-danger btn-delete-set";
      deleteBtn.type = "button";
      deleteBtn.textContent = "Xoá";

      deleteBtn.addEventListener("click", async () => {
        const ok = confirm(
          `Bạn chắc chắn muốn xoá bộ "${set.title}"?\n\nToàn bộ từ vựng trong bộ này sẽ bị xoá.`
        );

        if (!ok) return;

        deleteBtn.disabled = true;

        try {
          await window.vocaApi.authPost("deleteSet", { setId: set.id });
          loadLists();
        } catch (err) {
          console.error(err);
          alert(err.message || "Xoá bộ từ vựng thất bại");
          deleteBtn.disabled = false;
        }
      });

      actions.appendChild(deleteBtn);
    }

    el.appendChild(actions);
    container.appendChild(el);
  }

  function renderMySets(list) {
    myVocabList.innerHTML = "";

    if (!list.length) {
      myVocabList.innerHTML = "<p>Không có bộ phù hợp.</p>";
      return;
    }

    list.forEach(set => renderSet(set, myVocabList, true));
  }

  function renderPublicSets(list) {
    publicVocabList.innerHTML = "";

    if (!list.length) {
      publicVocabList.innerHTML = "<p>Không có bộ phù hợp.</p>";
      return;
    }

    list.forEach(set => renderSet(set, publicVocabList, false));
  }

  createBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    if (!title) {
      alert("Vui lòng nhập tên bộ từ vựng");
      return;
    }

    createBtn.disabled = true;

    try {
      await window.vocaApi.authPost("createSet", {
        title,
        description: descInput.value.trim(),
        isPublic: publicCheckbox.checked
      });

      closeModal();
      loadLists();
    } catch (err) {
      console.error(err);
      alert(err.message || "Tạo bộ từ vựng thất bại");
    } finally {
      createBtn.disabled = false;
    }
  });

  titleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") createBtn.click();
  });

  if (mySearchInput) {
    mySearchInput.addEventListener("input", () => {
      const q = mySearchInput.value.trim().toLowerCase();
      const filtered = mySetsCache.filter(set =>
        (set.title || "").toLowerCase().includes(q)
      );

      renderMySets(filtered);
    });
  }

  if (publicSearchInput) {
    publicSearchInput.addEventListener("input", () => {
      const q = publicSearchInput.value.trim().toLowerCase();
      const filtered = publicSetsCache.filter(set =>
        (set.title || "").toLowerCase().includes(q)
      );

      renderPublicSets(filtered);
    });
  }

  loadLists();
})();
