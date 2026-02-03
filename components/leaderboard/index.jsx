"use client";

import { useState, useEffect } from 'react';
import LeaderboardRow from "./LeaderboardRow";
import LeaderboardHeader from "./LeaderboardHeader";
import { leaderboardAPI, teamAPI } from '../../lib/api';
import { useSocket } from '@/hooks/useSocket';

export default function Leaderboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const gameId = typeof window !== 'undefined'
    ? localStorage.getItem('currentGameId') || 'default-game'
    : 'default-game';

  // Use socket for real-time updates
  const { updateGameState, isConnected } = useSocket(gameId);

  // Load leaderboard data
  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get leaderboard data
      const leaderboardResponse = await leaderboardAPI.get();

      if (leaderboardResponse.success && leaderboardResponse.teams) {
        // Sort by score descending
        const sortedTeams = [...leaderboardResponse.teams].sort((a, b) => b.score - a.score);
        setTeams(sortedTeams);
        setLastUpdate(Date.now());
        console.log('✅ Leaderboard loaded:', sortedTeams);
      } else {
        // Fallback to teams API if leaderboard doesn't exist
        const teamsResponse = await teamAPI.getAll();
        if (teamsResponse.success && teamsResponse.teams) {
          const sortedTeams = [...teamsResponse.teams].sort((a, b) => (b.score || 0) - (a.score || 0));
          setTeams(sortedTeams);
          setLastUpdate(Date.now());
          console.log('✅ Loaded from teams API:', sortedTeams);
        } else {
          throw new Error('No teams found');
        }
      }
    } catch (err) {
      console.error('❌ Failed to load leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadLeaderboard();
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadLeaderboard();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Listen for real-time score updates via Socket.IO
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScoreUpdate = (data) => {
      console.log('📡 Real-time score update received:', data);
      // Reload leaderboard when scores change
      loadLeaderboard();
    };

    const handleGameStateUpdate = (data) => {
      console.log('📡 Game state update received:', data);
      // Reload on any game state change
      loadLeaderboard();
    };

    const socket = window.io ? window.io() : null;
    if (socket) {
      socket.on('game-state-updated', handleGameStateUpdate);
      socket.on('score-updated', handleScoreUpdate);
      socket.on('answer-revealed', handleScoreUpdate);

      return () => {
        socket.off('game-state-updated', handleGameStateUpdate);
        socket.off('score-updated', handleScoreUpdate);
        socket.off('answer-revealed', handleScoreUpdate);
      };
    }
  }, []);

  if (loading && teams.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error && teams.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-300 mb-4">Error Loading Leaderboard</h2>
          <p className="text-white mb-6">{error}</p>
          <button
            onClick={loadLeaderboard}
            className="py-2 px-6 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🏆 Leaderboard</h1>
          <p className="text-gray-300 text-lg">Live Rankings & Scores</p>

          {/* Status Indicators */}
          <div className="flex justify-center items-center space-x-4 mt-4">
            <div className={`px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {isConnected ? '🟢 Live Updates' : '🔴 Offline'}
            </div>
            <div className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
              Last updated: {new Date(lastUpdate).toLocaleTimeString()}
            </div>
            <button
              onClick={loadLeaderboard}
              className="px-3 py-1 bg-white/20 text-white rounded-full text-sm hover:bg-white/30 transition-all duration-300"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
          <LeaderboardHeader />

          {teams.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-lg mb-4">No teams found</p>
              <p className="text-gray-500 text-sm">Create teams to see them on the leaderboard</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {teams.map((team, index) => (
                <LeaderboardRow
                  key={`team-${team._id || team.name}-${index}`}
                  rank={index + 1}
                  team={team.name}
                  score={team.score || 0}
                  gamesPlayed={team.gamesPlayed || 0}
                  gamesWon={team.gamesWon || 0}
                  winRate={team.gamesPlayed > 0 ? Math.round((team.gamesWon / team.gamesPlayed) * 100) : 0}
                />
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        {teams.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">{teams.length}</div>
              <div className="text-gray-300 text-sm mt-1">Total Teams</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400">
                {Math.max(...teams.map(t => t.score || 0)).toLocaleString()}
              </div>
              <div className="text-gray-300 text-sm mt-1">Highest Score</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">
                {teams.reduce((sum, t) => sum + (t.gamesPlayed || 0), 0)}
              </div>
              <div className="text-gray-300 text-sm mt-1">Total Games</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
          <h3 className="text-blue-300 font-semibold mb-2">📊 About the Leaderboard</h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Rankings update automatically every 5 seconds</li>
            <li>• Live updates via Socket.IO when scores change</li>
            <li>• Teams are ranked by total score (highest to lowest)</li>
            <li>• Click refresh to manually update the leaderboard</li>
          </ul>
        </div>

        {loading && teams.length > 0 && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-yellow-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
              <span className="text-sm">Updating...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}