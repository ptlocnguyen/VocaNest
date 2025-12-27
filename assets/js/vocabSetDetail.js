// vocabSetDetail.js
// Supabase v1 + authGuard
// Lưu ý: Không dùng return ở top-level, bọc trong IIFE để an toàn

let allItems = [];

(() => {
    const currentUser = requireAuth();
    if (!currentUser) {
        // requireAuth đã redirect
        return;
    }

    // ===== PARAM =====
    const params = new URLSearchParams(window.location.search);
    const vocabSetId = params.get("id");

    if (!vocabSetId) {
        alert("Thiếu ID bộ từ vựng");
        window.location.replace("./vocab-sets.html");
        return;
    }

    // ===== HEADER =====
    const userEmailEl = document.getElementById("userEmail");
    const logoutBtn = document.getElementById("logoutBtn");

    if (userEmailEl) userEmailEl.textContent = currentUser.email;

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await supabaseClient.auth.signOut();
            window.location.replace("./auth.html");
        });
    }

    // ===== SET INFO =====
    const setTitleEl = document.getElementById("setTitle");
    const setMetaEl = document.getElementById("setMeta");
    const addSection = document.getElementById("addSection");

    // ===== ADD =====
    const wordInput = document.getElementById("wordInput");
    const meaningInput = document.getElementById("meaningInput");
    const addBtn = document.getElementById("addBtn");

    // ===== LIST =====
    const vocabItemsEl = document.getElementById("vocabItems");

    let isOwner = false;
    const searchInput = document.getElementById("searchInput");

    async function loadSetInfo() {
        const { data, error } = await supabaseClient
            .from("vocab_sets")
            .select("*")
            .eq("id", vocabSetId)
            .single();

        if (error || !data) {
            console.error(error);
            alert("Không tìm thấy bộ từ vựng");
            window.location.replace("./vocab-sets.html");
            return false;
        }

        if (setTitleEl) setTitleEl.textContent = data.title || "";

        isOwner = data.user_id === currentUser.id;

        if (!isOwner && !data.is_public) {
            alert("Bộ này là riêng tư");
            window.location.replace("./vocab-sets.html");
            return false;
        }

        if (setMetaEl) {
            setMetaEl.textContent = isOwner
                ? (data.is_public ? "Bộ công khai của bạn" : "Bộ riêng tư của bạn")
                : "Bạn đang xem bộ công khai";
        }

        if (!isOwner && addSection) {
            addSection.style.display = "none";
        }

        return true;
    }

    async function loadItems() {
        if (!vocabItemsEl) return;

        vocabItemsEl.innerHTML = "";

        const { data, error } = await supabaseClient
            .from("vocab_items")
            .select("*")
            .eq("vocab_set_id", vocabSetId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            vocabItemsEl.innerHTML = "<p>Lỗi tải danh sách từ.</p>";
            return;
        }

        if (!data || data.length === 0) {
            vocabItemsEl.innerHTML = "<p>Chưa có từ vựng</p>";
            return;
        }

        allItems = data || [];
        renderItems(allItems);
    }

    function renderItem(item) {
        if (!vocabItemsEl) return;

        const row = document.createElement("div");
        row.className = "vocab-row";

        row.innerHTML = `
      <div>
        <div class="vocab-word">${item.word}</div>
        <div class="vocab-meaning">${item.meaning}</div>
      </div>
      ${isOwner ? `<button class="btn btn-danger" data-id="${item.id}">Xoá</button>` : ""}
    `;

        if (isOwner) {
            const btn = row.querySelector("button");
            btn.addEventListener("click", async () => {
                const ok = confirm("Xoá từ này?");
                if (!ok) return;

                const { error } = await supabaseClient
                    .from("vocab_items")
                    .delete()
                    .eq("id", item.id);

                if (error) {
                    console.error(error);
                    alert("Xoá thất bại");
                    return;
                }

                loadItems();
            });
        }

        vocabItemsEl.appendChild(row);
    }

    function renderItems(list) {
        vocabItemsEl.innerHTML = "";

        if (!list.length) {
            vocabItemsEl.innerHTML = "<p>Không có từ phù hợp.</p>";
            return;
        }

        list.forEach(renderItem);
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

        const { error } = await supabaseClient
            .from("vocab_items")
            .insert({
                vocab_set_id: vocabSetId,
                user_id: currentUser.id,
                word,
                meaning
            });

        if (addBtn) addBtn.disabled = false;

        if (error) {
            console.error(error);
            alert("Thêm từ thất bại");
            return;
        }

        wordInput.value = "";
        meaningInput.value = "";
        loadItems();
    }

    if (addBtn) {
        addBtn.addEventListener("click", addItem);
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const q = searchInput.value.trim().toLowerCase();

            if (!q) {
                renderItems(allItems);
                return;
            }

            const filtered = allItems.filter(item =>
                item.word.toLowerCase().includes(q) ||
                item.meaning.toLowerCase().includes(q)
            );

            renderItems(filtered);
        });
    }

    // ===== INIT =====
    (async () => {
        const ok = await loadSetInfo();
        if (!ok) return;
        await loadItems();
    })();
})();
