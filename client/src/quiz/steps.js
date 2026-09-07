// Defines the 9-step onboarding flow. Each step has a type driving
// how QuizPage renders and validates it.
export const QUIZ_STEPS = [
  { key: 'full_name', type: 'text', label: 'What should we call you?', placeholder: 'Your name' },
  { key: 'primary_goal', type: 'single-select', label: 'What brings you here?', options: ['Lose weight', 'Build muscle', 'Improve energy', 'General health'] },
  { key: 'experience_level', type: 'single-select', label: "What's your experience level?", options: ['Beginner', 'Intermediate', 'Advanced'] },
  { key: 'focus_areas', type: 'multi-select', label: 'Which areas do you want to focus on? (select all that apply)', options: ['Nutrition', 'Strength training', 'Cardio', 'Flexibility', 'Sleep'] },
  { key: 'availability', type: 'single-select', label: 'How many days a week can you commit?', options: ['1-2', '3-4', '5+'] },
  { key: 'obstacles', type: 'multi-select', label: 'What has held you back before? (select all that apply)', options: ['Lack of time', 'Lack of motivation', 'Not sure where to start', 'Past injury'] },
  { key: 'motivation', type: 'text', label: 'What would achieving this goal mean to you?', placeholder: 'A sentence or two' },
  { key: 'reminder_pref', type: 'single-select', label: 'How should we remind you to stay on track?', options: ['Email', 'Push notification', 'None'] },
  { key: 'plan_type', type: 'single-select', label: 'Choose your plan', options: ['Basic', 'Pro'] },
];

export function isStepAnswered(step, value) {
  if (value === undefined || value === null) return false;
  if (step.type === 'text') return typeof value === 'string' && value.trim().length > 0;
  if (step.type === 'single-select') return typeof value === 'string' && value.length > 0;
  if (step.type === 'multi-select') return Array.isArray(value) && value.length > 0;
  return false;
}