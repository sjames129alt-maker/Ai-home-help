import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini API client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface AssignmentInput {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO date string or formatted
  maxPoints?: number;
  alternateLink?: string;
}

interface RankedAssignment {
  id: string;
  difficultyScore: number; // 1 to 100
  rank: number; // 1 = hardest
  difficultyTier: 'MYTHIC_TITAN' | 'ELITE_BOSS' | 'CHALLENGING_MINION' | 'MODERATE_QUEST' | 'QUICK_SKIRMISH';
  bossTitle: string;
  estimatedHours: number;
  cognitiveLoad: 'EXTREME' | 'HEAVY' | 'MODERATE' | 'LIGHT';
  difficultyReasoning: string;
  bossWeakness: string;
  subQuests: { id: string; title: string; xp: number }[];
  xpReward: number;
}

// Fallback heuristic scoring if AI API is temporarily unavailable
function fallbackHeuristicRanking(assignments: AssignmentInput[]): RankedAssignment[] {
  const scored = assignments.map((item, index) => {
    let score = 50;
    const text = `${item.title} ${item.description || ''} ${item.courseName}`.toLowerCase();

    // Subject difficulty cues
    if (/quantum|calculus|thermodynamics|organic chemistry|physics|capstone|dissertation|research paper|exam/.test(text)) {
      score += 30;
    } else if (/programming|algorithm|statistics|literature review|midterm|lab report|essay/.test(text)) {
      score += 20;
    } else if (/worksheet|reading|summary|discussion post|quiz/.test(text)) {
      score += 5;
    } else if (/syllabus|survey|attendance|check-in|reflection|icebreaker/.test(text)) {
      score -= 25;
    }

    // Points cue
    if (item.maxPoints) {
      if (item.maxPoints >= 100) score += 20;
      else if (item.maxPoints >= 50) score += 10;
      else if (item.maxPoints <= 10) score -= 15;
    }

    // Length cue
    if ((item.description || '').length > 500) score += 10;
    if ((item.description || '').length < 60) score -= 5;

    score = Math.max(10, Math.min(99, score + (index % 5) - 2));

    let tier: RankedAssignment['difficultyTier'] = 'MODERATE_QUEST';
    let cognitive: RankedAssignment['cognitiveLoad'] = 'MODERATE';
    let hours = 2.5;

    if (score >= 85) {
      tier = 'MYTHIC_TITAN';
      cognitive = 'EXTREME';
      hours = 8;
    } else if (score >= 70) {
      tier = 'ELITE_BOSS';
      cognitive = 'HEAVY';
      hours = 5;
    } else if (score >= 50) {
      tier = 'CHALLENGING_MINION';
      cognitive = 'MODERATE';
      hours = 3;
    } else if (score >= 30) {
      tier = 'MODERATE_QUEST';
      cognitive = 'LIGHT';
      hours = 1.5;
    } else {
      tier = 'QUICK_SKIRMISH';
      cognitive = 'LIGHT';
      hours = 0.5;
    }

    return {
      id: item.id,
      difficultyScore: score,
      rank: 1,
      difficultyTier: tier,
      bossTitle: `${item.courseName.split(' ')[0]} Golem of ${item.title.slice(0, 15)}`,
      estimatedHours: hours,
      cognitiveLoad: cognitive,
      difficultyReasoning: `Identified by high conceptual depth in ${item.courseName} requiring structured problem breakdown.`,
      bossWeakness: 'Break down into timed 25-minute Pomodoro bursts and outline core deliverables first.',
      subQuests: [
        { id: '1', title: 'Review rubric and gather research sources', xp: 40 },
        { id: '2', title: 'Draft core arguments or execute calculations', xp: 60 },
        { id: '3', title: 'Perform final review and turn in', xp: 50 },
      ],
      xpReward: Math.round(score * 12),
    };
  });

  // Sort descending by score (Hardest -> Easiest)
  scored.sort((a, b) => b.difficultyScore - a.difficultyScore);
  scored.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  return scored;
}

