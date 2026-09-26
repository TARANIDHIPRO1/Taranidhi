import { $app, clear, showToast } from "../dom";
import { requestOtp, verifyOtp, setSession } from "../api";
import { navigate } from "../router";

export function renderLogin() {
  const app = $app();
  clear(app);

  app.innerHTML = `
    <div class="screen login-screen">
      <div class="logo">☉</div>
      <h1>OccultViision</h1>
      <p class="subtitle">Vedic Astrology — Muhurta &amp; KP</p>

      <div id="step-phone">
        <label>Phone Number</label>
        <div class="input-row">
          <span class="prefix">+91</span>
          <input id="phone" type="tel" maxlength="10" placeholder="9876543210" inputmode="numeric" />
        </div>
        <button id="btn-otp" class="btn-primary">Send OTP</button>
      </div>

      <div id="step-otp" class="hidden">
        <label>Enter OTP</label>
        <input id="otp-code" type="tel" maxlength="6" placeholder="000000" inputmode="numeric" />
        <button id="btn-verify" class="btn-primary">Verify &amp; Login</button>
        <button id="btn-back" class="btn-link">← Change number</button>
      </div>

      <div id="login-loading" class="hidden">
        <div class="spinner"></div>
      </div>
    </div>
  `;

  let phone = "";

  const phoneInput = document.getElementById("phone") as HTMLInputElement;
  const btnOtp = document.getElementById("btn-otp")!;
  const stepPhone = document.getElementById("step-phone")!;
  const stepOtp = document.getElementById("step-otp")!;
  const otpInput = document.getElementById("otp-code") as HTMLInputElement;
  const btnVerify = document.getElementById("btn-verify")!;
  const btnBack = document.getElementById("btn-back")!;
  const loading = document.getElementById("login-loading")!;

  btnOtp.addEventListener("click", async () => {
    phone = phoneInput.value.trim();
    if (!/^\d{10}$/.test(phone)) {
      showToast("Enter a valid 10-digit phone number", true);
      return;
    }
    btnOtp.setAttribute("disabled", "");
    loading.classList.remove("hidden");

    const res = await requestOtp(phone);
    loading.classList.add("hidden");
    btnOtp.removeAttribute("disabled");

    if (res.ok) {
      stepPhone.classList.add("hidden");
      stepOtp.classList.remove("hidden");
      otpInput.focus();
      showToast("OTP sent!");
    } else {
      showToast(res.data?.error ?? "Failed to send OTP", true);
    }
  });

  btnBack.addEventListener("click", () => {
    stepOtp.classList.add("hidden");
    stepPhone.classList.remove("hidden");
    phoneInput.focus();
  });

  btnVerify.addEventListener("click", async () => {
    const code = otpInput.value.trim();
    if (!/^\d{4,6}$/.test(code)) {
      showToast("Enter the OTP code", true);
      return;
    }
    btnVerify.setAttribute("disabled", "");
    loading.classList.remove("hidden");

    // Generate a simple device fingerprint
    const fp = `pwa-${navigator.userAgent.slice(0, 40)}-${screen.width}x${screen.height}`;

    const res = await verifyOtp(phone, code, fp);
    loading.classList.add("hidden");
    btnVerify.removeAttribute("disabled");

    if (res.ok && res.data?.session_token) {
      setSession(res.data.session_token);
      showToast("Logged in!");
      navigate("/dashboard");
    } else {
      showToast(res.data?.error ?? "Verification failed", true);
    }
  });
}
