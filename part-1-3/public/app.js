let ldClient = null;
let config = null;

const el = (id) => document.getElementById(id);

function buildContextFromForm() {
  const userKey = el("userKey").value.trim();
  const email = el("email").value.trim();
  const plan = el("plan").value;
  const region = el("region").value;
  const internal = el("internal").value === "true";

  // LaunchDarkly "Context" format (single-kind)
  // If your LD account uses multi-kind contexts, you can extend this later.
  return {
    kind: "user",
    key: userKey || "anonymous",
    email: email || undefined,
    plan,
    region,
    internal
  };
}

function renderBanner(isEnabled) {
  el("flagState").textContent = `Flag state: ${isEnabled ? "ON" : "OFF"}`;

  const container = el("bannerContainer");
  container.innerHTML = "";

  if (!isEnabled) {
    const div = document.createElement("div");
    div.className = "banner";
    div.innerHTML = `
      <strong>Current experience (control):</strong>
      <div class="muted">Standard pricing banner is hidden. (Flag OFF)</div>
    `;
    container.appendChild(div);
    return;
  }

  // New feature experience (treatment)
  const div = document.createElement("div");
  div.className = "banner";
  div.innerHTML = `
    <strong>New experience (treatment):</strong>
    <div style="margin-top:6px;">🎉 Try our <b>New Pro Trial</b> — get setup in minutes.</div>
    <button style="margin-top:10px;" id="ctaBtn" class="primary">Start Pro Trial</button>
    <div id="ctaResult" class="muted" style="margin-top:8px;"></div>
  `;
  container.appendChild(div);

  // Example: track a click as a simple "metric-like" event
  const ctaBtn = document.getElementById("ctaBtn");
  ctaBtn.addEventListener("click", () => {
    document.getElementById("ctaResult").textContent =
      "CTA clicked (you could send this as an event/metric).";
    // If you add Experimentation later, this is where you'd send a custom event.
    // Example (depending on SDK version/features in your LD plan):
    // ldClient.track("cta_clicked");
  });
}

async function loadConfig() {
  const resp = await fetch("/api/config");
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Failed to load /api/config: ${text}`);
  }
  return resp.json();
}

async function connect() {
  config = await loadConfig();
  const context = buildContextFromForm();

  el("status").textContent = "Connecting…";

  // Close any prior client (if user changes context and reconnects)
  if (ldClient && typeof ldClient.close === "function") {
    try {
      ldClient.close();
    } catch (_) {}
  }

  // Initialize LD client-side SDK
  ldClient = LDClient.initialize(config.clientSideId, context);

  // Wait for initialization before reading flags
  await ldClient.waitForInitialization();

  el("status").textContent = "Connected ✅";

  // Initial render
  const flagKey = config.flagKey || "new-pricing-banner";
  const initialValue = ldClient.variation(flagKey, false);
  renderBanner(initialValue);

  /**
   * Listener requirement:
   * "Implement a listener such that toggling the flag instantly switches code
   * (no page reload)" :contentReference[oaicite:3]{index=3}
   */
  ldClient.on("change", (changes) => {
    // changes is an object keyed by flag key
    if (changes && changes[flagKey]) {
      const nextValue = changes[flagKey].current;
      renderBanner(Boolean(nextValue));
    }
  });
}

async function killSwitch() {
  el("killSwitchResult").textContent = "Calling kill switch…";

  try {
    const resp = await fetch("/api/kill-switch", { method: "POST" });
    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      el("killSwitchResult").textContent =
        `Kill switch failed: ${data.error || resp.statusText}`;
      return;
    }

    el("killSwitchResult").textContent =
      "Kill switch executed: flag set to OFF (check LaunchDarkly UI).";
  } catch (e) {
    el("killSwitchResult").textContent = `Kill switch error: ${String(e)}`;
  }
}

// UI wiring
el("connectBtn").addEventListener("click", () => {
  connect().catch((e) => {
    console.error(e);
    el("status").textContent = `Error: ${e.message}`;
  });
});

el("killSwitchBtn").addEventListener("click", () => {
  killSwitch();
});

el("showCurlBtn").addEventListener("click", () => {
  const box = el("curlBox");
  box.style.display = box.style.display === "none" ? "block" : "none";
});