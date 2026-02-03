"use client";

import { useState, useEffect } from 'react';
import { teamAPI, gameAPI, questionAPI } from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import { useGameState } from '../lib/gameState';

export default function GameIntegration() {
  const [teams, setTeams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [gameState, setGameState] = useState('setup'); // setup, active, completed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use shared game state
  const {
    gameState: sharedGameState,
    setGameQuestions,
    getCurrentQuestion,
    revealAnswer: revealAnswerInState,
    nextQuestion: nextQuestionInState,
    setTeams: setTeamsInState,
    updateState
  } = useGameState();

  const gameQuestions = sharedGameState.questions;
  const currentQuestionIndex = sharedGameState.currentQuestionIndex;
  const currentRound = sharedGameState.currentRound;

  const gameId = currentGame?._id || 'default-game';
  const {
    buzzerPressed,
    clearBuzzerPressed,
    updateGameState,
    revealAnswer,
    isConnected
  } = useSocket(gameId);

  // Load initial data
  useEffect(() => {
    loadTeams();
    loadQuestions();
    checkExistingGame();
  }, []);

  const checkExistingGame = async () => {
    try {
      const storedGameId = localStorage.getItem('currentGameId');
      if (storedGameId) {
        console.log('Found existing game:', storedGameId);
        const response = await gameAPI.getById(storedGameId);
        if (response.game) {
          setCurrentGame(response.game);
          setGameState('active');
          console.log('Loaded existing game');
        }
      }
    } catch (error) {
      console.log('No existing game found, starting fresh');
      localStorage.removeItem('currentGameId');
    }
  };

  const loadTeams = async () => {
    try {
      console.log('Loading teams from database...');
      setError(null);
      
      const response = await teamAPI.getAll();
      console.log('Teams API response:', response);
      
      if (response.success === false) {
        throw new Error(response.error || 'Failed to load teams');
      }
      
      const teamsArray = response.teams || [];
      setTeams(teamsArray);
      
      if (teamsArray.length === 0) {
        setError('No teams found. Please create teams first in Setup Teams page.');
      } else {
        console.log(`Successfully loaded ${teamsArray.length} teams`);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
      setError(`Failed to load teams: ${error.message}. Please check database connection.`);
    }
  };

  const loadQuestions = async () => {
    try {
      console.log('Loading questions from database...');
      const response = await questionAPI.getAll();
      
      if (response.questions && response.questions.length > 0) {
        setQuestions(response.questions);
        console.log(`Loaded ${response.questions.length} questions from database`);
      } else {
        setError('No questions found in database. Please add questions first.');
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
      setError('Failed to load questions from database.');
    }
  };

  const createGame = async () => {
    if (selectedTeams.length < 2) {
      setError('Please select at least 2 teams');
      return;
    }

    if (questions.length < 9) {
      setError('Need at least 9 questions in database to start a game');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating new game with teams:', selectedTeams);
      
      // Create game in database
      const response = await gameAPI.create({
        teamIds: selectedTeams,
        settings: {
          teamSize: 4,
          maxStrikes: 3,
          questionTimeLimit: 30
        }
      });
      
      if (!response.game) {
        throw new Error('Failed to create game in database');
      }
      
      setCurrentGame(response.game);
      localStorage.setItem('currentGameId', response.game._id);
      
      // Select 9 random questions
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, 9);
      
      // Set questions in shared state for control panel
      setGameQuestions(selectedQuestions);
      
      // Set teams in shared state
      setTeamsInState(selectedTeams);
      
      setGameState('active');
      setError(null);
      
      console.log('Game created successfully:', response.game._id);
      console.log('Selected 9 questions for the game');
      
    } catch (error) {
      console.error('Failed to create game:', error);
      setError(`Failed to create game: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Listen for game state updates from control panel
  useEffect(() => {
    if (!gameId) return;

    console.log('🔌 Setting up Socket.IO listeners for game synchronization...');

    const handleAnswerRevealed = (data) => {
      console.log('📡 Answer revealed by control panel:', data);
      
      // Update shared state
      if (data.questionIndex !== undefined && data.answerIndex !== undefined) {
        revealAnswerInState(data.questionIndex, data.answerIndex);
        console.log(`✅ Revealed answer ${data.answerIndex + 1} for question ${data.questionIndex + 1}`);
      }
    };

    const handleGameStateUpdate = (data) => {
      console.log('📡 Game state updated by control panel:', data);
      
      // Handle next question event
      if (data.nextQuestion) {
        console.log('🔄 Next question triggered by control panel:', data.nextQuestion);
        
        // Update shared game state to match control panel
        if (data.currentQuestionIndex !== undefined) {
          updateState({
            currentQuestionIndex: data.currentQuestionIndex,
            currentRound: data.currentRound || Math.ceil((data.currentQuestionIndex + 1) / 3),
            revealedAnswers: sharedGameState.revealedAnswers.map((answers, index) => 
              index === data.currentQuestionIndex ? Array(6).fill(false) : answers
            )
          });
        }
      }
      
      // Handle answer reveals
      if (data.answerRevealed) {
        const { questionIndex, answerIndex } = data.answerRevealed;
        revealAnswerInState(questionIndex, answerIndex);
        console.log(`✅ Synced answer reveal: Q${questionIndex + 1} A${answerIndex + 1}`);
      }
      
      // Handle game completion
      if (data.gameState === 'completed' || data.gameCompleted) {
        setGameState('completed');
        console.log('🎉 Game completed by control panel');
      }
    };

    // Use the socket from useSocket hook
    const socket = window.io ? window.io() : null;
    if (socket) {
      socket.on('answer-revealed', handleAnswerRevealed);
      socket.on('game-state-updated', handleGameStateUpdate);
      
      console.log('✅ Socket.IO listeners registered');
      
      return () => {
        socket.off('answer-revealed', handleAnswerRevealed);
        socket.off('game-state-updated', handleGameStateUpdate);
        console.log('🔌 Socket.IO listeners cleaned up');
      };
    } else {
      console.warn('⚠️ Socket.IO not available');
    }
  }, [gameId, revealAnswerInState, updateState, sharedGameState.revealedAnswers]);

  // Get current question in round (1, 2, or 3)
  const getCurrentQuestionInRound = () => {
    return (currentQuestionIndex % 3) + 1;
  };

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            🎮 Family Feud Game Setup
          </h1>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6">
              <p className="text-red-300">{error}</p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={loadTeams}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded text-sm hover:bg-blue-500/30"
                >
                  Retry Teams
                </button>
                <button
                  onClick={loadQuestions}
                  className="px-3 py-1 bg-green-500/20 text-green-300 rounded text-sm hover:bg-green-500/30"
                >
                  Retry Questions
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Team Selection */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Select Teams</h2>
              
              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-lg mb-4">No teams available</p>
                  <p className="text-gray-500 text-sm mb-4">
                    You need to create teams first before starting a game.
                  </p>
                  <a 
                    href="/setup" 
                    className="inline-block py-2 px-4 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
                  >
                    Go to Setup Teams
                  </a>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {teams.map((team) => (
                    <label key={team._id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={selectedTeams.includes(team._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTeams([...selectedTeams, team._id]);
                          } else {
                            setSelectedTeams(selectedTeams.filter(id => id !== team._id));
                          }
                        }}
                        className="w-5 h-5 text-yellow-400 bg-white/10 border-white/20 rounded focus:ring-yellow-400"
                      />
                      <div className="flex-1">
                        <span className="text-white font-semibold text-lg">
                          {team.name}
                        </span>
                        <p className="text-gray-400 text-sm">
                          {team.players?.length || 0} players
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <p className="text-gray-400 text-sm">
                  Selected: {selectedTeams.length} teams | Available: {teams.length} teams
                </p>
              </div>
            </div>

            {/* Game Info */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Game Information</h2>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">📋 Game Structure</h3>
                  <ul className="text-gray-300 space-y-1">
                    <li>• 3 Rounds per game</li>
                    <li>• 3 Questions per round</li>
                    <li>• 9 Total questions (randomly selected)</li>
                    <li>• 6 Answers per question</li>
                    <li>• Real-time buzzer competition</li>
                  </ul>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-400 mb-2">🎯 Database Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Teams:</span>
                      <span className="text-white font-bold">{teams.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Questions:</span>
                      <span className="text-white font-bold">{questions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Ready:</span>
                      <span className={`font-bold ${teams.length >= 2 && questions.length >= 9 ? 'text-green-400' : 'text-red-400'}`}>
                        {teams.length >= 2 && questions.length >= 9 ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">�️ Control Panel</h3>
                  <p className="text-gray-300 text-sm">
                    After starting the game, use the Control Panel to:
                  </p>
                  <ul className="text-gray-300 text-sm mt-2 space-y-1">
                    <li>• Manage questions and rounds</li>
                    <li>• Reveal answers and award points</li>
                    <li>• Control buzzer system</li>
                    <li>• Track scores and progress</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={createGame}
              disabled={loading || selectedTeams.length < 2 || questions.length < 9}
              className="py-4 px-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
            >
              {loading ? 'Creating Game...' : 'Start Game & Open Control Panel'}
            </button>
            
            {(selectedTeams.length < 2 || questions.length < 9) && (
              <div className="mt-4 space-y-2">
                {selectedTeams.length < 2 && (
                  <p className="text-red-400 text-sm">
                    Please select at least 2 teams
                  </p>
                )}
                {questions.length < 9 && (
                  <p className="text-red-400 text-sm">
                    Need {9 - questions.length} more questions in database
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 text-center">
            <div className="inline-flex space-x-4">
              <a
                href="/setup"
                className="py-2 px-4 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
              >
                Setup Teams
              </a>
              <a
                href="/debug"
                className="py-2 px-4 bg-purple-500/20 border border-purple-400/30 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all duration-300"
              >
                Debug Database
              </a>
              <a
                href="/control"
                className="py-2 px-4 bg-orange-500/20 border border-orange-400/30 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-all duration-300"
              >
                Control Panel
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'active' && currentGame) {
    const currentQuestion = getCurrentQuestion();
    const questionInRound = getCurrentQuestionInRound();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Game Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              🎮 Family Feud Game
            </h1>
            <div className="flex justify-center items-center space-x-6">
              <div className="text-yellow-400 font-semibold">
                Round {currentRound}/3
              </div>
              <div className="text-blue-400 font-semibold">
                Question {questionInRound}/3
              </div>
              <div className="text-green-400 font-semibold">
                Progress: {currentQuestionIndex + 1}/9
              </div>
              <div className={`font-semibold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? '🟢 Synced with Control Panel' : '🔴 Not Connected'}
              </div>
            </div>
            
            {/* Real-time sync status */}
            <div className="mt-2 text-sm text-gray-400">
              Game ID: {gameId} | Questions Loaded: {gameQuestions.length}/9
            </div>
          </div>

          {/* Control Panel Link */}
          <div className="text-center mb-6">
            <div className="space-x-4">
              <a
                href="/control"
                target="_blank"
                className="inline-block py-3 px-6 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg"
              >
                🎛️ Open Control Panel (Host)
              </a>
              
              <button
                onClick={() => {
                  console.log('🔄 Manual sync requested');
                  // Force re-render to check for updates
                  updateState({ lastSync: Date.now() });
                }}
                className="inline-block py-3 px-6 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300"
              >
                🔄 Sync Now
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Host uses the Control Panel to manage questions, reveal answers, and control the game
            </p>
          </div>

          {/* Current Question Display */}
          {currentQuestion && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
              <h2 className="text-3xl font-bold text-white mb-4 text-center">
                {currentQuestion.question}
              </h2>
              <p className="text-gray-400 text-center mb-6 text-lg">
                Category: {currentQuestion.category}
              </p>
              
              {/* 6 Answers Grid - Clean Display with Real-time Updates */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }, (_, index) => {
                  const answer = currentQuestion.answers?.[index];
                  const isRevealed = sharedGameState.revealedAnswers[currentQuestionIndex]?.[index] || false;
                  return (
                    <div
                      key={index}
                      className={`p-6 rounded-lg border min-h-[120px] flex flex-col justify-between transition-all duration-700 transform ${
                        isRevealed 
                          ? 'bg-green-500/20 border-green-400/30 scale-105 shadow-lg animate-pulse' 
                          : 'bg-white/5 border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <span className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-500 ${
                            isRevealed 
                              ? 'bg-green-500 text-white' 
                              : 'bg-yellow-500 text-black'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-white font-medium text-lg">
                            {isRevealed ? answer?.text : 'Hidden Answer'}
                          </span>
                        </div>
                        <span className={`font-bold text-3xl transition-all duration-500 ${
                          isRevealed ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {isRevealed ? answer?.points : '?'}
                        </span>
                      </div>
                      
                      {!answer && (
                        <div className="text-center text-gray-500 text-sm mt-4">
                          No answer available
                        </div>
                      )}
                      
                      {isRevealed && (
                        <div className="text-center text-green-400 text-xs mt-2 animate-bounce">
                          ✨ Revealed by Host
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Game Instructions */}
              <div className="mt-6 p-4 rounded-lg bg-white/5 text-center">
                <p className="text-lg font-semibold text-white mb-2">
                  🔔 Waiting for Host Control
                </p>
                <p className="text-gray-400">
                  The host will reveal answers and manage the game from the Control Panel
                </p>
              </div>
            </div>
          )}

          {/* Teams Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {currentGame.teams?.map((team, index) => (
              <div key={team.teamId || index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {team.name || `Team ${index + 1}`}
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-300 text-lg">
                    Score: <span className="text-yellow-400 font-bold text-2xl">{team.score || 0}</span>
                  </p>
                  <p className="text-gray-300">
                    Strikes: <span className="text-red-400 font-bold">{team.strikes || 0}/3</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Buzzer Link */}
          <div className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">🔔 Team Buzzer</h3>
            <p className="text-gray-300 mb-4">Share this link with teams for buzzer access:</p>
            <code className="bg-white/10 px-4 py-2 rounded text-yellow-300 text-lg">
              {typeof window !== 'undefined' ? window.location.origin : ''}/buzzer?gameId={gameId}
            </code>
            <div className="mt-4">
              <a
                href={`/buzzer?gameId=${gameId}`}
                target="_blank"
                className="inline-block py-2 px-4 bg-green-500/20 border border-green-400/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-all duration-300"
              >
                Test Buzzer
              </a>
            </div>
          </div>

          {/* Game Controls */}
          <div className="text-center mt-6">
            <button
              onClick={() => {
                setGameState('setup');
                localStorage.removeItem('currentGameId');
              }}
              className="py-2 px-6 bg-gray-500/20 border border-gray-400/30 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-all duration-300"
            >
              End Game & Start New
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center max-w-2xl">
          <h1 className="text-4xl font-bold text-white mb-4">🎉 Game Completed!</h1>
          <p className="text-gray-300 mb-6">All 9 questions across 3 rounds finished. Check the leaderboard for final results.</p>
          
          <div className="space-x-4">
            <button
              onClick={() => {
                setGameState('setup');
                localStorage.removeItem('currentGameId');
              }}
              className="py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
            >
              Start New Game
            </button>
            
            <a
              href="/leaderboard"
              className="inline-block py-3 px-6 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300"
            >
              View Leaderboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}