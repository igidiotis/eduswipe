import { useState } from 'react';
import { UserProfile, UserRole, ExperienceLevel, EducationalSetting } from '@/types';
import { useStore } from '@/store';

export default function Questionnaire() {
  const setUserProfile = useStore((state) => state.setUserProfile);
  
  const [role, setRole] = useState<UserRole>('student');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('beginner');
  const [educationalSetting, setEducationalSetting] = useState<EducationalSetting>('k-12');
  const [challenges, setChallenges] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!challenges.trim()) {
      alert('Please describe your challenges with digital education.');
      return;
    }
    
    setIsSubmitting(true);
    
    const userProfile: UserProfile = {
      role,
      experienceLevel,
      educationalSetting,
      challenges,
    };
    
    // Save user profile and advance to next step
    setUserProfile(userProfile);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Tell Us About Yourself</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What is your role in education?
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="parent">Parent</option>
            <option value="administrator">Administrator</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What is your experience level with digital tools?
          </label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What educational setting do you work in?
          </label>
          <select
            value={educationalSetting}
            onChange={(e) => setEducationalSetting(e.target.value as EducationalSetting)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="k-12">K-12</option>
            <option value="higher-education">Higher Education</option>
            <option value="professional-development">Professional Development</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What challenges do you face with digital education?
          </label>
          <textarea
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={4}
            required
            placeholder="Describe your challenges..."
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Continue'}
        </button>
      </form>
    </div>
  );
} 