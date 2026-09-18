import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../lib/api.js';
import { QUIZ_STEPS, isStepAnswered } from '../quiz/steps.js';
import QuizStepInput from '../quiz/QuizStepInput.jsx';

export default function QuizPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const step = QUIZ_STEPS[stepIndex];
  const isLast = stepIndex === QUIZ_STEPS.length - 1;
  const canAdvance = isStepAnswered(step, answers[step.key]);

  // Resume flow: load any previously-saved answers on mount
  useEffect(() => {
    async function loadAnswers() {
      try {
        const { answers: saved } = await apiFetch('/api/quiz/answers', { getToken });
        const map = {};
        saved.forEach((a) => { map[a.stepKey] = a.value; });
        setAnswers(map);

        // Resume at the first unanswered step
        const firstUnanswered = QUIZ_STEPS.findIndex((s) => !isStepAnswered(s, map[s.key]));
        if (firstUnanswered !== -1) setStepIndex(firstUnanswered);
      } catch {
        // Non-fatal — start fresh if the fetch fails
      } finally {
        setLoading(false);
      }
    }
    loadAnswers();
  }, [getToken]);

  async function handleNext() {
    if (!canAdvance || saving) return;
    setSaving(true);
    setError('');
    try {
      await apiFetch('/api/quiz/answers', {
        method: 'POST',
        body: { stepKey: step.key, value: answers[step.key] },
        getToken,
      });

      if (isLast) {
        navigate('/payment');
      } else {
        setStepIndex((i) => i + 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  if (loading) return <div className="page-loading">Loading…</div>;

  return (
    <div className="page">
      <p className="quiz-progress" aria-live="polite">
        Step {stepIndex + 1} of {QUIZ_STEPS.length}
      </p>
      <div className="progress-bar" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={QUIZ_STEPS.length}>
        <div className="progress-fill" style={{ width: `${((stepIndex + 1) / QUIZ_STEPS.length) * 100}%` }} />
      </div>

      <h1>{step.label}</h1>

      <QuizStepInput
        step={step}
        value={answers[step.key]}
        onChange={(value) => setAnswers((prev) => ({ ...prev, [step.key]: value }))}
      />

      {error && <p role="alert" className="form-error">{error}</p>}

      <div className="quiz-nav">
        <button type="button" onClick={handleBack} disabled={stepIndex === 0 || saving} className="secondary-btn">
          Back
        </button>
        <button type="button" onClick={handleNext} disabled={!canAdvance || saving} title={isLast ? 'Continue to payment' : 'Go to next step'}>
          {saving ? 'Saving…' : isLast ? 'Continue to payment' : 'Next'}
        </button>
      </div>
    </div>
  );
}