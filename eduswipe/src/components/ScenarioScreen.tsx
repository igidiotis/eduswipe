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
  
  // Generate scenarios when the component mounts
  useEffect(() => {
    if (!userProfile || scenarios.length > 0) return;
    
    const fetchScenarios = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/scenarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userProfile }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate scenarios');
        }
        
        const data = await response.json();
        
        if (data.scenarios && data.scenarios.length > 0) {
          setScenarios(data.scenarios);
        } else {
          // If API fails to return scenarios, use sample data
          const sampleScenarios: Scenario[] = Array.from({ length: 10 }, (_, i) => ({
            id: `sample-${i + 1}`,
            text: `This is a sample scenario ${i + 1} about digital education future. In this hypothetical situation, imagine how technology might evolve to address the challenges you mentioned.`,
          }));
          setScenarios(sampleScenarios);
        }
      } catch (err) {
        console.error('Error fetching scenarios:', err);
        setError('Failed to generate scenarios. Please try again.');
        
        // Use sample data in case of error
        const sampleScenarios: Scenario[] = Array.from({ length: 10 }, (_, i) => ({
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
    updateScenarioDecision(id, decision);
  };
  
  const handleComplete = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more scenarios, go to results
      setStep('results');
    }
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
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
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
      
      {scenarios.length > 0 && currentIndex < scenarios.length && (
        <ScenarioCard
          scenario={scenarios[currentIndex]}
          onSwipe={handleSwipe}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
} 