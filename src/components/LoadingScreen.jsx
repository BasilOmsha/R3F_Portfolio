import { useProgress } from "@react-three/drei";
export default function({ started, onStarted }) {
  if (started) return null;
    const { progress } = useProgress();
  return (
    <div className={`loadingScreen ${started ? "loadingScreen--started" : ""}`}>
    <div className="loadingScreen__progress">
      <div
        className="loadingScreen__progress__value"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
    <div className="loadingScreen__board">
      <h1 className="loadingScreen__title">Loading...</h1>
      <button
        className="loadingScreen__button"
        disabled={progress < 100}
        onClick={onStarted}
      >
        Start
      </button>
    </div>
  </div>
  );
}
