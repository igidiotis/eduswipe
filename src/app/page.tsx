'use client';

import { useStore } from '@/store';
import dynamic from 'next/dynamic';

const Questionnaire = dynamic(() => import('@/components/Questionnaire'), { ssr: false });
const ScenarioScreen = dynamic(() => import('@/components/ScenarioScreen'), { ssr: false });
const ResultsScreen = dynamic(() => import('@/components/ResultsScreen'), { ssr: false });

export default function Home() {
  const step = useStore((state) => state.step);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <header className="mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-blue-600 dark:text-blue-400">
            EduSwipe
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
            Explore your hopes and fears about digital education futures
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-12">
        {step === 'questionnaire' && <Questionnaire />}
        {step === 'scenarios' && <ScenarioScreen />}
        {step === 'results' && <ResultsScreen />}
      </main>

      <footer className="mt-auto py-6 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} EduSwipe - Exploring Digital Education Futures
          </p>
        </div>
      </footer>
    </div>
  );
}
