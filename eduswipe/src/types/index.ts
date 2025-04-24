export type UserRole = 'student' | 'teacher' | 'parent' | 'administrator';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type EducationalSetting = 'k-12' | 'higher-education' | 'professional-development';

export interface UserProfile {
  role: UserRole;
  experienceLevel: ExperienceLevel;
  educationalSetting: EducationalSetting;
  challenges: string;
}

export interface Scenario {
  id: string;
  text: string;
  decision?: 'hopeful' | 'fearful';
}

export interface AppState {
  step: 'questionnaire' | 'scenarios' | 'results';
  userProfile: UserProfile | null;
  scenarios: Scenario[];
  setStep: (step: 'questionnaire' | 'scenarios' | 'results') => void;
  setUserProfile: (profile: UserProfile) => void;
  setScenarios: (scenarios: Scenario[]) => void;
  updateScenarioDecision: (id: string, decision: 'hopeful' | 'fearful') => void;
} 