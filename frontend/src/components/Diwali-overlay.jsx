/* First-visit fireworks with a professional Diwali message (no TypeScript) */
"use client"

import { useEffect, useRef, useState } from "react"
import { Fireworks } from "fireworks-js"

export default function DiwaliOverlay() {
  const containerRef = useRef(null)
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return

    const already = sessionStorage.getItem("diwaliShown")
    if (already === "1") {
      setShow(false)
      return
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let fw = null

    if (!prefersReduced && containerRef.current) {
      fw = new Fireworks(containerRef.current, {
        autoresize: true,
        opacity: 0.5,
        acceleration: 1.02,
        friction: 0.97,
        gravity: 1.3,
        particles: 140,
        traceLength: 3,
        traceSpeed: 6,
        explosion: 6,
        sound: { enabled: false },
        hue: { min: 15, max: 50 }, // warm oranges/golds
        rocketsPoint: { min: 0, max: 100 },
      })
      fw.start()
    }

    const fadeTimer = setTimeout(() => {
      const el = document.querySelector(".diwali-overlay")
      if (el) el.classList.add("diwali-overlay--fade")
    }, 2600)

    const endTimer = setTimeout(() => {
      if (fw) fw.stop()
      sessionStorage.setItem("diwaliShown", "1")
      setShow(false)
    }, 3400)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(endTimer)
      if (fw) fw.stop()
    }
  }, [])

  if (!show) return null

  return (
    <div className="diwali-overlay" role="dialog" aria-label="Diwali greeting, page will appear shortly">
      <div ref={containerRef} className="diwali-fireworks" />
      <div className="diwali-message">
        <h1 className="diwali-title">Happy Diwali</h1>
        <p className="diwali-subtitle">Wishing you prosperity, success, and luminous beginnings.</p>
      </div>
    </div>
  )
}
