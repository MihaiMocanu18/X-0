// App.js
import { useState, useMemo, useEffect, useRef } from "react";

/* —————— Stiluri inline (dark) —————— */
const styles = `
html, body, #root { height: 100%; }
* { box-sizing: border-box; }
body {
  margin: 0;
  background: #0b0f19; /* very dark blue/gray */
  color: #e5e7eb;      /* gray-200 */
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
}
.page {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(1200px 600px at 20% -10%, rgba(168,85,247,0.15), transparent 60%),
    radial-gradient(1000px 600px at 120% 110%, rgba(99,102,241,0.12), transparent 60%),
    #0b0f19;
}
.card {
  width: 100%;
  max-width: 980px;
  background: rgba(17, 24, 39, 0.85); /* slate-900 with alpha */
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 12px 40px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,0.03);
  backdrop-filter: blur(6px);
}
.title { margin: 0 0 14px; font-size: 26px; font-weight: 800; letter-spacing: .2px; color: #f4f4f5; }
.topbar { display:flex; gap:12px; align-items:center; margin-bottom:16px; font-size:14px; }
.badge { display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius: 999px; background:#111827; border:1px solid rgba(148,163,184,.2); }
.separator { flex:1; }
.row { display:flex; gap: 12px; align-items:center; flex-wrap: wrap; }
.selectGroup { display:flex; gap:8px; background:#0b1220; border:1px solid rgba(148,163,184,.2); padding:6px; border-radius: 12px; }
.toggle { padding:8px 12px; border-radius:10px; border:1px solid transparent; cursor:pointer; color:#cbd5e1; background:transparent; }
.toggle--active { background: linear-gradient(180deg, #1f2937, #0b1220); border-color: rgba(148,163,184,.35); color:#f8fafc; box-shadow: 0 0 0 1px rgba(99,102,241,.4) inset; }

.layout { display:grid; grid-template-columns: auto 1fr; gap:20px; }
@media (max-width: 880px) { .layout { grid-template-columns: 1fr; } }

.panel {
  border:1px solid rgba(148,163,184,.18);
  border-radius: 14px;
  padding: 14px;
  background: linear-gradient(180deg, rgba(2,6,23,.6), rgba(2,6,23,.35));
}

.status {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #e9d5ff; /* violet-200 */
  text-shadow: 0 0 16px rgba(168,85,247,.25);
}

/* Tabla */
.board {
  display: grid;
  grid-template-columns: repeat(3, 78px);
  grid-auto-rows: 78px;
  gap: 12px;
  user-select: none;
}
@media (max-width: 420px) {
  .board { grid-template-columns: repeat(3, 64px); grid-auto-rows:64px; gap:10px; }
}

/* Celule */
.sq {
  display:flex; align-items:center; justify-content:center;
  border-radius: 14px;
  border: 1px solid rgba(148,163,184,.25);
  background: #0b1220;
  color: #f8fafc;
  font-size: 32px;
  font-weight: 800;
  cursor: pointer;
  transition: transform .06s ease, background .15s ease, box-shadow .15s ease, border-color .15s ease;
  box-shadow: 0 6px 14px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.02);
}
.sq:hover { background: #0e1730; }
.sq:active { transform: scale(0.985); }
.sq--hl {
  background: radial-gradient(140px 90px at 50% 30%, rgba(168,85,247,.35), rgba(14,23,48,1));
  border-color: rgba(168,85,247,.65);
  box-shadow: 0 0 0 1px rgba(168,85,247,.35) inset, 0 8px 18px rgba(168,85,247,.2);
}

/* Butoane */
.btn {
  border:1px solid rgba(148,163,184,.3);
  background: #0b1220;
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 10px;
  cursor: pointer;
  color: #e5e7eb;
  transition: background .15s ease, opacity .15s ease, box-shadow .15s ease, border-color .15s ease;
}
.btn:hover { background: #0e1730; }
.btn:disabled { opacity:.5; cursor:not-allowed; }
.btn--soft { background: #111827; }
.btn--main {
  background: radial-gradient(120px 60px at 50% 0%, rgba(99,102,241,.35), #0b1220);
  border-color: rgba(99,102,241,.5);
}
.btn--main:hover { box-shadow: 0 0 0 1px rgba(99,102,241,.35) inset; }

/* Istoric */
.historyHeader { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.subtitle { font-weight: 700; color: #e2e8f0; }
.historyList { display:flex; flex-direction:column; gap:8px; list-style: none; margin:0; padding:0; max-height: 340px; overflow:auto; }
.historyList li { display:flex; }
.stepBtn { width: 100%; text-align: left; }

/* Hint */
.hint {
  margin-top: 12px;
  font-size: 12px;
  color: #94a3b8;
}
.sep { height:1px; background: rgba(148,163,184,.15); margin: 12px 0; border-radius: 1px; }

.score { display:flex; gap:10px; align-items:center; }
.score .pill { padding:6px 10px; border-radius: 999px; background:#0b1220; border:1px solid rgba(148,163,184,.25); }
`;

