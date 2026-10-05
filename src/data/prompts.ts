import { DailyPrompt } from '../types/journal';

export const DAILY_PROMPTS: DailyPrompt[] = [
  {
    id: 'p-1',
    category: 'Study & Craft',
    question: 'What concept or mental model did you wrestle with today, and how would you explain it to a curious 10-year-old?',
    spark: 'Feynman Technique: true mastery is simplifying without losing essence.'
  },
  {
    id: 'p-2',
    category: 'Study & Craft',
    question: 'Where was your cognitive friction highest today, and what study environmental tweak could smooth it tomorrow?',
    spark: 'Notice micro-friction: lighting, posture, tabs, or ambiguity in the goal.'
  },
  {
    id: 'p-3',
    category: 'Gratitude',
    question: 'What sensory detail from today brought unexpected quiet delight?',
    spark: 'The scent of rain, warmth of ceramic, or the slant of golden afternoon light.'
  },
  {
    id: 'p-4',
    category: 'Self-Discovery',
    question: 'If today was a chapter in your personal biography, what would you title it?',
    spark: 'Narrative reframing turns chaotic days into deliberate chapters of growth.'
  },
  {
    id: 'p-5',
    category: 'Memory & Past',
    question: 'Recall a pivotal conversation from your journey that altered your trajectory. What echo of it still guides you?',
    spark: 'Memories are our compass; honor the people and crossroads that shaped you.'
  },
  {
    id: 'p-6',
    category: 'Deep Thinking',
    question: 'What belief or habit are you currently testing or re-evaluating?',
    spark: 'Intellectual honesty requires periodically pruning outgrown assumptions.'
  },
  {
    id: 'p-7',
    category: 'Evening Peace',
    question: 'What burden or unfinished task can you consciously surrender until sunrise?',
    spark: 'Sleep is sacred. Write it down so your working memory can fully let go.'
  },
  {
    id: 'p-8',
    category: 'Gratitude',
    question: 'Who did something kind or thoughtful recently that you haven’t yet thanked them for?',
    spark: 'Appreciation expressed compounds joy for both giver and receiver.'
  },
  {
    id: 'p-9',
    category: 'Study & Craft',
    question: 'What is the highest-leverage skill you are currently cultivating, and what evidence of progress appeared this week?',
    spark: 'Small compounding increments generate exponential skill arcs.'
  },
  {
    id: 'p-10',
    category: 'Self-Discovery',
    question: 'What energized you today, and conversely, what drained your battery faster than anticipated?',
    spark: 'Energy audit: design your days around energy management rather than just time.'
  }
];

export function getRandomPrompt(): DailyPrompt {
  const idx = Math.floor(Math.random() * DAILY_PROMPTS.length);
  return DAILY_PROMPTS[idx];
}
