import { useEffect, useRef, useState } from "react";

export default function SnakeGame() {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const box = 20;
    const canvasSize = 400;
    const totalBoxes = canvasSize / box;

    let snake = [{ x: 9 * box, y: 10 * box }];
    let direction = "RIGHT";
    let food = {
      x: Math.floor(Math.random() * totalBoxes) * box,
      y: Math.floor(Math.random() * totalBoxes) * box,
    };

    setGameOver(false);
    setScore(0);

    const draw = () => {
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      // Draw snake with improved visuals
      for (let i = 0; i < snake.length; i++) {
        // Gradient effect for snake
        const gradient = ctx.createLinearGradient(
          snake[i].x, snake[i].y, 
          snake[i].x + box, snake[i].y + box
        );
        
        if (i === 0) {
          gradient.addColorStop(0, '#00ff99');
          gradient.addColorStop(1, '#00cc88');
        } else {
          gradient.addColorStop(0, '#007f4f');
          gradient.addColorStop(1, '#005f37');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        
        // Add subtle shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.strokeStyle = i === 0 ? '#00ffcc' : '#004d33';
        ctx.lineWidth = 2;
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
        ctx.shadowBlur = 0; // Reset shadow
      }

      // Draw food with better visual
      ctx.beginPath();
      ctx.arc(food.x + box/2, food.y + box/2, box/2, 0, Math.PI * 2);
      ctx.fillStyle = '#ff3366';
      ctx.fill();
      ctx.strokeStyle = '#ff0033';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Move
      const head = { ...snake[0] };
      if (direction === "LEFT") head.x -= box;
      if (direction === "RIGHT") head.x += box;
      if (direction === "UP") head.y -= box;
      if (direction === "DOWN") head.y += box;

      // Game over conditions
      if (
        head.x < 0 ||
        head.x >= canvasSize ||
        head.y < 0 ||
        head.y >= canvasSize ||
        snake.some((seg) => seg.x === head.x && seg.y === head.y)
      ) {
        clearInterval(game);
        setGameOver(true);
        setHighScore(prev => Math.max(prev, score));
        return;
      }

      snake.unshift(head);

      // Eat food
      if (head.x === food.x && head.y === food.y) {
        food = {
          x: Math.floor(Math.random() * totalBoxes) * box,
          y: Math.floor(Math.random() * totalBoxes) * box,
        };
        setScore(prev => prev + 1);
      } else {
        snake.pop();
      }
    };

    const game = setInterval(draw, 150);

    const keyHandler = (e) => {
      if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
      if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
      if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
      if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    };

    window.addEventListener("keydown", keyHandler);

    return () => {
      clearInterval(game);
      window.removeEventListener("keydown", keyHandler);
    };
  }, [restartKey]);

  const handleRestart = () => {
    setRestartKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="w-full max-w-md bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">
            Snake Game
          </h1>
          <div className="flex gap-5">
            <div className="bg-gray-700/60 px-4 py-2 rounded-xl shadow-inner">
              <span className="text-gray-300 text-sm">Score:</span>{" "}
              <span className="font-mono text-green-400">{score}</span>
            </div>
            <div className="bg-gray-700/60 px-4 py-2 rounded-xl shadow-inner">
              <span className="text-gray-300 text-sm">High:</span>{" "}
              <span className="font-mono text-purple-400">{highScore}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full h-auto rounded-2xl border-4 border-gray-600 shadow-2xl bg-gray-900/90"
            tabIndex={0}
          />

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-2xl backdrop-blur-md">
              <div className="text-5xl font-extrabold text-red-500 mb-6 animate-pulse">
                Game Over!
              </div>
              <div className="text-xl text-white mb-8">
                Your score: <span className="text-green-400">{score}</span>
              </div>
              <button
                onClick={handleRestart}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-2xl transition-transform hover:scale-105 active:scale-95"
              >
                Restart Game
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 text-gray-400 text-sm tracking-wide select-none">
          <p>Use arrow keys to control the snake</p>
        </div>
      </div>
    </div>
  );
}
