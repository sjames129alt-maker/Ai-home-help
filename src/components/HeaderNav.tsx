import React from 'react';
import {
  Flame,
  Calendar,
  Swords,
  Sparkles,
  RefreshCw,
  LogOut,
  Trophy,
  GraduationCap,
  Zap,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { PlayerStats } from '../types';

interface HeaderNavProps {
  currentTab: 'CALENDAR' | 'ARENA' | 'DUEL';
  onSelectTab: (tab: 'CALENDAR' | 'ARENA' | 'DUEL') => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onSyncClassroom: () => void;
  isSyncing: boolean;
  playerStats: PlayerStats;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  isDemoMode,
  onToggleDemoMode,
  onSyncClassroom,
  isSyncing,
  playerStats,
}) => {
  const xpPercent = Math.min(
    100,
    Math.round((playerStats.currentXp / playerStats.xpToNextLevel) * 100)
  );

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-3 flex-shrink-0 z-20">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/30">
          <Flame className="w-5 h-5 fill-white" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black tracking-tight text-white uppercase">
              Classroom Quest
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              AI Hardest → Easiest
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Google Classroom Workload RPG & Visual Calendar
          </p>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <nav className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => onSelectTab('CALENDAR')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
            currentTab === 'CALENDAR'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Deadline Calendar</span>
        </button>

        <button
          onClick={() => onSelectTab('ARENA')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
            currentTab === 'ARENA'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Boss Battle Arena</span>
        </button>

        <button
          onClick={() => onSelectTab('DUEL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
            currentTab === 'DUEL'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">AI Difficulty Duel</span>
          <span className="md:hidden">Duel</span>
        </button>
      </nav>

      {/* Right Controls: Player XP Level + Classroom Sync / Login */}
      <div className="flex items-center gap-3">
        {/* Player Level & XP Widget */}
        <div className="hidden lg:flex items-center gap-2.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs">
            L{playerStats.level}
          </div>

          <div className="space-y-1 w-24">
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>{playerStats.title}</span>
              <span className="font-mono text-indigo-400">{xpPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 pl-1 border-l border-slate-800">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>{playerStats.streakDays}d</span>
          </div>
        </div>

        {/* Sync Classroom / Demo Toggle */}
        <button
          onClick={user ? onSyncClassroom : onToggleDemoMode}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition disabled:opacity-50"
          title={user ? 'Sync Google Classroom coursework' : 'Toggle Demo / Live mode'}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
          <span className="hidden sm:inline">
            {isSyncing ? 'Syncing...' : user ? 'Sync Classroom' : isDemoMode ? 'Demo Academy' : 'Switch Mode'}
          </span>
        </button>

        {/* Google Classroom Sign In / User Avatar */}
        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Student'}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <GraduationCap className="w-4 h-4 text-emerald-400" />
              )}
              <span className="text-xs font-semibold text-slate-200 hidden md:inline truncate max-w-[120px]">
                {user.displayName || user.email}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            disabled={isLoggingIn}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition shadow-sm disabled:opacity-50"
            title="Connect your real Google Classroom classes"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="hidden sm:inline">
              {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
