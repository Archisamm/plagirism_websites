document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.getElementById("uploadBtn");
  const fileInput = document.getElementById("fileInput");
  const statusBox = document.getElementById("status");
  const resultBox = document.getElementById("resultBox");
  const percentageSpan = document.getElementById("percentage");
  const verdictSpan = document.getElementById("verdict");
  const downloadBtn = document.getElementById("downloadBtn");

  let currentReportId = null;

  // ✅ Safety checks
  if (!uploadBtn || !fileInput) {
    console.error("Dashboard elements missing. Check dashboard.html IDs.");
    return;
  }

  // ✅ Load last saved result
  const savedResult = localStorage.getItem("lastPlagiarismResult");
  if (savedResult) {
    try {
      const data = JSON.parse(savedResult);
      percentageSpan.textContent = data.plagiarism_percentage;
      verdictSpan.textContent = data.verdict;
      currentReportId = data.report_id;

      resultBox.classList.remove("hidden");
      statusBox.textContent = "✅ Last analysis loaded";
    } catch {
      localStorage.removeItem("lastPlagiarismResult");
    }
  }

  // ✅ Upload handler
  uploadBtn.addEventListener("click", async () => {
    if (!fileInput.files.length) {
      statusBox.textContent = "❌ Please choose a file first";
      return;
    }

    uploadBtn.disabled = true;
    uploadBtn.textContent = "⏳ Analyzing...";

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    statusBox.textContent = "⏳ Uploading & analyzing...";
    resultBox.classList.add("hidden");

    try {
      const response = await fetch("/api/upload/", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }

      const data = await response.json();

      localStorage.setItem("lastPlagiarismResult", JSON.stringify(data));
      currentReportId = data.report_id;

      percentageSpan.textContent = data.plagiarism_percentage;
      verdictSpan.textContent = data.verdict;

      statusBox.textContent = "✅ Analysis complete";
      resultBox.classList.remove("hidden");

    } catch (error) {
      console.error("Upload error:", error);
      statusBox.textContent = "❌ Error: Upload failed (see console)";
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = "Analyze Document";
    }
  });

  // ✅ Download report
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      if (!currentReportId) {
        alert("❌ No report available");
        return;
      }
      window.open(`/api/report/${currentReportId}/`, "_blank");
    });
  }
});
