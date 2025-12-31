// footer.js
(async () => {
  try {
    const res = await fetch(
      "https://vocanest-quote.ptlocnguyen.workers.dev/"
    );

    if (!res.ok) {
      throw new Error("Quote API failed");
    }

    const data = await res.json();

    const enEl = document.getElementById("quoteEn");
    const viEl = document.getElementById("quoteVi");

    if (enEl) {
      enEl.textContent = `“${data.en}” — ${data.author}`;
    }

    if (viEl) {
      viEl.textContent =
        data.vi || "(Bản dịch đang được cập nhật)";
    }

  } catch (err) {
    console.error("Footer quote error:", err);
  }
})();
