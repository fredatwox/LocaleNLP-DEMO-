import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import axios from "axios";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

// 🌍 Text Translation with Auto-Detect
app.post("/translate", async (req, res) => {
  try {
    const { text, source, target } = req.body;

    if (!text) return res.status(400).json({ error: "Text is required" });
    if (!target) return res.status(400).json({ error: "Target language is required" });

    let finalSource = source;

    // ✅ Auto-detect if missing
    if (!source || source === "auto") {
      const detectRes = await axios.post(
        "https://libretranslate.de/detect",
        { q: text },
        { headers: { "Content-Type": "application/json" } }
      );
      finalSource = detectRes.data?.[0]?.language || "en";
    }

    // ✅ Translate
    const response = await axios.post(
      "https://libretranslate.de/translate",
      {
        q: text,
        source: finalSource,
        target,
        format: "text",
      },
      { headers: { "Content-Type": "application/json" } }
    );

    return res.json({
      translatedText: response.data.translatedText,
      detectedSource: finalSource,
    });
  } catch (err) {
    console.error("Translate Error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Translation failed" });
  }
});

// 🎤 Audio Transcription (+ optional translation)
app.post("/transcribe", upload.single("file"), async (req, res) => {
  const filePath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

    const targetLang = req.body.targetLang || "en";

    // Step 1: Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });

    let textResult = transcription.text || "";
    let detectedSource = "en"; // Whisper mostly outputs English by default

    // Step 2: Translate if targetLang ≠ English
    if (targetLang !== "en") {
      const translateRes = await axios.post(
        "https://libretranslate.de/translate",
        {
          q: textResult,
          source: "en",
          target: targetLang,
          format: "text",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      textResult = translateRes.data.translatedText;
      detectedSource = "en";
    }

    return res.json({
      text: textResult,
      detectedSource,
    });
  } catch (err) {
    console.error("Transcription Error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Transcription failed" });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // cleanup temp file
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT}`)
);



// // server.js
// import express from "express";
// import multer from "multer";
// import cors from "cors";
// import fs from "fs";
// import axios from "axios";
// import OpenAI from "openai";
// import dotenv from "dotenv";
// import pino from "pino";
// import rateLimit from "express-rate-limit";
// import helmet from "helmet";

// dotenv.config();

// const logger = pino({
//   level: process.env.LOG_LEVEL || "info",
//   prettyPrint: process.env.NODE_ENV !== "production",
// });

// const app = express();

// // Security middlewares
// app.use(helmet());
// app.use(express.json({ limit: "1mb" })); // limit body size
// // In production, set specific origin(s)
// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN || true,
//   })
// );

// // Basic rate limiting
// const limiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minute
//   max: parseInt(process.env.RATE_LIMIT_MAX || "60", 10), // 60 requests per minute default
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);

// // Multer setup - store files in uploads/ (ensure directory exists)
// const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
// if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// const maxFileSizeBytes = parseInt(process.env.MAX_FILE_SIZE || `${10 * 1024 * 1024}`, 10); // 10 MB default

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, UPLOAD_DIR),
//   filename: (req, file, cb) => {
//     // Keep original extension while avoiding collisions
//     const ext = file.originalname.includes(".")
//       ? "." + file.originalname.split(".").pop()
//       : "";
//     cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   // Accept common audio mime types
//   if (/^audio\/.+/.test(file.mimetype) || file.mimetype === "video/mp4") {
//     cb(null, true);
//   } else {
//     cb(new Error("Unsupported file type. Only audio files are allowed."), false);
//   }
// };

// const upload = multer({
//   storage,
//   limits: { fileSize: maxFileSizeBytes },
//   fileFilter,
// });

// // OpenAI client
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // Supported languages whitelist — adjust as needed (codes visible on LibreTranslate UI)
// const SUPPORTED_LANGS = new Set([
//   "en", "de", "es", "fr", "it", "pt", "nl", "ru", "ja", "zh", "ko",
//   "bg","eu","eo","ga","kab","ca","cs","uk","hu","sq","gl","scots","ko"
//   // Add or remove according to your target LibreTranslate instance
// ]);

// const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || "https://libretranslate.de/translate";
// const LIBRETRANSLATE_TIMEOUT = parseInt(process.env.LIBRETRANSLATE_TIMEOUT || "10000", 10);

// // Helper: call LibreTranslate with checks
// async function callLibreTranslate({ text, targetLang, source = "auto" }) {
//   const payload = {
//     q: text,
//     source,
//     target: targetLang,
//     format: "text",
//   };

//   const resp = await axios.post(LIBRETRANSLATE_URL, payload, {
//     headers: { "Content-Type": "application/json" },
//     timeout: LIBRETRANSLATE_TIMEOUT,
//     validateStatus: (s) => s >= 200 && s < 500, // treat 4xx/5xx as returnable errors to inspect
//   });

//   // If HTML page returned (common with downed instances)
//   if (typeof resp.data === "string" && resp.data.includes("<!DOCTYPE html>")) {
//     const error = new Error("LibreTranslate returned HTML (likely down or error page)");
//     error.isHtmlResponse = true;
//     error.status = resp.status;
//     throw error;
//   }

//   if (resp.status !== 200) {
//     const error = new Error(`LibreTranslate returned status ${resp.status}`);
//     error.status = resp.status;
//     error.data = resp.data;
//     throw error;
//   }

//   // Typical response: { translatedText: "..." }
//   if (resp.data && (resp.data.translatedText || resp.data.translation)) {
//     return resp.data.translatedText ?? resp.data.translation;
//   }

//   // In some setups, API might return plain string
//   if (typeof resp.data === "string") {
//     return resp.data;
//   }

//   throw new Error("Unexpected response format from LibreTranslate");
// }

// /**
//  * POST /translate
//  * Body: { text: string, targetLang?: string }
//  */
// app.post("/translate", async (req, res) => {
//   const startTs = Date.now();
//   try {
//     const { text, targetLang = "en" } = req.body ?? {};
//     if (!text || typeof text !== "string" || text.trim().length === 0) {
//       return res.status(400).json({ error: "Text is required" });
//     }

//     if (!SUPPORTED_LANGS.has(targetLang)) {
//       return res.status(400).json({ error: "Unsupported targetLang" });
//     }

//     // Optional: limit text length for LibreTranslate and OpenAI
//     const MAX_TEXT_LEN = parseInt(process.env.MAX_TEXT_LENGTH || "20000", 10);
//     const safeText = text.length > MAX_TEXT_LEN ? text.slice(0, MAX_TEXT_LEN) : text;

//     try {
//       const translatedText = await callLibreTranslate({ text: safeText, targetLang });
//       logger.info(
//         { route: "/translate", durationMs: Date.now() - startTs },
//         "Translated with LibreTranslate"
//       );
//       return res.json({ translatedText, provider: "libretranslate" });
//     } catch (ltErr) {
//       logger.warn(
//         { err: ltErr.message, isHtml: ltErr.isHtmlResponse, route: "/translate" },
//         "LibreTranslate failed, attempting OpenAI fallback"
//       );

//       // Fallback to OpenAI Chat completion
//       try {
//         // Trim for token safety
//         const safeForOpenAI = String(safeText).slice(0, 3000);
//         const targetLangName = targetLang === "en" ? "English" : targetLang;

//         // Use a small prompt instructing to return only the translation
//         const completion = await openai.chat.completions.create({
//           model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
//           messages: [
//             {
//               role: "system",
//               content: `You are a concise translation assistant. Translate the user's text to ${targetLangName}. Return only the translated text and nothing else.`
//             },
//             { role: "user", content: safeForOpenAI }
//           ],
//         });

//         const translatedText = completion?.choices?.[0]?.message?.content?.trim();
//         if (!translatedText) {
//           throw new Error("OpenAI returned empty translation");
//         }

//         logger.info({ route: "/translate", provider: "openai" }, "Translated with OpenAI fallback");
//         return res.json({ translatedText, provider: "openai" });
//       } catch (openaiErr) {
//         logger.error({ err: openaiErr.message }, "OpenAI fallback failed");
//         return res.status(502).json({
//           error: "Translation failed",
//           message: "Both LibreTranslate and OpenAI fallback failed",
//           details: openaiErr.message,
//         });
//       }
//     }
//   } catch (err) {
//     logger.error({ err: err.message }, "Internal error in /translate");
//     return res.status(500).json({ error: "Internal server error" });
//   }
// });

// /**
//  * POST /transcribe
//  * Upload form field: file (audio)
//  * Optional body field: targetLang (e.g., "de")
//  */
// app.post("/transcribe", upload.single("file"), async (req, res) => {
//   const startTs = Date.now();
//   const file = req.file;

//   if (!file) {
//     return res.status(400).json({ error: "File is required (field name: file)" });
//   }

//   const filePath = file.path;
//   const targetLang = req.body.targetLang || "en";

//   if (!SUPPORTED_LANGS.has(targetLang)) {
//     // cleanup file immediately
//     try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) {}
//     return res.status(400).json({ error: "Unsupported targetLang" });
//   }

//   try {
//     // Transcribe with OpenAI Whisper
//     const transcription = await openai.audio.transcriptions.create({
//       file: fs.createReadStream(filePath),
//       model: process.env.WHISPER_MODEL || "whisper-1",
//     });

//     let textResult = transcription?.text ?? "";
//     if (!textResult) {
//       throw new Error("No transcription text returned");
//     }

//     // If targetLang is not English, attempt translation via LibreTranslate
//     if (targetLang !== "en") {
//       try {
//         // For best accuracy, let LibreTranslate detect source language
//         const translated = await callLibreTranslate({ text: textResult, targetLang, source: "auto" });
//         textResult = translated;
//       } catch (translateErr) {
//         logger.warn({ err: translateErr.message }, "Translation after transcription failed — returning original transcription");
//         // keep original transcription
//       }
//     }

//     logger.info({ route: "/transcribe", durationMs: Date.now() - startTs }, "Transcription complete");
//     return res.json({ text: textResult });
//   } catch (err) {
//     logger.error({ err: err.message }, "Transcription error");
//     return res.status(500).json({ error: "Transcription failed", details: err.message });
//   } finally {
//     // Always delete uploaded file
//     try {
//       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//     } catch (unlinkErr) {
//       logger.warn({ err: unlinkErr.message }, "Failed to cleanup uploaded file");
//     }
//   }
// });

// // Health check endpoint
// app.get("/health", async (req, res) => {
//   const health = { status: "ok", services: {} };

//   // LibreTranslate quick check (non-costly)
//   try {
//     const resp = await axios.post(
//       LIBRETRANSLATE_URL,
//       { q: "hello", source: "en", target: "es", format: "text" },
//       { headers: { "Content-Type": "application/json" }, timeout: 5000, validateStatus: (s)=>s>=200&&s<500 }
//     );

//     if (typeof resp.data === "string" && resp.data.includes("<!DOCTYPE html>")) {
//       health.services.libretranslate = { status: "unavailable", detail: "HTML response" };
//       health.status = "degraded";
//     } else if (resp.status !== 200) {
//       health.services.libretranslate = { status: "unavailable", statusCode: resp.status };
//       health.status = "degraded";
//     } else {
//       health.services.libretranslate = { status: "available" };
//     }
//   } catch (err) {
//     health.services.libretranslate = { status: "unavailable", error: err.message };
//     health.status = "degraded";
//   }

//   // OpenAI basic check (non-costly): just check that the API key exists
//   if (process.env.OPENAI_API_KEY) {
//     health.services.openai = { status: "key_present" };
//   } else {
//     health.services.openai = { status: "missing_api_key" };
//     health.status = "degraded";
//   }

//   return res.json(health);
// });

// // Fallback route
// app.use((req, res) => {
//   res.status(404).json({ error: "Not found" });
// });

// // Error handler (further centralization)
// app.use((err, req, res, next) => {
//   logger.error({ err: err.message }, "Unhandled error");
//   res.status(500).json({ error: "Internal server error" });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   logger.info(`✅ Backend running on http://localhost:${PORT}`);
// });


