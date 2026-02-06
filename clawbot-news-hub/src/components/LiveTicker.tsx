export function LiveTicker() {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-cyan-400">Live Ticker</h3>
      <div className="space-y-2">
        <div className="bg-gray-700 p-2 rounded text-sm">
          <span className="text-cyan-400">NEW:</span> System update available
        </div>
        <div className="bg-gray-700 p-2 rounded text-sm">
          <span className="text-cyan-400">ALERT:</span> Security scan completed
        </div>
        <div className="bg-gray-700 p-2 rounded text-sm">
          <span className="text-cyan-400">INFO:</span> News sources updated
        </div>
      </div>
    </div>
  );
}