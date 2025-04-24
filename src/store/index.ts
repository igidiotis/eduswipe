import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Scenario, UserProfile } from '@/types';

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      step: 'questionnaire',
      userProfile: null,
      scenarios: [],
      
      setStep: (step) => set({ step }),
      
      setUserProfile: (profile: UserProfile) => set({ 
        userProfile: profile,
        step: 'scenarios' 
      }),
      
      setScenarios: (scenarios: Scenario[]) => set({ scenarios }),
      
      updateScenarioDecision: (id: string, decision: 'hopeful' | 'fearful') => 
        set((state) => ({
          scenarios: state.scenarios.map((scenario) =>
            scenario.id === id ? { ...scenario, decision } : scenario
          ),
        })),
    }),
    {
      name: 'eduswipe-storage',
    }
  )
); 