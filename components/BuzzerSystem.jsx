"use client";

import { useState, useEffect, useCallback } from 'react';
import { useBuzzer } from '../hooks/useSocket';

export default function BuzzerSystem({ gameId, onBuzzerPress }) {
  const [playerName, setPlayerName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [teams, setTeams] = useState([]);
  const [gameState, setGameState] = useState('waiting');

  // Generate unique player ID
  useEffect(() => {
    setPlayerId(`player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  // Load teams from API
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const response = await fetch('/api/teams');
        const data = await response.json();
        if (data.success) {
          setTeams(data.teams);
        }
      } catch (error) {
        console.error('Failed to load teams:', error);
      }
    };
    loadTeams();
  }, []);

  // Initialize buzzer hook
  const {
    pressBuzzer,
    buzzerPressed,
    clearBuzzerPressed,
    canBuzz,
    buzzCooldown,
    isConnected
  } = useBuzzer(gameId, teamId, playerId, playerName);

  // Handle buzzer press
  const handleBuzzerPress = useCallback(() => {
    if (!canBuzz || !isJoined) return;
    
    const result = pressBuzzer();
    if (result && onBuzzerPress) {
      onBuzzerPress(result);
    }
  }, [canBuzz, isJoined, pressBuzzer, onBuzzerPress]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space' && isJoined) {
        event.preventDefault();
        handleBuzzerPress();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleBuzzerPress, isJoined]);

  // Handle buzzer events
  useEffect(() => {
    if (buzzerPressed) {
      const isWinner = buzzerPressed.teamId === teamId;
      setGameState(isWinner ? 'won' : 'lost');
      
      // Clear after 3 seconds
      setTimeout(() => {
        clearBuzzerPressed();
        setGameState('waiting');
      }, 3000);
    }
  }, [buzzerPressed, teamId, clearBuzzerPressed]);

  const joinGame = () => {
    if (!playerName.trim() || !teamId) return;
    setIsJoined(true);
  };

  const leaveGame = () => {
    setIsJoined(false);
    setPlayerName('');
    setTeamId('');
    setGameState('waiting');
  };

  // Join Screen
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Join Buzzer System
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Select Team
              </label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
              >
                <option value="">Choose your team</option>
                {teams.map((team) => (
                  <option key={team._id} value={team._id} className="bg-slate-800">
                    {team.name} ({team.players?.length || 0} players)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={joinGame}
              disabled={!playerName.trim() || !teamId}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Join Game
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Connection: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Buzzer Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      
      {/* Player Info */}
      <div className="relative z-10 text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {playerName}
        </h1>
        <p className="text-xl text-gray-300">
          Team: {teams.find(t => t._id === teamId)?.name || 'Unknown'}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </p>
      </div>

      {/* Game Status */}
      <div className="relative z-10 text-center mb-8">
        {gameState === 'waiting' && (
          <p className="text-2xl text-yellow-400 animate-pulse">
            Ready to buzz! Press SPACE or click the button
          </p>
        )}
        {gameState === 'won' && (
          <p className="text-3xl text-green-400 font-bold animate-bounce">
            🎉 YOU BUZZED FIRST! 🎉
          </p>
        )}
        {gameState === 'lost' && (
          <p className="text-2xl text-red-400">
            ❌ Too late! {buzzerPressed?.playerName} from {teams.find(t => t._id === buzzerPressed?.teamId)?.name} buzzed first
          </p>
        )}
      </div>

      {/* Buzzer Button */}
      <div className="relative z-10 mb-8">
        <button
          onClick={handleBuzzerPress}
          disabled={!canBuzz || !isConnected}
          className={`
            w-64 h-64 rounded-full text-6xl font-black border-8 transition-all duration-300 transform
            ${canBuzz && isConnected
              ? 'bg-gradient-to-br from-red-500 to-red-700 border-red-300 hover:scale-110 hover:shadow-2xl hover:shadow-red-500/50 active:scale-95'
              : 'bg-gray-600 border-gray-400 cursor-not-allowed opacity-50'
            }
            ${gameState === 'won' ? 'bg-gradient-to-br from-green-500 to-green-700 border-green-300' : ''}
            ${gameState === 'lost' ? 'bg-gradient-to-br from-gray-500 to-gray-700 border-gray-400' : ''}
          `}
        >
          {buzzCooldown > 0 ? buzzCooldown : 'BUZZ'}
        </button>
      </div>

      {/* Instructions */}
      <div className="relative z-10 text-center mb-8">
        <p className="text-gray-400">
          Press <kbd className="px-2 py-1 bg-white/20 rounded text-white">SPACE</kbd> to buzz
        </p>
        {buzzCooldown > 0 && (
          <p className="text-yellow-400 mt-2">
            Cooldown: {buzzCooldown}s
          </p>
        )}
      </div>

      {/* Leave Button */}
      <div className="relative z-10">
        <button
          onClick={leaveGame}
          className="px-6 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
        >
          Leave Game
        </button>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-red-400/30 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 left-1/4 w-1 h-1 bg-yellow-400/40 rounded-full animate-ping delay-500"></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-ping delay-1000"></div>
      </div>
    </div>
  );
}