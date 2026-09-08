document.documentElement.classList.add('js')
try {
  const scale = localStorage.getItem('chakthai-text-scale')
  if (scale === '1.15' || scale === '1.3') {
    document.documentElement.style.setProperty('--text-scale', scale)
  }
} catch {
  // Storage may be unavailable in private browsing; keep the default size.
}
