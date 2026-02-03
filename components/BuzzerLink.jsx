import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function BuzzerLink({ gameId = "default-game", className = "" }) {
  const [origin, setOrigin] = useState('');
  const buzzerUrl = `/buzzer?gameCode=${gameId}`;
  
  useEffect(() => {
    // Set origin on client side to avoid hydration mismatch
    setOrigin(window.location.origin);
  }, []);
  
  return (
    <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 ${className}`}>
      <h3 className="text-2xl font-bold text-white mb-4">Player Buzzer Access</h3>
      
      <div className="space-y-4">
        <div className="text-center mb-4">
          <div className="text-sm text-gray-400 mb-2">Game Code</div>
          <div className="text-4xl font-bold text-yellow-400 tracking-wider">{gameId}</div>
        </div>
        
        <p className="text-gray-300">
          Share this link or game code with players to join the buzzer system:
        </p>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
          <code className="text-yellow-300 text-sm break-all">
            {origin}{buzzerUrl}
          </code>
        </div>
        
        <div className="flex space-x-3">
          <Link 
            href={buzzerUrl}
            className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 text-center"
          >
            Open Buzzer
          </Link>
          
          <button
            onClick={() => {
              if (origin) {
                navigator.clipboard.writeText(origin + buzzerUrl);
                alert('Buzzer link copied to clipboard!');
              }
            }}
            className="py-2 px-4 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
          >
            📋 Copy
          </button>
        </div>
        
        <div className="text-xs text-gray-400">
          <p>• Players enter game code: <strong className="text-yellow-400">{gameId}</strong></p>
          <p>• Real-time buzzer competition</p>
          <p>• Keyboard and touch support</p>
        </div>
      </div>
    </div>
  );
}