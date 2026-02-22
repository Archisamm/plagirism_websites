document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("historyList");
  list.innerHTML = `<div class="list-card">⏳ Loading history...</div>`;

  try {
    const res = await fetch("/api/recent-results/");
    const data = await res.json();

    if (!data.results || !data.results.length) {
      list.innerHTML = `<div class="list-card">No history found yet.</div>`;
      return;
    }

    list.innerHTML = "";

    data.results.forEach(r => {
      let badgeClass = "ok";
      if (r.plagiarism_percentage > 20) badgeClass = "bad";
      else if (r.plagiarism_percentage > 17) badgeClass = "warn";

      list.innerHTML += `
        <div class="list-card">
          <div class="list-row">
            <div>
              <b>${r.title}</b><br>
              <small>${r.created_at}</small>
            </div>

            <div style="text-align:right;">
              <span class="badge ${badgeClass}">
                ${r.plagiarism_percentage}% • ${r.verdict}
              </span>
              <br><br>
              <a class="btn btn-green" style="text-decoration:none; padding:8px 12px; display:inline-block;"
                 target="_blank" href="/api/report/${r.report_id}/">
                 📄 Download PDF
              </a>
            </div>
          </div>
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
    list.innerHTML = `<div class="list-card">❌ Failed to load history</div>`;
  }
});
