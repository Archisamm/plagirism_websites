async function saveProfile() {
  const fd = new FormData();
  fd.append("display_name", document.getElementById("display_name").value);
  fd.append("role", document.getElementById("role").value);
  fd.append("institution", document.getElementById("institution").value);
  fd.append("phone", document.getElementById("phone").value);
  fd.append("bio", document.getElementById("bio").value);

  const res = await fetch("/accounts/save-profile/", {
    method: "POST",
    body: fd
  });

  const data = await res.json();

  if (data.redirect) {
    window.location.href = data.redirect;
  } else {
    alert(data.error || "Error saving profile");
  }
}
