import { Scenario, UserProfile } from "@/types";

// Save complete dataset to local storage
export const saveCompleteData = (userProfile: UserProfile, scenarios: Scenario[]) => {
  const data = {
    userProfile,
    scenarios,
    timestamp: new Date().toISOString(),
  };

  try {
    localStorage.setItem('eduswipe-complete-data', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving data to local storage:', error);
    return false;
  }
};

// Get complete dataset from local storage
export const getCompleteData = () => {
  try {
    const data = localStorage.getItem('eduswipe-complete-data');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting data from local storage:', error);
    return null;
  }
};

// Submit data to "database" (placeholder for now)
export const submitDataToDatabase = async (userProfile: UserProfile, scenarios: Scenario[]) => {
  // In a real app, this would be an API call to save data to Supabase or Firebase
  // For now, we'll just simulate a successful submission
  
  const data = {
    userProfile,
    scenarios,
    timestamp: new Date().toISOString(),
  };
  
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      console.log('Data submitted to database:', data);
      resolve(true);
    }, 1000);
  });
}; 