/* —————— Utilitare joc —————— */
const LINES = [
  [0, 1, 2],[3, 4, 5],[6, 7, 8],
  [0, 3, 6],[1, 4, 7],[2, 5, 8],
  [0, 4, 8],[2, 4, 6],
];

function calculateWinner(sq) {
  for (const [a,b,c] of LINES) {
    if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) {
      return { winner: sq[a], line: [a,b,c] };
    }
  }
  return null;
}
const emptyIndices = (sq) => sq.map((v,i)=>v?null:i).filter(i=>i!==null);

/* —————— AI: Easy (win > block > random) —————— */
function aiMoveEasy(sq) {
  // 1) câștigă dacă poate
  for (const [a,b,c] of LINES) {
    const line = [a,b,c];
    const vals = line.map(i => sq[i]);
    if (vals.filter(v=>v==='O').length===2 && vals.includes(null)) {
      return line[vals.indexOf(null)];
    }
  }
  // 2) blochează X dacă urmează să câștige
  for (const [a,b,c] of LINES) {
    const line = [a,b,c];
    const vals = line.map(i => sq[i]);
    if (vals.filter(v=>v==='X').length===2 && vals.includes(null)) {
      return line[vals.indexOf(null)];
    }
  }
  // 3) centru > colț aleator > rest
  if (sq[4] === null) return 4;
  const corners = [0,2,6,8].filter(i=>sq[i]===null);
  if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
  const empties = emptyIndices(sq);
  return empties[Math.floor(Math.random()*empties.length)];
}

/* —————— AI: Hard (Minimax, perfect) —————— */
function evaluate(sq) {
  const res = calculateWinner(sq);
  if (res?.winner === 'O') return +10;
  if (res?.winner === 'X') return -10;
  return 0;
}
function isFull(sq) { return sq.every(v => v !== null); }

function minimax(sq, maximizing, depth=0) {
  const score = evaluate(sq);
  if (score === 10) return score - depth;   // câștig mai rapid e mai bun
  if (score === -10) return score + depth;  // pierdere întârziată e puțin mai bună
  if (isFull(sq)) return 0;

  if (maximizing) { // O
    let best = -Infinity;
    for (const i of emptyIndices(sq)) {
      sq[i] = 'O';
      best = Math.max(best, minimax(sq, false, depth+1));
      sq[i] = null;
    }
    return best;
  } else {          // X
    let best = +Infinity;
    for (const i of emptyIndices(sq)) {
      sq[i] = 'X';
      best = Math.min(best, minimax(sq, true, depth+1));
      sq[i] = null;
    }
    return best;
  }
}
function aiMoveHard(sq) {
  let bestVal = -Infinity;
  let bestMove = null;
  for (const i of emptyIndices(sq)) {
    sq[i] = 'O';
    const moveVal = minimax(sq, false, 0);
    sq[i] = null;
    if (moveVal > bestVal) {
      bestVal = moveVal;
      bestMove = i;
    }
  }
  return bestMove ?? aiMoveEasy(sq); // fallback (nu ar trebui să se întâmple)
}

/* —————— Componente UI —————— */
function Square({ value, onClick, highlight }) {
  return (
    <button className={`sq ${highlight ? "sq--hl" : ""}`} onClick={onClick} aria-label={value ? `Celulă ${value}` : "Celulă goală"}>
      {value}
    </button>
  );
}
function Board({ squares, onPlay, xIsNext, locked, winningLine }) {
  const handleClick = (i) => {
    if (locked || squares[i]) return;
    const next = squares.slice();
    next[i] = xIsNext ? "X" : "O";
    onPlay(next, i);
  };
  return (
    <div className="board">
      {squares.map((sq, i) => (
        <Square key={i} value={sq} onClick={() => handleClick(i)} highlight={winningLine?.includes(i)} />
      ))}
    </div>
  );
}

