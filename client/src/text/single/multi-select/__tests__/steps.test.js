import { isStepAnswered, QUIZ_STEPS } from '../steps.js';

describe('isStepAnswered', () => {
  const textStep = QUIZ_STEPS.find((s) => s.type === 'text');
  const singleStep = QUIZ_STEPS.find((s) => s.type === 'single-select');
  const multiStep = QUIZ_STEPS.find((s) => s.type === 'multi-select');

  it('text step requires a non-empty trimmed string', () => {
    expect(isStepAnswered(textStep, '')).toBe(false);
    expect(isStepAnswered(textStep, '   ')).toBe(false);
    expect(isStepAnswered(textStep, 'Alexis')).toBe(true);
  });

  it('single-select requires a non-empty string value', () => {
    expect(isStepAnswered(singleStep, undefined)).toBe(false);
    expect(isStepAnswered(singleStep, '')).toBe(false);
    expect(isStepAnswered(singleStep, 'Beginner')).toBe(true);
  });

  it('multi-select requires a non-empty array', () => {
    expect(isStepAnswered(multiStep, [])).toBe(false);
    expect(isStepAnswered(multiStep, undefined)).toBe(false);
    expect(isStepAnswered(multiStep, ['Nutrition'])).toBe(true);
  });

  it('defines exactly 9 steps matching the JD flow', () => {
    expect(QUIZ_STEPS).toHaveLength(9);
  });
});