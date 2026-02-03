"use client";

import { useState, useEffect } from "react";
import styles from "./control.module.css";
import BackToHome from "../../components/BackToHome";
import BuzzerControl from "../../components/BuzzerControl";
import BuzzerLink from "../../components/BuzzerLink";

export default function ControlPanel() {
  const [teamA, setTeamA] = useState("Team A");
  const [teamB, setTeamB] = useState("Team B");
  const [gameId, setGameId] = useState("default-game");

  // --- ACTIONS ---
  const revealAnswer = (num) => {
    console.log("Reveal answer", num);
  };

  const strike = () => {
    console.log("Strike ❌");
  };

  const startTimer = () => {
    console.log("Timer started");
  };

  const resetTimer = () => {
    console.log("Timer reset");
  };

  const nextQuestion = () => {
    console.log("Next question");
  };

  const updateScore = (team, delta) => {
    console.log(`${team} score ${delta > 0 ? "+" : ""}${delta}`);
  };

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handler = (e) => {
      if (e.key >= "1" && e.key <= "6") revealAnswer(Number(e.key));
      if (e.key === "x" || e.key === "X") strike();
      if (e.key === " ") {
        e.preventDefault();
        startTimer();
      }
      // Buzzer controls
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        // Enable buzzer - handled by BuzzerControl component
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        // Reset buzzer - handled by BuzzerControl component
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <BackToHome />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Game Control Panel</h1>
          <p className="text-gray-300">Host controls for managing the game</p>
        </div>

        {/* Main Control Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          
          {/* LEFT - Team Setup */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Team Setup</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Team A</label>
                <select 
                  onChange={(e) => setTeamA(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                >
                  <option>Team A</option>
                  <option>Team One</option>
                  <option>Team Two</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Team B</label>
                <select 
                  onChange={(e) => setTeamB(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                >
                  <option>Team B</option>
                  <option>Team Three</option>
                  <option>Team Four</option>
                </select>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300">
                Start Feud
              </button>
            </div>
          </div>

          {/* CENTER - Game Controls */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Game Controls</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  className="py-2 px-4 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all duration-300" 
                  onClick={startTimer}
                >
                  Start Timer
                </button>

                <button 
                  className="py-2 px-4 bg-gray-500/20 border border-gray-400/30 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-all duration-300" 
                  onClick={resetTimer}
                >
                  Reset Timer
                </button>
              </div>

              <button
                className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300"
                onClick={strike}
              >
                ❌ Strike
              </button>

              <div className="border-t border-white/20 pt-4">
                <h3 className="text-lg font-semibold text-white mb-3">Score Control</h3>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    className="py-2 px-3 bg-green-500/20 border border-green-400/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-all duration-300 text-sm"
                    onClick={() => updateScore(teamA, +10)}
                  >
                    ➕ {teamA}
                  </button>

                  <button
                    className="py-2 px-3 bg-red-500/20 border border-red-400/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-sm"
                    onClick={() => updateScore(teamA, -10)}
                  >
                    ➖ {teamA}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    className="py-2 px-3 bg-green-500/20 border border-green-400/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-all duration-300 text-sm"
                    onClick={() => updateScore(teamB, +10)}
                  >
                    ➕ {teamB}
                  </button>

                  <button
                    className="py-2 px-3 bg-red-500/20 border border-red-400/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-sm"
                    onClick={() => updateScore(teamB, -10)}
                  >
                    ➖ {teamB}
                  </button>
                </div>
              </div>

              <button
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-violet-700 transition-all duration-300"
                onClick={nextQuestion}
              >
                Next Question
              </button>
            </div>
          </div>

          {/* RIGHT - Answer Reveals */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Answer Reveals</h2>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  className="aspect-square bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-all duration-300 font-bold text-xl"
                  onClick={() => revealAnswer(n)}
                >
                  {n}
                </button>
              ))}
            </div>

            <button className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-black text-2xl rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-300">
              BIG ❌
            </button>

            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Keyboard Shortcuts</h4>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                <div><kbd className="px-1 py-0.5 bg-white/20 rounded">1-6</kbd> Reveal</div>
                <div><kbd className="px-1 py-0.5 bg-white/20 rounded">X</kbd> Strike</div>
                <div><kbd className="px-1 py-0.5 bg-white/20 rounded">Space</kbd> Timer</div>
                <div><kbd className="px-1 py-0.5 bg-white/20 rounded">B</kbd> Buzzer</div>
              </div>
            </div>
          </div>
        </div>

        {/* Buzzer Control Section */}
        <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BuzzerControl gameId={gameId} />
          <BuzzerLink gameId={gameId} />
        </div>
      </div>
    </>
  );
}
