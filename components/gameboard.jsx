import QuestionBar from "./questionbar";
import OptionCard from "./optioncard";
import Timer from "./timer";
import ScoreBox from "./scorebox";
import styles from "./gameboard.module.css";
import Image from "next/image";

export default function GameBoard() {
  return (
    <div
      className=" bg-gradient-to-br from-blue-900 to-blue-700 flex flex-col items-center gap-8 p-10 text-white"
      style={{
        background:
          "radial-gradient(159.8% 159.8% at 50% 0%, #000 0%, #1B59F5 100%)",
      }}
    >
      <QuestionBar question="Name something students pretend to understand in class but actually don't." />

        
<div className={styles.board}>
      <div className={styles.scoreLeft}></div>
         <ScoreBox score={10} />

      
        <div className="flex flex-col items-center gap-6">
          <Timer time="00" />

          <div className="grid grid-cols-2 gap-4">
            <OptionCard index={1} />
            <OptionCard index={2} />
            <OptionCard index={3} />
            <OptionCard index={4} />
            <OptionCard index={5} />
            <OptionCard index={6} />
          </div>
        </div>
            <ScoreBox score={10} />
        </div>

      <div className={styles.logoWrapper}>
         <Image
          src="/Logo.png"
          alt="FEUD.exe"
          width={220}
          height={120}
          priority
        />
      </div>
    </div>
  );
}
