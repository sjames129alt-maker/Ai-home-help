import {
  GoogleCourse,
  GoogleCourseWork,
  GoogleStudentSubmission,
  ClassroomAssignment,
} from '../types';

const COURSE_COLORS = [
  '#6366F1', // Indigo
  '#0EA5E9', // Sky
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#14B8A6', // Teal
];

// Demo dataset with realistic courses and assignments across difficulty spectrums
export const DEMO_COURSES: GoogleCourse[] = [
  { id: 'c1', name: 'AP Physics C: Mechanics', section: 'Period 2' },
  { id: 'c2', name: 'Multivariable Calculus & Linear Algebra', section: 'Period 4' },
  { id: 'c3', name: 'AP English Literature', section: 'Period 1' },
  { id: 'c4', name: 'CS 106B: Data Structures & Algorithms', section: 'Honors' },
  { id: 'c5', name: 'AP European & World History', section: 'Period 6' },
];

export const DEMO_ASSIGNMENTS_RAW = [
  {
    id: 'demo-1',
    courseId: 'c1',
    courseName: 'AP Physics C: Mechanics',
    title: 'Rotational Inertia Tensor & Lagrangian Mechanics Problem Set',
    description:
      'Solve 6 multi-part advanced analytical mechanics problems. Derive the Euler-Lagrange equations for double compound pendulums, compute moment of inertia tensors using volume integrals, and show conservation of angular momentum under non-inertial reference frames.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(), // ~1.5 days
    maxPoints: 100,
  },
  {
    id: 'demo-2',
    courseId: 'c3',
    courseName: 'AP English Literature',
    title: '12-Page Comparative Critical Research Paper: Allegory & Rhetoric',
    description:
      'A scholarly research thesis comparing post-colonial identity and allegorical structures between Achebe and Conrad. Must synthesize at least 8 peer-reviewed academic journal sources, utilize MLA 9 style, and feature detailed textual close-readings.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 68).toISOString(), // ~2.8 days
    maxPoints: 150,
  },
  {
    id: 'demo-3',
    courseId: 'c4',
    courseName: 'CS 106B: Data Structures & Algorithms',
    title: 'Implement Huffman Compression & Binary Heap Priority Queue',
    description:
      'Implement a memory-safe custom Priority Queue using a min-heap array representation in C++/TypeScript, then build an end-to-end Huffman Encoding tree compression engine to serialize and deserialize arbitrary binary file streams.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(), // 4 days
    maxPoints: 100,
  },
  {
    id: 'demo-4',
    courseId: 'c2',
    courseName: 'Multivariable Calculus & Linear Algebra',
    title: 'Surface Flux Integrals & Stokes Theorem Problem Set',
    description:
      'Evaluate boundary line integrals across piecewise smooth parametric curves and prove Stokes Theorem over oriented hyperbolic paraboloid manifolds. Show all coordinate changes to cylindrical and spherical systems.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(), // 5 days
    maxPoints: 80,
  },
  {
    id: 'demo-5',
    courseId: 'c1',
    courseName: 'AP Physics C: Mechanics',
    title: 'Laboratory Analysis: Damped Harmonic Oscillator & Error Propagation',
    description:
      'Analyze vernier sensor data for air-drag damped oscillations. Plot logarithmic decrement curves, compute Q-factor and damping coefficients with chi-square goodness of fit, and write a formal 4-page lab discussion.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 160).toISOString(), // ~6.6 days
    maxPoints: 75,
  },
  {
    id: 'demo-6',
    courseId: 'c5',
    courseName: 'AP European & World History',
    title: 'DBQ Essay: Industrial Revolution Economic Disparities',
    description:
      'Analyze 7 primary source historical excerpts regarding urbanization in Victorian England. Frame a thesis arguing to what extent industrialization redistributed political influence and exacerbated class warfare.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 200).toISOString(), // ~8 days
    maxPoints: 60,
  },
  {
    id: 'demo-7',
    courseId: 'c2',
    courseName: 'Multivariable Calculus & Linear Algebra',
    title: 'Eigenvalues & Diagonalization Computational Drill',
    description:
      'Calculate eigenvalues and eigenvectors for five 3x3 matrices. Check for algebraic vs geometric multiplicity and compute matrix powers via diagonalization.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 240).toISOString(), // 10 days
    maxPoints: 40,
  },
  {
    id: 'demo-8',
    courseId: 'c4',
    courseName: 'CS 106B: Data Structures & Algorithms',
    title: 'Big-O Runtime Analysis & Recurrence Relations Worksheet',
    description:
      'Identify asymptotic tight bounds using the Master Theorem for divide-and-conquer recurrences. Short answers and 8 multiple-part code traces.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 290).toISOString(), // 12 days
    maxPoints: 30,
  },
  {
    id: 'demo-9',
    courseId: 'c5',
    courseName: 'AP European & World History',
    title: 'Chapter 24 Primary Source Reflection & Key Terms',
    description:
      'Define 12 vocabulary terms and write two paragraphs analyzing Otto von Bismarck’s Realpolitik speech from 1862.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 340).toISOString(), // 14 days
    maxPoints: 25,
  },
  {
    id: 'demo-10',
    courseId: 'c3',
    courseName: 'AP English Literature',
    title: 'Act III Discussion Board Response & Peer Reply',
    description:
      'Post a 250-word synthesis of Hamlet’s soliloquy focusing on syntax and motif, then provide substantive feedback to at least two classmates before midnight.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), // ~18 hours
    maxPoints: 20,
  },
];

