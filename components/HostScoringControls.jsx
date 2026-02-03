"use client";

import { useState, useEffect } from 'react';

export default function HostScoringControls({ 
  currentGame, 
  currentQuestion, 
  onAnswerReveal, 
  onStealAttempt, 
  onBuzzerControl,
  onScoreAdjustment 
}) {
  const [scoringEngine, setScoringEngine] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  useEffect(() => {
    const initScoring = async () => {
      try {
        const { scoringEngine: engine } = await import('../lib/scoring');
        setScoringEngine(engine);
        
        if (currentGame && currentGame.teams) {
          engine.setTeamNames(
            currentGame.teams[0]?.name || 'Team A',
            currentGame.teams[1]?.name || 'Team B'
          );
        }
        
        setGameState(engine.getGameState());
      } catch (error) {
        console.error('Failed to initialize scoring engine:', error);
      }
    };

    initScoring();
  }, [currentGame]);

  const handleAnswerReveal = async (answerIndex, isCorrect) => {
    if (!scoringEngine || !currentQuestion) return;

    const answer = currentQuestion.answers[answerIndex];
    const result = isCorrect 
      ? scoringEngine.processCorrectAnswer(answerIndex, answer.points)
      : scoringEngine.processWrongAnswer();

    setGameState(scoringEngine.getGameState());
    
    if (onAnswerReveal) {
      onAnswerReveal(answerIndex, isCorrect, result);
    }
  };

  const handleStealAttempt = async (isCorrect, answerIndex = null) => {
    if (!scoringEngine) return;

    const result = scoringEngine.processStealAttempt(isCorrect, answerIndex);
    setGameState(scoringEngine.getGameState());
    
    if (onStealAttempt) {
      onStealAttempt(isCorrect, answerIndex, result);
    }
  };

  const handleBuzzerPress = (teamId) => {
    if (!scoringEngine) return;

    const result = scoringEngine.handleBuzzer(teamId);
    setGameState(scoringEngine.getGameState());
    
    if (onBuzzerControl) {
      onBuzzerControl(teamId, result);
    }
  };

  const handleScoreAdjustment = (teamId, adjustment, reason) => {
    if (!scoringEngine) return;

    // Manual score adjustment
    const currentState = scoringEngine.getGameState();
    currentState.teams[teamId].score += adjustment;
    
    setGameState(currentState);
    
    if (onScoreAdjustment) {
      onScoreAdjustment(teamId, adjustment, reason);
    }
  };

  const resetStreak = () => {
    if (scoringEngine) {
      scoringEngine.resetStreak();
      setGameState(scoringEngine.getGameState());
    }
  };

  const switchControl = () => {
    if (scoringEngine) {
      scoringEngine.switchControl();
      setGameState(scoringEngine.getGameState());
    }
  };

  if (!currentQuestion || !gameState) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">🎛️ Host Controls</h2>
        <p className="text-gray-400">No active question or scoring engine not initialized</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">🎛️ Advanced Host Controls</h2>

      {/* Current Game State */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">📊 Current State</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-yellow-400 font-semibold">Round</div>
            <div className="text-white text-xl">{gameState.currentRound}</div>
            <div className="text-gray-400">×{gameState.roundMultiplier}</div>
          </div>
          
          <div className="text-center">
            <div className="text-orange-400 font-semibold">Streak</div>
            <div className="text-white text-xl">{gameState.streakCount}</div>
            <div className="text-gray-400">
              {gameState.streakTeam ? `Team ${gameState.streakTeam}` : 'None'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-blue-400 font-semibold">Current Team</div>
            <div className="text-white text-xl">{gameState.currentTeam}</div>
            <div className="text-gray-400">
              {gameState.teams[gameState.currentTeam]?.name}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-green-400 font-semibold">Buzzer Bonus</div>
            <div className="text-white text-xl">
              {gameState.buzzerBonus ? '✅' : '❌'}
            </div>
            <div className="text-gray-400">Available</div>
          </div>
        </div>
      </div>

      {/* Answer Reveal Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">🎯 Answer Controls</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {currentQuestion.answers.map((answer, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-3">
              <div className="text-center mb-2">
                <div className="text-yellow-400 font-bold">#{index + 1}</div>
                <div className="text-white text-sm">{answer.text}</div>
                <div className="text-gray-400 text-xs">{answer.points} pts</div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAnswerReveal(index, true)}
                  disabled={gameState.revealedAnswers[index]}
                  className="flex-1 py-2 px-3 bg-green-500/20 border border-green-400/30 text-green-300 rounded text-xs hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✅ Correct
                </button>
                
                <button
                  onClick={() => handleAnswerReveal(index, false)}
                  className="flex-1 py-2 px-3 bg-red-500/20 border border-red-400/30 text-red-300 rounded text-xs hover:bg-red-500/30"
                >
                  ❌ Wrong
                </button>
              </div>
              
              {gameState.revealedAnswers[index] && (
                <div className="mt-2 text-center text-green-400 text-xs font-semibold">
                  REVEALED
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Team Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">👥 Team Controls</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(gameState.teams).map(([teamId, team]) => (
            <div key={teamId} className="bg-white/5 rounded-lg p-4">
              <div className="text-center mb-3">
                <div className="text-white font-semibold">Team {teamId}</div>
                <div className="text-gray-400 text-sm">{team.name}</div>
                <div className="text-yellow-400 text-lg font-bold">
                  {team.score.toLocaleString()} pts
                </div>
                <div className="text-red-400 text-sm">
                  {team.strikes}/3 strikes
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleBuzzerPress(teamId)}
                  className="w-full py-2 px-3 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded text-sm hover:bg-blue-500/30"
                >
                  🔔 Buzzer Press
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleScoreAdjustment(teamId, 10, 'Manual +10')}
                    className="flex-1 py-1 px-2 bg-green-500/20 border border-green-400/30 text-green-300 rounded text-xs hover:bg-green-500/30"
                  >
                    +10
                  </button>
                  
                  <button
                    onClick={() => handleScoreAdjustment(teamId, -10, 'Manual -10')}
                    className="flex-1 py-1 px-2 bg-red-500/20 border border-red-400/30 text-red-300 rounded text-xs hover:bg-red-500/30"
                  >
                    -10
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Steal Controls */}
      {gameState.canSteal && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
          <h3 className="text-lg font-semibold text-red-400 mb-3">🎯 Steal Opportunity</h3>
          
          <div className="text-center mb-4">
            <div className="text-white">
              Team {gameState.currentTeam} can attempt to steal!
            </div>
            <div className="text-gray-400 text-sm">
              Choose correct answer or mark as failed steal
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {currentQuestion.answers.map((answer, index) => (
              !gameState.revealedAnswers[index] && (
                <button
                  key={index}
                  onClick={() => handleStealAttempt(true, index)}
                  className="py-2 px-3 bg-green-500/20 border border-green-400/30 text-green-300 rounded text-xs hover:bg-green-500/30"
                >
                  #{index + 1} Correct
                </button>
              )
            ))}
            
            <button
              onClick={() => handleStealAttempt(false)}
              className="py-2 px-3 bg-red-500/20 border border-red-400/30 text-red-300 rounded text-xs hover:bg-red-500/30"
            >
              ❌ Failed Steal
            </button>
          </div>
        </div>
      )}

      {/* Game Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">🎮 Game Controls</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={switchControl}
            className="py-2 px-3 bg-purple-500/20 border border-purple-400/30 text-purple-300 rounded text-sm hover:bg-purple-500/30"
          >
            🔄 Switch Control
          </button>
          
          <button
            onClick={resetStreak}
            className="py-2 px-3 bg-orange-500/20 border border-orange-400/30 text-orange-300 rounded text-sm hover:bg-orange-500/30"
          >
            🔥 Reset Streak
          </button>
          
          <button
            onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
            className="py-2 px-3 bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 rounded text-sm hover:bg-yellow-500/30"
          >
            📊 Score Details
          </button>
          
          <button
            onClick={() => {
              if (scoringEngine) {
                scoringEngine.endQuestion();
                setGameState(scoringEngine.getGameState());
              }
            }}
            className="py-2 px-3 bg-gray-500/20 border border-gray-400/30 text-gray-300 rounded text-sm hover:bg-gray-500/30"
          >
            🏁 End Question
          </button>
        </div>
      </div>

      {/* Score Breakdown */}
      {showScoreBreakdown && (
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">📈 Scoring Breakdown</h3>
          
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-400 mb-2">Round Multipliers:</div>
                <div className="space-y-1">
                  <div>Round 1: ×1</div>
                  <div>Round 2: ×2</div>
                  <div>Round 3: ×3</div>
                </div>
              </div>
              
              <div>
                <div className="text-gray-400 mb-2">Streak Multipliers:</div>
                <div className="space-y-1">
                  <div>1st: ×1</div>
                  <div>2nd: ×10</div>
                  <div>3rd: ×20</div>
                  <div>4th: ×30</div>
                  <div>5th: ×40</div>
                  <div>6th: ×50</div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-white/20 pt-3">
              <div className="text-gray-400 mb-2">Bonuses:</div>
              <div className="grid grid-cols-3 gap-4">
                <div>Buzzer: +10</div>
                <div>Steal: +20</div>
                <div>Perfect Board: +50</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts */}
      <div className="text-xs text-gray-500 text-center">
        <div className="mb-1">⌨️ Keyboard Shortcuts:</div>
        <div>1-6: Reveal answers | X: Wrong answer | B: Enable buzzer | R: Reset streak</div>
      </div>
    </div>
  );
}