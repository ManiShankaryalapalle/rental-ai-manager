export function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-surface" />
      <div className="absolute inset-0 grid-overlay opacity-60" />
      <div
        className="blob blob-float"
        style={{
          top: "-10%",
          left: "-8%",
          width: 420,
          height: 420,
          background: "radial-gradient(circle, var(--color-neon-cyan-soft), transparent 70%)",
        }}
      />
      <div
        className="blob blob-float"
        style={{
          top: "10%",
          right: "-10%",
          width: 480,
          height: 480,
          background: "radial-gradient(circle, var(--color-neon-pink-soft), transparent 70%)",
          animationDelay: "-4s",
        }}
      />
      <div
        className="blob blob-float"
        style={{
          bottom: "-15%",
          left: "20%",
          width: 500,
          height: 500,
          background: "radial-gradient(circle, var(--color-neon-violet-soft), transparent 70%)",
          animationDelay: "-8s",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(246,248,253,0) 0%, rgba(246,248,253,0.6) 70%, rgba(246,248,253,0.95) 100%)",
        }}
      />
    </div>
  );
}
