export default function ScoreBadge({ score }: { score: { correct: number; total: number } }) {
  return (
    <span className="text-xs font-medium text-foreground/50 tabular-nums">
      {score.correct} / {score.total} correct
    </span>
  );
}
