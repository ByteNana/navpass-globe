export function createTooltip() {
  const el = document.createElement('div')
  el.style.position = 'fixed'
  el.style.left = '0px'
  el.style.top = '0px'
  el.style.transform = 'translate(-50%, -120%) scale(0.98)'
  el.style.pointerEvents = 'none'
  el.style.padding = '12px 14px'
  el.style.minWidth = '228px'
  el.style.maxWidth = '320px'
  el.style.borderRadius = '0px'
  el.style.background = '#0d1c30'
  el.style.border = '1px solid rgba(236, 178, 0, 0.8)'
  el.style.color = 'var(--tooltip-text)'
  el.style.font = '12px "Quattrocento Sans", system-ui, -apple-system, Segoe UI, Roboto, "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
  el.style.letterSpacing = '0.2px'
  el.style.backdropFilter = 'blur(10px)'
  el.style.boxShadow = '0 0 46px -12px rgba(236, 178, 0, 0.95), 0 16px 36px rgba(0, 0, 0, 0.48)'
  el.style.opacity = '0'
  el.style.transition = 'opacity 150ms ease, transform 170ms ease'
  el.style.zIndex = '99999'

  document.body.appendChild(el)

  function show(text: string, x?: number, y?: number) {
    el.textContent = text
    if (typeof x === 'number' && typeof y === 'number') {
      el.style.left = `${x}px`
      el.style.top = `${y}px`
    }
    el.style.transform = 'translate(-50%, -120%) scale(1)'
    el.style.opacity = '1'
  }

  function showHTML(html: string, x?: number, y?: number) {
    el.innerHTML = html
    if (typeof x === 'number' && typeof y === 'number') {
      el.style.left = `${x}px`
      el.style.top = `${y}px`
    }
    el.style.transform = 'translate(-50%, -120%) scale(1)'
    el.style.opacity = '1'
  }

  function move(x: number, y: number) {
    el.style.left = `${x}px`
    el.style.top = `${y}px`
  }

  function hide() {
    el.style.opacity = '0'
    el.style.transform = 'translate(-50%, -120%) scale(0.98)'
  }

  function setTheme(isLight: boolean) {
    void isLight
    el.style.background = '#0d1c30'
    el.style.border = '1px solid rgba(236, 178, 0, 0.8)'
    el.style.color = 'var(--tooltip-text)'
  }

  return { el, show, showHTML, move, hide, setTheme }
}
