import { useState, useEffect, useRef } from "react";
import clickSoundFile from "../sounds/click.mp3";
import clickSoundCompFile from "../sounds/clickComp.mp3";
import startSoundFile from "../sounds/start.mp3";
import winSoundFile from "../sounds/win.mp3";
import drawSoundFile from "../sounds/draw.mp3";

export default function TicTacToe({ onBack }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [mode, setMode] = useState("single");
  const [winningCombo, setWinningCombo] = useState([]);

  const sounds = useRef({
    click: new Audio(clickSoundFile),
    compClick: new Audio(clickSoundCompFile),
    start: new Audio(startSoundFile),
    win: new Audio(winSoundFile),
    draw: new Audio(drawSoundFile),
  });

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  useEffect(() => {
    checkWinner();
  }, [board]);

  useEffect(() => {
    if (mode === "single" && !isXNext && !winner) {
      const timeoutId = setTimeout(computerMove, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isXNext, winner, mode]);

  const handleClick = (index) => {
    if (board[index] || winner || (mode === "single" && !isXNext)) return;
    sounds.current.click.play();
    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const computerMove = () => {
    const emptyIndices = board
      .map((val, idx) => (val === null ? idx : null))
      .filter((val) => val !== null);
    if (emptyIndices.length === 0) return;
    sounds.current.compClick.play();
    const randomIndex = Math.floor(Math.random() * emptyIndices.length);
    const newBoard = [...board];
    newBoard[emptyIndices[randomIndex]] = "O";
    setBoard(newBoard);
    setIsXNext(true);
  };

  const checkWinner = () => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setWinningCombo(combo);
        sounds.current.win.play();
        return;
      }
    }
    if (!board.includes(null)) {
      setWinner("Draw");
      sounds.current.draw.play();
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningCombo([]);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center p-6 relative text-white overflow-hidden">
      {/* Floating bubbles background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/10 animate-float"
            style={{
              width: `${Math.random() * 30 + 10}px`,
              height: `${Math.random() * 30 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 20 + 10}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full bg-gradient-to-br from-indigo-700/90 via-purple-800/90 to-pink-700/90 rounded-3xl shadow-2xl p-3 flex flex-col items-center relative z-10 backdrop-blur-sm border border-white/20">

        {/* Back Button - Inside Game Box, Top Left Corner */}
        <div className="absolute top-6 left-4">
          <button 
            className="bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-2 py-1 rounded-2xl text-sm font-semibold shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-400"
            onClick={onBack}
          >
            ←
          </button>
        </div>

        <header className="text-center">
          <h1 className="text-4xl mt-4 font-extrabold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Tic Tac Toe
          </h1>
          <p className="text-purple-200 text-sm tracking-wide">
            Play against a friend or the computer
          </p>
        </header>

        <div className="flex gap-4 my-5">
          <button
            onClick={() => {
              setMode("single");
              resetGame();
            }}
            className={`px-6 py-3  rounded-3xl border-2 border-white/70 transition-all shadow-md 
              ${mode === "single" ? "bg-white text-indigo-700 font-bold" : "bg-transparent text-white hover:bg-white/20"}`}
          >
            Single Player
          </button>
          <button
            onClick={() => {
              setMode("multi");
              resetGame();
            }}
            className={`px-6 py-3 rounded-3xl border-2 border-white/70 transition-all shadow-md 
              ${mode === "multi" ? "bg-white text-indigo-700 font-bold" : "bg-transparent text-white hover:bg-white/20"}`}
          >
            Multiplayer
          </button>
        </div>

        <p className="text-md mb-4 font-semibold drop-shadow-md tracking-wide">
          {!winner
            ? isXNext
              ? "Player X's turn"
              : mode === "single"
              ? "Computer's turn"
              : "Player O's turn"
            : winner === "Draw"
            ? "It's a draw!"
            : `${winner} wins!`}
        </p>

        <div 
          className="grid grid-cols-3 gap-4 w-full bg-gradient-to-br from-indigo-900/70 to-purple-900/70 rounded-3xl p-6 shadow-[inset_0_0_30px_rgba(255,255,255,0.1)] backdrop-blur-sm border border-white/20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`
          }}
        >
          {Array.from({ length: 9 }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={board[index] !== null || winner}
              className={`
                aspect-square rounded-3xl flex items-center justify-center text-5xl font-extrabold
                transition-transform duration-300 ease-in-out
                ${
                  board[index] === "X"
                    ? `text-indigo-300 drop-shadow-[0_0_15px_rgba(128,90,213,0.8)] ${winningCombo.includes(index) ? "animate-ping-once" : ""}`
                    : board[index] === "O"
                    ? `text-pink-300 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] ${winningCombo.includes(index) ? "animate-ping-once" : ""}`
                    : "bg-white/10 hover:bg-white/30 active:scale-95 cursor-pointer"
                }
                ${winner ? "cursor-default" : ""}
              `}
            >
              {board[index] === "X" ? (
                <span className="transform rotate-6 select-none">X</span>
              ) : board[index] === "O" ? (
                <span className="transform scale-110 select-none">O</span>
              ) : null}
            </button>
          ))}
        </div>

        <button
          onClick={resetGame}
          className="mt-8 px-8 py-3 rounded-3xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-400"
        >
          Reset Game
        </button>
      </div>

      {/* Winner Overlay */}
      {winner && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-8 rounded-3xl shadow-2xl text-center max-w-sm mx-4 animate-pop-in shadow-[0_0_40px_rgba(236,72,153,0.6)]">
            <h2 className="text-3xl font-extrabold text-white mb-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
              {winner === "Draw"
                ? "It's a Draw!"
                : mode === "single" && winner === "O"
                ? "You Lose! 😞"
                : mode === "single" && winner === "X"
                ? "You Win! 🎉"
                : `${winner} Wins! 🎉`}
            </h2>
            <button 
              onClick={resetGame}
              className="px-6 py-3 rounded-3xl bg-white text-indigo-700 font-bold shadow-md hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-400 transition"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        .animate-float { animation: float linear infinite; }
        
        @keyframes ping-once {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-ping-once { animation: ping-once 0.5s ease-in-out; }
        
        @keyframes pop-in {
          0% { transform: scale(0.5); opacity: 0; }
          80% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in { animation: pop-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
