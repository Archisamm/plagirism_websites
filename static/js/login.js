async function loginUser() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);

  try {
    const res = await fetch("/accounts/login/", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.error) {
      alert("❌ " + data.error);
      return;
    }

    // Save role for navbar/dashboard rendering
    localStorage.setItem("selectedRole", data.role);

    alert("✅ Login successful!");
    window.location.href = "/dashboard/";

  } catch (err) {
    console.error(err);
    alert("Login failed");
  }
}
