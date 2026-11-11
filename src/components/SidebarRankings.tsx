import React, { useState, useMemo } from 'react';
import {
  Flame,
  Shield,
  Swords,
  ScrollText,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { ClassroomAssignment, DifficultyTier } from '../types';

interface SidebarRankingsProps {
  assignments: ClassroomAssignment[];
  selectedAssignmentId: string | null;
  onSelectAssignment: (id: string) => void;
  isAnalyzing: boolean;
  onTriggerAnalyze: () => void;
}

export const SidebarRankings: React.FC<SidebarRankingsProps> = ({
  assignments,
  selectedAssignmentId,
  onSelectAssignment,
  isAnalyzing,
  onTriggerAnalyze,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SLAYED'>('ALL');
  const [sortOrder, setSortOrder] = useState<'HARDEST_FIRST' | 'EASIEST_FIRST'>('HARDEST_FIRST');

  // Unique courses for filter dropdown
  const uniqueCourses = useMemo(() => {
    const map = new Map<string, string>();
    assignments.forEach((a) => map.set(a.courseId, a.courseName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [assignments]);

  // Filter and sort assignments
  const filteredRankings = useMemo(() => {
    return assignments
      .filter((a) => {
        const matchesSearch =
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.bossTitle.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCourse =
          selectedCourseFilter === 'ALL' || a.courseId === selectedCourseFilter;

        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'ACTIVE' && !a.isSlayed) ||
          (statusFilter === 'SLAYED' && a.isSlayed);

        return matchesSearch && matchesCourse && matchesStatus;
      })
      .sort((a, b) => {
        if (sortOrder === 'HARDEST_FIRST') {
          return b.difficultyScore - a.difficultyScore;
        } else {
          return a.difficultyScore - b.difficultyScore;
        }
      });
  }, [assignments, searchQuery, selectedCourseFilter, statusFilter, sortOrder]);

  const getTierBadge = (tier: DifficultyTier, score: number) => {
    switch (tier) {
      case 'MYTHIC_TITAN':
        return {
          label: 'Mythic Boss',
          icon: Flame,
          color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          gradient: 'from-rose-600 to-red-800',
          ring: 'ring-rose-500/30',
        };
      case 'ELITE_BOSS':
        return {
          label: 'Elite Boss',
          icon: Swords,
          color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          gradient: 'from-amber-600 to-orange-700',
          ring: 'ring-amber-500/30',
        };
      case 'CHALLENGING_MINION':
        return {
          label: 'Heavy Quest',
          icon: Shield,
          color: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
          gradient: 'from-orange-500 to-amber-700',
          ring: 'ring-orange-500/30',
        };
      case 'MODERATE_QUEST':
        return {
          label: 'Moderate',
          icon: ScrollText,
          color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          gradient: 'from-blue-600 to-indigo-700',
          ring: 'ring-blue-500/30',
        };
      case 'QUICK_SKIRMISH':
      default:
        return {
          label: 'Warmup',
          icon: Sparkles,
          color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          gradient: 'from-emerald-600 to-teal-700',
          ring: 'ring-emerald-500/30',
        };
    }
  };

  const getRankMedalStyle = (rankIndex: number) => {
    if (rankIndex === 0) {
      return 'bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 text-slate-950 shadow-amber-500/30 shadow-md font-black';
    }
    if (rankIndex === 1) {
      return 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-950 font-bold';
    }
    if (rankIndex === 2) {
      return 'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 text-amber-100 font-bold';
    }
    return 'bg-slate-800 text-slate-400 font-medium';
  };

  return (
    <aside className="w-full lg:w-96 flex-shrink-0 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 flex flex-col h-full overflow-hidden">
      {/* Top Header of Sidebar */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <Flame className="w-4 h-4 fill-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                AI Difficulty Rankings
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold uppercase tracking-wider">
                  Hardest → Easiest
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {assignments.filter((a) => !a.isSlayed).length} active bosses to defeat
              </p>
            </div>
          </div>

          <button
            onClick={onTriggerAnalyze}
            disabled={isAnalyzing}
            title="Re-run AI Cognitive Load Assessment"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${isAnalyzing ? 'animate-spin text-amber-400' : 'text-amber-400'}`} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assignments or bosses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/60 text-xs text-slate-200 placeholder-slate-500 pl-9 pr-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            {/* Sort Toggle */}
            <button
              onClick={() =>
                setSortOrder((prev) =>
                  prev === 'HARDEST_FIRST' ? 'EASIEST_FIRST' : 'HARDEST_FIRST'
                )
              }
              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-[11px] font-medium text-slate-200 transition"
            >
              <ArrowUpDown className="w-3 h-3 text-amber-400" />
              <span>{sortOrder === 'HARDEST_FIRST' ? 'Hardest First' : 'Easiest First'}</span>
            </button>

            {/* Course Filter Dropdown */}
            <div className="flex-1 relative">
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="w-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-[11px] font-medium text-slate-200 px-2 py-1.5 rounded-md focus:outline-none appearance-none cursor-pointer truncate pr-5"
              >
                <option value="ALL">All Courses ({uniqueCourses.length})</option>
                {uniqueCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Filter className="w-2.5 h-2.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex p-0.5 bg-slate-950/60 rounded-lg border border-slate-800/80 text-[11px]">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`flex-1 py-1 rounded font-medium transition ${
                statusFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({assignments.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`flex-1 py-1 rounded font-medium transition ${
                statusFilter === 'ACTIVE'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active ({assignments.filter((a) => !a.isSlayed).length})
            </button>
            <button
              onClick={() => setStatusFilter('SLAYED')}
              className={`flex-1 py-1 rounded font-medium transition ${
                statusFilter === 'SLAYED'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Defeated ({assignments.filter((a) => a.isSlayed).length})
            </button>
          </div>
        </div>
      </div>

      {/* Rankings List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 p-2 space-y-1.5">
        {filteredRankings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <Shield className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
            <p className="text-xs">No assignments match your filter</p>
          </div>
        ) : (
          filteredRankings.map((item, index) => {
            const isSelected = selectedAssignmentId === item.id;
            const tierMeta = getTierBadge(item.difficultyTier, item.difficultyScore);
            const TierIcon = tierMeta.icon;
            const isDueSoon =
              item.daysRemaining !== null && item.daysRemaining <= 2 && !item.isSlayed;
            const isOverdue =
              item.daysRemaining !== null && item.daysRemaining < 0 && !item.isSlayed;

            return (
              <div
                key={item.id}
                onClick={() => onSelectAssignment(item.id)}
                className={`group relative rounded-xl p-3 cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/50'
                    : 'bg-slate-900/50 hover:bg-slate-800/60 border-slate-800/80 hover:border-slate-700'
                } ${item.isSlayed ? 'opacity-70 grayscale-[25%]' : ''}`}
              >
                {/* Top Row: Rank Badge + Difficulty Score + Tier */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] ${getRankMedalStyle(
                        index
                      )}`}
                    >
                      #{index + 1}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tierMeta.color}`}
                    >
                      <TierIcon className="w-2.5 h-2.5" />
                      {tierMeta.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-200">
                        {item.difficultyScore}
                      </span>
                      <span className="text-[9px] text-slate-500">/100</span>
                    </div>

                    <div className="w-8 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${tierMeta.gradient}`}
                        style={{ width: `${item.difficultyScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Boss Title & Assignment Title */}
                <div className="mb-2">
                  <p className="text-[10px] font-semibold text-amber-400/90 uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                    {item.bossTitle}
                  </p>
                  <h3 className="text-xs font-semibold text-slate-100 group-hover:text-indigo-300 transition line-clamp-2">
                    {item.title}
                  </h3>
                </div>

                {/* Course Name Tag */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.courseColor }}
                  />
                  <span className="text-[10px] font-medium text-slate-400 truncate">
                    {item.courseName}
                  </span>
                </div>

                {/* Footer Meta: Deadline Urgency + HP / Subquest Progress */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                  {/* Deadline Indicator */}
                  <div className="flex items-center gap-1">
                    {item.isSlayed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Conquered
                      </span>
                    ) : isOverdue ? (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-semibold animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        Overdue
                      </span>
                    ) : isDueSoon ? (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                        <Clock className="w-3 h-3" />
                        {item.daysRemaining === 0
                          ? 'Due Today!'
                          : item.daysRemaining === 1
                          ? 'Due Tomorrow'
                          : `Due in ${item.daysRemaining}d`}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        {item.dueDateFormatted.split(',')[0]}
                      </span>
                    )}
                  </div>

                  {/* Progress / XP */}
                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="text-[10px] font-mono text-indigo-400 font-medium">
                      +{item.xpReward} XP
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-300 transition" />
                  </div>
                </div>

                {/* Mini Boss Health Bar */}
                <div className="mt-1.5 w-full bg-slate-950 rounded-full h-1 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      item.isSlayed
                        ? 'bg-emerald-500'
                        : item.currentHp <= 30
                        ? 'bg-rose-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${(item.currentHp / item.maxHp) * 100}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Summary Bar */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          Showing <strong className="text-slate-200">{filteredRankings.length}</strong> tasks
        </span>
        <span className="flex items-center gap-1 text-amber-400 font-medium">
          <Flame className="w-3 h-3 fill-amber-400" />
          Ranked by Gemini AI
        </span>
      </div>
    </aside>
  );
};
