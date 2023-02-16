import { FiRefreshCcw } from "react-icons/fi";

export default function Buttons({
  searchWord,
  shuffle,
  clearWord,
  revealedAnswers,
}) {
  return (
    <div className="buttons" style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "1rem",
      marginLeft: "2rem",
    }}>
      <button onClick={() => clearWord()} className="delete-btn">
        Delete
      </button>
      <button
        className="refresh-btn"
        data-testid="shuffle-btn"
        onClick={() => shuffle()}
        disabled={revealedAnswers}
      >
        <FiRefreshCcw />
      </button>
      <button
        onClick={() => searchWord()}
        className="enter-btn"
        disabled={revealedAnswers}
      >
        Enter
      </button>
    </div>
  );
}
