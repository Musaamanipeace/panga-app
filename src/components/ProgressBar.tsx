type ProgressBarProps = {
  value: number;
  label?: string;
};

export default function ProgressBar({ value, label }: ProgressBarProps) {
  const progress = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-track">
        <div className="progress-value" style={{ width: `${progress}%` }} />
      </div>
      {label ? <span className="progress-label">{label}</span> : <span className="progress-label">{progress}%</span>}
    </div>
  );
}
