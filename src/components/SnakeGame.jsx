import { useEffect, useRef, useState } from "react";

export default function SnakeGame() {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [restartKey, setRestartKey] = useState(0);
  const [direction, setDirection] = useState("RIGHT");
  
  const gameState = useRef({
    snake: [{ x: 9 * 20, y: 10 * 20 }],
    food: {
      x: Math.floor(Math.random() * 20) * 20,
      y: Math.floor(Math.random() * 20) * 20,
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const box = 20;
    const canvasSize = 400;

    const draw = () => {
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      // Draw snake
      gameState.current.snake.forEach((segment, i) => {
        const gradient = ctx.createLinearGradient(
          segment.x, segment.y, 
          segment.x + box, segment.y + box
        );
        
        if (i === 0) {
          gradient.addColorStop(0, '#00ff99');
          gradient.addColorStop(1, '#00cc88');
        } else {
          gradient.addColorStop(0, '#007f4f');
          gradient.addColorStop(1, '#005f37');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(segment.x, segment.y, box, box);
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.strokeStyle = i === 0 ? '#00ffcc' : '#004d33';
        ctx.lineWidth = 2;
        ctx.strokeRect(segment.x, segment.y, box, box);
        ctx.shadowBlur = 0;
      });

      // Draw food
      ctx.beginPath();
      ctx.arc(
        gameState.current.food.x + box/2, 
        gameState.current.food.y + box/2, 
        box/2, 
        0, 
        Math.PI * 2
      );
      ctx.fillStyle = '#ff3366';
      ctx.fill();
      ctx.strokeStyle = '#ff0033';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Move snake
      const head = { ...gameState.current.snake[0] };
      if (direction === "LEFT") head.x -= box;
      if (direction === "RIGHT") head.x += box;
      if (direction === "UP") head.y -= box;
      if (direction === "DOWN") head.y += box;

      // Check collisions
      if (
        head.x < 0 ||
        head.x >= canvasSize ||
        head.y < 0 ||
        head.y >= canvasSize ||
        gameState.current.snake.some(seg => seg.x === head.x && seg.y === head.y)
      ) {
        clearInterval(gameLoop);
        setGameOver(true);
        setHighScore(prev => Math.max(prev, score));
        return;
      }

      gameState.current.snake.unshift(head);

      // Check if food eaten
      if (head.x === gameState.current.food.x && head.y === gameState.current.food.y) {
        gameState.current.food = {
          x: Math.floor(Math.random() * 20) * 20,
          y: Math.floor(Math.random() * 20) * 20,
        };
        setScore(prev => prev + 1);
      } else {
        gameState.current.snake.pop();
      }
    };

    const gameLoop = setInterval(draw, 150);

    const keyHandler = (e) => {
      if (e.key === "ArrowLeft" && direction !== "RIGHT") setDirection("LEFT");
      if (e.key === "ArrowUp" && direction !== "DOWN") setDirection("UP");
      if (e.key === "ArrowRight" && direction !== "LEFT") setDirection("RIGHT");
      if (e.key === "ArrowDown" && direction !== "UP") setDirection("DOWN");
    };

    window.addEventListener("keydown", keyHandler);

    return () => {
      clearInterval(gameLoop);
      window.removeEventListener("keydown", keyHandler);
    };
  }, [restartKey, direction, score]);

  const handleRestart = () => {
    gameState.current = {
      snake: [{ x: 9 * 20, y: 10 * 20 }],
      food: {
        x: Math.floor(Math.random() * 20) * 20,
        y: Math.floor(Math.random() * 20) * 20,
      }
    };
    setDirection("RIGHT");
    setGameOver(false);
    setScore(0);
    setRestartKey(prev => prev + 1);
  };

  const changeDirection = (newDirection) => {
    if (
      (newDirection === "LEFT" && direction !== "RIGHT") ||
      (newDirection === "RIGHT" && direction !== "LEFT") ||
      (newDirection === "UP" && direction !== "DOWN") ||
      (newDirection === "DOWN" && direction !== "UP")
    ) {
      setDirection(newDirection);
    }
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

        {/* Arrow Controls */}
        <div className="mt-6 flex flex-col items-center">
          <div className="grid grid-cols-3 gap-2 w-full max-w-[200px]">
            <div className="col-start-2">
              <button
                onClick={() => changeDirection("UP")}
                className="w-full bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white p-4 rounded-lg shadow-md flex justify-center items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
            <div className="col-start-1 row-start-2">
              <button
                onClick={() => changeDirection("LEFT")}
                className="w-full bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white p-4 rounded-lg shadow-md flex justify-center items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            <div className="col-start-3 row-start-2">
              <button
                onClick={() => changeDirection("RIGHT")}
                className="w-full bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white p-4 rounded-lg shadow-md flex justify-center items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="col-start-2 row-start-3">
              <button
                onClick={() => changeDirection("DOWN")}
                className="w-full bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white p-4 rounded-lg shadow-md flex justify-center items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 text-gray-400 text-sm tracking-wide select-none text-center">
          <p>Use arrow keys or buttons to control the snake</p>
        </div>
      </div>
    </div>
  );
}
