// recentSubmissions.js
const CACHE_KEY = "recent_submissions";

const loadHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || [];
  } catch (e) {
    console.error("Failed to parse recent submissions:", e);
    return [];
  }
};

export const saveSubmission = (submission) => {
  let history = loadHistory();

  // Add newest at the front
  history.unshift({
    ...submission,
    timestamp: new Date().toISOString(),
  });

  // Keep only last 5
  history = history.slice(0, 5);

  localStorage.setItem(CACHE_KEY, JSON.stringify(history));
};

export const getSubmissions = () => {
  return loadHistory();
};
