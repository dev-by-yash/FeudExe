"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BackToHome from "../../components/BackToHome";
import BuzzerLink from "../../components/BuzzerLink";
import { gameAPI, questionAPI, teamAPI } from "../../lib/api";
import { useSocket } from "../../hooks/useSocket";
import { useGameState } from "../../lib/gameState";
import { activeGameAPI, generateGameCode } from "../../lib/activeGame";


export default function ControlPanel() {
  const searchParams = useSearchParams();
  const urlGameCode = searchParams.get('gameCode');
  
  const [gameCode, setGameCode] = useState(urlGameCode || null);
  const [activeGame, setActiveGame] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scoringEngine, setScoringEngine] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [buzzerState, setBuzzerState] = useState('disabled');
  const [buzzerWinner, setBuzzerWinner] = useState(null);
  const [buzzerTeams, setBuzzerTeams] = useState({}); // Track teams from buzzer presses

  // Use shared game state
  const {
    gameState: sharedGameState,
    setGameQuestions,
    getCurrentQuestion,
    revealAnswer: revealAnswerInState,
    nextQuestion: nextQuestionInState,
    setTeams,
    updateState,
    setGameId: setSharedGameId
  } = useGameState();

  const currentQuestion = getCurrentQuestion();
  const currentQuestionIndex = sharedGameState.currentQuestionIndex;
  const currentRound = sharedGameState.currentRound;
  const gameQuestions = sharedGameState.questions;

  const {
    buzzerPressed,
    clearBuzzerPressed,
    updateGameState,
    revealAnswer: socketRevealAnswer,
    isConnected,
    emitBuzzerReady,
    emitBuzzerReset,
    teamJoined
  } = useSocket(gameCode);

  // Handle team joined events
  useEffect(() => {
    if (teamJoined) {
      console.log('👥 Team joined event received:', teamJoined);
      // Reload active game to get updated teams
      loadActiveGame(gameCode);
    }
  }, [teamJoined, gameCode]);

  // Initialize scoring engine
  useEffect(() => {
    const initScoring = async () => {
      try {
        const { scoringEngine: engine } = await import('../../lib/scoring');
        setScoringEngine(engine);
        setGameState(engine.getGameState());
        
        // If we already have a game loaded, set team names
        if (currentGame && currentGame.teams && currentGame.teams.length >= 2) {
          const teamA = currentGame.teams[0]?.name || 'Team A';
          const teamB = currentGame.teams[1]?.name || 'Team B';
          console.log(`🏷️ Setting team names in scoring engine: ${teamA} vs ${teamB}`);
          engine.setTeamNames(teamA, teamB);
          setGameState(engine.getGameState());
        }
      } catch (error) {
        console.error('Failed to initialize scoring engine:', error);
      }
    };
    initScoring();
  }, [currentGame]);

  // Load current game state and initialize everything
  useEffect(() => {
    initializeControlPanel();
  }, []);

  const initializeControlPanel = async () => {
    console.log('🎛️ Initializing Control Panel...');

    // PRIORITY 1: Read gameCode from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlGameCode = urlParams.get('gameCode');
    
    let activeGameCode = urlGameCode;
    
    if (urlGameCode) {
      console.log('📍 Using gameCode from URL:', urlGameCode);
      setGameCode(urlGameCode);
      setSharedGameId(urlGameCode);
      localStorage.setItem('currentGameCode', urlGameCode);
    } else {
      // Check localStorage as fallback
      const storedGameCode = localStorage.getItem('currentGameCode');
      if (storedGameCode) {
        console.log('📍 Using gameCode from localStorage:', storedGameCode);
        activeGameCode = storedGameCode;
        setGameCode(storedGameCode);
        setSharedGameId(storedGameCode);
        
        // Update URL to include gameCode
        const newUrl = `${window.location.pathname}?gameCode=${storedGameCode}`;
        window.history.replaceState({}, '', newUrl);
      } else {
        // Generate new game code if none exists
        const newCode = generateGameCode();
        console.log('🆕 Generated new game code:', newCode);
        activeGameCode = newCode;
        setGameCode(newCode);
        setSharedGameId(newCode);
        localStorage.setItem('currentGameCode', newCode);
        
        // Update URL to include gameCode
        const newUrl = `${window.location.pathname}?gameCode=${newCode}`;
        window.history.replaceState({}, '', newUrl);
      }
    }

    // Initialize scoring engine first
    try {
      const { scoringEngine: engine } = await import('../../lib/scoring');
      setScoringEngine(engine);
      setGameState(engine.getGameState());
      console.log('✅ Scoring engine initialized');
    } catch (error) {
      console.error('❌ Failed to initialize scoring engine:', error);
    }

    // Load questions from database
    await loadQuestions();

    // Load or create active game
    await loadActiveGame(activeGameCode);
  };

  // Handle buzzer press events
  useEffect(() => {
    if (buzzerPressed && buzzerState === 'ready') {
      setBuzzerWinner(buzzerPressed);
      setBuzzerState('locked');

      // Track buzzer team names
      if (buzzerPressed.teamId && buzzerPressed.playerName) {
        setBuzzerTeams(prev => ({
          ...prev,
          [buzzerPressed.teamId]: buzzerPressed.playerName
        }));
        
        // Add team to ActiveGame if not already added
        if (gameCode) {
          const teamName = buzzerPressed.playerName;
          const existingTeam = activeGame?.teams?.find(t => t.teamName === teamName);
          
          if (!existingTeam) {
            activeGameAPI.addTeam(gameCode, teamName)
              .then(() => {
                console.log('✅ Added team to ActiveGame:', teamName);
                // Reload active game to get updated teams
                loadActiveGame(gameCode);
              })
              .catch(error => {
                console.error('❌ Failed to add team to ActiveGame:', error);
              });
          }
        }
        
        // Update team names in scoring engine if we have buzzer teams
        if (scoringEngine && Object.keys(buzzerTeams).length === 0) {
          // First buzzer press - set as Team A
          scoringEngine.setTeamNames(buzzerPressed.playerName, 'Team B');
          setGameState(scoringEngine.getGameState());
        } else if (scoringEngine && Object.keys(buzzerTeams).length === 1) {
          // Second team buzzing - set as Team B
          const teamAName = Object.values(buzzerTeams)[0];
          scoringEngine.setTeamNames(teamAName, buzzerPressed.playerName);
          setGameState(scoringEngine.getGameState());
        }
      }

      // Handle buzzer in scoring engine
      if (scoringEngine) {
        const teamLetter = buzzerPressed.teamId === currentGame?.teams[0]?._id ? 'A' : 'B';
        scoringEngine.handleBuzzer(teamLetter);
        setGameState(scoringEngine.getGameState());
      }
      
      // Set buzzer winner in ActiveGame
      if (gameCode) {
        activeGameAPI.setBuzzerWinner(gameCode, buzzerPressed.playerName, buzzerPressed.playerName)
          .then(() => console.log('✅ Buzzer winner set in ActiveGame'))
          .catch(error => console.error('❌ Failed to set buzzer winner:', error));
      }
    }
  }, [buzzerPressed, buzzerState, scoringEngine, currentGame, buzzerTeams, gameCode, activeGame]);

  const loadActiveGame = async (activeGameCode) => {
    try {
      console.log('🎮 Loading active game with code:', activeGameCode);

      if (!activeGameCode) {
        console.log('⚠️ No game code provided');
        return;
      }

      // Get or create game from ActiveGame API
      const response = await activeGameAPI.getGame(activeGameCode);
      
      if (response.success && response.game) {
        setActiveGame(response.game);
        console.log('✅ Loaded active game:', response.game);
        console.log('Game teams:', response.game.teams);

        // Update team names in scoring engine if teams exist
        if (scoringEngine && response.game.teams.length >= 2) {
          const teamA = response.game.teams[0]?.teamName || 'Team A';
          const teamB = response.game.teams[1]?.teamName || 'Team B';
          console.log(`🏷️ Setting team names: ${teamA} vs ${teamB}`);
          scoringEngine.setTeamNames(teamA, teamB);
          scoringEngine.startNewRound(response.game.currentRound || 1);
          setGameState(scoringEngine.getGameState());
          console.log('✅ Scoring engine updated with team names');
        }
      } else {
        console.log('⚠️ Failed to load active game:', response.error);
      }
    } catch (error) {
      console.error('❌ Failed to load active game:', error);
    }
  };

  const loadCurrentGame = async (activeGameId) => {
    try {
      console.log('🎮 Loading current game...');

      // Use provided gameId or try to get from localStorage
      const targetGameId = activeGameId || localStorage.getItem('currentGameId');
      
      if (targetGameId) {
        console.log('Found game ID:', targetGameId);
        setGameId(targetGameId);
        setSharedGameId(targetGameId);

        try {
          const response = await gameAPI.getById(targetGameId);
          if (response.game) {
            setCurrentGame(response.game);
            console.log('✅ Loaded existing game:', response.game._id);
            console.log('Game teams:', response.game.teams);

            // Wait for scoring engine to be ready
            if (scoringEngine) {
              // Set team names in scoring engine
              const teamA = response.game.teams[0]?.name || 'Team A';
              const teamB = response.game.teams[1]?.name || 'Team B';
              console.log(`🏷️ Setting team names: ${teamA} vs ${teamB}`);
              scoringEngine.setTeamNames(teamA, teamB);
              scoringEngine.startNewRound(response.game.currentRound || 1);
              setGameState(scoringEngine.getGameState());
              console.log('✅ Scoring engine updated with team names');
            } else {
              console.warn('⚠️ Scoring engine not ready yet');
            }
            return;
          }
        } catch (error) {
          console.log('Stored game not found, will create new one');
          localStorage.removeItem('currentGameId');
        }
      }

      // If no stored game or it doesn't exist, create a new one
      console.log('🆕 Creating new game...');
      await createNewGame();
    } catch (error) {
      console.error('❌ Failed to load current game:', error);
    }
  };

  const createNewGame = async () => {
    try {
      console.log('🔄 Creating new game with database teams...');

      // Get teams from database
      const teamsResponse = await teamAPI.getAll();
      console.log('Teams response:', teamsResponse);

      if (!teamsResponse.teams || teamsResponse.teams.length < 2) {
        console.error('❌ Need at least 2 teams to create a game');
        console.log('Available teams:', teamsResponse.teams?.length || 0);
        return;
      }

      // Create new game with first 2 teams
      const selectedTeams = teamsResponse.teams.slice(0, 2).map(team => team._id);
      console.log('Selected teams for game:', selectedTeams);

      const gameResponse = await gameAPI.create({
        teamIds: selectedTeams,
        settings: {
          teamSize: 4,
          maxStrikes: 3,
          questionTimeLimit: 30
        }
      });

      if (gameResponse.game) {
        const newGameId = gameResponse.game._id;
        
        setCurrentGame(gameResponse.game);
        setGameId(newGameId);
        setSharedGameId(newGameId);
        localStorage.setItem('currentGameId', newGameId);
        
        // Update URL to include gameId
        const newUrl = `${window.location.pathname}?gameId=${newGameId}`;
        window.history.replaceState({}, '', newUrl);

        console.log('📊 Game Response:', {
          gameId: newGameId,
          teams: gameResponse.game.teams,
          teamNames: gameResponse.game.teams.map(t => t.name)
        });

        if (scoringEngine) {
          const teamA = gameResponse.game.teams[0]?.name || 'Team A';
          const teamB = gameResponse.game.teams[1]?.name || 'Team B';
          console.log(`🏷️ Setting team names for new game: ${teamA} vs ${teamB}`);
          scoringEngine.setTeamNames(teamA, teamB);
          scoringEngine.startNewRound(1);
          const newGameState = scoringEngine.getGameState();
          setGameState(newGameState);
          console.log('✅ Scoring engine initialized with team names');
          console.log('📊 Game State after init:', {
            teamA: newGameState.teams.A,
            teamB: newGameState.teams.B
          });
        }

        console.log('✅ New game created with ID:', newGameId);
        console.log('✅ URL updated to include gameId');
      } else {
        console.error('❌ Failed to create game - no game returned');
      }
    } catch (error) {
      console.error('❌ Failed to create new game:', error);
    }
  };

  const loadQuestions = async () => {
    try {
      console.log('Loading questions from database...');
      const response = await questionAPI.getAll();

      if (!response.questions || response.questions.length === 0) {
        console.error('No questions found in database');
        return;
      }

      console.log(`Found ${response.questions.length} questions in database`);

      // Check if we already have questions in shared state
      if (gameQuestions.length === 0) {
        // Select 9 random questions for the game
        const shuffled = [...response.questions].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.min(9, shuffled.length));

        console.log('Selected questions for game:', selected.map(q => q.question));

        // Set questions in shared state
        setGameQuestions(selected);

        // Initialize scoring engine with first question
        if (scoringEngine && selected[0]) {
          scoringEngine.startNewQuestion(selected[0].answers, 'A');
          setGameState(scoringEngine.getGameState());
        }
      } else {
        console.log('Questions already loaded in shared state');

        // Initialize scoring engine with current question if not already done
        if (scoringEngine && currentQuestion) {
          scoringEngine.startNewQuestion(currentQuestion.answers, gameState?.currentTeam || 'A');
          setGameState(scoringEngine.getGameState());
        }
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  };

  // Reveal answer with advanced scoring and real-time sync
  const revealAnswer = async (answerIndex) => {
    if (!currentQuestion || !scoringEngine || !gameState) return;

    const answer = currentQuestion.answers[answerIndex];
    if (!answer || gameState.revealedAnswers[answerIndex]) return;

    setLoading(true);
    try {
      console.log(`🎯 Revealing answer ${answerIndex + 1}: ${answer.text}`);

      // Process correct answer through scoring engine
      const result = scoringEngine.processCorrectAnswer(answerIndex, answer.points);

      if (result.success) {
        // Update game state
        setGameState(scoringEngine.getGameState());

        // Update shared state
        revealAnswerInState(currentQuestionIndex, answerIndex);

        // Save to database if we have a current game
        if (currentGame) {
          try {
            await gameAPI.answer(currentGame._id, {
              answerIndex,
              isCorrect: true,
              scoreCalculation: result.scoreCalculation,
              teamScore: result.scoreCalculation?.totalScore || 0,
              questionIndex: currentQuestionIndex
            });
            console.log('✅ Answer saved to database');
          } catch (dbError) {
            console.error('❌ Failed to save answer to database:', dbError);
          }
        }

        // CRITICAL: Broadcast to ALL clients including game page
        socketRevealAnswer(gameCode, {
          answerIndex,
          answer,
          points: result.scoreCalculation.totalScore,
          teamId: result.team,
          scoreBreakdown: result.scoreCalculation,
          questionIndex: currentQuestionIndex
        });

        // Also emit comprehensive game state update
        updateGameState({
          gameState: 'active',
          message: `Correct! +${result.scoreCalculation.totalScore} points (Base: ${result.scoreCalculation.basePoints}, Round ×${result.scoreCalculation.roundMultiplier}, Streak ×${result.scoreCalculation.streakMultiplier}${result.scoreCalculation.buzzerBonus ? ', Buzzer +' + result.scoreCalculation.buzzerBonus : ''})`,
          teamScores: [gameState.teams.A.score, gameState.teams.B.score],
          // Send answer reveal info for game page synchronization
          answerRevealed: {
            questionIndex: currentQuestionIndex,
            answerIndex: answerIndex,
            answer: answer,
            points: result.scoreCalculation.totalScore
          }
        });

        console.log('✅ Answer revealed and broadcasted:', result);
      }
    } catch (error) {
      console.error('❌ Failed to reveal answer:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle wrong answer with database integration
  const handleWrongAnswer = async () => {
    if (!scoringEngine || !gameState) return;

    setLoading(true);
    try {
      const result = scoringEngine.processWrongAnswer();

      if (result.success) {
        setGameState(scoringEngine.getGameState());

        // Save to database if we have a current game
        if (currentGame) {
          try {
            await gameAPI.answer(currentGame._id, {
              isCorrect: false,
              strikes: result.strikes,
              controlSwitch: result.controlSwitch,
              questionIndex: currentQuestionIndex
            });
            console.log('Wrong answer saved to database');
          } catch (dbError) {
            console.error('Failed to save wrong answer to database:', dbError);
            // Continue anyway - don't block the UI
          }
        }

        updateGameState({
          gameState: 'active',
          message: `Wrong answer! Strike added (${result.strikes}/3). ${result.controlSwitch ? 'Control switches for steal opportunity!' : 'Buzzer is active again.'}`
        });

        console.log('Wrong answer processed:', result);
      }
    } catch (error) {
      console.error('Failed to handle wrong answer:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enable buzzer
  const enableBuzzer = async () => {
    setBuzzerState('ready');
    setBuzzerWinner(null);
    clearBuzzerPressed();

    console.log('🟢 Buzzer enabled for question', currentQuestionIndex + 1, 'in gameCode:', gameCode);
    console.log('📡 Emitting buzzer-ready event to game room:', `game-${gameCode}`);

    // Update ActiveGame in database
    if (gameCode) {
      try {
        await activeGameAPI.enableBuzzer(gameCode);
        console.log('✅ Buzzer enabled in ActiveGame database');
      } catch (error) {
        console.error('❌ Failed to enable buzzer in database:', error);
      }
    }

    // Emit the proper socket event that buzzer pages listen for
    emitBuzzerReady();

    // Also send game state update for other listeners
    updateGameState({
      buzzerState: 'ready',
      gameState: 'buzzer',
      message: 'Buzzer is now active! Teams can buzz in.',
      buzzerEnabled: true,
      questionIndex: currentQuestionIndex
    });
    
    console.log('✅ Buzzer events emitted');
  };

  // Reset buzzer
  const resetBuzzer = async () => {
    setBuzzerState('disabled');
    setBuzzerWinner(null);
    clearBuzzerPressed();

    // Update ActiveGame in database
    if (gameCode) {
      try {
        await activeGameAPI.disableBuzzer(gameCode);
        console.log('✅ Buzzer disabled in ActiveGame database');
      } catch (error) {
        console.error('❌ Failed to disable buzzer in database:', error);
      }
    }

    // Emit the proper socket event that buzzer pages listen for
    emitBuzzerReset();

    // Also send game state update for other listeners
    updateGameState({
      buzzerState: 'disabled',
      message: 'Buzzer reset'
    });
  };

  // Handle steal attempt
  const handleStealAttempt = async (answerIndex) => {
    if (!scoringEngine || !currentQuestion) return;

    setLoading(true);
    try {
      const answer = currentQuestion.answers[answerIndex];
      const result = scoringEngine.processStealAttempt(true, answerIndex, answer.points);

      if (result.success && result.stealSuccessful) {
        setGameState(scoringEngine.getGameState());

        // Update question state
        const updatedQuestion = { ...currentQuestion };
        updatedQuestion.answers[answerIndex].revealed = true;
        setCurrentQuestion(updatedQuestion);

        updateGameState({
          gameState: 'completed',
          message: `SUCCESSFUL STEAL! +${result.stealScore} points! Question completed.`
        });
      }
    } catch (error) {
      console.error('Failed to handle steal:', error);
    } finally {
      setLoading(false);
    }
  };

  // Next question with database integration and real-time sync
  const nextQuestion = async () => {
    if (currentQuestionIndex < gameQuestions.length - 1) {
      console.log('🔄 Moving to next question...');

      // Update shared state first
      nextQuestionInState();

      const nextIndex = currentQuestionIndex + 1;
      const newRound = Math.ceil((nextIndex + 1) / 3);
      const questionInRound = (nextIndex % 3) + 1;

      // Initialize new question in scoring engine
      if (scoringEngine && gameQuestions[nextIndex]) {
        if (newRound !== currentRound) {
          scoringEngine.startNewRound(newRound);
        }
        scoringEngine.startNewQuestion(gameQuestions[nextIndex].answers, gameState?.currentTeam || 'A');
        setGameState(scoringEngine.getGameState());
      }

      // Save progress to database if we have a current game
      if (currentGame) {
        try {
          await gameAPI.start(currentGame._id, {
            questionId: gameQuestions[nextIndex]._id,
            questionIndex: nextIndex,
            round: newRound
          });
          console.log('✅ Next question progress saved to database');
        } catch (dbError) {
          console.error('❌ Failed to save next question to database:', dbError);
        }
      }

      // CRITICAL: Broadcast to ALL clients including game page
      updateGameState({
        gameState: 'active',
        message: `Round ${newRound}, Question ${questionInRound} ready!`,
        nextQuestion: {
          questionIndex: nextIndex,
          round: newRound,
          questionInRound: questionInRound,
          question: gameQuestions[nextIndex]
        },
        // Send complete game state for synchronization
        currentQuestion: gameQuestions[nextIndex],
        currentQuestionIndex: nextIndex,
        currentRound: newRound,
        revealedAnswers: Array(6).fill(false) // Reset revealed answers for new question
      });

      // Reset buzzer state for new question
      setBuzzerState('disabled');
      setBuzzerWinner(null);
      clearBuzzerPressed();

      // Broadcast buzzer reset to all clients
      updateGameState({
        buzzerState: 'disabled',
        buzzerReset: true,
        message: 'Buzzer reset for new question'
      });

      console.log(`✅ Advanced to question ${nextIndex + 1}/9 - Round ${newRound}, Question ${questionInRound}`);
    } else {
      // Game completed
      updateGameState({
        gameState: 'completed',
        message: 'Game completed! All 9 questions finished.',
        gameCompleted: true
      });

      console.log('🎉 Game completed!');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key >= "1" && e.key <= "6") {
        e.preventDefault();
        revealAnswer(Number(e.key) - 1);
      }
      if (e.key === "x" || e.key === "X") {
        e.preventDefault();
        handleWrongAnswer();
      }
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        enableBuzzer();
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        resetBuzzer();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentQuestion, scoringEngine, gameState]);

  // Save team scores to database
  const saveTeamScores = async () => {
    if (!currentGame || !gameState) return;

    try {
      // Update team scores in database
      const teamUpdates = Object.entries(gameState.teams).map(([teamLetter, team]) => ({
        teamId: currentGame.teams.find(t => t.name === team.name)?._id,
        score: team.score,
        strikes: team.strikes
      }));

      for (const update of teamUpdates) {
        if (update.teamId) {
          // You might need to create this API endpoint
          console.log('Would save team score:', update);
        }
      }
    } catch (error) {
      console.error('Failed to save team scores:', error);
    }
  };

  // Auto-save scores periodically
  useEffect(() => {
    if (gameState && currentGame) {
      const interval = setInterval(saveTeamScores, 10000); // Save every 10 seconds
      return () => clearInterval(interval);
    }
  }, [gameState, currentGame]);

  const getTeamName = (teamLetter) => {
    if (!gameState || !gameState.teams[teamLetter]) return `Team ${teamLetter}`;
    return gameState.teams[teamLetter].name;
  };

  return (
    <>
      <BackToHome />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎛️ Host Control Panel</h1>
          <p className="text-gray-300">Advanced game controls with scoring system</p>

          {/* Debug Info */}
          <div className="mt-4 p-3 bg-white/5 rounded-lg max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400">
              <div>
                <div className="font-semibold text-gray-300">Game Status</div>
                <div>Game Code: {gameCode}</div>
                <div>ActiveGame: {activeGame ? '✅ Connected' : '❌ Not Connected'}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-300">Questions</div>
                <div>Loaded: {gameQuestions.length}/9</div>
                <div>Current: {currentQuestionIndex + 1}/{gameQuestions.length}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-300">Game Progress</div>
                <div>Round: {currentRound}/3</div>
                <div>Socket: {isConnected ? '✅' : '❌'}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-300">Buzzer Teams</div>
                <div>Connected: {activeGame?.teams?.length || 0}</div>
                {activeGame?.teams?.map((team, idx) => (
                  <div key={idx} className="text-green-400">🔔 {team.teamName}</div>
                ))}
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={async () => {
                  console.log('🔄 Testing database connection...');
                  try {
                    const teamsTest = await teamAPI.getAll();
                    const questionsTest = await questionAPI.getAll();
                    const activeGameTest = gameCode ? await activeGameAPI.getGame(gameCode) : null;
                    console.log('✅ Database test results:');
                    console.log('Teams:', teamsTest.teams?.length || 0);
                    console.log('Questions:', questionsTest.questions?.length || 0);
                    console.log('ActiveGame:', activeGameTest);
                    alert(`Database Test:\nTeams: ${teamsTest.teams?.length || 0}\nQuestions: ${questionsTest.questions?.length || 0}\nActiveGame: ${activeGameTest?.success ? 'Connected' : 'Not found'}`);
                  } catch (error) {
                    console.error('❌ Database test failed:', error);
                    alert('Database test failed: ' + error.message);
                  }
                }}
                className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs hover:bg-red-500/30"
              >
                Test DB
              </button>
              <button
                onClick={() => {
                  console.log('📊 Current State:', {
                    gameCode,
                    activeGame,
                    currentGame,
                    gameState,
                    buzzerTeams,
                    buzzerWinner
                  });
                }}
                className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs hover:bg-blue-500/30"
              >
                Log State
              </button>
            </div>
          </div>
        </div>

        {/* Game Status Bar */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-yellow-400 font-semibold">Round</div>
                <div className="text-white text-xl">{currentRound}/3</div>
                <div className="text-gray-400 text-sm">×{gameState?.roundMultiplier || 1} multiplier</div>
              </div>
              <div>
                <div className="text-orange-400 font-semibold">Streak</div>
                <div className="text-white text-xl">{gameState?.streakCount || 0}</div>
                <div className="text-gray-400 text-sm">
                  {gameState?.streakTeam ? `Team ${gameState.streakTeam}` : 'None'}
                </div>
                {gameState?.streakCount > 0 && (
                  <div className="text-xs text-orange-300 mt-1">
                    ×{gameState?.streakMultiplier || 1} bonus
                  </div>
                )}
              </div>
              <div>
                <div className="text-blue-400 font-semibold">Current Team</div>
                <div className="text-white text-xl">{gameState?.currentTeam || 'A'}</div>
                <div className="text-gray-400 text-sm">
                  {getTeamName(gameState?.currentTeam || 'A')}
                </div>
              </div>
              <div>
                <div className="text-green-400 font-semibold">Connection</div>
                <div className="text-white text-xl">{isConnected ? '🟢' : '🔴'}</div>
                <div className="text-gray-400 text-sm">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
              <div>
                <div className="text-purple-400 font-semibold">Actions</div>
                <div className="space-x-2">
                  <button
                    onClick={createNewGame}
                    className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs hover:bg-blue-500/30"
                  >
                    New Game
                  </button>
                  <button
                    onClick={loadQuestions}
                    className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs hover:bg-green-500/30"
                  >
                    Reload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Control Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto mb-6">

          {/* Current Question Display */}
          {currentQuestion && (
            <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Current Question</h2>
                  <p className="text-xl text-gray-300 mb-2">{currentQuestion.question}</p>
                  <p className="text-gray-400">Category: {currentQuestion.category}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Question {currentQuestionIndex + 1} of {gameQuestions.length}</div>
                  <div className="text-sm text-gray-400">Round {currentRound}</div>
                </div>
              </div>

              {/* Buzzer Winner Display */}
              {buzzerWinner && (
                <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 mb-4">
                  <h4 className="text-lg font-bold text-yellow-300 mb-2">🏆 Buzzer Winner!</h4>
                  <p className="text-white">
                    <strong>{buzzerWinner.playerName}</strong> from <strong>{buzzerWinner.teamName || 'Unknown Team'}</strong>
                  </p>
                  <p className="text-gray-300 text-sm mt-1">
                    Time: {new Date(buzzerWinner.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              )}

              {/* Answers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentQuestion.answers.map((answer, index) => (
                  <div
                    key={`answer-${currentQuestionIndex}-${index}-${answer.text}`}
                    className={`p-4 rounded-lg border min-h-[100px] flex flex-col justify-between ${gameState?.revealedAnswers[index] || answer.revealed
                      ? 'bg-green-500/20 border-green-400/30'
                      : 'bg-white/5 border-white/20'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <span className="text-white font-medium">
                          {gameState?.revealedAnswers[index] || answer.revealed ? answer.text : 'Hidden Answer'}
                        </span>
                      </div>
                      <span className="text-yellow-400 font-bold text-xl">
                        {gameState?.revealedAnswers[index] || answer.revealed ? answer.points : '?'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answer Reveal Controls */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">🎯 Answer Controls</h2>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {Array.from({ length: 6 }, (_, index) => {
                const answer = currentQuestion?.answers?.[index];
                const isRevealed = gameState?.revealedAnswers[index] || answer?.revealed;

                return (
                  <button
                    key={`answer-btn-${currentQuestionIndex}-${index}`}
                    onClick={() => revealAnswer(index)}
                    disabled={loading || !answer || isRevealed}
                    className={`aspect-square rounded-lg font-bold text-xl transition-all duration-300 ${isRevealed
                      ? 'bg-green-500/30 border-green-400/50 text-green-300 cursor-not-allowed'
                      : answer
                        ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300 hover:bg-yellow-500/30 hover:scale-105'
                        : 'bg-gray-500/20 border-gray-400/30 text-gray-500 cursor-not-allowed'
                      } border`}
                  >
                    {index + 1}
                    {isRevealed && <div className="text-xs mt-1">✓</div>}
                    {answer && !isRevealed && (
                      <div className="text-xs mt-1">{answer.points}pts</div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleWrongAnswer}
                disabled={loading}
                className="py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-300"
              >
                ❌ Wrong Answer
              </button>

              <button
                onClick={nextQuestion}
                disabled={loading || currentQuestionIndex >= gameQuestions.length - 1}
                className="py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-300"
              >
                ➡️ Next Question
              </button>
            </div>

            {/* Steal Controls */}
            {gameState?.canSteal && (
              <div className="p-4 bg-red-500/10 border border-red-400/30 rounded-lg mb-4">
                <h4 className="text-red-400 font-semibold mb-2">🎯 Steal Opportunity</h4>
                <p className="text-white text-sm mb-3">
                  Team {gameState.currentTeam} can steal! Choose correct answer:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {currentQuestion?.answers.map((answer, index) => (
                    !gameState.revealedAnswers[index] && (
                      <button
                        key={`steal-btn-${currentQuestionIndex}-${index}`}
                        onClick={() => handleStealAttempt(index)}
                        className="py-2 px-3 bg-green-500/20 border border-green-400/30 text-green-300 rounded text-sm hover:bg-green-500/30"
                      >
                        #{index + 1}
                      </button>
                    )
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-white/5 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">⌨️ Keyboard Shortcuts</h4>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                <div><kbd className="px-1 py-0.5 bg-white/20 rounded">1-6</kbd> Reveal Answer</div>
                <div><kbd className="px-1 py-0.5 bg-white/20 rounded">X</kbd> Wrong Answer</div>
                <div><kbd className="px-1 py-0.5 bg-white/20 rounded">B</kbd> Enable Buzzer</div>
                <div><kbd className="px-1 py-0.5 bg-white/20 rounded">R</kbd> Reset Buzzer</div>
              </div>
            </div>
          </div>

          {/* Unified Buzzer Control */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">🔔 Buzzer Control</h2>

            {/* Buzzer Status */}
            <div className="mb-6">
              <div className={`px-4 py-3 rounded-lg text-center font-semibold ${buzzerState === 'ready' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                buzzerState === 'locked' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                  'bg-gray-500/20 text-gray-300 border border-gray-400/30'
                }`}>
                {buzzerState === 'ready' && '🟢 BUZZER ACTIVE'}
                {buzzerState === 'locked' && '🔴 BUZZER LOCKED'}
                {buzzerState === 'disabled' && '⚫ BUZZER DISABLED'}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={enableBuzzer}
                disabled={buzzerState === 'ready'}
                className="py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                🔔 Enable Buzzer
              </button>

              <button
                onClick={resetBuzzer}
                className="py-3 px-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300"
              >
                🔄 Reset Buzzer
              </button>
            </div>

            {/* Team Scores */}
            {gameState && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white">Team Scores</h4>
                {Object.entries(gameState.teams).map(([teamLetter, team], index) => {
                  // Priority: Buzzer team name > Database team name > Generic name
                  const buzzerTeamName = Object.values(buzzerTeams)[index];
                  const dbTeamName = currentGame?.teams?.[index]?.name;
                  const displayName = buzzerTeamName || dbTeamName || team.name || `Team ${teamLetter}`;

                  return (
                    <div key={teamLetter} className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-white font-semibold">{displayName}</span>
                          <span className="text-gray-400 text-sm ml-2">(Team {teamLetter})</span>
                          {buzzerTeamName && (
                            <span className="text-green-400 text-xs ml-2">🔔 From Buzzer</span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-400 font-bold">{team.score.toLocaleString()}</div>
                          <div className="text-red-400 text-sm">{team.strikes}/3 strikes</div>
                        </div>
                      </div>
                      {gameState.currentTeam === teamLetter && (
                        <div className="text-green-400 text-sm mt-1">🎯 Current Turn</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Buzzer Link Section */}
        <div className="max-w-7xl mx-auto">
          <BuzzerLink gameId={gameCode} />
        </div>
      </div>
    </>
  );
}
