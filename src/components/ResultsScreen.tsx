import { useState } from 'react';
import { useStore } from '@/store';
import { submitDataToDatabase } from '@/utils/storage';

export default function ResultsScreen() {
  const scenarios = useStore((state) => state.scenarios);
  const userProfile = useStore((state) => state.userProfile);
  const setStep = useStore((state) => state.setStep);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Filter scenarios by decision
  const hopefulScenarios = scenarios.filter((s) => s.decision === 'hopeful');
  const fearfulScenarios = scenarios.filter((s) => s.decision === 'fearful');
  const undecidedScenarios = scenarios.filter((s) => !s.decision);
  
  // Calculate percentages
  const totalDecided = hopefulScenarios.length + fearfulScenarios.length;
  const hopefulPercentage = totalDecided ? Math.round((hopefulScenarios.length / totalDecided) * 100) : 0;
  const fearfulPercentage = totalDecided ? Math.round((fearfulScenarios.length / totalDecided) * 100) : 0;
  
  const handleSubmit = async () => {
    if (!userProfile) return;
    
    setIsSubmitting(true);
    
    try {
      await submitDataToDatabase(userProfile, scenarios);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Failed to submit data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReset = () => {
    // Clear local storage and go back to the questionnaire
    localStorage.removeItem('eduswipe-storage');
    window.location.reload();
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Your Digital Education Outlook</h2>
      
      {undecidedScenarios.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700 dark:text-yellow-300">
            You have {undecidedScenarios.length} scenario(s) without a decision. Your results below reflect only the scenarios you've rated.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Summary</h3>
          
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-300">Total scenarios:</span>
            <span className="font-medium">{scenarios.length}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-300">Scenarios rated:</span>
            <span className="font-medium">{totalDecided} ({Math.round((totalDecided / scenarios.length) * 100)}%)</span>
          </div>
          
          <div className="mt-6">
            <h4 className="text-lg font-medium mb-3 text-gray-800 dark:text-white">Your Sentiment</h4>
            
            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="text-green-600 dark:text-green-400">Hopeful</span>
                <span className="text-green-600 dark:text-green-400">{hopefulPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${hopefulPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-red-600 dark:text-red-400">Fearful</span>
                <span className="text-red-600 dark:text-red-400">{fearfulPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-red-500 h-2.5 rounded-full" 
                  style={{ width: `${fearfulPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Your Profile</h3>
          
          {userProfile && (
            <div className="space-y-4">
              <div>
                <span className="text-gray-600 dark:text-gray-300 block">Role:</span>
                <span className="font-medium capitalize">{userProfile.role}</span>
              </div>
              
              <div>
                <span className="text-gray-600 dark:text-gray-300 block">Experience level:</span>
                <span className="font-medium capitalize">{userProfile.experienceLevel}</span>
              </div>
              
              <div>
                <span className="text-gray-600 dark:text-gray-300 block">Educational setting:</span>
                <span className="font-medium capitalize">{userProfile.educationalSetting.replace('-', ' ')}</span>
              </div>
              
              <div>
                <span className="text-gray-600 dark:text-gray-300 block">Challenges:</span>
                <p className="text-sm mt-1">{userProfile.challenges}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-6 mb-10">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Your Responses</h3>
        
        {hopefulScenarios.length > 0 && (
          <div>
            <h4 className="text-lg font-medium mb-3 text-green-600 dark:text-green-400">Hopeful Scenarios</h4>
            <div className="space-y-4">
              {hopefulScenarios.map((scenario) => (
                <div key={scenario.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-gray-700 dark:text-gray-300">{scenario.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {fearfulScenarios.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-medium mb-3 text-red-600 dark:text-red-400">Fearful Scenarios</h4>
            <div className="space-y-4">
              {fearfulScenarios.map((scenario) => (
                <div key={scenario.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-red-500">
                  <p className="text-gray-700 dark:text-gray-300">{scenario.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit My Responses'}
          </button>
        ) : (
          <div className="text-center mb-4 p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
            Thank you for submitting your responses!
          </div>
        )}
        
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Start Over
        </button>
        
        <button
          onClick={() => setStep('scenarios')}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Back to Scenarios
        </button>
      </div>
    </div>
  );
} 