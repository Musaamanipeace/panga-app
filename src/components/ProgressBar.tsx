interface Props {
  percent: number;
}

export default function ProgressBar({ percent }: Props) {
  return (
    <div className="progress-track" aria-label={`${percent}% complete`}>
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
