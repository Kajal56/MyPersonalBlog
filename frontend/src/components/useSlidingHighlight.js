'use client'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

// Positions a single highlight behind a row of links. It glides to whichever
// item is hovered and settles back on the item marked data-active="true".
export function useSlidingHighlight(activeKey) {
  const containerRef = useRef(null)
  const [style, setStyle] = useState({ opacity: 0 })
  const [animate, setAnimate] = useState(false)

  const moveTo = useCallback((el) => {
    if (!el || !containerRef.current) {
      setStyle((s) => ({ ...s, opacity: 0 }))
      return
    }
    setStyle({ left: el.offsetLeft, width: el.offsetWidth, top: el.offsetTop, height: el.offsetHeight, opacity: 1 })
  }, [])

  const moveToActive = useCallback(() => {
    moveTo(containerRef.current?.querySelector('[data-active="true"]'))
  }, [moveTo])

  useLayoutEffect(() => {
    moveToActive()
  }, [activeKey, moveToActive])

  useEffect(() => {
    // Skip the transition on first placement so it doesn't slide in from the left edge
    const id = requestAnimationFrame(() => setAnimate(true))
    // Re-measure once web fonts finish loading, since text widths change
    document.fonts?.ready.then(moveToActive)
    window.addEventListener('resize', moveToActive)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', moveToActive)
    }
  }, [moveToActive])

  return {
    containerRef,
    highlightStyle: style,
    highlightClassName: animate ? 'transition-all duration-300 ease-out' : '',
    itemProps: { onMouseEnter: (e) => moveTo(e.currentTarget) },
    containerProps: { onMouseLeave: moveToActive },
  }
}
