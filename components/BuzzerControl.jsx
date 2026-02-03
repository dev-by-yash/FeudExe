"use client";

import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

export default function BuzzerControl({ gameId }) {
  const [buzzerState, setBuzzerState] = useState('disabled'); // disabled, ready, locked
  const [buzzerWinner, setBuzzerWinner] = useState(null);
  const [buzzerHistory, setBuzzerHistory] = useState([]);
  const [teams, setTeams] = useState([]);

  const {
    buzzerPressed,
    clearBuzzerPressed,
    updateGameState,
    isConnected
  } = useSocket(gameId);

  // Load teams
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

  // Handle buzzer press events
  useEffect(() => {
    if (buzzerPressed && buzzerState === 'ready') {
      setBuzzerWinner(buzzerPressed);
      setBuzzerState('locked');
      setBuzzerHistory(prev => [...prev, {
        ...buzzerPressed,
        timestamp: new Date().toLocaleTimeString()
      }]);

      // Auto-reset after 5 seconds
      setTimeout(() => {
        resetBuzzer();
      }, 5000);
    }
  }, [buzzerPressed, buzzerState]);

  const enableBuzzer = () => {
    setBuzzerState('ready');
    setBuzzerWinner(null);
    clearBuzzerPressed();
    
    // Notify all clients
    updateGameState({
      buzzerState: 'ready',
      message: 'Buzzer is now active!'
    });
  };

  const resetBuzzer = () => {
    setBuzzerState('disabled');
    setBuzzerWinner(null);
    clearBuzzerPressed();
    
    // Notify all clients
    updateGameState({
      buzzerState: 'disabled',
      message: 'Buzzer reset'
    });
  };

  const clearHistory = () => {
    setBuzzerHistory([]);
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t._id === teamId);
    return team?.name || 'Unknown Team';
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">Buzzer Control</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-sm text-gray-300">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Buzzer Status */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
            buzzerState === 'ready' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
            buzzerState === 'locked' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
            'bg-gray-500/20 text-gray-300 border border-gray-400/30'
          }`}>
            {buzzerState === 'ready' && '🟢 BUZZER ACTIVE'}
            {buzzerState === 'locked' && '🔴 BUZZER LOCKED'}
            {buzzerState === 'disabled' && '⚫ BUZZER DISABLED'}
          </div>
        </div>

        {buzzerWinner && (
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 mb-4">
            <h4 className="text-lg font-bold text-yellow-300 mb-2">🏆 Buzzer Winner!</h4>
            <p className="text-white">
              <strong>{buzzerWinner.playerName}</strong> from <strong>{getTeamName(buzzerWinner.teamId)}</strong>
            </p>
            <p className="text-gray-300 text-sm mt-1">
              Time: {new Date(buzzerWinner.timestamp).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={enableBuzzer}
          disabled={buzzerState === 'ready'}
          className="py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          Enable Buzzer
        </button>

        <button
          onClick={resetBuzzer}
          className="py-3 px-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300"
        >
          Reset Buzzer
        </button>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Keyboard Shortcuts</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div><kbd className="px-1 py-0.5 bg-white/20 rounded">B</kbd> Enable Buzzer</div>
          <div><kbd className="px-1 py-0.5 bg-white/20 rounded">R</kbd> Reset Buzzer</div>
        </div>
      </div>

      {/* Buzzer History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-white">Recent Buzzes</h4>
          {buzzerHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Clear History
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {buzzerHistory.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No buzzer activity yet</p>
          ) : (
            buzzerHistory.slice(-5).reverse().map((buzz, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">{buzz.playerName}</p>
                    <p className="text-gray-300 text-sm">{getTeamName(buzz.teamId)}</p>
                  </div>
                  <p className="text-gray-400 text-xs">{buzz.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}