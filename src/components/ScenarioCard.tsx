import { useState } from 'react';
import { Scenario } from '@/types';

type Props = {
  scenario: Scenario;
  onSwipe: (id: string, direction: 'hopeful' | 'fearful') => void;
  onComplete: () => void;
};

export default function ScenarioCard({ scenario, onSwipe, onComplete }: Props) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setSwiping(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    setCurrentX(e.touches[0].clientX - startX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!swiping) return;
    setCurrentX(e.clientX - startX);
  };

  const handleTouchEnd = () => {
    handleSwipeEnd();
  };

  const handleMouseUp = () => {
    handleSwipeEnd();
  };

  const handleSwipeEnd = () => {
    if (Math.abs(currentX) > 100) {
      // Determine swipe direction
      const direction = currentX > 0 ? 'hopeful' : 'fearful';
      onSwipe(scenario.id, direction);
      onComplete();
    }
    
    // Reset state
    setStartX(0);
    setCurrentX(0);
    setSwiping(false);
  };

  // Calculate rotation and opacity based on swipe distance
  const rotation = currentX * 0.1;
  const opacity = Math.min(Math.abs(currentX) / 100, 1);
  
  // Determine indicator color based on swipe direction
  const indicatorColor = currentX > 50 
    ? 'text-green-500' 
    : currentX < -50 
      ? 'text-red-500' 
      : 'text-gray-400';

  return (
    <div 
      className="relative w-full max-w-md mx-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden w-full h-[450px] p-6 cursor-grab"
        style={{
          transform: `translateX(${currentX}px) rotate(${rotation}deg)`,
          transition: swiping ? 'none' : 'transform 0.3s ease'
        }}
      >
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-auto">
            <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
              {scenario.text}
            </p>
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <span className={currentX < -50 ? "text-red-500 dark:text-red-400 font-bold" : "text-gray-400"}>
                ← Fearful
              </span>
            </div>
            <div className={`mt-2 text-center ${indicatorColor}`}>
              {currentX > 50 ? 'Hopeful' : currentX < -50 ? 'Fearful' : 'Swipe to decide'}
            </div>
            <div className="flex items-center">
              <span className={currentX > 50 ? "text-green-500 dark:text-green-400 font-bold" : "text-gray-400"}>
                Hopeful →
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Indicators that appear based on swipe direction */}
      {currentX > 50 && (
        <div 
          className="absolute top-6 right-6 bg-green-500 text-white px-3 py-1 rounded-full font-bold transform rotate-12"
          style={{ opacity }}
        >
          HOPEFUL
        </div>
      )}
      
      {currentX < -50 && (
        <div 
          className="absolute top-6 left-6 bg-red-500 text-white px-3 py-1 rounded-full font-bold transform -rotate-12"
          style={{ opacity }}
        >
          FEARFUL
        </div>
      )}
    </div>
  );
} 