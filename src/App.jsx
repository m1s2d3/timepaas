import { useState } from "react";
import "./App.css";
import SnakeGame from "./components/SnakeGame";
import TicTacToe from "./components/TicTacToe";
import clickSoundFile from "./sounds/click.mp3";
import startSoundFile from "./sounds/start.mp3";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedGame, setSelectedGame] = useState("tictactoe");

  const clickSound = new Audio(clickSoundFile);
  const startSound = new Audio(startSoundFile);

  const carouselItems = [
    {
      key: "tictactoe",
      title: "Tic Tac Toe",
      description: "Classic strategy game. Challenge your friend or AI!",
      image: "tictactoe.png",
    },
    {
      key: "snake",
      title: "Snake Game",
      description: "Eat, grow, and avoid walls in this arcade classic!",
      image: "snake.png",
    },
  ];

  const nextSlide = () => {
    clickSound.play().catch(() => {});
    setCarouselIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    clickSound.play().catch(() => {});
    setCarouselIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  // Theme variables based on current game selection
  const currentGameTheme = carouselItems[carouselIndex].key === "snake" 
    ? "from-green-900 via-emerald-900 to-teal-800" 
    : "from-indigo-900 via-purple-900 to-pink-800";

  const currentButtonTheme = carouselItems[carouselIndex].key === "snake"
    ? "from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
    : "from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700";

  const currentTextGradient = carouselItems[carouselIndex].key === "snake"
    ? "from-green-400 to-teal-400"
    : "from-pink-400 to-purple-400";

  const currentBubbleColor = carouselItems[carouselIndex].key === "snake"
    ? "bg-green-100/20"
    : "bg-white/10";

  if (showSplash) {
    return (
      <div className={`min-h-screen w-full bg-gradient-to-br ${currentGameTheme} flex flex-col items-center justify-center p-4 overflow-hidden relative`}>
        {/* Floating bubbles background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className={`absolute rounded-full ${currentBubbleColor} animate-float`}
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

        <div className="z-10 w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 mx-4">
          <h1 className={`text-center text-4xl md:text-5xl font-bold text-white py-4 md:py-6 bg-gradient-to-r ${currentButtonTheme}`}>
            Game Hub
          </h1>

          <div className="p-4 md:p-8">
            <div className="relative group">
              {/* Mobile navigation dots at top */}
              <div className="flex gap-2 mb-4 justify-center md:hidden">
                {carouselItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      clickSound.play().catch(() => {});
                      setCarouselIndex(index);
                    }}
                    className={`w-3 h-3 rounded-full transition-all ${index === carouselIndex ? 'bg-white w-6' : 'bg-white/30'}`}
                  />
                ))}
              </div>

              {/* Desktop left arrow */}
              <button 
                onClick={prevSlide}
                className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all z-20 group-hover:translate-x-0 opacity-0 group-hover:opacity-100"
              >
                ◀
              </button>

              <div className="carousel-slide bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                  <div className="w-full md:w-1/2">
                    <img
                      src={carouselItems[carouselIndex].image}
                      alt="Preview"
                      className="w-full h-48 md:h-64 object-contain rounded-lg shadow-lg transform transition-all duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="w-full md:w-1/2 text-white text-center md:text-left">
                    <h2 className={`text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-transparent bg-clip-text bg-gradient-to-r ${currentTextGradient}`}>
                      {carouselItems[carouselIndex].title}
                    </h2>
                    <p className="text-base md:text-lg mb-4 md:mb-6 text-white/80">
                      {carouselItems[carouselIndex].description}
                    </p>
                    <div className="hidden md:flex gap-2 mb-8 justify-center md:justify-start">
                      {carouselItems.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            clickSound.play().catch(() => {});
                            setCarouselIndex(index);
                          }}
                          className={`w-3 h-3 rounded-full transition-all ${index === carouselIndex ? 'bg-white w-6' : 'bg-white/30'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop right arrow */}
              <button 
                onClick={nextSlide}
                className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all z-20 group-hover:-translate-x-0 opacity-0 group-hover:opacity-100"
              >
                ▶
              </button>

              {/* Mobile navigation buttons */}
              <div className="flex justify-between mt-4 md:hidden">
                <button 
                  onClick={prevSlide}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all"
                >
                  ◀
                </button>
                <button 
                  onClick={nextSlide}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all"
                >
                  ▶
                </button>
              </div>
            </div>

            <div className="mt-6 md:mt-8 text-center">
              <button
                className={`px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r ${currentButtonTheme} text-white text-lg md:text-xl font-bold rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105`}
                onClick={() => {
                  startSound.play().catch(() => {});
                  setSelectedGame(carouselItems[carouselIndex].key);
                  setShowSplash(false);
                }}
              >
                Start Game
              </button>
            </div>
          </div>

          <div className="bg-black/20 text-white/70 text-center p-3 md:p-4 text-xs md:text-sm">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center justify-center gap-2 mb-2 md:mb-0">
                <p>Created by <strong className="text-white">Mohd Shamshad</strong></p>
                <img 
                  src="developer.png" 
                  alt="Developer" 
                  className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover border border-white/20"
                />
              </div>
              <p>© 2025 Powered by creativity and code</p>
            </div>
          </div>
        </div>

        {/* Add this to your global CSS or Tailwind config */}
        <style jsx global>{`
          @keyframes float {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(-100vh) rotate(360deg);
              opacity: 0;
            }
          }
          .animate-float {
            animation: float linear infinite;
          }
        `}</style>
      </div>
    );
  }

  if (selectedGame === "snake") {
    return (
      <div className="relative">
        <button 
          className="absolute top-4 left-4 z-50 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg shadow-lg transition-all backdrop-blur-sm"
          onClick={() => setShowSplash(true)}
        >
          ⬅ Back to Menu
        </button>
        <SnakeGame />
      </div>
    );
  }

  if (selectedGame === "tictactoe") {
    return <TicTacToe onBack={() => setShowSplash(true)} />;
  }
}