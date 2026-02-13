document.addEventListener("DOMContentLoaded", async () => {
  const box = document.getElementById("resultsBox");
  const status = document.getElementById("status");

  try {
    const res = await fetch("/api/recent-results/");
    const data = await res.json();

    if (!data.results || !data.results.length) {
      status.textContent = "No results found.";
      return;
    }

    status.textContent = `Showing ${data.results.length} recent analyses`;

    box.innerHTML = data.results.map(r => `
      <div class="match-card">
        <div><b>📄 Title:</b> ${r.title}</div>
        <div><b>📌 Score:</b> ${r.plagiarism_percentage}%</div>
        <div><b>✅ Verdict:</b> ${r.verdict}</div>
        <div><b>🕒 Date:</b> ${r.created_at}</div>
      </div>
    `).join("");

  } catch (err) {
    console.error(err);
    status.textContent = "Error loading results.";
  }
});
