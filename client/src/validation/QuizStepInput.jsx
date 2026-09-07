export default function QuizStepInput({ step, value, onChange }) {
  if (step.type === 'text') {
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={step.placeholder}
        aria-label={step.label}
      />
    );
  }

  if (step.type === 'single-select') {
    return (
      <div role="radiogroup" aria-label={step.label} className="option-list">
        {step.options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === opt}
            className={`option-btn ${value === opt ? 'selected' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (step.type === 'multi-select') {
    const selected = Array.isArray(value) ? value : [];
    function toggle(opt) {
      onChange(selected.includes(opt) ? selected.filter((v) => v !== opt) : [...selected, opt]);
    }
    return (
      <div role="group" aria-label={step.label} className="option-list">
        {step.options.map((opt) => (
          <button
            key={opt}
            type="button"
            aria-pressed={selected.includes(opt)}
            className={`option-btn ${selected.includes(opt) ? 'selected' : ''}`}
            onClick={() => toggle(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  return null;
}