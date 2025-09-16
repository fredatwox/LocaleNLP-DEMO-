# LocaleNLP-DEMO-

# 🌍 LocaleNLP Translator

An interactive text translation and (future) transcription app designed to break language barriers.  
Built with **React (frontend)** + **Node.js/Express (backend)** + **TailwindCSS**.  
Recent translations are cached locally so you can revisit them even offline.

---

## 🚀 Tech Stack

**Frontend**
- React + Vite
- TailwindCSS
- i18next (localization support)
- Axios (API calls)
- LocalStorage (recent history)

**Backend**
- Node.js + Express
- Translation API integration (e.g., [LibreTranslate](https://libretranslate.com/) or Google Translate)
- CORS enabled for frontend communication

---

## ⚙️ Running the Project Locally

### 1. Clone Repository
```bash
git clone https://github.com/fredatwox/locale-NLP-DEMO-.git
cd localenlp-demo



⚡ Known Limitations

Currently supports text translation only.

Requires a valid API key for external translation API.

No database persistence → everything is handled in-memory.


🚧 Future Extensions

Integrate speech-to-text using OpenAI Whisper
 or Google Speech API.

Add authentication so users can save translation history across devices.

Extend support for more African languages and domain-specific dictionaries.

Improve caching with IndexedDB or a backend database (MongoDB/Postgres).

Deploy backend + frontend together on Render, Railway, or Heroku.
