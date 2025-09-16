// api.js - Centralized API helpers

// Get backend base URL from .env (fallback: same origin)
const API_BASE = import.meta.env.VITE_API_BASE || "";

/**
 * Handles API responses safely.
 */
async function handleResponse(res) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `API Error ${res.status}: ${errorText || res.statusText}`
    );
  }
  try {
    return await res.json();
  } catch {
    throw new Error("Invalid JSON response from server");
  }
}

/**
 * Translate text.
 * @param {string} text - Input text to translate
 * @param {string} target - Target language (default: 'en')
 * @param {string} source - Source language (default: 'auto')
 */
export async function translateText(text, target = "en", source = "auto") {
  try {
    const res = await fetch(`${API_BASE}/api/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target, source }),
    });
    return await handleResponse(res);
  } catch (err) {
    console.error("translateText failed:", err.message);
    return { error: err.message };
  }
}

/**
 * Transcribe audio file.
 * @param {File} file - Audio file to transcribe
 */
export async function transcribeFile(file) {
  const form = new FormData();
  form.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/api/transcribe`, {
      method: "POST",
      body: form,
    });
    return await handleResponse(res);
  } catch (err) {
    console.error("transcribeFile failed:", err.message);
    return { error: err.message };
  }
}
