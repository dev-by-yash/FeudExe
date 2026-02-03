"use client";

import { useSearchParams } from "next/navigation";
import BackToHome from "../../components/BackToHome";
import Buzzer from "../../buzzer/buzzer";

export default function BuzzerPage() {
  const searchParams = useSearchParams();
  const gameCode = searchParams.get("gameCode") || "default-game";

  return (
    <>
      <BackToHome />
      <Buzzer gameCode={gameCode} />
    </>
  );
}
