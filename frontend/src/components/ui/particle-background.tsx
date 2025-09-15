'use client'

export default function ParticleBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      {/* CSS-only animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5">
        <div className="absolute inset-0 opacity-20">
          {/* Animated dots */}
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-accent rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40" />
      </div>
    </div>
  )
}
