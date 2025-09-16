export default function UploadButton({ onUpload }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) onUpload(file);
  };

  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700">
        Upload audio file (mp3/wav)
      </label>
      <input
        type="file"
        accept="audio/*"
        onChange={handleFile}
        className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
      />
    </div>
  );
}