/* —————— App —————— */
export default function App() {
  // Istoric: fiecare mutare păstrează tabla + indexul celulei mutate
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), moveIndex: null }]);
  const [step, setStep] = useState(0);
  const [sortDesc, setSortDesc] = useState(false);
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [difficulty, setDifficulty] = useState("easy"); // "easy" | "hard"

  // Control pentru când să ruleze AI-ul (evită auto-move după undo/jump)
  const aiAutoPlay = useRef(true);

  const xIsNext = step % 2 === 0; // X (omul) mută primul
  const current = history[step];

  const result = useMemo(() => calculateWinner(current.squares), [current.squares]);
  const isBoardFull = useMemo(() => current.squares.every((s) => s !== null), [current.squares]);
  const isDraw = !result && isBoardFull;
  const locked = Boolean(result || isDraw);

  const status = result
    ? `Câștigă: ${result.winner}`
    : isDraw
    ? "Remiză"
    : `Urmează: ${xIsNext ? "Tu (X)" : "Calculator (O)"}`;

  function handlePlay(nextSquares, moveIndex) {
    const nextHistory = [...history.slice(0, step + 1), { squares: nextSquares, moveIndex }];
    setHistory(nextHistory);
    setStep(nextHistory.length - 1);
    // După mutarea omului, permitem AI-ului să joace (dacă e rândul lui)
    aiAutoPlay.current = true;
  }

  function jumpTo(move) {
    setStep(move);
    // După navigare în istoric, oprim AI-ul până la următoarea mutare a omului
    aiAutoPlay.current = false;
  }

  function restartRound() {
    // dacă s-a încheiat runda, actualizează scorul o singură dată
    if (result) setScore((s) => ({ ...s, [result.winner]: s[result.winner] + 1 }));
    // pornește o rundă nouă, păstrând scorul
    setHistory([{ squares: Array(9).fill(null), moveIndex: null }]);
    setStep(0);
    aiAutoPlay.current = true;
  }

  function resetScoreboard() {
    setScore({ X: 0, O: 0 });
    setHistory([{ squares: Array(9).fill(null), moveIndex: null }]);
    setStep(0);
    aiAutoPlay.current = true;
  }

  function changeDifficulty(mode) {
    setDifficulty(mode);
    // schimbarea dificultății resetează runda curentă (nu scorul)
    setHistory([{ squares: Array(9).fill(null), moveIndex: null }]);
    setStep(0);
    aiAutoPlay.current = true;
  }

  // ——— Rulează AI-ul când e rândul lui (O), jocul nu s-a încheiat și autoPlay este permis
  useEffect(() => {
    if (!xIsNext && !locked && aiAutoPlay.current) {
      const sq = current.squares.slice();
      const computeMove = difficulty === "hard" ? aiMoveHard : aiMoveEasy;
      const idx = computeMove(sq.slice());
      if (idx != null && sq[idx] === null) {
        // mic delay ca să se simtă mai natural
        const t = setTimeout(() => {
          const next = sq.slice();
          next[idx] = "O";
          const nextHistory = [...history.slice(0, step + 1), { squares: next, moveIndex: idx }];
          setHistory(nextHistory);
          setStep(nextHistory.length - 1);
        }, 280);
        return () => clearTimeout(t);
      }
    }
  }, [xIsNext, locked, current.squares, difficulty, history, step]);

  // Mutări (istoric)
  function indexToRowCol(i) {
    const row = Math.floor(i / 3) + 1;
    const col = (i % 3) + 1;
    return { row, col };
  }
  const moves = history.map((h, move) => {
    const isCurrent = move === step;
    let label = move === 0 ? "Start joc" : `Mutarea #${move}`;
    if (h.moveIndex != null) {
      const { row, col } = indexToRowCol(h.moveIndex);
      label += ` (r${row}, c${col})`;
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)} className={`btn stepBtn ${isCurrent ? "btn--soft" : ""}`}>
          {label}
        </button>
      </li>
    );
  });
  const orderedMoves = sortDesc ? [...moves].reverse() : moves;

  return (
    <div className="page">
      <style>{styles}</style>

      <div className="card">
        <div className="topbar">
          <div className="badge">🎮 X și 0 — Player vs CPU</div>
          <div className="separator" />
          <div className="score">
            <span className="pill">Scor X: <strong>{score.X}</strong></span>
            <span className="pill">Scor O: <strong>{score.O}</strong></span>
            <button onClick={resetScoreboard} className="btn">Reset scor</button>
          </div>
        </div>

        <div className="row" style={{marginBottom: 10}}>
          <span style={{opacity:.9}}>Dificultate:</span>
          <div className="selectGroup">
            <button className={`toggle ${difficulty==="easy" ? "toggle--active" : ""}`} onClick={() => changeDifficulty("easy")}>Ușor</button>
            <button className={`toggle ${difficulty==="hard" ? "toggle--active" : ""}`} onClick={() => changeDifficulty("hard")}>Greu</button>
          </div>
        </div>

        <div className="layout">
          <div>
            <div className="panel">
              <div className="status">{status}</div>

              <Board
                squares={current.squares}
                onPlay={handlePlay}
                xIsNext={xIsNext}
                locked={locked}
                winningLine={result?.line}
              />

              <div className="row" style={{marginTop: 12}}>
                <button onClick={() => jumpTo(Math.max(0, step - 1))} disabled={step === 0} className="btn">Undo</button>
                <button onClick={() => jumpTo(Math.min(history.length - 1, step + 1))} disabled={step === history.length - 1} className="btn">Redo</button>
                <div className="separator" />
                <button onClick={restartRound} className="btn btn--main">Restart rundă</button>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="historyHeader">
              <div className="subtitle">Istoric mutări</div>
              <div className="separator" />
              <button onClick={() => setSortDesc((v) => !v)} className="btn" title="Inversează ordinea">
                {sortDesc ? "Sortează ascendent" : "Sortează descendent"}
              </button>
            </div>
            <ul className="historyList">{orderedMoves}</ul>
          </div>
        </div>

        <div className="sep" />

        <p className="hint">
          Sfat: Dacă dai Undo/Redo, AI-ul nu va muta automat până când pui tu următoarea piesă.
        </p>
      </div>
    </div>
  );
}
