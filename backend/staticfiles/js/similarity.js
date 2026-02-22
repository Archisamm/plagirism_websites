document.addEventListener("DOMContentLoaded", async () => {
  const status = document.getElementById("status");
  const list = document.getElementById("similarityList");

  try {
    const res = await fetch("/api/recent-results/");
    const data = await res.json();

    if (!data.results || !data.results.length) {
      status.textContent = "No similarity reports found.";
      return;
    }

    status.textContent = `Showing ${data.results.length} recent reports`;

    list.innerHTML = data.results.map(r => `
      <div class="match-card">
        <div><b>Title:</b> ${r.title}</div>
        <div><b>Similarity:</b> ${r.plagiarism_percentage}%</div>
        <div><b>Verdict:</b> ${r.verdict}</div>
        <div><b>Date:</b> ${r.created_at}</div>
      </div>
    `).join("");

  } catch (err) {
    console.error(err);
    status.textContent = "Error loading similarity reports";
  }
});