// Endpoint to organize and rank coursework using Gemini AI
app.post('/api/analyze-difficulty', async (req: Request, res: Response) => {
  try {
    const { assignments } = req.body as { assignments: AssignmentInput[] };

    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({ error: 'No assignments provided to analyze' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not configured. Using fallback intelligent heuristic.');
      const ranked = fallbackHeuristicRanking(assignments);
      return res.json({ rankings: ranked, method: 'heuristic' });
    }

    // Call Gemini 3.8 Flash to evaluate and rank assignments hardest to easiest
    const prompt = `You are the Grandmaster Battle Tactician of a gamified student RPG.
Analyze the following Google Classroom coursework assignments and organize them strictly from HARDEST to EASIEST (Rank 1 = Most brutal difficulty/hardest, last rank = easiest/quickest).

Evaluate each based on:
1. Cognitive Load & Complexity: Conceptual difficulty (e.g. theoretical proofs, coding projects, synthesis essays vs simple worksheets or reading checks).
2. Time & Effort: Expected hours required to achieve high marks.
3. Stakes & Depth: Point value, deliverables, scope of work, and strictness of formatting.

Assignments to rank:
${JSON.stringify(
  assignments.map((a) => ({
    id: a.id,
    title: a.title,
    course: a.courseName,
    description: (a.description || '').slice(0, 400),
    maxPoints: a.maxPoints || 100,
    dueDate: a.dueDate || 'No explicit deadline',
  })),
  null,
  2
)}

For each assignment, return:
- id: the exact assignment id
- difficultyScore: 1-100 (where 100 is hardest boss in the realm, 1 is effortless)
- rank: 1 for hardest, 2 for second hardest, etc.
- difficultyTier: One of "MYTHIC_TITAN" (score 85-100), "ELITE_BOSS" (score 70-84), "CHALLENGING_MINION" (score 50-69), "MODERATE_QUEST" (score 30-49), "QUICK_SKIRMISH" (score 1-29)
- bossTitle: Fun, epic RPG boss title reflecting the subject and assignment (e.g. "Thermodynamic Arch-Colossus", "The Void Derivative of Calculus", "Scribe of the 10-Page Rhetoric")
- estimatedHours: realistic hours to finish (e.g. 0.5 to 12.0)
- cognitiveLoad: "EXTREME" | "HEAVY" | "MODERATE" | "LIGHT"
- difficultyReasoning: 1-2 sentences on why the AI graded this as hard or easy
- bossWeakness: 1 actionable tactical tip for a student to conquer this assignment easily
- subQuests: 3 to 4 sequential actionable battle phases to defeat this boss (each with id, title, xp between 25 and 100)
- xpReward: integer XP rewarded upon full completion (e.g. 150 to 1200)`;

    // Call Gemini 3.8 Flash with retry logic to evaluate and rank assignments hardest to easiest
    let parsed: any = null;
    let lastError: any = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const geminiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                rankings: {
                  type: Type.ARRAY,
                  description: 'Assignments ordered strictly from hardest to easiest',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      difficultyScore: { type: Type.NUMBER },
                      rank: { type: Type.INTEGER },
                      difficultyTier: {
                        type: Type.STRING,
                        enum: ['MYTHIC_TITAN', 'ELITE_BOSS', 'CHALLENGING_MINION', 'MODERATE_QUEST', 'QUICK_SKIRMISH'],
                      },
                      bossTitle: { type: Type.STRING },
                      estimatedHours: { type: Type.NUMBER },
                      cognitiveLoad: {
                        type: Type.STRING,
                        enum: ['EXTREME', 'HEAVY', 'MODERATE', 'LIGHT'],
                      },
                      difficultyReasoning: { type: Type.STRING },
                      bossWeakness: { type: Type.STRING },
                      subQuests: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            xp: { type: Type.INTEGER },
                          },
                          required: ['id', 'title', 'xp'],
                        },
                      },
                      xpReward: { type: Type.INTEGER },
                    },
                    required: [
                      'id',
                      'difficultyScore',
                      'rank',
                      'difficultyTier',
                      'bossTitle',
                      'estimatedHours',
                      'cognitiveLoad',
                      'difficultyReasoning',
                      'bossWeakness',
                      'subQuests',
                      'xpReward',
                    ],
                  },
                },
              },
              required: ['rankings'],
            },
          },
        });

        parsed = JSON.parse(geminiResponse.text || '{"rankings": []}');
        if (parsed.rankings && parsed.rankings.length > 0) {
          break;
        }
      } catch (err) {
        lastError = err;
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }

    if (!parsed || !parsed.rankings || parsed.rankings.length === 0) {
      console.warn('Gemini response fallback:', lastError?.message);
      const fallback = fallbackHeuristicRanking(assignments);
      return res.json({ rankings: fallback, method: 'fallback_heuristic' });
    }

    // Sort by rank / difficultyScore descending just in case
    parsed.rankings.sort((a: any, b: any) => b.difficultyScore - a.difficultyScore);
    parsed.rankings.forEach((r: any, idx: number) => {
      r.rank = idx + 1;
    });

    return res.json({ rankings: parsed.rankings, method: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('AI ranking error:', error);
    // Graceful fallback to heuristic ranking so the user UI never breaks
    const fallback = fallbackHeuristicRanking(req.body.assignments || []);
    return res.json({ rankings: fallback, method: 'fallback_error', error: error?.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
