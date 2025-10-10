/* Decorative festive lights and subtle background bokeh (responsive, no TypeScript) */
"use client"

export default function DiwaliDecor() {
  return (
    <div className="diwali-decor" aria-hidden="true">
      <ul className="garland garland-top">
        {Array.from({ length: 18 }).map((_, i) => (
          <li key={`top-${i}`} className="bulb" style={{ animationDelay: `${(i % 6) * 0.2}s` }} />
        ))}
      </ul>
      <ul className="garland garland-bottom">
        {Array.from({ length: 18 }).map((_, i) => (
          <li key={`bottom-${i}`} className="bulb" style={{ animationDelay: `${(i % 6) * 0.2}s` }} />
        ))}
      </ul>
      <div className="diwali-bokeh" />
    </div>
  )
}
