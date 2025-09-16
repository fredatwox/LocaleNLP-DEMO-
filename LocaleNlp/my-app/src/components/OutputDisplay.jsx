export default function OutputDisplay({ text }) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 text-gray-800 min-h-[80px]">
      {text || "Your translation will appear here"}
    </div>
  );
}
