alert("JS CONNECTED");

let currentMode = "paraphrase";

// ─── INIT ─────────────────────────────────────────────
function init() {
  updateCharCount();
}

// ─── MODE SELECTOR ─────────────────────────────────────
function setMode(mode) {
  currentMode = mode;

  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  document.getElementById("btn-" + mode).classList.add("active");
}

// ─── CHARACTER COUNTER ─────────────────────────────────
function updateCharCount() {
  const text = document.getElementById("inputText").value;
  document.getElementById("charCount").textContent = text.length;
}

// ─── MAIN FUNCTION ─────────────────────────────────────
async function processText() {
  console.log("BUTTON CLICKED");

  const inputText = document.getElementById("inputText").value.trim();
  const runBtn    = document.getElementById("runBtn");
  const outputEl  = document.getElementById("output");
  const errorEl   = document.getElementById("errorMsg");
  const actionsEl = document.getElementById("outputActions");

  // Reset error
  errorEl.style.display = "none";
  errorEl.textContent = "";

  // Validasi
  if (!inputText) {
    showError("Text must be filled.");
    return;
  }

  if (inputText.length > 3000) {
    showError("Text is too long. Maximum 3000 characters.");
    return;
  }

  // Loading state
  runBtn.disabled = true;
  runBtn.textContent = "ᯓ Processing...";
  outputEl.innerHTML = '<span class="placeholder">Waiting for AI response...</span>';
  actionsEl.style.display = "none";

  try {
    console.log("SENDING REQUEST...");

    const response = await fetch("http://127.0.0.1:3000/rewrite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: inputText,
        mode: currentMode
      })
    });

    console.log("RESPONSE STATUS:", response.status);

    if (!response.ok) {
      throw new Error("Server error: " + response.status);
    }

    const data = await response.json();
    console.log("RESPONSE DATA:", data);

    // Handle error dari backend
    if (data.error) {
      throw new Error(data.error);
    }

    const result = data.result;

    if (!result) {
      console.log("DEBUG FULL:", data);
      throw new Error("No response from AI");
    }

    // Tampilkan hasil
    outputEl.textContent = result;
    actionsEl.style.display = "flex";

  } catch (err) {
    console.error("FRONTEND ERROR:", err);

    outputEl.innerHTML = '<span class="placeholder">Failed to process text.</span>';
    showError("Error: " + (err.message || "Something went wrong"));
  } finally {
    runBtn.disabled = false;
    runBtn.textContent = "⋙ Process with AI";
  }
}

// ─── COPY OUTPUT ───────────────────────────────────────
function copyOutput() {
  const text = document.getElementById("output").textContent;
  const btn  = document.getElementById("copyBtn");

  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = "✓ Copied!";
    btn.classList.add("success");

    setTimeout(() => {
      btn.textContent = "🗎 Copy output";
      btn.classList.remove("success");
    }, 2000);
  });
}

// ─── USE AS INPUT ──────────────────────────────────────
function useAsInput() {
  const result = document.getElementById("output").textContent;

  document.getElementById("inputText").value = result;
  updateCharCount();
  document.getElementById("inputText").focus();

  document.getElementById("output").innerHTML =
    '<span class="placeholder">Output will be here...</span>';
  document.getElementById("outputActions").style.display = "none";
}

// ─── ERROR HANDLER ─────────────────────────────────────
function showError(message) {
  const el = document.getElementById("errorMsg");
  el.textContent = message;
  el.style.display = "block";
}

// ─── SHORTCUT ──────────────────────────────────────────
document.addEventListener("keydown", function(e) {
  if (e.ctrlKey && e.key === "Enter") {
    processText();
  }
});

// ─── RUN INIT ──────────────────────────────────────────
init();