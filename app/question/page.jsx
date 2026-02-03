"use client";

import { useEffect, useState } from "react";
import styles from "./question.module.css";
import BackToHome from "../../components/BackToHome";

export default function QuestionManager() {
  const [questions, setQuestions] = useState([]);

  // Load from storage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("questions"));
    if (saved) setQuestions(saved);
  }, []);

  // Save to storage
  useEffect(() => {
    localStorage.setItem("questions", JSON.stringify(questions));
  }, [questions]);

  // Import JSON
  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        setQuestions(data);
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const toggleEnabled = (id) => {
    setQuestions(qs =>
      qs.map(q =>
        q.id === id ? { ...q, enabled: !q.enabled } : q
      )
    );
  };

  const updateQuestionText = (id, value) => {
    setQuestions(qs =>
      qs.map(q =>
        q.id === id ? { ...q, question: value } : q
      )
    );
  };

  const updateAnswerText = (qid, index, value) => {
    setQuestions(qs =>
      qs.map(q => {
        if (q.id !== qid) return q;
        const answers = [...q.answers];
        answers[index].text = value;
        return { ...q, answers };
      })
    );
  };

  return (
    <>
      <BackToHome />
      <main className={styles.container}>
      <h1>Question Manager</h1>

      <section className={styles.section}>
        <h2>Import Questions (JSON)</h2>
        <input type="file" accept=".json" onChange={importJSON} />
      </section>

      {questions.map((q, i) => (
        <section
          key={q.id}
          className={`${styles.section} ${!q.enabled ? styles.disabled : ""}`}
        >
          <div className={styles.header}>
            <strong>Q{i + 1}</strong>
            <button
              className={styles.toggle}
              onClick={() => toggleEnabled(q.id)}
            >
              {q.enabled ? "Disable" : "Enable"}
            </button>
          </div>

          <input
            className={styles.input}
            value={q.question}
            onChange={(e) =>
              updateQuestionText(q.id, e.target.value)
            }
          />

          <ul className={styles.answerList}>
            {q.answers.map((a, idx) => (
              <li key={idx}>
                <input
                  className={styles.input}
                  value={a.text}
                  onChange={(e) =>
                    updateAnswerText(q.id, idx, e.target.value)
                  }
                />
                <span className={styles.points}>{a.points}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      </main>
    </>
  );
}
