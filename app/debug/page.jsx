"use client";

import { useState, useEffect } from 'react';
import { teamAPI, questionAPI } from '../../lib/api';
import BackToHome from '../../components/BackToHome';

export default function DebugPage() {
  const [teams, setTeams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading debug data...');
      
      // Load teams
      const teamsResponse = await teamAPI.getAll();
      console.log('Teams response:', teamsResponse);
      setTeams(teamsResponse.teams || []);
      
      // Load questions
      const questionsResponse = await questionAPI.getAll();
      console.log('Questions response:', questionsResponse);
      setQuestions(questionsResponse.questions || []);
      
    } catch (error) {
      console.error('Debug load error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const testAPI = async () => {
    try {
      const response = await fetch('/api/teams');
      const data = await response.json();
      console.log('Direct API test:', data);
      alert('Check console for API response');
    } catch (error) {
      console.error('API test error:', error);
      alert('API test failed: ' + error.message);
    }
  };

  return (
    <>
      <BackToHome />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Debug Information
          </h1>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6">
              <p className="text-red-300">Error: {error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Teams Debug */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Teams ({teams.length})</h2>
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              
              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No teams found</p>
                  <a 
                    href="/setup" 
                    className="inline-block mt-2 px-4 py-2 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30"
                  >
                    Create Teams
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {teams.map((team, index) => (
                    <div key={team._id || index} className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{team.name}</span>
                        <span className="text-gray-400 text-sm">
                          {team.players?.length || 0} players
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {team._id}
                      </div>
                      {team.players && team.players.length > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          Players: {team.players.map(p => p.name).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Questions Debug */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Questions ({questions.length})</h2>
              
              {questions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No questions found</p>
                  <button
                    onClick={() => {
                      if (confirm('Import sample questions?')) {
                        window.location.href = '/question';
                      }
                    }}
                    className="inline-block mt-2 px-4 py-2 bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30"
                  >
                    Import Questions
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {questions.slice(0, 5).map((question, index) => (
                    <div key={question._id || index} className="bg-white/5 rounded-lg p-3">
                      <div className="text-white font-medium text-sm">
                        {question.question}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Category: {question.category} | Answers: {question.answers?.length || 0}
                      </div>
                    </div>
                  ))}
                  {questions.length > 5 && (
                    <div className="text-center text-gray-400 text-sm">
                      ... and {questions.length - 5} more questions
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* API Test */}
          <div className="mt-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">API Test</h2>
            <div className="space-x-4">
              <button
                onClick={testAPI}
                className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded hover:bg-yellow-500/30"
              >
                Test Teams API
              </button>
              <button
                onClick={() => window.open('/api/teams', '_blank')}
                className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30"
              >
                Open Teams API
              </button>
              <button
                onClick={() => window.open('/api/debug/teams', '_blank')}
                className="px-4 py-2 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30"
              >
                Debug Teams API
              </button>
            </div>
          </div>

          {/* Database Status */}
          <div className="mt-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Database Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{teams.length}</div>
                <div className="text-gray-400">Teams</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{questions.length}</div>
                <div className="text-gray-400">Questions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}