"use client";

import { useState, useEffect } from "react";
import BackToHome from "../../components/BackToHome";
import { teamAPI } from "../../lib/api";

export default function SetupPage() {
  // ===== STATE =====
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== LOAD TEAMS =====
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const response = await teamAPI.getAll();
      setTeams(response.teams);
    } catch (error) {
      console.error('Failed to load teams:', error);
      setError('Failed to load teams');
    }
  };

  // ===== ACTIONS =====
  const createTeam = async () => {
    if (!teamName.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await teamAPI.create({
        name: teamName.trim(),
        players: []
      });
      
      setTeams([...teams, response.team]);
      setTeamName("");
    } catch (error) {
      console.error('Failed to create team:', error);
      setError(error.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const addPlayer = async () => {
    if (!playerName.trim() || !selectedTeam) return;

    console.log('Adding player:', { playerName: playerName.trim(), selectedTeam });

    setLoading(true);
    setError(null);
    
    try {
      const response = await teamAPI.addPlayer(selectedTeam, {
        name: playerName.trim()
      });
      
      console.log('Add player response:', response);
      
      // Update the team in the list
      setTeams(teams.map(team => 
        team._id === selectedTeam ? response.team : team
      ));
      
      setPlayerName("");
    } catch (error) {
      console.error('Failed to add player:', error);
      setError(error.message || 'Failed to add player');
    } finally {
      setLoading(false);
    }
  };

  const removePlayer = async (teamId, playerName) => {
    if (!confirm(`Remove ${playerName} from team?`)) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await teamAPI.removePlayer(teamId, playerName);
      
      // Update the team in the list
      setTeams(teams.map(team => 
        team._id === teamId ? response.team : team
      ));
    } catch (error) {
      console.error('Failed to remove player:', error);
      setError(error.message || 'Failed to remove player');
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId) => {
    const team = teams.find(t => t._id === teamId);
    if (!confirm(`Delete team "${team?.name}"? This cannot be undone.`)) return;

    setLoading(true);
    setError(null);
    
    try {
      await teamAPI.delete(teamId);
      setTeams(teams.filter(team => team._id !== teamId));
    } catch (error) {
      console.error('Failed to delete team:', error);
      setError(error.message || 'Failed to delete team');
    } finally {
      setLoading(false);
    }
  };

  // ===== UI =====
  return (
    <>
      <BackToHome />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Team Management
          </h1>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* CREATE TEAM */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Team</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Team Name
                  </label>
                  <input 
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                    onKeyPress={(e) => e.key === 'Enter' && createTeam()}
                  />
                </div>
                
                <button 
                  onClick={createTeam}
                  disabled={loading || !teamName.trim()}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </div>

            {/* ADD PLAYER */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Add Player</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Player Name
                  </label>
                  <input 
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter player name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                    onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Select Team
                  </label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                  >
                    <option value="">Choose a team</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id} className="bg-slate-800">
                        {team.name} ({team.players?.length || 0} players)
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={addPlayer}
                  disabled={loading || !playerName.trim() || !selectedTeam}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? 'Adding...' : 'Add Player'}
                </button>
              </div>
            </div>
          </div>

          {/* TEAMS LIST */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Teams ({teams.length})</h2>
            
            {teams.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-gray-400 text-lg">No teams created yet</p>
                <p className="text-gray-500 text-sm mt-2">Create your first team above</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                  <div key={team._id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white">{team.name}</h3>
                      <button
                        onClick={() => deleteTeam(team._id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete team"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-gray-300">
                        Players: <span className="text-yellow-400 font-semibold">{team.players?.length || 0}</span>
                      </p>
                      <p className="text-gray-300">
                        Score: <span className="text-green-400 font-semibold">{team.score || 0}</span>
                      </p>
                      <p className="text-gray-300">
                        Games: <span className="text-blue-400 font-semibold">{team.gamesPlayed || 0}</span>
                      </p>
                    </div>

                    {team.players && team.players.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Players:</h4>
                        <div className="space-y-1">
                          {team.players.map((player, index) => (
                            <div key={index} className="flex justify-between items-center bg-white/5 rounded px-3 py-2">
                              <span className="text-white text-sm">{player.name}</span>
                              <button
                                onClick={() => removePlayer(team._id, player.name)}
                                className="text-red-400 hover:text-red-300 text-xs transition-colors"
                                title="Remove player"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}