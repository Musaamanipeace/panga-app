interface Props {
  percent: number;
  pending?: number;
}

export default function ProgressBar({ percent, pending }: Props) {
  const tip =
    pending === undefined
      ? `${percent}% complete`
      : `${percent}% complete · ${pending} pending task${pending === 1 ? "" : "s"}`;
  return (
    <div className="progress-track" aria-label={`${percent}% complete`} data-tip={tip}>
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
