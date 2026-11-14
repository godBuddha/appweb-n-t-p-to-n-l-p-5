/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { AchievementsView } from './components/AchievementsView';
import { DashboardView } from './components/DashboardView';
import { ParentView } from './components/ParentView';
import { PracticeView } from './components/PracticeView';
import { TopBar } from './components/TopBar';
import { VisualLabView } from './components/VisualLabView';
import { INITIAL_PROGRESS } from './data/curriculum';
import type {
  MathDomain,
  NavView,
  PracticeMode,
  Question,
  SessionRecord,
  StudentProgress,
} from './types/math';

const STORAGE_KEY = 'math-spark-junior-vi-v1';

function loadInitialProgress(): StudentProgress {
  if (typeof window === 'undefined') return INITIAL_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PROGRESS;
    const parsed = JSON.parse(raw) as StudentProgress;
    if (!parsed || !parsed.domainStats) return INITIAL_PROGRESS;
    return {
      ...parsed,
      studentName: !parsed.studentName || parsed.studentName === 'Minh Anh' ? 'Bạn ơi' : parsed.studentName,
    };
  } catch {
    return INITIAL_PROGRESS;
  }
}

function getInitialView(): NavView {
  if (typeof window === 'undefined') return 'dashboard';
  const params = new URLSearchParams(window.location.search);
  if (params.get('autostart') === '1') {
    return 'practice';
  }
  return 'dashboard';
}

function getInitialPracticeMode(): PracticeMode {
  if (typeof window === 'undefined') return 'de-1';
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  if (
    mode === 'de-1' ||
    mode === 'de-2' ||
    mode === 'de-3' ||
    mode === 'de-4' ||
    mode === 'fractions' ||
    mode === 'decimals' ||
    mode === 'geometry' ||
    mode === 'measurement' ||
    mode === 'daily'
  ) {
    return mode;
  }
  return 'de-1';
}

export default function App() {
  const [activeView, setActiveView] = useState<NavView>(getInitialView);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(getInitialPracticeMode);
  const [labDomain, setLabDomain] = useState<MathDomain>('fractions');
  const [progress, setProgress] = useState<StudentProgress>(loadInitialProgress);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeView]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  const handleStartPractice = (mode: PracticeMode) => {
    setPracticeMode(mode);
    setActiveView('practice');
  };

  const handleOpenLab = (domain: MathDomain) => {
    setLabDomain(domain);
    setActiveView('lab');
  };

  const handleCompleteSession = (
    mode: PracticeMode,
    results: { question: Question; isCorrect: boolean }[],
    sessionRecord: SessionRecord
  ) => {
    setProgress((prev) => {
      const nextStats = {
        fractions: { ...prev.domainStats.fractions },
        decimals: { ...prev.domainStats.decimals },
        geometry: { ...prev.domainStats.geometry },
        measurement: { ...prev.domainStats.measurement },
      };

      for (const item of results) {
        const d = item.question.domain;
        nextStats[d].questionsAnswered += 1;
        if (item.isCorrect) {
          nextStats[d].questionsCorrect += 1;
        }
      }

      if (
        mode === 'fractions' ||
        mode === 'decimals' ||
        mode === 'geometry' ||
        mode === 'measurement'
      ) {
        nextStats[mode].lessonsCompleted += 1;
      }

      const isPerfect =
        results.length > 0 && results.every((r) => r.isCorrect);

      return {
        ...prev,
        xp: prev.xp + sessionRecord.xpEarned,
        todayQuestionsAnswered: prev.todayQuestionsAnswered + results.length,
        perfectRounds: prev.perfectRounds + (isPerfect ? 1 : 0),
        domainStats: nextStats,
        recentSessions: [sessionRecord, ...prev.recentSessions].slice(0, 10),
      };
    });
  };

  const handleUpdateDailyGoal = (newGoal: number) => {
    setProgress((prev) => ({
      ...prev,
      dailyGoalQuestions: newGoal,
    }));
  };

  const handleResetProgress = () => {
    setProgress(INITIAL_PROGRESS);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      <TopBar
        activeView={activeView}
        onNavigate={setActiveView}
        onStartDailyChallenge={() => handleStartPractice('daily')}
        streakDays={progress.streakDays}
        xp={progress.xp}
      />

      <div className="flex-1">
        {activeView === 'dashboard' && (
          <DashboardView
            progress={progress}
            onStartPractice={handleStartPractice}
            onOpenLab={handleOpenLab}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'practice' && (
          <PracticeView
            initialMode={practiceMode}
            streakDays={progress.streakDays}
            onCompleteSession={handleCompleteSession}
            onExitToDashboard={() => setActiveView('dashboard')}
          />
        )}

        {activeView === 'lab' && (
          <VisualLabView
            initialDomain={labDomain}
            onStartPractice={(domain) => handleStartPractice(domain)}
          />
        )}

        {activeView === 'achievements' && (
          <AchievementsView
            progress={progress}
            onStartPractice={() => handleStartPractice('daily')}
          />
        )}

        {activeView === 'parent' && (
          <ParentView
            progress={progress}
            onUpdateDailyGoal={handleUpdateDailyGoal}
            onResetProgress={handleResetProgress}
          />
        )}
      </div>
    </div>
  );
}
