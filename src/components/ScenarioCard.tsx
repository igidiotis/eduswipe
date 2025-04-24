import { useState, useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
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
  const [direction, setDirection] = useState<'none' | 'left' | 'right'>('none');
  const [hasDecided, setHasDecided] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Calculate rotation and opacity based on swipe distance
  const rotation = currentX * 0.1;
  const opacity = Math.min(Math.abs(currentX) / 100, 1);
  
  // Spring animation for the card
  const [props, api] = useSpring(() => ({
    x: 0,
    rotate: 0,
    scale: 1,
    config: { tension: 300, friction: 20 }
  }));

  // Update spring when currentX changes
  useEffect(() => {
    if (swiping) {
      api.start({
        x: currentX,
        rotate: rotation,
        scale: 1 - Math.abs(currentX) * 0.0005, // Slight scale effect
      });
      
      // Set direction for visual indicators
      if (currentX > 50) {
        setDirection('right');
      } else if (currentX < -50) {
        setDirection('left');
      } else {
        setDirection('none');
      }
    }
  }, [currentX, rotation, swiping, api]);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setSwiping(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping || hasDecided) return;
    setCurrentX(e.touches[0].clientX - startX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!swiping || hasDecided) return;
    setCurrentX(e.clientX - startX);
  };

  const handleTouchEnd = () => {
    handleSwipeEnd();
  };

  const handleMouseUp = () => {
    handleSwipeEnd();
  };

  const handleSwipeEnd = () => {
    if (hasDecided) return;
    
    if (Math.abs(currentX) > 100) {
      // Determine swipe direction
      const swipeDirection = currentX > 0 ? 'hopeful' : 'fearful';
      setHasDecided(true);
      
      // Animate card flying away
      api.start({
        x: currentX > 0 ? 1500 : -1500,
        rotate: currentX > 0 ? 45 : -45,
        config: { tension: 200, friction: 25 },
        onRest: () => {
          onSwipe(scenario.id, swipeDirection);
          onComplete();
          
          // Reset for next card
          setStartX(0);
          setCurrentX(0);
          setSwiping(false);
          setDirection('none');
          setHasDecided(false);
        }
      });
    } else {
      // Spring back to center
      api.start({
        x: 0,
        rotate: 0,
        scale: 1,
        config: { tension: 300, friction: 10 }
      });
      
      // Reset state
      setStartX(0);
      setCurrentX(0);
      setSwiping(false);
      setDirection('none');
    }
  };

  // Buttons for alternative swiping methods
  const handleButtonSwipe = (swipeDirection: 'hopeful' | 'fearful') => {
    if (hasDecided) return;
    
    setHasDecided(true);
    
    // First call onSwipe to update the decision
    onSwipe(scenario.id, swipeDirection);
    
    // Animate based on direction
    api.start({
      x: swipeDirection === 'hopeful' ? 1500 : -1500,
      rotate: swipeDirection === 'hopeful' ? 45 : -45,
      config: { tension: 200, friction: 25 },
      onRest: () => {
        // Then call onComplete to advance to the next card
        onComplete();
        
        // Reset state happens after the next card is shown
        setTimeout(() => {
          setStartX(0);
          setCurrentX(0);
          setSwiping(false);
          setDirection('none');
          setHasDecided(false);
        }, 100);
      }
    });
  };
  
  // Calculate background gradients based on swipe direction
  const getBorderGradient = () => {
    if (direction === 'right') {
      const intensity = Math.min(opacity * 100, 20);
      return `linear-gradient(to right, transparent, rgba(74, 222, 128, ${intensity/100}))`;
    } else if (direction === 'left') {
      const intensity = Math.min(opacity * 100, 20);
      return `linear-gradient(to left, transparent, rgba(248, 113, 113, ${intensity/100}))`;
    }
    return 'none';
  };
  
  // Determine indicator text
  const indicatorText = direction === 'right' 
    ? 'HOPEFUL' 
    : direction === 'left' 
      ? 'FEARFUL' 
      : 'SWIPE';
  
  // Determine indicator color based on swipe direction
  const indicatorColor = direction === 'right'
    ? 'text-green-500' 
    : direction === 'left'
      ? 'text-red-500' 
      : 'text-gray-400';

  return (
    <div className="relative w-full max-w-md mx-auto">
      <animated.div 
        ref={cardRef}
        className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden w-full h-[450px] p-6 cursor-grab relative"
        style={{
          x: props.x,
          rotate: props.rotate,
          scale: props.scale,
          background: 'white',
          touchAction: 'pan-y',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background gradient effect */}
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ background: getBorderGradient() }}
        />
        
        <div className="h-full flex flex-col relative z-10">
          <div className="flex-1 overflow-auto">
            <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
              {scenario.text}
            </p>
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <span className={direction === 'left' ? "text-red-500 dark:text-red-400 font-bold" : "text-gray-400"}>
                ← Fearful
              </span>
            </div>
            <div className={`mt-2 text-center ${indicatorColor} text-xl font-bold`}>
              {indicatorText}
            </div>
            <div className="flex items-center">
              <span className={direction === 'right' ? "text-green-500 dark:text-green-400 font-bold" : "text-gray-400"}>
                Hopeful →
              </span>
            </div>
          </div>
        </div>
      </animated.div>
      
      {/* Larger indicators that appear based on swipe direction */}
      {direction === 'right' && (
        <animated.div 
          className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full font-bold transform rotate-12 shadow-lg"
          style={{ opacity: opacity * 2, scale: 1 + opacity * 0.5 }}
        >
          HOPEFUL
        </animated.div>
      )}
      
      {direction === 'left' && (
        <animated.div 
          className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-full font-bold transform -rotate-12 shadow-lg"
          style={{ opacity: opacity * 2, scale: 1 + opacity * 0.5 }}
        >
          FEARFUL
        </animated.div>
      )}
      
      {/* Button controls for alternative input method */}
      <div className="flex justify-center mt-6 space-x-6">
        <button
          onClick={() => handleButtonSwipe('fearful')}
          className="px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transform transition-transform hover:-translate-x-1 hover:scale-105"
          disabled={hasDecided}
        >
          Fearful
        </button>
        <button
          onClick={() => handleButtonSwipe('hopeful')}
          className="px-5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transform transition-transform hover:translate-x-1 hover:scale-105"
          disabled={hasDecided}
        >
          Hopeful
        </button>
      </div>
    </div>
  );
} 