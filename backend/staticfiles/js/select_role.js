async function setRole(role) {
  const status = document.getElementById("status");
  status.textContent = "⏳ Saving role...";

  const formData = new FormData();
  formData.append("role", role);

  try {
    const res = await fetch("/set-role/", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.redirect) {
      status.textContent = "✅ Role saved! Redirecting...";
      window.location.href = data.redirect;
    } else {
      status.textContent = "❌ " + (data.error || "Error");
    }
  } catch (err) {
    status.textContent = "❌ Failed to save role";
  }
}
