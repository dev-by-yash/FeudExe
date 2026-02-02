"use client";

import { useState, useEffect } from "react";
import styles from "./setup.module.css";

export default function SetupPage() {
  // ===== STATE =====
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamSize, setTeamSize] = useState(4);

  const [playerName, setPlayerName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

  // ===== LOAD FROM STORAGE =====
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("gameSetup"));
    if (saved) {
      setPlayers(saved.players || []);
      setTeams(saved.teams || []);
      setTeamSize(saved.teamSize || 4);
    }
  }, []);

  // ===== SAVE TO STORAGE =====
  useEffect(() => {
    localStorage.setItem(
      "gameSetup",
      JSON.stringify({ players, teams, teamSize })
    );
  }, [players, teams, teamSize]);

  // ===== ACTIONS =====
  const addPlayer = () => {
    if (!playerName.trim()) return;

    setPlayers([...players, { id: Date.now(), name: playerName.trim() }]);
    setPlayerName("");
  };

  const createTeam = () => {
    if (!teamName.trim()) return;

    setTeams([...teams, { id: Date.now(), name: teamName.trim(), players: [] }]);
    setTeamName("");
  };

  const assignPlayer = () => {
    if (!selectedPlayer || !selectedTeam) return;

    const player = players.find(p => p.id == selectedPlayer);
    if (!player) return;

    setTeams(prev =>
      prev.map(team => {
        if (team.id == selectedTeam) {
          if (team.players.length >= teamSize) {
            alert("Team is full");
            return team;
          }
          return { ...team, players: [...team.players, player] };
        }
        return {
          ...team,
          players: team.players.filter(p => p.id != selectedPlayer),
        };
      })
    );

    setSelectedPlayer("");
    setSelectedTeam("");
  };

  const resetAll = () => {
    if (!confirm("This will RESET EVERYTHING. Continue?")) return;

    localStorage.clear();
    setPlayers([]);
    setTeams([]);
    setTeamSize(4);
  };

  // ===== UI =====
  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>Game Setup (Tech Team Only)</h1>

      {/* ADD PLAYERS */}
      <section className={styles.section}>
        <h2>Add Players</h2>
        <input 
          className={styles.input}
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          placeholder="Player name"
        />
        <button className={styles.btn} onClick={addPlayer}>Add</button>

        <ul className={styles.playerList}>
          {players.map(p => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      </section>

      {/* CREATE TEAMS */}
      <section className={styles.section}>
        <h2>Create Teams</h2>
        <input 
          className={styles.input}
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          placeholder="Team name"
        />
        <button className={styles.btn} onClick={createTeam}>Create</button>

        <ul className={styles.playerList}>
          {teams.map(t => (
            <li key={t.id}>
              {t.name} ({t.players.length}/{teamSize})
            </li>
          ))}
        </ul>
      </section>

      {/* ASSIGN PLAYERS */}
      <section className={styles.section}>
        <h2>Assign Players to Teams</h2>

        <select
          className={styles.sel}
          value={selectedPlayer}
          onChange={e => setSelectedPlayer(e.target.value)}
        >
          <option value="">Select Player</option>
          {players.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          className={styles.sel}
          value={selectedTeam}
          onChange={e => setSelectedTeam(e.target.value)}
        >
          <option value="">Select Team</option>
          {teams.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <button className={styles.btn} onClick={assignPlayer}>Assign</button>
      </section>

      {/* SETTINGS */}
      <section className={styles.section}>
        <h2>Settings</h2>
        <label>
          Team Size:
          <input
          className={styles.input}
            type="number"
            min="1"
            value={teamSize}
            onChange={e => setTeamSize(Number(e.target.value))}
          />
        </label>
      </section>

      {/* RESET */}
      <section className={styles.sectionDanger}>
        <h2>Danger Zone</h2>
        <button onClick={resetAll} className={`${styles.reset} ${styles.btn} `}>
          RESET ALL DATA
        </button>
      </section>
    </main>
  );
}
