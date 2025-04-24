import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import ScenarioCard from './ScenarioCard';
import { Scenario } from '@/types';

export default function ScenarioScreen() {
  const userProfile = useStore((state) => state.userProfile);
  const scenarios = useStore((state) => state.scenarios);
  const setScenarios = useStore((state) => state.setScenarios);
  const updateScenarioDecision = useStore((state) => state.updateScenarioDecision);
  const setStep = useStore((state) => state.setStep);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  
  // Generate scenarios when the component mounts
  useEffect(() => {
    if (!userProfile || scenarios.length > 0) return;
    
    const fetchScenarios = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching scenarios for', userProfile);
        const response = await fetch('/api/scenarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userProfile }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('API error response:', data);
          throw new Error(data.error || 'Failed to generate scenarios');
        }
        
        if (data.scenarios && data.scenarios.length > 0) {
          console.log(`Loaded ${data.scenarios.length} scenarios`);
          setScenarios(data.scenarios);
        } else {
          console.warn('API returned empty scenarios, using fallback data');
          // If API fails to return scenarios, use sample data with EXACTLY 5 scenarios
          const sampleScenarios: Scenario[] = Array.from({ length: 5 }, (_, i) => ({
            id: `sample-${i + 1}`,
            text: `This is a sample scenario ${i + 1} about digital education future. In this hypothetical situation, imagine how technology might evolve to address the challenges you mentioned.`,
          }));
          setScenarios(sampleScenarios);
        }
      } catch (err) {
        console.error('Error fetching scenarios:', err);
        setError('Failed to generate scenarios. Please try again.');
        
        // Use sample data in case of error - EXACTLY 5 scenarios
        const sampleScenarios: Scenario[] = Array.from({ length: 5 }, (_, i) => ({
          id: `sample-${i + 1}`,
          text: `This is a sample scenario ${i + 1} about digital education future. In this hypothetical situation, imagine how technology might evolve to address the challenges you mentioned.`,
        }));
        setScenarios(sampleScenarios);
      } finally {
        setLoading(false);
      }
    };
    
    fetchScenarios();
  }, [userProfile, scenarios.length, setScenarios]);
  
  const handleSwipe = (id: string, decision: 'hopeful' | 'fearful') => {
    console.log(`Decision registered: ${decision} for scenario ${id}`);
    updateScenarioDecision(id, decision);
  };
  
  const handleComplete = () => {
    if (transitioning) return; // Prevent multiple calls
    
    setTransitioning(true);
    console.log(`Completing scenario at index ${currentIndex}`);
    
    // Add a delay to allow animation to complete and avoid rapid clicks
    setTimeout(() => {
      if (currentIndex < scenarios.length - 1) {
        console.log(`Moving to next scenario (index ${currentIndex + 1})`);
        setCurrentIndex(prevIndex => prevIndex + 1);
      } else {
        console.log('No more scenarios, showing results');
        setStep('results');
      }
      setTransitioning(false);
    }, 800); // Longer delay to ensure animation completes
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Generating personalized scenarios...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
          <button
            onClick={() => setStep('questionnaire')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Questionnaire
          </button>
        </div>
      </div>
    );
  }
  
  if (scenarios.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-300 mb-4">No scenarios available.</p>
        <button
          onClick={() => setStep('questionnaire')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto p-4">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Explore Education Futures</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Swipe right for hopeful, left for fearful
        </p>
        <div className="mt-2 text-sm text-gray-500">
          Scenario {currentIndex + 1} of {scenarios.length}
        </div>
      </div>
      
      {scenarios.length > 0 && currentIndex < scenarios.length && !transitioning && (
        <ScenarioCard
          key={scenarios[currentIndex].id} 
          scenario={scenarios[currentIndex]}
          onSwipe={handleSwipe}
          onComplete={handleComplete}
        />
      )}
      
      {transitioning && (
        <div className="h-[450px] flex items-center justify-center">
          <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
} 