# Feud.Exe – Event Flow & Website Specification

## 1. Event Overview

**Event Name:** Feud.Exe
**Tagline:** Execution Begins With The Beep
**Inspired By:** Family Feud (college-friendly, fast-paced version)

Feud.Exe is a team-based, survey-driven quiz event designed for a college tech fest. Instead of families, teams of students compete head-to-head. The game emphasizes quick reactions (buzzer system), teamwork, strategy, and audience engagement.

---

## 2. Physical Setup & Devices

### Devices Involved

* **Laptop 1 – Control Panel (Admin Screen)**

  * Managed by event coordinators
  * Controls match flow, questions, answers, timer, scoring

* **Laptop 2 – Display Screen (Public View)**

  * Projected to audience
  * Shows questions, revealed answers, strikes, timer, and leaderboard

* **2 Mobile Phones – Buzzer Devices**

  * One phone per team
  * Connected to the server
  * Used only to buzz in (first-press detection)

> The buzzer system is already implemented and integrated in `src/` with a working flow. The website must adapt to this existing logic.

---

## 3. Website Architecture (High Level)

The system is a **multi-screen web application** backed by a lightweight SQL database.

### Key Characteristics

* Real-time updates (buzzer, timer, score, leaderboard)
* Multi-client sync (admin, display, mobiles)
* Minimal dependencies
* Local-first (no cloud dependency required)

---

## 4. Technology & Storage

### Database

* **Preferred:** MySQL
* **Alternative:** SQLite3 (acceptable for local / offline setup)

> Supabase is intentionally avoided to reduce dependency and overhead.

### Data Storage Usage

* **Database:**

  * Players
  * Teams
  * Questions & answers
  * Scores & streaks
* **Local Storage (Browser):**

  * Temporary UI state
  * Selected teams for current match
  * Admin preferences

---

## 5. Core Website Modules

### 5.1 Player Management

* Add players (name, optional ID)
* Players are reusable across matches

### 5.2 Team Management

* Create teams
* Assign players to teams
* Team size is **configurable** via settings

### 5.3 Settings Page

* Configure:

  * Team size (default: 4)
  * Timer duration per question
  * Streak bonus values
* Changes apply globally

---

## 6. Question System

### 6.1 Question Structure

Each question contains:

* Question text
* Category (e.g., Fun, Tech, College Life)
* Top answers (ranked)
* Points per answer (based on popularity)

### 6.2 Question Import

* Questions are stored in JSON format
* A **script** parses JSON and inserts data directly into SQL
* No manual DB editing required

### 6.3 Question Management UI

* View all questions on the website
* Edit answers / points for last-minute corrections
* Enable or disable questions if needed

---

## 7. Match Flow (Event Execution)

### Step 1: Match Setup

* Admin selects **two teams** from the team list
* Clicks **Start Feud**

### Step 2: Question Display

* Question appears on Display Screen
* Answers remain hidden
* Timer starts automatically

### Step 3: Buzzer Phase

* One player from each team uses their mobile buzzer
* First buzz is locked
* Winning team gets the first chance to answer

---

## 8. Answer Reveal System

### Numpad-Based Control (Admin)

* **1–5:** Reveal answer by rank
* **X / Wrong Button:**

  * Show large ❌ on screen
  * Count as a strike

### Strike Rules

* Max **3 strikes per question per team**
* On 3 strikes:

  * Turn passes or question ends (based on rules)

---

## 9. Streak & Scoring System

### Base Scoring

* Points awarded based on answer rank/popularity

### Streak Logic

* Consecutive correct answers by the **same team** form a streak
* Example:

  * 2 correct in a row → +10 bonus points
  * 3 correct in a row → +20 bonus points
  * Continues incrementally

### Streak Reset

* Wrong answer
* Timeout
* Turn passes to other team

---

## 10. Leaderboard System

### Leaderboard Screen

* Separate screen (Laptop 2)
* Displays:

  * All teams
  * Current scores
  * Rank ordering

### Updates

* Scores update **live**
* Reflects streak bonuses instantly

---

## 11. End of Match & Progression

* Minimum 3 questions per match
* Scores are cumulative
* Winners advance to next round
* Tie-breakers handled via sudden-death questions

---

## 12. What This Website Is

* A **real-time event control system**
* A **game engine for Feud-style events**
* A **multi-device synchronized web app**

## 13. What This Website Is NOT

* Not a public quiz website
* Not user-auth heavy
* Not cloud-dependent

---

## 14. Summary

The Feud.Exe website acts as the digital backbone of the event, coordinating:

* Teams & players
* Questions & answers
* Buzzers & timers
* Scoring, streaks, and leaderboard

All of this happens **live**, with minimal friction, ensuring the event feels fast, fair, and exciting for both participants and the audience.
