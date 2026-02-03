"use client";

import { useState, useEffect } from 'react';

export default function ScoringDisplay({ 
  teams = [], 
  currentRound = 1, 
  streakInfo = null, 
  gameState = 'setup',
  onScoringUpdate = null 
}) {
  const [scoringEngine, setScoringEngine] = useState(null);
  const [scoreBreakdown, setScoreBreakdown] = useState(null);

  useEffect(() => {
    // Initialize scoring engine
    const initScoring = async () => {
      try {
        const { scoringEngine: engine } = await import('../lib/scoring');
        setScoringEngine(engine);
        
        // Set team names if available
        if (teams.length >= 2) {
          engine.setTeamNames(teams[0].name, teams[1].name);
        }
        
        // Start new round if needed
        engine.startNewRound(currentRound);
      } catch (error) {
        console.error('Failed to initialize scoring engine:', error);
      }
    };

    initScoring();
  }, [teams, currentRound]);

  const getRoundMultiplier = (round) => {
    const multipliers = { 1: 1, 2: 2, 3: 3 };
    return multipliers[round] || 1;
  };

  const getStreakMultiplier = (streakCount) => {
    const multipliers = { 1: 1, 2: 10, 3: 20, 4: 30, 5: 40, 6: 50 };
    return multipliers[streakCount] || 1;
  };

  const formatScore = (score) => {
    return score.toLocaleString();
  };

  const getTeamLetter = (index) => {
    return index === 0 ? 'A' : 'B';
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        🏆 Live Scoring System
      </h2>

      {/* Round Information */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center space-x-4 bg-white/5 rounded-lg px-6 py-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">Round {currentRound}</div>
            <div className="text-sm text-gray-400">×{getRoundMultiplier(currentRound)} Multiplier</div>
          </div>
          
          {streakInfo && streakInfo.count > 0 && (
            <>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-400">
                  🔥 {streakInfo.count} Streak
                </div>
                <div className="text-sm text-gray-400">
                  ×{getStreakMultiplier(streakInfo.count)} Multiplier
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Team Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {teams.map((team, index) => (
          <div 
            key={team._id || index}
            className={`bg-white/5 rounded-xl p-6 border-2 transition-all duration-300 ${
              gameState === 'active' && team.currentTurn 
                ? 'border-yellow-400 bg-yellow-400/10' 
                : 'border-white/20'
            }`}
          >
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-300 mb-2">
                Team {getTeamLetter(index)} - {team.name}
              </div>
              
              {/* Score Display */}
              <div className="text-4xl font-bold text-white mb-3">
                {formatScore(team.score || 0)}
              </div>
              
              {/* Strikes Display */}
              <div className="flex justify-center items-center space-x-2 mb-3">
                <span className="text-sm text-gray-400">Strikes:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3].map((strike) => (
                    <div
                      key={strike}
                      className={`w-4 h-4 rounded-full border-2 ${
                        (team.strikes || 0) >= strike
                          ? 'bg-red-500 border-red-500'
                          : 'border-gray-500'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400">
                  ({team.strikes || 0}/3)
                </span>
              </div>

              {/* Team Status */}
              <div className="text-sm">
                {team.currentTurn && (
                  <div className="text-yellow-400 font-semibold">🎯 Current Turn</div>
                )}
                {(team.strikes || 0) >= 3 && (
                  <div className="text-red-400 font-semibold">⚠️ Strike Out</div>
                )}
                {streakInfo && streakInfo.team === getTeamLetter(index) && (
                  <div className="text-orange-400 font-semibold">
                    🔥 {streakInfo.count} Answer Streak
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scoring Mechanics Info */}
      <div className="bg-white/5 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-white mb-3">📊 Scoring Mechanics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-yellow-400 font-semibold">Round Multiplier</div>
            <div className="text-white">×{getRoundMultiplier(currentRound)}</div>
          </div>
          
          <div className="text-center">
            <div className="text-orange-400 font-semibold">Streak Bonus</div>
            <div className="text-white">
              {streakInfo && streakInfo.count > 0 
                ? `×${getStreakMultiplier(streakInfo.count)}` 
                : '×1'
              }
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-blue-400 font-semibold">Buzzer Bonus</div>
            <div className="text-white">+10 pts</div>
          </div>
          
          <div className="text-center">
            <div className="text-green-400 font-semibold">Steal Bonus</div>
            <div className="text-white">+20 pts</div>
          </div>
        </div>
      </div>

      {/* Bonus Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-3">
          <div className="text-purple-400 font-semibold mb-1">🎊 Perfect Board</div>
          <div className="text-gray-300">+50 bonus for revealing all answers</div>
        </div>
        
        <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3">
          <div className="text-red-400 font-semibold mb-1">🎯 Steal Opportunity</div>
          <div className="text-gray-300">After 3 strikes, opposing team can steal</div>
        </div>
      </div>

      {/* Score Breakdown (if available) */}
      {scoreBreakdown && (
        <div className="mt-6 bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">📈 Last Score Breakdown</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Base Points:</span>
              <span className="text-white">{scoreBreakdown.basePoints}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Round Multiplier:</span>
              <span className="text-white">×{scoreBreakdown.roundMultiplier}</span>
            </div>
            
            {scoreBreakdown.streakMultiplier > 1 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Streak Multiplier:</span>
                <span className="text-orange-400">×{scoreBreakdown.streakMultiplier}</span>
              </div>
            )}
            
            {scoreBreakdown.buzzerBonus > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Buzzer Bonus:</span>
                <span className="text-blue-400">+{scoreBreakdown.buzzerBonus}</span>
              </div>
            )}
            
            {scoreBreakdown.stealBonus > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Steal Bonus:</span>
                <span className="text-green-400">+{scoreBreakdown.stealBonus}</span>
              </div>
            )}
            
            {scoreBreakdown.perfectBoardBonus > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Perfect Board:</span>
                <span className="text-purple-400">+{scoreBreakdown.perfectBoardBonus}</span>
              </div>
            )}
            
            <div className="border-t border-white/20 pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span className="text-white">Total Score:</span>
                <span className="text-yellow-400">{scoreBreakdown.totalScore}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game State Indicator */}
      <div className="mt-4 text-center">
        <div className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${
          gameState === 'active' ? 'bg-green-500/20 text-green-400' :
          gameState === 'buzzer' ? 'bg-yellow-500/20 text-yellow-400' :
          gameState === 'steal' ? 'bg-red-500/20 text-red-400' :
          gameState === 'completed' ? 'bg-purple-500/20 text-purple-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {gameState === 'active' && '🎮 Game Active'}
          {gameState === 'buzzer' && '🔔 Buzzer Ready'}
          {gameState === 'steal' && '🎯 Steal Opportunity'}
          {gameState === 'completed' && '🏁 Game Complete'}
          {gameState === 'setup' && '⚙️ Setting Up'}
        </div>
      </div>
    </div>
  );
}