export async function fetchLiveClassroomData(accessToken: string): Promise<{
  courses: GoogleCourse[];
  assignments: {
    id: string;
    courseId: string;
    courseName: string;
    title: string;
    description: string;
    dueDate: string | null;
    maxPoints: number;
    alternateLink?: string;
    submissionState: 'PENDING' | 'TURNED_IN' | 'COMPLETED';
  }[];
}> {
  // 1. Fetch courses
  const coursesRes = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!coursesRes.ok) {
    const errorText = await coursesRes.text();
    throw new Error(`Google Classroom API error (${coursesRes.status}): ${errorText}`);
  }

  const coursesData = await coursesRes.json();
  const rawCourses: GoogleCourse[] = coursesData.courses || [];

  if (rawCourses.length === 0) {
    return { courses: [], assignments: [] };
  }

  const courseMap = new Map<string, GoogleCourse>();
  rawCourses.forEach((c) => courseMap.set(c.id, c));

  const allAssignments: any[] = [];

  // 2. Fetch coursework for each course
  for (const course of rawCourses.slice(0, 8)) {
    try {
      const cwRes = await fetch(
        `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?courseWorkStates=PUBLISHED`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!cwRes.ok) continue;

      const cwData = await cwRes.json();
      const courseworkList: GoogleCourseWork[] = cwData.courseWork || [];

      // Fetch submissions for this course to see what is already turned in
      let submissionsMap = new Map<string, string>();
      try {
        const subRes = await fetch(
          `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork/-/studentSubmissions?userId=me`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (subRes.ok) {
          const subData = await subRes.json();
          const subs: GoogleStudentSubmission[] = subData.studentSubmissions || [];
          subs.forEach((s) => submissionsMap.set(s.courseWorkId, s.state));
        }
      } catch (e) {
        console.warn('Submissions check warning:', e);
      }

      for (const cw of courseworkList) {
        let isoDueDate: string | null = null;
        if (cw.dueDate) {
          const year = cw.dueDate.year;
          const month = String(cw.dueDate.month).padStart(2, '0');
          const day = String(cw.dueDate.day).padStart(2, '0');
          const hours = String(cw.dueTime?.hours || 23).padStart(2, '0');
          const minutes = String(cw.dueTime?.minutes || 59).padStart(2, '0');
          isoDueDate = `${year}-${month}-${day}T${hours}:${minutes}:00`;
        }

        const subState = submissionsMap.get(cw.id);
        const isDone = subState === 'TURNED_IN' || subState === 'RETURNED';

        allAssignments.push({
          id: cw.id,
          courseId: course.id,
          courseName: course.name,
          title: cw.title,
          description: cw.description || '',
          dueDate: isoDueDate,
          maxPoints: cw.maxPoints || 100,
          alternateLink: cw.alternateLink,
          submissionState: isDone ? 'TURNED_IN' : 'PENDING',
        });
      }
    } catch (err) {
      console.warn(`Failed fetching coursework for ${course.name}:`, err);
    }
  }

  return {
    courses: rawCourses,
    assignments: allAssignments,
  };
}

export function formatDueDate(isoString: string | null): { formatted: string; daysRemaining: number | null } {
  if (!isoString) {
    return { formatted: 'No due date', daysRemaining: null };
  }

  const due = new Date(isoString);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };

  const formatted = due.toLocaleDateString(undefined, options);
  return { formatted, daysRemaining: diffDays };
}

export function getCourseColor(courseName: string): string {
  let hash = 0;
  for (let i = 0; i < courseName.length; i++) {
    hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COURSE_COLORS.length;
  return COURSE_COLORS[index];
}
