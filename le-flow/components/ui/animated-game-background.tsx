type AnimatedGameBackgroundProps = {
  className?: string;
};

export function AnimatedGameBackground({ className = "" }: AnimatedGameBackgroundProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="practice-animated-bg-base absolute inset-0" />
      <div className="practice-animated-bg-blob practice-animated-bg-blob-1" />
      <div className="practice-animated-bg-blob practice-animated-bg-blob-2" />
      <div className="practice-animated-bg-blob practice-animated-bg-blob-3" />
      <div className="practice-animated-bg-shimmer absolute inset-0" />
    </div>
  );
}
