"use client";

import { useSearchParams } from "next/navigation";
import BackToHome from "../../components/BackToHome";
import Buzzer from "../../buzzer/buzzer";

export default function BuzzerPage() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId") || "default-game";

  return (
    <>
      <BackToHome />
      <Buzzer gameId={gameId} />
    </>
  );
}
