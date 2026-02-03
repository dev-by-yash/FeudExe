"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateGameCode } from '../../lib/activeGame';

export default function StartGame() {
  const router = useRouter();
  const [gameCode, setGameCode] = useState('');
  const [loading, setLoading] = useState(false);

  const createNewGame = () => {
    const newCode = generateGameCode();
    router.push(`/control?gameCode=${newCode}`);
  };

  const joinGame = () => {
    if (!gameCode.trim()) {
      alert('Please enter a game code');
      return;
    }
    router.push(`/control?gameCode=${gameCode.toUpperCase()}`);
  };

  const joinAsBuzzer = () => {
    if (!gameCode.trim()) {
      alert('Please enter a game code');
      return;
    }
    router.push(`/buzzer?gameCode=${gameCode.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">FEUD.EXE</h1>
          <p className="text-xl text-gray-300">Start or Join a Game</p>
        </div>

        {/* Create New Game */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">🎮 Create New Game</h2>
          <p className="text-gray-300 mb-6">
            Start a new game and get a unique game code to share with players
          </p>
          <button
            onClick={createNewGame}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg"
          >
            Create New Game
          </button>
        </div>

        {/* Join Existing Game */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">🔗 Join Existing Game</h2>
          <p className="text-gray-300 mb-6">
            Enter the game code to join as host or player
          </p>
          
          <input
            type="text"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            placeholder="Enter Game Code (e.g., ABC123)"
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white text-center text-2xl font-bold placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 mb-4"
            maxLength={6}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={joinGame}
              disabled={!gameCode.trim()}
              className="py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Join as Host
            </button>
            
            <button
              onClick={joinAsBuzzer}
              disabled={!gameCode.trim()}
              className="py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Join as Player
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">How It Works</h3>
            <div className="text-gray-300 text-sm space-y-2">
              <p>1. <strong>Host</strong> creates a new game and gets a code</p>
              <p>2. <strong>Players</strong> join using the game code</p>
              <p>3. <strong>Everyone</strong> uses the same code to stay in sync</p>
              <p>4. <strong>Simple!</strong> No complex setup needed</p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
