import React, { useState } from 'react';
import {
  Flame,
  Swords,
  Trophy,
  Sparkles,
  HelpCircle,
  ArrowRight,
  RotateCw,
  Award,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClassroomAssignment } from '../types';

interface RankPredictorGameProps {
  assignments: ClassroomAssignment[];
  onAwardXp: (amount: number) => void;
}

export const RankPredictorGame: React.FC<RankPredictorGameProps> = ({
  assignments,
  onAwardXp,
}) => {
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [selectedPairIndex, setSelectedPairIndex] = useState<{ a: number; b: number }>(() => {
    return getRandomPair(assignments.length);
  });
  const [revealed, setRevealed] = useState(false);
  const [userChoice, setUserChoice] = useState<'A' | 'B' | null>(null);

  function getRandomPair(len: number) {
    if (len < 2) return { a: 0, b: 0 };
    const a = Math.floor(Math.random() * len);
    let b = Math.floor(Math.random() * len);
    while (b === a) {
      b = Math.floor(Math.random() * len);
    }
    return { a, b };
  }

  const nextDuel = () => {
    setSelectedPairIndex(getRandomPair(assignments.length));
    setRevealed(false);
    setUserChoice(null);
    setRound((r) => r + 1);
  };

  if (assignments.length < 2) {
    return (
      <div className="p-8 text-center text-slate-400">
        Need at least 2 assignments to initiate the AI Difficulty Crucible Duel!
      </div>
    );
  }

  const itemA = assignments[selectedPairIndex.a];
  const itemB = assignments[selectedPairIndex.b];

  // The harder assignment has the higher difficultyScore (or lower rank number)
  const harderIsA = itemA.difficultyScore > itemB.difficultyScore;
  const isCorrect = userChoice && ((userChoice === 'A' && harderIsA) || (userChoice === 'B' && !harderIsA));

  const handleChoose = (choice: 'A' | 'B') => {
    if (revealed) return;
    setUserChoice(choice);
    setRevealed(true);

    const won = (choice === 'A' && harderIsA) || (choice === 'B' && !harderIsA);
    if (won) {
      setStreak((s) => s + 1);
      onAwardXp(100);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    } else {
      setStreak(0);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 p-6 overflow-y-auto max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          The Grandmaster Duel: Difficulty Intuition
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Which Assignment Did AI Rank as HARDEST?
        </h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Test your workload instincts! Choose which coursework piece has a higher cognitive load,
          points penalty, and time investment according to Gemini AI.
        </p>

        {/* Streak & Score Counter */}
        <div className="flex items-center justify-center gap-6 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-500/30">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>Duel Streak: {streak} 🔥</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-500/30">
            <Trophy className="w-4 h-4" />
            <span>Round #{round}</span>
          </div>
        </div>
      </div>

      {/* Versus Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
        {/* Card A */}
        <div
          onClick={() => handleChoose('A')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
            revealed && harderIsA
              ? 'bg-rose-950/50 border-rose-500 ring-2 ring-rose-500/60 shadow-xl'
              : revealed && !harderIsA && userChoice === 'A'
              ? 'bg-slate-900 border-rose-800 opacity-70'
              : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-950 text-indigo-400 border border-slate-800">
                Option A
              </span>
              <span className="text-xs font-semibold text-slate-400">{itemA.courseName}</span>
            </div>
            <h3 className="text-base font-bold text-white">{itemA.title}</h3>
            <p className="text-xs text-slate-400 line-clamp-3">{itemA.description}</p>
          </div>

          {/* Reveal details */}
          {revealed ? (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">AI Difficulty Score:</span>
                <span className="text-base font-black text-amber-400">
                  {itemA.difficultyScore}/100
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{itemA.difficultyReasoning}</p>
            </div>
          ) : (
            <button className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition">
              Bet on Option A as Harder
            </button>
          )}
        </div>

        {/* VS Badge in center for desktop */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950 border-2 border-indigo-500 items-center justify-center text-xs font-black text-indigo-300 z-10 shadow-lg pointer-events-none">
          VS
        </div>

        {/* Card B */}
        <div
          onClick={() => handleChoose('B')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
            revealed && !harderIsA
              ? 'bg-rose-950/50 border-rose-500 ring-2 ring-rose-500/60 shadow-xl'
              : revealed && harderIsA && userChoice === 'B'
              ? 'bg-slate-900 border-rose-800 opacity-70'
              : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-950 text-indigo-400 border border-slate-800">
                Option B
              </span>
              <span className="text-xs font-semibold text-slate-400">{itemB.courseName}</span>
            </div>
            <h3 className="text-base font-bold text-white">{itemB.title}</h3>
            <p className="text-xs text-slate-400 line-clamp-3">{itemB.description}</p>
          </div>

          {/* Reveal details */}
          {revealed ? (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">AI Difficulty Score:</span>
                <span className="text-base font-black text-amber-400">
                  {itemB.difficultyScore}/100
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{itemB.difficultyReasoning}</p>
            </div>
          ) : (
            <button className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition">
              Bet on Option B as Harder
            </button>
          )}
        </div>
      </div>

      {/* Result feedback and Next Round */}
      {revealed && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <h4 className="text-base font-bold text-emerald-300">
                  Brilliant intuition! You predicted correctly! (+100 XP)
                </h4>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-rose-400" />
                <h4 className="text-base font-bold text-rose-300">
                  Not quite! The AI determined the other task has steeper cognitive hurdles.
                </h4>
              </>
            )}
          </div>

          <button
            onClick={nextDuel}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 transition"
          >
            <span>Next Duel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
