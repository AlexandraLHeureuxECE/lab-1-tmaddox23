// ========================
// Appearance customization:
// 1) Theme toggle (dark/light) saved in localStorage
// 2) Board color dropdown (rainbow) saved in localStorage
// 3) Marker color dropdown (rainbow) saved in localStorage
// ========================

const THEME_KEY = "ttt_theme"; // "dark" or "light"
const BOARD_COLOR_KEY = "ttt_board_color"; // rainbow name
const MARKER_COLOR_KEY = "ttt_marker_color"; // rainbow name

// Rainbow palette (you can tweak shades later)
const RAINBOW = {
  red: { tint: "rgba(239, 68, 68, 0.55)", marker: "#ef4444" },
  orange: { tint: "rgba(249, 115, 22, 0.55)", marker: "#f97316" },
  yellow: { tint: "rgba(234, 179, 8, 0.55)", marker: "#eab308" },
  green: { tint: "rgba(34, 197, 94, 0.55)", marker: "#22c55e" },
  blue: { tint: "rgba(59, 130, 246, 0.55)", marker: "#3b82f6" },
  indigo: { tint: "rgba(99, 102, 241, 0.55)", marker: "#6366f1" },
  violet: { tint: "rgba(168, 85, 247, 0.55)", marker: "#a855f7" },
};

function applyTheme(theme) {
  const t = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", t);

  const btn = document.getElementById("themeToggleBtn");
  if (btn) {
    const isLight = t === "light";
    btn.textContent = isLight ? "Dark mode" : "Light mode";
    btn.setAttribute("aria-pressed", String(isLight));
  }
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved || "dark");
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "light" ? "dark" : "light";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

function applyBoardColor(colorName) {
  const c = RAINBOW[colorName] || RAINBOW.blue;
  document.documentElement.style.setProperty("--boardTint", c.tint);
}

function applyMarkerColor(colorName) {
  const c = RAINBOW[colorName] || RAINBOW.blue;
  document.documentElement.style.setProperty("--markerColor", c.marker);
}

function initColorPickers() {
  const boardSelect = document.getElementById("boardColorSelect");
  const markerSelect = document.getElementById("markerColorSelect");

  const savedBoard = localStorage.getItem(BOARD_COLOR_KEY) || "blue";
  const savedMarker = localStorage.getItem(MARKER_COLOR_KEY) || "blue";

  // Set dropdowns to saved values
  if (boardSelect) boardSelect.value = savedBoard;
  if (markerSelect) markerSelect.value = savedMarker;

  // Apply to UI
  applyBoardColor(savedBoard);
  applyMarkerColor(savedMarker);

  // Listen for changes
  if (boardSelect) {
    boardSelect.addEventListener("change", (e) => {
      const value = e.target.value;
      localStorage.setItem(BOARD_COLOR_KEY, value);
      applyBoardColor(value);
    });
  }

  if (markerSelect) {
    markerSelect.addEventListener("change", (e) => {
      const value = e.target.value;
      localStorage.setItem(MARKER_COLOR_KEY, value);
      applyMarkerColor(value);
    });
  }
}

// ======= Game State =======
let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// ======= DOM =======
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");

function buildBoardUI() {
  boardEl.innerHTML = "";

  for (let i = 0; i < 9; i++) {
    const btn = document.createElement("button");
    btn.className = "cell";
    btn.type = "button";
    btn.setAttribute("role", "gridcell");
    btn.setAttribute("aria-label", `Cell ${i + 1}`);
    btn.dataset.index = String(i);

    btn.addEventListener("click", onCellClick);
    boardEl.appendChild(btn);
  }
}

function render() {
  const cells = boardEl.querySelectorAll(".cell");
  cells.forEach((btn, i) => {
    btn.textContent = board[i];
    btn.disabled = gameOver || board[i] !== "";
    btn.classList.remove("win");
  });
}

function onCellClick(e) {
  if (gameOver) return;

  const index = Number(e.currentTarget.dataset.index);
  if (board[index] !== "") return;

  board[index] = currentPlayer;

  const winLine = getWinningLine(board);
  if (winLine) {
    gameOver = true;
    statusEl.textContent = `${currentPlayer} wins!`;
    highlightWin(winLine);
    render();
    return;
  }

  if (isDraw(board)) {
    gameOver = true;
    statusEl.textContent = "Draw!";
    render();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusEl.textContent = `${currentPlayer}’s turn`;
  render();
}

function getWinningLine(b) {
  for (const [a, c, d] of WIN_LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return [a, c, d];
  }
  return null;
}

function isDraw(b) {
  return b.every((cell) => cell !== "");
}

function highlightWin(line) {
  const cells = boardEl.querySelectorAll(".cell");
  line.forEach((idx) => cells[idx].classList.add("win"));
}

function restartGame() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameOver = false;
  statusEl.textContent = "X’s turn";
  render();
}

// ======= Wire up controls =======
restartBtn.addEventListener("click", restartGame);
themeToggleBtn.addEventListener("click", toggleTheme);

// ======= Init =======
initTheme();
initColorPickers();
buildBoardUI();
render();
