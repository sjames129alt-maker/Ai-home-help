export interface GoogleCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  courseState?: string;
  alternateLink?: string;
}

export interface GoogleCourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  state?: string;
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours?: number;
    minutes?: number;
  };
  maxPoints?: number;
  workType?: string;
  submissionModificationMode?: string;
}

export interface GoogleStudentSubmission {
  id: string;
  courseId: string;
  courseWorkId: string;
  userId: string;
  state: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT';
  assignedGrade?: number;
}

export interface SubQuest {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
}

export type DifficultyTier =
  | 'MYTHIC_TITAN'
  | 'ELITE_BOSS'
  | 'CHALLENGING_MINION'
  | 'MODERATE_QUEST'
  | 'QUICK_SKIRMISH';

export interface ClassroomAssignment {
  id: string;
  courseId: string;
  courseName: string;
  courseColor: string;
  title: string;
  description: string;
  dueDate: string | null; // ISO string e.g. 2026-11-14T23:59:00Z
  dueDateFormatted: string;
  daysRemaining: number | null; // negative if overdue
  maxPoints: number;
  alternateLink?: string;
  submissionState: 'PENDING' | 'TURNED_IN' | 'COMPLETED';

  // AI Generated Gamification & Ranking Data
  rank: number; // 1 = hardest
  difficultyScore: number; // 1 to 100
  difficultyTier: DifficultyTier;
  bossTitle: string;
  estimatedHours: number;
  cognitiveLoad: 'EXTREME' | 'HEAVY' | 'MODERATE' | 'LIGHT';
  difficultyReasoning: string;
  bossWeakness: string;
  subQuests: SubQuest[];
  xpReward: number;

  // Battle State
  currentHp: number;
  maxHp: number;
  isSlayed: boolean;
}

export interface PlayerStats {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  totalXp: number;
  streakDays: number;
  bossesSlayed: number;
  totalStudyMinutes: number;
  title: string;
}
