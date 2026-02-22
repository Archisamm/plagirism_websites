function selectRole(role) {
  // Save role choice
  localStorage.setItem("selectedRole", role);

  // Redirect to signup page
  window.location.href = "/signup/";
}
