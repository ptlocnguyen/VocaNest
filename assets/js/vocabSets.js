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

    // Bộ của tôi
    const { data: mySets, error: myErr } = await supabaseClient
        .from("vocab_sets")
        .select("*")
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

    // Bộ công khai
    const { data: publicSets, error: pubErr } = await supabaseClient
        .from("vocab_sets")
        .select("*")
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
function renderSet(set, container) {
    const el = document.createElement("div");
    el.className = "card vocab-card";

    el.innerHTML = `
    <h3>${set.title}</h3>
    <p>${set.description || "Không có mô tả"}</p>
    <span class="badge">${set.is_public ? "Công khai" : "Riêng tư"}</span>
    <br/><br/>
    <a class="btn" href="./vocab-set-detail.html?id=${set.id}">
      Mở bộ từ vựng
    </a>
  `;

    container.appendChild(el);
}

function renderMySets(list) {
  myVocabList.innerHTML = "";

  if (!list.length) {
    myVocabList.innerHTML = "<p>Không có bộ phù hợp.</p>";
    return;
  }

  list.forEach(set => renderSet(set, myVocabList));
}

function renderPublicSets(list) {
  publicVocabList.innerHTML = "";

  if (!list.length) {
    publicVocabList.innerHTML = "<p>Không có bộ phù hợp.</p>";
    return;
  }

  list.forEach(set => renderSet(set, publicVocabList));
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
