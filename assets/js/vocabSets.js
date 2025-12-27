// vocabSets.js
// Trang danh sách bộ từ vựng
// Supabase v1 + authGuard

const userEmailEl = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

// Guard
const currentUser = requireAuth();
if (!currentUser) {
  // requireAuth đã redirect
  throw new Error("Unauthenticated");
}

userEmailEl.textContent = currentUser.email;

let mySetsCache = [];
let publicSetsCache = [];

// ===== ELEMENTS =====
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

// ===== LOGOUT =====
logoutBtn.addEventListener("click", async () => {
  logoutBtn.disabled = true;
  await supabaseClient.auth.signOut();
  window.location.replace("./auth.html");
});

// ===== MODAL =====
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

// Click nền để đóng modal
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// ===== LOAD LIST =====
async function loadLists() {
  myVocabList.innerHTML = "";
  publicVocabList.innerHTML = "";

  // ===== Bộ của tôi =====
  const { data: mySets, error: myErr } = await supabaseClient
    .from("vocab_sets")
    .select(`
      *,
        vocab_items(count)
    `)
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (myErr) {
    console.error(myErr);
    myVocabList.innerHTML = "<p>Lỗi tải bộ từ vựng.</p>";
  } else if (!mySets || mySets.length === 0) {
    myVocabList.innerHTML = "<p>Chưa có bộ từ vựng nào.</p>";
  } else {
    mySetsCache = mySets || [];
    renderMySets(mySetsCache);
  }

  // ===== Bộ công khai (JOIN user email) =====
  const { data: publicSets, error: pubErr } = await supabaseClient
    .from("vocab_sets")
    .select(`
  *,
  profile:profiles (
    email
  ),
  vocab_items(count)
`)
    .eq("is_public", true)
    .neq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (pubErr) {
    console.error(pubErr);
    publicVocabList.innerHTML = "<p>Lỗi tải bộ công khai.</p>";
  } else if (!publicSets || publicSets.length === 0) {
    publicVocabList.innerHTML = "<p>Chưa có bộ công khai nào.</p>";
  } else {
    publicSetsCache = publicSets || [];
    renderPublicSets(publicSetsCache);
  }
}

// ===== RENDER CARD =====
function renderSet(set, container, isOwner) {
  const el = document.createElement("div");
  el.className = "card vocab-card";

  const wordCount =
    Array.isArray(set.vocab_items) && set.vocab_items.length
      ? set.vocab_items[0].count
      : 0;

  const createdAt = set.created_at
    ? new Date(set.created_at).toLocaleDateString("vi-VN")
    : "";

  const creatorLine = (!isOwner && set.profile && set.profile.email)
    ? `Tạo bởi ${set.profile.email}${createdAt ? ` · ${createdAt}` : ""}`
    : "";

  el.innerHTML = `
  <h3>${set.title}</h3>
  <p>${set.description || "Không có mô tả"}</p>

  <div class="set-meta">
    <div class="set-meta__left">
      <span class="badge ${set.is_public ? "badge--public" : "badge--private"}">
        ${set.is_public ? "Công khai" : "Riêng tư"}
      </span>

      <span class="badge badge--count">
        ${wordCount} từ
      </span>
    </div>

    ${!isOwner && set.profile ? `
      <span class="set-meta__creator">
        Tạo bởi ${set.profile.email} · ${createdAt}
      </span>
    ` : `<span></span>`}
  </div>

  <div class="row row--actions">
    <a class="btn" href="./vocab-set-detail.html?id=${set.id}">
      Mở bộ từ vựng
    </a>

    <a class="btn primary" href="./flashcards.html?set=${set.id}">
      📚 Flashcards
    </a>

    ${isOwner ? `
      <button class="btn btn-danger btn-delete-set">Xoá</button>
    ` : ""}
  </div>
`;

  // ===== DELETE SET (CHỈ OWNER) =====
  if (isOwner) {
    const deleteBtn = el.querySelector(".btn-delete-set");

    deleteBtn.addEventListener("click", async () => {
      const ok = confirm(
        `Bạn chắc chắn muốn xoá bộ "${set.title}"?\n\nToàn bộ từ vựng trong bộ này sẽ bị xoá.`
      );

      if (!ok) return;

      deleteBtn.disabled = true;

      try {
        // Xoá vocab_items
        const { error: itemErr } = await supabaseClient
          .from("vocab_items")
          .delete()
          .eq("vocab_set_id", set.id);

        if (itemErr) throw itemErr;

        // Xoá vocab_set (đảm bảo đúng owner)
        const { error: setErr } = await supabaseClient
          .from("vocab_sets")
          .delete()
          .eq("id", set.id)
          .eq("user_id", currentUser.id);

        if (setErr) throw setErr;

        loadLists();

      } catch (err) {
        console.error(err);
        alert("Xoá bộ từ vựng thất bại");
        deleteBtn.disabled = false;
      }
    });
  }

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

// ===== CREATE SET =====
createBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  if (!title) {
    alert("Vui lòng nhập tên bộ từ vựng");
    return;
  }

  createBtn.disabled = true;

  const payload = {
    user_id: currentUser.id,
    title,
    description: descInput.value.trim() || null,
    is_public: publicCheckbox.checked
  };

  const { error } = await supabaseClient
    .from("vocab_sets")
    .insert(payload);

  createBtn.disabled = false;

  if (error) {
    console.error(error);
    alert("Tạo bộ từ vựng thất bại");
    return;
  }

  closeModal();
  loadLists();
});

// ===== SEARCH =====
if (mySearchInput) {
  mySearchInput.addEventListener("input", () => {
    const q = mySearchInput.value.trim().toLowerCase();

    const filtered = mySetsCache.filter(set =>
      set.title.toLowerCase().includes(q)
    );

    renderMySets(filtered);
  });
}

if (publicSearchInput) {
  publicSearchInput.addEventListener("input", () => {
    const q = publicSearchInput.value.trim().toLowerCase();

    const filtered = publicSetsCache.filter(set =>
      set.title.toLowerCase().includes(q)
    );

    renderPublicSets(filtered);
  });
}

// ===== INIT =====
loadLists();