import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import InputBox from "./components/InputBox";
import UploadButton from "./components/UploadButton";
import OutputDisplay from "./components/OutputDisplay";
import TranslateSelector from "./components/TranslateSelector";

const STORAGE_KEY = "recent_submissions_v2";

function saveRecent(item) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let arr = raw ? JSON.parse(raw) : [];
    arr = [item, ...arr].slice(0, 5); // keep last 5
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {
    console.warn("localStorage save failed", e);
  }
}

function loadRecent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const { t } = useTranslation();
  const [output, setOutput] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [loading, setLoading] = useState(false);
  const [targetLang, setTargetLang] = useState("sw"); // default Swahili
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  // ✅ Submit text for translation
  const handleTextSubmit = async (text) => {
    if (!text) return;
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/translate", {
        text,
        source: "auto", // let backend auto-detect
        target: targetLang,
      });

      const translated = res.data.translatedText || "";
      const detected = res.data.detectedSource || "";

      setOutput(translated);
      setDetectedLang(detected);

      // Save to history
      saveRecent({
        type: "translate",
        input: text,
        output: translated,
        detected,
        target: targetLang,
        time: Date.now(),
      });
      setRecent(loadRecent());
    } catch (err) {
      console.error(err);
      setOutput("❌ Error: Could not translate.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ File upload placeholder
  const handleFileUpload = (file) => {
    setOutput(`(Audio feature coming soon: ${file.name})`);
  };

  // ✅ Use a past translation
  const handleUseRecent = (item) => {
    setOutput(item.output);
    setDetectedLang(item.detected || "");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Header */}
      <header className="w-full max-w-xl flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-white">
          {t("appTitle") || "LocaleNLP Translator"}
        </h1>
      </header>

      {/* Main card */}
      <main className="w-full max-w-xl space-y-4 bg-white rounded-2xl shadow-md p-6 z-10 relative">
        <TranslateSelector targetLang={targetLang} setTargetLang={setTargetLang} />
        <InputBox onSubmit={handleTextSubmit} />
        <UploadButton onUpload={handleFileUpload} />

        {loading ? (
          <p className="text-blue-600">Translating...</p>
        ) : (
          <>
            {detectedLang && (
              <span className="inline-block bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full mb-2">
                🌍 Detected: {detectedLang}
              </span>
            )}
            <OutputDisplay text={output} />
          </>
        )}

        {/* Recent history */}
        <section className="border-t pt-4">
          <h2 className="text-sm font-semibold mb-2 text-gray-800">
            {t("recentLabel") || "Recent Submissions"}
          </h2>
          <ul className="space-y-2">
            {recent.length === 0 && (
              <li className="text-gray-500 text-sm">No recent items</li>
            )}
            {recent.map((r, i) => (
              <li
                key={i}
                className="p-2 rounded bg-gray-100 cursor-pointer hover:bg-gray-200"
                onClick={() => handleUseRecent(r)}
              >
                <div className="text-xs text-gray-600">
                  {new Date(r.time).toLocaleString()}
                </div>
                <div className="font-medium">{r.input}</div>
                <div className="text-sm text-gray-700">→ {r.output}</div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
