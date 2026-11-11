import React, { useState, useEffect } from 'react';
import {
  Flame,
  Swords,
  ShieldAlert,
  Clock,
  Sparkles,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
  Zap,
  Target,
  Trophy,
  Brain,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClassroomAssignment } from '../types';

interface BossBattleArenaProps {
  assignment: ClassroomAssignment | null;
  onToggleSubQuest: (assignmentId: string, subQuestId: string) => void;
  onConquerAssignment: (assignmentId: string) => void;
}

export const BossBattleArena: React.FC<BossBattleArenaProps> = ({
  assignment,
  onToggleSubQuest,
  onConquerAssignment,
}) => {
  // Focus Pomodoro Timer state
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'POMODORO' | 'SHORT_BREAK'>('POMODORO');

  // Reset timer on assignment change
  useEffect(() => {
    setIsTimerRunning(false);
    setTimerSeconds(timerMode === 'POMODORO' ? 25 * 60 : 5 * 60);
  }, [assignment?.id, timerMode]);

  // Pomodoro countdown ticker
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // ignore
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(timerMode === 'POMODORO' ? 25 * 60 : 5 * 60);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!assignment) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950 text-slate-400 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Swords className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-200">Select an Assignment to Enter Battle</h3>
          <p className="text-xs max-w-sm text-slate-400">
            Pick a coursework item from the AI rankings on the left or click a deadline chip in the
            calendar dashboard to view battle strategies and combat phases.
          </p>
        </div>
      </div>
    );
  }

  const hpPercent = Math.round((assignment.currentHp / assignment.maxHp) * 100);

  const handleDefeatClick = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
    onConquerAssignment(assignment.id);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto p-4 lg:p-6 space-y-5">
      {/* Boss Encounter Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-5 shadow-2xl">
        {/* Glow effect based on difficulty */}
        <div
          className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
            assignment.difficultyScore >= 80 ? 'bg-rose-500' : 'bg-indigo-500'
          }`}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black tracking-wider flex items-center gap-1.5 shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                RANK #{assignment.rank} HARDEST
              </span>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                {assignment.courseName}
              </span>

              <span className="text-xs font-bold px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {assignment.difficultyTier.replace('_', ' ')}
              </span>
            </div>

            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {assignment.bossTitle}
            </h1>
            <p className="text-sm font-semibold text-slate-300">{assignment.title}</p>
          </div>

          {/* Difficulty Gauge & Bounty */}
          <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Difficulty
              </span>
              <span className="text-2xl font-black text-amber-400">
                {assignment.difficultyScore}
                <span className="text-xs text-slate-500">/100</span>
              </span>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">XP Bounty</span>
              <span className="text-xl font-bold text-indigo-400 font-mono">
                +{assignment.xpReward}
              </span>
            </div>
          </div>
        </div>

        {/* Boss HP Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Boss Health (Assignment Progress)
            </span>
            <span className="font-mono font-bold text-slate-300">
              {assignment.isSlayed ? '0 / 100 HP (DEFEATED)' : `${hpPercent} / 100 HP`}
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                assignment.isSlayed
                  ? 'bg-emerald-500'
                  : hpPercent > 60
                  ? 'bg-gradient-to-r from-rose-600 to-red-500'
                  : hpPercent > 25
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500'
              }`}
              style={{ width: `${assignment.isSlayed ? 0 : hpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: AI Intel & Battle Phases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Tactical Dossier & SubQuests */}
        <div className="lg:col-span-2 space-y-5">
          {/* AI Intelligence & Boss Weakness */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Brain className="w-4 h-4" />
              <span>AI Cognitive Load & Difficulty Analysis</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              {assignment.difficultyReasoning}
            </p>

            {/* Boss Weakness / Tactical Tip */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200">
              <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold text-amber-300 block mb-0.5">
                  Tactical Study Weakness:
                </strong>
                <p className="text-xs text-amber-200/90">{assignment.bossWeakness}</p>
              </div>
            </div>

            {/* Meta badges: Est hours, due date, points */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium block">Est. Effort</span>
                <span className="text-xs font-bold text-slate-200">
                  {assignment.estimatedHours} Hours
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium block">Due Deadline</span>
                <span className="text-xs font-bold text-slate-200">
                  {assignment.dueDateFormatted}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium block">Max Score</span>
                <span className="text-xs font-bold text-slate-200">{assignment.maxPoints} pts</span>
              </div>
            </div>
          </div>

          {/* Sub-Quests (Combat Phases) */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Target className="w-4 h-4 text-rose-400" />
                <span>Battle Phases & Checkpoints</span>
              </div>
              <span className="text-xs text-slate-400">
                Check off phases to slash Boss HP and earn XP!
              </span>
            </div>

            <div className="space-y-2">
              {assignment.subQuests.map((phase) => (
                <div
                  key={phase.id}
                  onClick={() => onToggleSubQuest(assignment.id, phase.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    phase.completed
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200 line-through'
                      : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                        phase.completed
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {phase.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-medium">{phase.title}</span>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-950/50 border border-indigo-800/50">
                    +{phase.xp} XP
                  </span>
                </div>
              ))}
            </div>

            {/* Victory / Conquered CTA */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleDefeatClick}
                disabled={assignment.isSlayed}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg ${
                  assignment.isSlayed
                    ? 'bg-emerald-800 text-emerald-200 cursor-not-allowed opacity-80'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50'
                }`}
              >
                <Trophy className="w-4 h-4" />
                {assignment.isSlayed ? 'Boss Conquered & Turned In! 🏆' : 'Mark Boss Defeated (+100% XP)'}
              </button>

              {assignment.alternateLink && (
                <a
                  href={assignment.alternateLink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition"
                  title="Open assignment in Google Classroom"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Pomodoro Focus Spell Timer */}
        <div className="space-y-5">
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 flex flex-col items-center justify-center text-center space-y-4">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pomodoro Battle Focus</span>
            </div>

            {/* Timer mode toggle */}
            <div className="flex p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setTimerMode('POMODORO')}
                className={`px-3 py-1 rounded font-medium transition ${
                  timerMode === 'POMODORO'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Focus (25m)
              </button>
              <button
                onClick={() => setTimerMode('SHORT_BREAK')}
                className={`px-3 py-1 rounded font-medium transition ${
                  timerMode === 'SHORT_BREAK'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Break (5m)
              </button>
            </div>

            {/* Digital Clock Display */}
            <div className="relative py-4">
              <div
                className={`text-4xl lg:text-5xl font-mono font-black tracking-widest ${
                  isTimerRunning ? 'text-amber-400 animate-pulse' : 'text-slate-100'
                }`}
              >
                {formatTimer(timerSeconds)}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                {isTimerRunning ? '⚔️ In Combat Focus' : 'Ready to Cast Focus'}
              </p>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={toggleTimer}
                className={`flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                  isTimerRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    Pause Combat
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Start Focus Burst
                  </>
                )}
              </button>

              <button
                onClick={resetTimer}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Reset Timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Assignment Description Excerpt */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Classroom Instructions
            </h4>
            <div className="text-xs text-slate-400 max-h-40 overflow-y-auto leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
              {assignment.description || 'No additional instructions provided by teacher.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
