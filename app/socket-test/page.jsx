"use client";

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function SocketTest() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameId, setGameId] = useState('test-game-123');
  const [logs, setLogs] = useState([]);
  const [buzzerReady, setBuzzerReady] = useState(false);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      addLog(`✅ Connected with socket ID: ${newSocket.id}`);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      addLog("❌ Disconnected from server");
    });

    newSocket.on("buzzer-ready", () => {
      setBuzzerReady(true);
      addLog("🔔 Received buzzer-ready event!");
    });

    newSocket.on("buzzer-reset", () => {
      setBuzzerReady(false);
      addLog("🔄 Received buzzer-reset event!");
    });

    newSocket.on("game-state-updated", (data) => {
      addLog(`📡 Received game-state-updated: ${JSON.stringify(data)}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinGame = () => {
    if (socket && gameId) {
      socket.emit('join-game', gameId);
      addLog(`📥 Joined game room: ${gameId}`);
    }
  };

  const enableBuzzer = () => {
    if (socket && gameId) {
      socket.emit('buzzer-ready', gameId);
      addLog(`🔔 Emitted buzzer-ready for game: ${gameId}`);
    }
  };

  const resetBuzzer = () => {
    if (socket && gameId) {
      socket.emit('buzzer-reset', gameId);
      addLog(`🔄 Emitted buzzer-reset for game: ${gameId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Socket.IO Test Page</h1>

        {/* Connection Status */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Connection Status</h2>
          <div className="flex items-center space-x-4">
            <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-white">{isConnected ? 'Connected' : 'Disconnected'}</span>
            {socket && <span className="text-gray-400">Socket ID: {socket.id}</span>}
          </div>
        </div>

        {/* Game ID Input */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Game ID</h2>
          <input
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
            placeholder="Enter game ID"
          />
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Controls</h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={joinGame}
              disabled={!isConnected || !gameId}
              className="py-3 px-4 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Game
            </button>
            <button
              onClick={enableBuzzer}
              disabled={!isConnected || !gameId}
              className="py-3 px-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enable Buzzer
            </button>
            <button
              onClick={resetBuzzer}
              disabled={!isConnected || !gameId}
              className="py-3 px-4 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset Buzzer
            </button>
          </div>
        </div>

        {/* Buzzer Status */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Buzzer Status</h2>
          <div className={`text-center py-8 rounded-lg ${buzzerReady ? 'bg-green-500/20 border-2 border-green-400' : 'bg-gray-500/20 border-2 border-gray-400'}`}>
            <div className="text-4xl font-bold text-white">
              {buzzerReady ? '🟢 BUZZER READY' : '⚫ BUZZER DISABLED'}
            </div>
          </div>
        </div>

        {/* Event Logs */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Event Logs</h2>
          <div className="bg-black/30 rounded-lg p-4 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400">No events yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-gray-300 font-mono text-sm mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => setLogs([])}
            className="mt-4 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Clear Logs
          </button>
        </div>
      </div>
    </div>
  );
}
