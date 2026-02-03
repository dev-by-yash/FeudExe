"use client";

import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

export default function Host() {
  const startBuzzer = () => {
    socket.emit("start-buzzer");

    const beep = new Audio("/beep.mp3");
    beep.play();
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        background: "#111",
        color: "white",
      }}
    >
      <h1>HOST CONTROL</h1>

      <button
        onClick={startBuzzer}
        style={{
          marginTop: "40px",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          fontSize: "28px",
          background: "red",
          color: "white",
          border: "6px solid #fff",
          boxShadow: "0 0 40px red",
          cursor: "pointer",
        }}
      >
        START
        <br />
        BUZZER
      </button>
    </div>
  );
}
