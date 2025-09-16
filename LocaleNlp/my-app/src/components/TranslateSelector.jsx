// Translator.jsx
import { useState } from "react";
import { Loader2, Repeat, Copy } from "lucide-react";

export default function Translator() {
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("de");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError("Please enter text to translate.");
      return;
    }

    setLoading(true);
    setError("");
    setTranslation("");

    try {
      const res = await fetch("http://localhost:5000/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          source: sourceLang,
          target: targetLang,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch translation");

      const data = await res.json();
      setTranslation(data.translatedText);
    } catch (err) {
      console.error("Translation failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setTranslation("");
    setText(""); // optional: clear text when swapping
  };

  const handleCopy = () => {
    if (translation) {
      navigator.clipboard.writeText(translation).then(() => {
        alert("Copied to clipboard!");
      });
    }
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "de", name: "German" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "it", name: "Italian" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
  ];

  return (
    <div className="flex flex-col items-center gap-6 bg-white/90 p-6 rounded-2xl shadow-xl w-[32rem]">
      <h1 className="text-2xl font-bold text-blue-600">Language Translator</h1>

      {/* Language Selection */}
      <div className="flex items-center gap-4">
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="p-2 border rounded"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>

        {/* Swap button */}
        <button
          onClick={swapLanguages}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
          title="Swap languages"
        >
          <Repeat className="w-5 h-5" />
        </button>

        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="p-2 border rounded"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Text input
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError("");
        }}
        placeholder="Type text to translate..."
        className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-400 resize-none"
      /> */}

      {/* Translate button */}
      <button
        onClick={handleTranslate}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Translating..." : "Translate"}
      </button>

      {/* Error message */}
      {error && <p className="text-red-500 font-medium">{error}</p>}

      {/* Output */}
      {translation && (
        <div className="mt-4 relative w-full">
          <textarea
            value={translation}
            readOnly
            rows={6}
            className="w-full border border-gray-300 rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-2 py-1 rounded flex items-center gap-1"
          >
            <Copy className="w-4 h-4" /> Copy
          </button>
        </div>
      )}
    </div>
  );
}
