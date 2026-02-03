"use client";

import { useState, useEffect } from 'react';
import { teamAPI, gameAPI, questionAPI } from '../lib/api';
import { useSocket } from '../hooks/useSocket';

export default function GameIntegration() {
  const [teams, setTeams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [gameState, setGameState] = useState('setup'); // setup, active, completed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const loadQuestions = async () => {
    try {
      const response = await questionAPI.getAll();
      setQuestions(response.questions);
    } catch (error) {
      console.error('Failed to load questions:', error);
      setError('Failed to load questions');
    }
  };

  const createGame = async () => {
    if (selectedTeams.length < 2) {
      setError('Please select at least 2 teams');
      return;
    }

    setLoading(true);
    try {
      const response = await gameAPI.create({
        teamIds: selectedTeams,
        settings: {
          teamSize: 4,
          maxStrikes: 3,
          questionTimeLimit: 30
        }
      });
      
      setCurrentGame(response.game);
      setGameState('active');
      setError(null);
    } catch (error) {
      console.error('Failed to create game:', error);
      setError('Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    if (!currentGame || !selectedQuestion) {
      setError('Please select a question');
      return;
    }

    setLoading(true);
    try {
      const response = await gameAPI.start(currentGame._id, {
        questionId: selectedQuestion._id
      });
      
      setCurrentGame(response.game);
      updateGameState({
        gameState: 'active',
        currentQuestion: selectedQuestion,
        message: 'Game started! Get ready to buzz!'
      });
      setError(null);
    } catch (error) {
      console.error('Failed to start game:', error);
      setError('Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const handleBuzzerPress = async (teamId) => {
    if (!currentGame) return;

    try {
      const response = await gameAPI.buzzer(currentGame._id, {
        teamId,
        playerId: 'host-controlled'
      });
      
      setCurrentGame(response.game);
    } catch (error) {
      console.error('Failed to handle buzzer:', error);
    }
  };

  const handleAnswerReveal = async (answerIndex, isCorrect) => {
    if (!currentGame) return;

    try {
      const response = await gameAPI.answer(currentGame._id, {
        answerIndex,
        isCorrect
      });
      
      setCurrentGame(response.game);
      
      if (isCorrect) {
        revealAnswer(gameId, {
          answerIndex,
          answer: selectedQuestion?.answers[answerIndex],
          points: selectedQuestion?.answers[answerIndex]?.points || 0,
          teamId: currentGame.currentTeamTurn
        });
      }
    } catch (error) {
      console.error('Failed to handle answer:', error);
    }
  };

  // Handle real-time buzzer events
  useEffect(() => {
    if (buzzerPressed && currentGame) {
      handleBuzzerPress(buzzerPressed.teamId);
    }
  }, [buzzerPressed, currentGame]);

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Game Setup
          </h1>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Team Selection */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Select Teams</h2>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {teams.map((team) => (
                  <label key={team._id} className="flex items-center space-x-3 cursor-pointer">
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
                      className="w-4 h-4 text-yellow-400 bg-white/10 border-white/20 rounded focus:ring-yellow-400"
                    />
                    <span className="text-white">
                      {team.name} ({team.players?.length || 0} players)
                    </span>
                  </label>
                ))}
              </div>

              <p className="text-gray-400 text-sm mt-4">
                Selected: {selectedTeams.length} teams
              </p>
            </div>

            {/* Question Selection */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Select Question</h2>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {questions.map((question) => (
                  <label key={question._id} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="question"
                      checked={selectedQuestion?._id === question._id}
                      onChange={() => setSelectedQuestion(question)}
                      className="w-4 h-4 text-yellow-400 bg-white/10 border-white/20 focus:ring-yellow-400 mt-1"
                    />
                    <div>
                      <p className="text-white font-medium">{question.question}</p>
                      <p className="text-gray-400 text-sm">
                        {question.category} • {question.answers?.length || 0} answers
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={createGame}
              disabled={loading || selectedTeams.length < 2}
              className="py-3 px-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Creating Game...' : 'Create Game'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'active' && currentGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Game Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Game Active
            </h1>
            <p className="text-gray-300">
              Connection: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </p>
          </div>

          {/* Current Question */}
          {selectedQuestion && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedQuestion.question}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedQuestion.answers?.map((answer, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      answer.revealed 
                        ? 'bg-green-500/20 border-green-400/30' 
                        : 'bg-white/5 border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">
                        {answer.revealed ? answer.text : `Answer ${index + 1}`}
                      </span>
                      <span className="text-yellow-400 font-bold">
                        {answer.revealed ? answer.points : '?'}
                      </span>
                    </div>
                    
                    {!answer.revealed && (
                      <div className="mt-2 space-x-2">
                        <button
                          onClick={() => handleAnswerReveal(index, true)}
                          className="px-3 py-1 bg-green-500/20 border border-green-400/30 text-green-300 rounded text-sm hover:bg-green-500/30"
                        >
                          Reveal
                        </button>
                        <button
                          onClick={() => handleAnswerReveal(index, false)}
                          className="px-3 py-1 bg-red-500/20 border border-red-400/30 text-red-300 rounded text-sm hover:bg-red-500/30"
                        >
                          Wrong
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teams Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {currentGame.teams?.map((team) => (
              <div key={team.teamId} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {team.name}
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-300">Score: <span className="text-yellow-400 font-bold">{team.score}</span></p>
                  <p className="text-gray-300">Strikes: <span className="text-red-400 font-bold">{team.strikes}/3</span></p>
                  {currentGame.currentTeamTurn === team.teamId && (
                    <p className="text-green-400 font-semibold">🎯 Current Turn</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Game Controls */}
          <div className="text-center space-x-4">
            <button
              onClick={() => setGameState('setup')}
              className="py-2 px-6 bg-gray-500/20 border border-gray-400/30 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-all duration-300"
            >
              New Game
            </button>
            
            <button
              onClick={startGame}
              disabled={!selectedQuestion}
              className="py-2 px-6 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 transition-all duration-300"
            >
              Start Round
            </button>
          </div>

          {/* Buzzer Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-300 mb-2">Share buzzer link with players:</p>
            <code className="bg-white/10 px-4 py-2 rounded text-yellow-300">
              {typeof window !== 'undefined' ? window.location.origin : ''}/buzzer?gameId={gameId}
            </code>
          </div>
        </div>
      </div>
    );
  }

  return null;
}