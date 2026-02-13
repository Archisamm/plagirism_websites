document.addEventListener("DOMContentLoaded", async () => {
  const box = document.getElementById("reportsBox");
  const status = document.getElementById("status");

  try {
    status.textContent = "⏳ Loading reports...";

    const res = await fetch("/api/recent-results/");
    const data = await res.json();

    if (!data.results || !data.results.length) {
      status.textContent = "No reports found.";
      box.innerHTML = "";
      return;
    }

    status.textContent = `✅ Showing ${data.results.length} reports`;

    box.innerHTML = data.results.map(r => `
      <div class="match-card">
        <div><b>📄 Title:</b> ${r.title}</div>
        <div><b>📌 Score:</b> ${r.plagiarism_percentage}%</div>
        <div><b>✅ Verdict:</b> ${r.verdict}</div>
        <div><b>🕒 Date:</b> ${r.created_at}</div>

        <button class="btn btn-primary" style="margin-top:12px;"
          onclick="downloadReport(${r.report_id})">
          📥 Download PDF Report
        </button>
      </div>
    `).join("");

  } catch (err) {
    console.error(err);
    status.textContent = "❌ Error loading reports";
  }
});

function downloadReport(reportId) {
  if (!reportId) {
    alert("No report id found!");
    return;
  }
  window.open(`/api/report/${reportId}/`, "_blank");
}
