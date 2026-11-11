import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logout,
} from './services/auth';
import {
  DEMO_ASSIGNMENTS_RAW,
  fetchLiveClassroomData,
  formatDueDate,
  getCourseColor,
} from './services/classroom';
import {
  ClassroomAssignment,
  PlayerStats,
  DifficultyTier,
} from './types';
import { HeaderNav } from './components/HeaderNav';
import { SidebarRankings } from './components/SidebarRankings';
import { DeadlineCalendar } from './components/DeadlineCalendar';
import { BossBattleArena } from './components/BossBattleArena';
import { RankPredictorGame } from './components/RankPredictorGame';
import { Sparkles, AlertCircle, CheckCircle2, Flame, Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // App navigation
  const [currentTab, setCurrentTab] = useState<'CALENDAR' | 'ARENA' | 'DUEL'>('CALENDAR');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  // Assignments & AI Rankings
  const [assignments, setAssignments] = useState<ClassroomAssignment[]>([]);

  // Player RPG stats
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem('classroom_quest_player_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      level: 4,
      currentXp: 380,
      xpToNextLevel: 600,
      totalXp: 1580,
      streakDays: 5,
      bossesSlayed: 3,
      totalStudyMinutes: 240,
      title: 'Arch-Scholar',
    };
  });

  // Save player stats
  useEffect(() => {
    localStorage.setItem('classroom_quest_player_stats', JSON.stringify(playerStats));
  }, [playerStats]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Award XP helper
  const handleAwardXp = useCallback((xpGain: number) => {
    setPlayerStats((prev) => {
      let newCurrentXp = prev.currentXp + xpGain;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNextLevel;

      while (newCurrentXp >= newXpToNext) {
        newCurrentXp -= newXpToNext;
        newLevel += 1;
        newXpToNext = Math.round(newXpToNext * 1.35);
      }

      let title = prev.title;
      if (newLevel >= 10) title = 'Mythic Grandmaster';
      else if (newLevel >= 7) title = 'High Battle Sage';
      else if (newLevel >= 5) title = 'Arch-Scholar';
      else if (newLevel >= 3) title = 'Adept Researcher';

      return {
        ...prev,
        level: newLevel,
        currentXp: newCurrentXp,
        xpToNextLevel: newXpToNext,
        totalXp: prev.totalXp + xpGain,
        title,
      };
    });
  }, []);

  // AI Analysis of assignments via Express server endpoint
  const runAiDifficultyAnalysis = useCallback(
    async (rawList: any[]) => {
      setIsAnalyzing(true);
      try {
        const response = await fetch('/api/analyze-difficulty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignments: rawList }),
        });

        const data = await response.json();
        const rankingsMap = new Map<string, any>();

        if (data.rankings && Array.isArray(data.rankings)) {
          data.rankings.forEach((r: any) => {
            rankingsMap.set(r.id, r);
          });
        }

        // Merge raw assignments with AI difficulty metrics
        const merged: ClassroomAssignment[] = rawList.map((raw, idx) => {
          const aiData = rankingsMap.get(raw.id) || {};
          const { formatted, daysRemaining } = formatDueDate(raw.dueDate);
          const color = getCourseColor(raw.courseName);

          const subQuests = (aiData.subQuests || [
            { id: '1', title: 'Breakdown instructions and build bibliography', xp: 40 },
            { id: '2', title: 'Execute central thesis & core computations', xp: 60 },
            { id: '3', title: 'Format citations and final proofreading', xp: 50 },
          ]).map((sq: any) => ({
            id: sq.id,
            title: sq.title,
            xp: sq.xp,
            completed: false,
          }));

          return {
            id: raw.id,
            courseId: raw.courseId,
            courseName: raw.courseName,
            courseColor: color,
            title: raw.title,
            description: raw.description || '',
            dueDate: raw.dueDate || null,
            dueDateFormatted: formatted,
            daysRemaining,
            maxPoints: raw.maxPoints || 100,
            alternateLink: raw.alternateLink,
            submissionState: raw.submissionState || 'PENDING',

            rank: aiData.rank || idx + 1,
            difficultyScore: aiData.difficultyScore || 50,
            difficultyTier: (aiData.difficultyTier || 'MODERATE_QUEST') as DifficultyTier,
            bossTitle: aiData.bossTitle || `Guardian of ${raw.title.slice(0, 20)}`,
            estimatedHours: aiData.estimatedHours || 3,
            cognitiveLoad: aiData.cognitiveLoad || 'MODERATE',
            difficultyReasoning:
              aiData.difficultyReasoning ||
              'Analyzed for conceptual depth and time investment required for high marks.',
            bossWeakness:
              aiData.bossWeakness ||
              'Tackle the heaviest analytical segment first with 25-minute Pomodoro focus sprints.',
            subQuests,
            xpReward: aiData.xpReward || Math.round((aiData.difficultyScore || 50) * 10),

            currentHp: 100,
            maxHp: 100,
            isSlayed: raw.submissionState === 'TURNED_IN',
          };
        });

        // Ensure order is strictly hardest to easiest
        merged.sort((a, b) => b.difficultyScore - a.difficultyScore);
        merged.forEach((item, index) => {
          item.rank = index + 1;
        });

        setAssignments(merged);
        if (merged.length > 0 && !selectedAssignmentId) {
          setSelectedAssignmentId(merged[0].id);
        }

        showToast(
          `✨ AI Organized ${merged.length} assignments from Hardest (#1 ${merged[0]?.bossTitle}) to Easiest!`
        );
      } catch (err: any) {
        console.error('Failed to run AI ranking:', err);
        showToast('Using local heuristic ranking.');
      } finally {
        setIsAnalyzing(false);
      }
    },
    [selectedAssignmentId]
  );

  // Initialize demo data on app load
  useEffect(() => {
    runAiDifficultyAnalysis(DEMO_ASSIGNMENTS_RAW);
  }, []);

  // Init Firebase Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        setIsDemoMode(false);
        // Automatically fetch real Google Classroom assignments on successful login
        syncClassroomWithToken(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch Google Classroom data
  const syncClassroomWithToken = async (accessToken: string) => {
    setIsSyncing(true);
    try {
      const data = await fetchLiveClassroomData(accessToken);
      if (data.assignments && data.assignments.length > 0) {
        setIsDemoMode(false);
        await runAiDifficultyAnalysis(data.assignments);
        showToast(`Synced ${data.assignments.length} assignments from Google Classroom!`);
      } else {
        showToast('No active assignments found in Classroom. Keeping Demo Academy loaded.');
      }
    } catch (error: any) {
      console.error('Classroom sync error:', error);
      showToast('Error connecting to Google Classroom. Verify class permissions.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setIsDemoMode(false);
        await syncClassroomWithToken(result.accessToken);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      showToast('Sign-in cancelled or failed. Check Google popup settings.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setIsDemoMode(true);
    runAiDifficultyAnalysis(DEMO_ASSIGNMENTS_RAW);
    showToast('Signed out. Switched to Demo Academy.');
  };

  const handleToggleDemoMode = () => {
    setIsDemoMode(true);
    runAiDifficultyAnalysis(DEMO_ASSIGNMENTS_RAW);
    showToast('Loaded Demo Academy Courses.');
  };

  // Toggle sub-quest completion in Boss Battle Arena
  const handleToggleSubQuest = (assignmentId: string, subQuestId: string) => {
    setAssignments((prev) =>
      prev.map((item) => {
        if (item.id !== assignmentId) return item;

        const updatedQuests = item.subQuests.map((sq) => {
          if (sq.id !== subQuestId) return sq;
          const willComplete = !sq.completed;
          if (willComplete) {
            handleAwardXp(sq.xp);
            showToast(`⚔️ Slashed Boss HP! +${sq.xp} XP earned!`);
          }
          return { ...sq, completed: willComplete };
        });

        const completedCount = updatedQuests.filter((sq) => sq.completed).length;
        const totalCount = updatedQuests.length;
        const remainingRatio = totalCount > 0 ? (totalCount - completedCount) / totalCount : 0;
        const newHp = Math.round(remainingRatio * item.maxHp);
        const isSlayed = completedCount === totalCount;

        return {
          ...item,
          subQuests: updatedQuests,
          currentHp: newHp,
          isSlayed,
        };
      })
    );
  };

  // Mark assignment completely conquered
  const handleConquerAssignment = (assignmentId: string) => {
    setAssignments((prev) =>
      prev.map((item) => {
        if (item.id !== assignmentId) return item;

        const completedQuests = item.subQuests.map((sq) => ({ ...sq, completed: true }));
        handleAwardXp(item.xpReward);

        setPlayerStats((s) => ({
          ...s,
          bossesSlayed: s.bossesSlayed + 1,
          streakDays: s.streakDays + 1,
        }));

        showToast(`🏆 BOSS CONQUERED! Awarded +${item.xpReward} XP!`);

        return {
          ...item,
          subQuests: completedQuests,
          currentHp: 0,
          isSlayed: true,
          submissionState: 'COMPLETED',
        };
      })
    );
  };

  const selectedAssignment =
    assignments.find((a) => a.id === selectedAssignmentId) || assignments[0] || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Application Header */}
      <HeaderNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        isDemoMode={isDemoMode}
        onToggleDemoMode={handleToggleDemoMode}
        onSyncClassroom={() => token && syncClassroomWithToken(token)}
        isSyncing={isSyncing}
        playerStats={playerStats}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-indigo-500/50 shadow-2xl shadow-indigo-950/80 px-4 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Split Layout: Left Rankings Sidebar + Center/Right Dashboard */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side Panel: AI Rankings Hardest to Easiest */}
        <SidebarRankings
          assignments={assignments}
          selectedAssignmentId={selectedAssignmentId}
          onSelectAssignment={(id) => {
            setSelectedAssignmentId(id);
            // If user clicked an assignment while on calendar, give them option to open in Arena
          }}
          isAnalyzing={isAnalyzing}
          onTriggerAnalyze={() => runAiDifficultyAnalysis(assignments)}
        />

        {/* Center Dashboard: Calendar / Arena / Prediction Duel */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {currentTab === 'CALENDAR' && (
            <DeadlineCalendar
              assignments={assignments}
              selectedAssignmentId={selectedAssignmentId}
              onSelectAssignment={(id) => {
                setSelectedAssignmentId(id);
                // Switch to arena to examine the chosen assignment
                setCurrentTab('ARENA');
              }}
            />
          )}

          {currentTab === 'ARENA' && (
            <BossBattleArena
              assignment={selectedAssignment}
              onToggleSubQuest={handleToggleSubQuest}
              onConquerAssignment={handleConquerAssignment}
            />
          )}

          {currentTab === 'DUEL' && (
            <RankPredictorGame
              assignments={assignments}
              onAwardXp={(xp) => {
                handleAwardXp(xp);
                showToast(`⚔️ Intuition Mastery! +${xp} XP!`);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
