let fpOtpVerified = false;
let cooldown = false;

async function sendForgotOtp() {
  const email = document.getElementById("fpEmail").value.trim();
  const btn = document.getElementById("fpSendOtpBtn");

  if (!email) return alert("Enter email");

  if (cooldown) return alert("Wait before resending OTP");

  btn.disabled = true;
  btn.innerText = "⏳ Sending OTP...";

  const fd = new FormData();
  fd.append("email", email);

  try {
    const res = await fetch("/accounts/send-email-otp/", { method:"POST", body: fd });
    const data = await res.json();
    if (data.error) alert(data.error);
    else alert("✅ OTP sent");

    // cooldown
    cooldown = true;
    let sec = 30;
    const timer = setInterval(() => {
      sec--;
      btn.innerText = `Resend in ${sec}s`;
      if (sec <= 0) {
        clearInterval(timer);
        cooldown = false;
        btn.disabled = false;
        btn.innerText = "Resend OTP";
      }
    }, 1000);

  } catch (e) {
    console.error(e);
    alert("Failed to send OTP");
    btn.disabled = false;
    btn.innerText = "Send OTP";
  }
}

async function verifyForgotOtp() {
  const email = document.getElementById("fpEmail").value.trim();
  const otp = document.getElementById("fpOtp").value.trim();
  const btn = document.getElementById("fpVerifyOtpBtn");

  if (!email || !otp) return alert("Enter email + OTP");

  btn.disabled = true;
  btn.innerText = "⏳ Verifying...";

  const fd = new FormData();
  fd.append("email", email);
  fd.append("otp", otp);

  const res = await fetch("/accounts/verify-email-otp/", { method:"POST", body: fd });
  const data = await res.json();

  if (data.verified) {
    fpOtpVerified = true;
    alert("✅ OTP Verified");
  } else {
    fpOtpVerified = false;
    alert(data.error || "OTP invalid");
  }

  btn.disabled = false;
  btn.innerText = "Verify OTP";
}

async function resetPassword() {
  const email = document.getElementById("fpEmail").value.trim();
  const newPass = document.getElementById("fpNewPassword").value;
  const confirm = document.getElementById("fpConfirmPassword").value;

  if (!fpOtpVerified) return alert("Verify OTP first");
  if (!newPass || !confirm) return alert("Enter new password");
  if (newPass !== confirm) return alert("Passwords not matching");

  const fd = new FormData();
  fd.append("email", email);
  fd.append("new_password", newPass);

  const res = await fetch("/accounts/reset-password/", { method:"POST", body: fd });
  const data = await res.json();

  if (data.error) alert("❌ " + data.error);
  else {
    alert("✅ Password reset successful");
    window.location.href = "/login/";
  }
}
