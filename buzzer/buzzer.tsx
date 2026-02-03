"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface BuzzerProps {
  gameId?: string;
  serverUrl?: string;
}

export default function Buzzer({ gameId = "default-game", serverUrl }: BuzzerProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [team, setTeam] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Waiting for host...");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = serverUrl || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
      if (gameId) {
        newSocket.emit("join-game", gameId);
      }
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    newSocket.on("buzzer-ready", () => {
      setReady(true);
      setMessage("BUZZ NOW!");
    });

    newSocket.on("buzz-winner", (winner: string) => {
      setReady(false);
      setMessage(
        winner === team ? "🎉 YOU BUZZED FIRST! 🎉" : `❌ ${winner} buzzed first!`
      );
      
      // Reset after 3 seconds
      setTimeout(() => {
        setMessage("Waiting for host...");
      }, 3000);
    });

    newSocket.on("buzzer-pressed", (data: any) => {
      if (data.teamId !== team) {
        setReady(false);
        setMessage(`❌ ${data.playerName} buzzed first!`);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [gameId, serverUrl, team]);

  const buzz = () => {
    if (!ready || !socket || !team) return;
    
    const buzzerData = {
      gameId,
      teamId: team,
      playerId: `player_${Date.now()}`,
      playerName: nameInput,
      timestamp: Date.now()
    };

    socket.emit("buzzer-press", buzzerData);
    setReady(false);
    setMessage("Buzzed! Waiting for results...");
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && ready && team) {
        event.preventDefault();
        buzz();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [ready, team]);

  /* 🔹 STEP 1: JOIN SCREEN */
  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Join Buzzer System
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Team Name
              </label>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your team name"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                onKeyPress={(e) => e.key === 'Enter' && nameInput.trim() && setTeam(nameInput.trim())}
              />
            </div>

            <button
              disabled={!nameInput.trim()}
              onClick={() => setTeam(nameInput.trim())}
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

  /* 🔹 STEP 2: BUZZER SCREEN */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      
      {/* Team Info */}
      <div className="relative z-10 text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {team}
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </p>
      </div>

      {/* Game Status */}
      <div className="relative z-10 text-center mb-8">
        <h2 className="text-2xl text-yellow-400 font-semibold">
          {message}
        </h2>
      </div>

      {/* Buzzer Button */}
      <div className="relative z-10 mb-8">
        <button
          disabled={!ready || !isConnected}
          onClick={buzz}
          className={`
            w-64 h-64 rounded-full text-6xl font-black border-8 transition-all duration-300 transform
            ${ready && isConnected
              ? 'bg-gradient-to-br from-red-500 to-red-700 border-red-300 hover:scale-110 hover:shadow-2xl hover:shadow-red-500/50 active:scale-95 cursor-pointer'
              : 'bg-gray-600 border-gray-400 cursor-not-allowed opacity-50'
            }
          `}
        >
          BUZZ
        </button>
      </div>

      {/* Instructions */}
      <div className="relative z-10 text-center">
        <p className="text-gray-400">
          Press <kbd className="px-2 py-1 bg-white/20 rounded text-white">SPACE</kbd> to buzz
        </p>
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