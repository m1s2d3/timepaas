import { useEffect, useRef, useState } from "react";
import coinEatSound from "../sounds/eat.mp3";
import appleEatSound from "../sounds/eat.mp3";
import gameOverSound from "../sounds/game-over.mp3";

export default function SnakeGame({ onBack }) {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [restartKey, setRestartKey] = useState(0);
  const [direction, setDirection] = useState("RIGHT");
  const [showScoreEffect, setShowScoreEffect] = useState(false);
  const [scoreEffectPos, setScoreEffectPos] = useState({ x: 0, y: 0 });
  const [scoreEffectValue, setScoreEffectValue] = useState("+1");
  const animationRef = useRef(null);
  const lastRenderTimeRef = useRef(0);
  const coinRotationRef = useRef(0);
  const applePulseRef = useRef(0);

  // Sound effects
  const eatSoundRef = useRef(null);
  const appleSoundRef = useRef(null);
  const gameOverSoundRef = useRef(null);

  const gameState = useRef({
    snake: [
      { x: 9 * 20, y: 10 * 20 }, // Head
      { x: 8 * 20, y: 10 * 20 }, // Body segment 1
      { x: 7 * 20, y: 10 * 20 }  // Body segment 2
    ],
    food: {
      x: Math.floor(Math.random() * 20) * 20,
      y: Math.floor(Math.random() * 20) * 20,
      type: Math.random() > 0.7 ? "APPLE" : "COIN"
    }
  });

  useEffect(() => {
    // Initialize sound effects
    eatSoundRef.current = new Audio(coinEatSound);
    appleSoundRef.current = new Audio(appleEatSound);
    gameOverSoundRef.current = new Audio(gameOverSound);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const box = 20;
    const canvasSize = 400;
    const SNAKE_SPEED = 8;

    const drawBackground = () => {
      ctx.fillStyle = "#0a2e0a";
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      ctx.strokeStyle = "rgba(50, 100, 50, 0.1)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= canvasSize; x += box) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize);
        ctx.stroke();
      }
      for (let y = 0; y <= canvasSize; y += box) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasSize, y);
        ctx.stroke();
      }
    };

    const drawShinyCoin = (x, y, rotation) => {
      const centerX = x + box / 2;
      const centerY = y + box / 2;
      const radius = box / 2;
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.1,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, '#FFDF00');
      gradient.addColorStop(0.5, '#FFD700');
      gradient.addColorStop(0.8, '#CFB53B');
      gradient.addColorStop(1, '#996515');
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.translate(-centerX, -centerY);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(
        centerX + radius * 0.3 * Math.cos(rotation * 2),
        centerY + radius * 0.3 * Math.sin(rotation * 2),
        radius * 0.25,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    };

    const drawJuicyApple = (x, y, pulse) => {
      const centerX = x + box / 2;
      const centerY = y + box / 2;
      const radius = box / 2;
      const pulseEffect = Math.sin(pulse) * 0.1 + 1;
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.3,
        centerX, centerY, radius * pulseEffect
      );
      gradient.addColorStop(0, '#ff3333');
      gradient.addColorStop(0.7, '#cc0000');
      gradient.addColorStop(1, '#990000');
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * pulseEffect, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();
      ctx.fillStyle = '#33cc33';
      ctx.beginPath();
      ctx.moveTo(centerX - radius * 0.2, centerY - radius * 0.8);
      ctx.quadraticCurveTo(
        centerX - radius * 0.5, centerY - radius * 1.2,
        centerX + radius * 0.2, centerY - radius * 0.9
      );
      ctx.quadraticCurveTo(
        centerX + radius * 0.1, centerY - radius * 0.7,
        centerX - radius * 0.2, centerY - radius * 0.8
      );
      ctx.fill();
      ctx.strokeStyle = '#663300';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX + radius * 0.1, centerY - radius * 0.8);
      ctx.lineTo(centerX + radius * 0.3, centerY - radius * 1.1);
      ctx.stroke();
      ctx.restore();
    };

    const drawSnakeSegment = (segment, index, segments) => {
      const isHead = index === 0;
      const isTail = index === segments.length - 1;
      ctx.save();
      if (!isHead && !isTail) {
        const bodyGradient = ctx.createLinearGradient(segment.x, segment.y, segment.x + box, segment.y + box);
        bodyGradient.addColorStop(0, '#228B22');
        bodyGradient.addColorStop(0.5, '#32CD32');
        bodyGradient.addColorStop(1, '#228B22');
        ctx.fillStyle = bodyGradient;
        const radius = 4;
        ctx.beginPath();
        ctx.moveTo(segment.x + radius, segment.y);
        ctx.lineTo(segment.x + box - radius, segment.y);
        ctx.quadraticCurveTo(segment.x + box, segment.y, segment.x + box, segment.y + radius);
        ctx.lineTo(segment.x + box, segment.y + box - radius);
        ctx.quadraticCurveTo(segment.x + box, segment.y + box, segment.x + box - radius, segment.y + box);
        ctx.lineTo(segment.x + radius, segment.y + box);
        ctx.quadraticCurveTo(segment.x, segment.y + box, segment.x, segment.y + box - radius);
        ctx.lineTo(segment.x, segment.y + radius);
        ctx.quadraticCurveTo(segment.x, segment.y, segment.x + radius, segment.y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#2E8B57';
        const scaleSize = box / 4;
        for (let y = segment.y + 2; y < segment.y + box; y += scaleSize) {
          for (let x = segment.x + 2; x < segment.x + box; x += scaleSize) {
            if ((x + y) % (scaleSize * 2) === 0) {
              ctx.beginPath();
              ctx.arc(x, y, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
      if (isHead) {
        ctx.fillStyle = '#32CD32';
        let rotation = 0;
        if (direction === "LEFT") rotation = Math.PI;
        if (direction === "UP") rotation = -Math.PI / 2;
        if (direction === "DOWN") rotation = Math.PI / 2;
        ctx.translate(segment.x + box / 2, segment.y + box / 2);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.moveTo(box / 2, 0);
        ctx.lineTo(-box / 2, -box / 2);
        ctx.lineTo(-box / 2, box / 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-box / 4, -box / 6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-box / 4, box / 6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-box / 4, -box / 6, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-box / 4, box / 6, 1.5, 0, Math.PI * 2);
        ctx.fill();
        if (direction === "RIGHT") {
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.moveTo(box / 2 - 2, 0);
          ctx.lineTo(box / 2 + 5, -3);
          ctx.lineTo(box / 2 + 5, 3);
          ctx.closePath();
          ctx.fill();
        }
      }
      if (isTail && segments.length > 1) {
        const prevSegment = segments[index - 1];
        ctx.fillStyle = '#2E8B57';
        let tailDirection = "RIGHT";
        if (prevSegment) {
          if (prevSegment.x < segment.x) tailDirection = "LEFT";
          if (prevSegment.x > segment.x) tailDirection = "RIGHT";
          if (prevSegment.y < segment.y) tailDirection = "UP";
          if (prevSegment.y > segment.y) tailDirection = "DOWN";
        }
        ctx.translate(segment.x + box / 2, segment.y + box / 2);
        ctx.beginPath();
        if (tailDirection === "LEFT") {
          ctx.moveTo(box / 2, 0);
          ctx.lineTo(-box / 2, -box / 3);
          ctx.lineTo(-box / 2, box / 3);
          ctx.closePath();
        } else if (tailDirection === "RIGHT") {
          ctx.moveTo(-box / 2, 0);
          ctx.lineTo(box / 2, -box / 3);
          ctx.lineTo(box / 2, box / 3);
          ctx.closePath();
        } else if (tailDirection === "UP") {
          ctx.moveTo(0, box / 2);
          ctx.lineTo(-box / 3, -box / 2);
          ctx.lineTo(box / 3, -box / 2);
          ctx.closePath();
        } else {
          ctx.moveTo(0, -box / 2);
          ctx.lineTo(-box / 3, box / 2);
          ctx.lineTo(box / 3, box / 2);
          ctx.closePath();
        }
        ctx.fill();
      }
      ctx.restore();
    };

    const gameLoop = (currentTime) => {
      animationRef.current = requestAnimationFrame(gameLoop);
      const secondsSinceLastRender = (currentTime - lastRenderTimeRef.current) / 1000;
      if (secondsSinceLastRender < 1 / SNAKE_SPEED) return;
      lastRenderTimeRef.current = currentTime;
      coinRotationRef.current += 0.05;
      applePulseRef.current += 0.1;
      drawBackground();
      gameState.current.snake.forEach((segment, index) => {
        drawSnakeSegment(segment, index, gameState.current.snake);
      });
      if (gameState.current.food.type === "COIN") {
        drawShinyCoin(gameState.current.food.x, gameState.current.food.y, coinRotationRef.current);
      } else {
        drawJuicyApple(gameState.current.food.x, gameState.current.food.y, applePulseRef.current);
      }
      if (showScoreEffect) {
        ctx.font = 'bold 22px Arial';
        ctx.fillStyle = scoreEffectValue === "+1" ? '#FFD700' : '#FF3333';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(scoreEffectValue, scoreEffectPos.x, scoreEffectPos.y);
        ctx.shadowBlur = 0;
      }
      const head = { ...gameState.current.snake[0] };
      if (direction === "LEFT") head.x -= box;
      if (direction === "RIGHT") head.x += box;
      if (direction === "UP") head.y -= box;
      if (direction === "DOWN") head.y += box;
      if (head.x < 0) head.x = canvasSize - box;
      if (head.x >= canvasSize) head.x = 0;
      if (head.y < 0) head.y = canvasSize - box;
      if (head.y >= canvasSize) head.y = 0;
      if (gameState.current.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        cancelAnimationFrame(animationRef.current);
        setGameOver(true);
        setHighScore(prev => Math.max(prev, score));
        gameOverSoundRef.current.play();
        return;
      }
      gameState.current.snake.unshift(head);
      if (head.x === gameState.current.food.x && head.y === gameState.current.food.y) {
        if (gameState.current.food.type === "COIN") {
          eatSoundRef.current.play();
          setScoreEffectValue("+1");
          setScore(prev => prev + 1);
        } else {
          appleSoundRef.current.play();
          setScoreEffectValue("+2");
          setScore(prev => prev + 2);
        }
        setScoreEffectPos({
          x: gameState.current.food.x + box / 2,
          y: gameState.current.food.y + box / 2 - 15
        });
        setShowScoreEffect(true);
        setTimeout(() => setShowScoreEffect(false), 400);
        let newFood;
        do {
          newFood = {
            x: Math.floor(Math.random() * 20) * 20,
            y: Math.floor(Math.random() * 20) * 20,
            type: Math.random() > 0.7 ? "APPLE" : "COIN"
          };
        } while (gameState.current.snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
        gameState.current.food = newFood;
      } else {
        gameState.current.snake.pop();
      }
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    const keyHandler = (e) => {
      if (e.key === "ArrowLeft" && direction !== "RIGHT") setDirection("LEFT");
      if (e.key === "ArrowUp" && direction !== "DOWN") setDirection("UP");
      if (e.key === "ArrowRight" && direction !== "LEFT") setDirection("RIGHT");
      if (e.key === "ArrowDown" && direction !== "UP") setDirection("DOWN");
    };

    window.addEventListener("keydown", keyHandler);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("keydown", keyHandler);
    };
  }, [restartKey, direction, score, showScoreEffect]);

  const handleRestart = () => {
    gameState.current = {
      snake: [
        { x: 9 * 20, y: 10 * 20 },
        { x: 8 * 20, y: 10 * 20 },
        { x: 7 * 20, y: 10 * 20 }
      ],
      food: {
        x: Math.floor(Math.random() * 20) * 20,
        y: Math.floor(Math.random() * 20) * 20,
        type: Math.random() > 0.7 ? "APPLE" : "COIN"
      }
    };
    setDirection("RIGHT");
    setGameOver(false);
    setScore(0);
    setShowScoreEffect(false);
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
    <div className="min-h-screen w-full bg-gradient-to-br from-green-950 via-emerald-900 to-teal-900 flex flex-col items-center justify-center p-6 overflow-hidden relative">
      
      {/* Floating Bubbles */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-emerald-300/10 animate-float"
            style={{
              width: `${Math.random() * 40 + 10}px`,
              height: `${Math.random() * 40 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 25 + 15}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
          100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
        }
        .animate-float { animation: float linear infinite; }
      `}</style>

      {/* Game Container */}
      <div className="z-10 w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 transition-all duration-300 hover:shadow-emerald-500/20">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={onBack}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-2 py-1 rounded-full text-sm font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400"
          >
            ←
          </button>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-lime-400 to-teal-400">
            Snake Game
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Score & High Score */}
        <div className="flex gap-6 mb-6 justify-center">
          <div className="bg-black/70 px-5 py-3 rounded-2xl shadow-inner border border-emerald-500/30 backdrop-blur-sm">
            <span className="text-gray-300 text-sm">Score:</span>{" "}
            <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-teal-400 text-md">{score}</span>
          </div>
          <div className="bg-black/70 px-5 py-3 rounded-2xl shadow-inner border border-emerald-500/30 backdrop-blur-sm">
            <span className="text-gray-300 text-sm">High:</span>{" "}
            <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-teal-400 text-md">{highScore}</span>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="relative mx-auto">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full h-auto rounded-2xl border-4 border-teal-500/40 shadow-[0_0_25px_rgba(0,255,170,0.2)] bg-gradient-to-br from-black to-green-900"
            tabIndex={0}
          />

          {/* Game Over Modal */}
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-2xl backdrop-blur-md transition-opacity duration-300">
              <div className="text-4xl font-extrabold text-red-500 mb-6 animate-pulse">
                Game Over!
              </div>
              <div className="text-2xl text-white mb-8">
                Your score:{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-teal-400">
                  {score}
                </span>
              </div>
              <button
                onClick={handleRestart}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold rounded-2xl shadow-2xl hover:shadow-emerald-500/50 transition-transform hover:scale-105 active:scale-95"
              >
                Restart Game
              </button>
            </div>
          )}
        </div>

        {/* Touch Controls */}
        <div className="mt-8 flex flex-col items-center">
          <div className="grid grid-cols-3 gap-3 w-full max-w-[220px]">
            <div className="col-start-2">
              <button
                onClick={() => changeDirection("UP")}
                className="w-full bg-gradient-to-b from-emerald-700 to-green-900 hover:from-emerald-800 hover:to-green-950 active:scale-95 text-white p-4 rounded-lg shadow-lg flex justify-center items-center transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
            <div className="col-start-1 row-start-2">
              <button
                onClick={() => changeDirection("LEFT")}
                className="w-full bg-gradient-to-b from-emerald-700 to-green-900 hover:from-emerald-800 hover:to-green-950 active:scale-95 text-white p-4 rounded-lg shadow-lg flex justify-center items-center transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            <div className="col-start-3 row-start-2">
              <button
                onClick={() => changeDirection("RIGHT")}
                className="w-full bg-gradient-to-b from-emerald-700 to-green-900 hover:from-emerald-800 hover:to-green-950 active:scale-95 text-white p-4 rounded-lg shadow-lg flex justify-center items-center transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="col-start-2 row-start-3">
              <button
                onClick={() => changeDirection("DOWN")}
                className="w-full bg-gradient-to-b from-emerald-700 to-green-900 hover:from-emerald-800 hover:to-green-950 active:scale-95 text-white p-4 rounded-lg shadow-lg flex justify-center items-center transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
