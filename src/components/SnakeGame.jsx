import { useEffect, useRef, useState } from "react";
import coinEatSound from "../sounds/eat.mp3";
import appleEatSound from "../sounds/eat.mp3";
import gameOverSound from "../sounds/game-over.mp3";

export default function SnakeGame({onBack}) {
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
      type: Math.random() > 0.7 ? "APPLE" : "COIN" // 30% chance for apple
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

    // Draw grid background with subtle pattern
    const drawBackground = () => {
      // Dark green background
      ctx.fillStyle = '#0a2e0a';
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      
      // Grid pattern
      ctx.strokeStyle = 'rgba(50, 100, 50, 0.1)';
      ctx.lineWidth = 0.5;
      
      // Vertical lines
      for (let x = 0; x <= canvasSize; x += box) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y <= canvasSize; y += box) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasSize, y);
        ctx.stroke();
      }
      
      // Subtle corner decorations
      ctx.strokeStyle = 'rgba(100, 200, 100, 0.2)';
      ctx.lineWidth = 1;
      
      // Top-left
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI/2);
      ctx.stroke();
      
      // Top-right
      ctx.beginPath();
      ctx.arc(canvasSize, 0, 50, Math.PI/2, Math.PI);
      ctx.stroke();
      
      // Bottom-left
      ctx.beginPath();
      ctx.arc(0, canvasSize, 50, -Math.PI/2, 0);
      ctx.stroke();
      
      // Bottom-right
      ctx.beginPath();
      ctx.arc(canvasSize, canvasSize, 50, Math.PI, 3*Math.PI/2);
      ctx.stroke();
    };

    const drawShinyCoin = (x, y, rotation) => {
      const centerX = x + box/2;
      const centerY = y + box/2;
      const radius = box/2;
      
      // Gold gradient with rotation effect
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
      
      // Draw coin body
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Coin edge details
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Shiny reflection
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
      
      // Inner circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      ctx.restore();
    };

    const drawJuicyApple = (x, y, pulse) => {
      const centerX = x + box/2;
      const centerY = y + box/2;
      const radius = box/2;
      const pulseEffect = Math.sin(pulse) * 0.1 + 1;
      
      // Apple gradient
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.3,
        centerX, centerY, radius * pulseEffect
      );
      gradient.addColorStop(0, '#ff3333');
      gradient.addColorStop(0.7, '#cc0000');
      gradient.addColorStop(1, '#990000');
      
      ctx.save();
      
      // Draw apple body with pulse effect
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * pulseEffect, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Apple shine
      ctx.beginPath();
      ctx.arc(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        radius * 0.2, 
        0, 
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();
      
      // Apple leaf
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
      
      // Apple stem
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
      
      // Body pattern (scales)
      if (!isHead && !isTail) {
        const bodyGradient = ctx.createLinearGradient(
          segment.x, segment.y, 
          segment.x + box, segment.y + box
        );
        bodyGradient.addColorStop(0, '#228B22');
        bodyGradient.addColorStop(0.5, '#32CD32');
        bodyGradient.addColorStop(1, '#228B22');
        ctx.fillStyle = bodyGradient;
        
        // Draw snake body with rounded corners
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
        
        // Add scale pattern
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
      
      // Draw snake head
      if (isHead) {
        ctx.fillStyle = '#32CD32';
        
        // Determine head rotation based on direction
        let rotation = 0;
        if (direction === "LEFT") rotation = Math.PI;
        if (direction === "UP") rotation = -Math.PI/2;
        if (direction === "DOWN") rotation = Math.PI/2;
        
        // Draw head shape (triangle)
        ctx.translate(segment.x + box/2, segment.y + box/2);
        ctx.rotate(rotation);
        
        ctx.beginPath();
        ctx.moveTo(box/2, 0);
        ctx.lineTo(-box/2, -box/2);
        ctx.lineTo(-box/2, box/2);
        ctx.closePath();
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-box/4, -box/6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-box/4, box/6, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-box/4, -box/6, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-box/4, box/6, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Tongue if moving right
        if (direction === "RIGHT") {
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.moveTo(box/2 - 2, 0);
          ctx.lineTo(box/2 + 5, -3);
          ctx.lineTo(box/2 + 5, 3);
          ctx.closePath();
          ctx.fill();
        }
      }
      
      // Draw snake tail
      if (isTail && segments.length > 1) {
        const prevSegment = segments[index - 1];
        ctx.fillStyle = '#2E8B57';
        
        // Determine tail direction
        let tailDirection = "RIGHT";
        if (prevSegment) {
          if (prevSegment.x < segment.x) tailDirection = "LEFT";
          if (prevSegment.x > segment.x) tailDirection = "RIGHT";
          if (prevSegment.y < segment.y) tailDirection = "UP";
          if (prevSegment.y > segment.y) tailDirection = "DOWN";
        }
        
        // Draw tail shape
        ctx.translate(segment.x + box/2, segment.y + box/2);
        
        if (tailDirection === "LEFT") {
          ctx.beginPath();
          ctx.moveTo(box/2, 0);
          ctx.lineTo(-box/2, -box/3);
          ctx.lineTo(-box/2, box/3);
          ctx.closePath();
        } else if (tailDirection === "RIGHT") {
          ctx.beginPath();
          ctx.moveTo(-box/2, 0);
          ctx.lineTo(box/2, -box/3);
          ctx.lineTo(box/2, box/3);
          ctx.closePath();
        } else if (tailDirection === "UP") {
          ctx.beginPath();
          ctx.moveTo(0, box/2);
          ctx.lineTo(-box/3, -box/2);
          ctx.lineTo(box/3, -box/2);
          ctx.closePath();
        } else { // DOWN
          ctx.beginPath();
          ctx.moveTo(0, -box/2);
          ctx.lineTo(-box/3, box/2);
          ctx.lineTo(box/3, box/2);
          ctx.closePath();
        }
        
        ctx.fill();
      }
      
      ctx.restore();
    };

    const gameLoop = (currentTime) => {
      animationRef.current = requestAnimationFrame(gameLoop);
      
      // Control game speed
      const secondsSinceLastRender = (currentTime - lastRenderTimeRef.current) / 1000;
      if (secondsSinceLastRender < 1 / SNAKE_SPEED) return;
      lastRenderTimeRef.current = currentTime;
      
      // Update animations
      coinRotationRef.current += 0.05;
      applePulseRef.current += 0.1;
      
      // Draw background
      drawBackground();

      // Draw snake
      gameState.current.snake.forEach((segment, index) => {
        drawSnakeSegment(segment, index, gameState.current.snake);
      });

      // Draw food based on type
      if (gameState.current.food.type === "COIN") {
        drawShinyCoin(gameState.current.food.x, gameState.current.food.y, coinRotationRef.current);
      } else {
        drawJuicyApple(gameState.current.food.x, gameState.current.food.y, applePulseRef.current);
      }

      // Draw score effect if active
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

      // Move snake
      const head = { ...gameState.current.snake[0] };
      if (direction === "LEFT") head.x -= box;
      if (direction === "RIGHT") head.x += box;
      if (direction === "UP") head.y -= box;
      if (direction === "DOWN") head.y += box;

      // Wrap around the walls
      if (head.x < 0) head.x = canvasSize - box;
      if (head.x >= canvasSize) head.x = 0;
      if (head.y < 0) head.y = canvasSize - box;
      if (head.y >= canvasSize) head.y = 0;

      // Check self-collision
      if (gameState.current.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        cancelAnimationFrame(animationRef.current);
        setGameOver(true);
        setHighScore(prev => Math.max(prev, score));
        gameOverSoundRef.current.play();
        return;
      }

      gameState.current.snake.unshift(head);

      // Check if food eaten
      if (head.x === gameState.current.food.x && head.y === gameState.current.food.y) {
        // Play sound based on food type
        if (gameState.current.food.type === "COIN") {
          eatSoundRef.current.play();
          setScoreEffectValue("+1");
          setScore(prev => prev + 1);
        } else {
          appleSoundRef.current.play();
          setScoreEffectValue("+2");
          setScore(prev => prev + 2);
        }
        
        // Show score effect
        setScoreEffectPos({
          x: gameState.current.food.x + box/2,
          y: gameState.current.food.y + box/2 - 15
        });
        setShowScoreEffect(true);
        setTimeout(() => setShowScoreEffect(false), 400);
        
        // Generate new food (ensure it doesn't spawn on snake)
        let newFood;
        do {
          newFood = {
            x: Math.floor(Math.random() * 20) * 20,
            y: Math.floor(Math.random() * 20) * 20,
            type: Math.random() > 0.7 ? "APPLE" : "COIN" // 30% chance for apple
          };
        } while (gameState.current.snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
        
        gameState.current.food = newFood;
      } else {
        gameState.current.snake.pop();
      }
    };

    // Start game loop
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
        { x: 9 * 20, y: 10 * 20 }, // Head
        { x: 8 * 20, y: 10 * 20 }, // Body segment 1
        { x: 7 * 20, y: 10 * 20 }  // Body segment 2
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700 p-8">
      <div className="absolute top-6 left-4">
      <button 
  className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 px-2 py-1 rounded-full text-sm font-semibold shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400"
  onClick={onBack}
>
  ←
</button>
        </div>
        <div className="flex justify-between items-center mt-6 mb-4">
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">
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
              <div className="text-3xl font-extrabold text-red-500 mb-6 animate-pulse">
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
        <div className="mt-4 flex flex-col items-center">
          <div className="grid grid-cols-3 gap-1 w-full max-w-[200px]">
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
      </div>
    </div>
  );
}
