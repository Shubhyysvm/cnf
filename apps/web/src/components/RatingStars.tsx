type Props = { value: number; size?: "sm" | "md" };

export default function RatingStars({ value, size = "md" }: Props) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < full || (i === full && half);
    return (
      <span key={i} className={filled ? "text-accent-carrot" : "text-gray-300"}>
        ★
      </span>
    );
  });
  return <div className={`inline-flex items-center gap-0.5 ${size === "sm" ? "text-xs" : "text-sm"}`}>{stars}</div>;
}
