const WEDDING_AT = new Date("2026-08-13T13:20:00+03:00").getTime()
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

function plural(n, one, few, many) {
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return many
  if (last === 1) return one
  if (last >= 2 && last <= 4) return few
  return many
}

function updateCountdown() {
  const root = document.getElementById("countdown")
  if (!root) return

  const diff = Math.max(0, WEDDING_AT - Date.now())
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)

  root.querySelector('[data-unit="days"]').textContent = String(days)
  root.querySelector('[data-unit="hours"]').textContent = String(hours).padStart(2, "0")
  root.querySelector('[data-unit="mins"]').textContent = String(mins).padStart(2, "0")

  root.querySelector('[data-unit="days"]').nextElementSibling.textContent = plural(
    days,
    "день",
    "дня",
    "дней",
  )
  root.querySelector('[data-unit="hours"]').nextElementSibling.textContent = plural(
    hours,
    "час",
    "часа",
    "часов",
  )
  root.querySelector('[data-unit="mins"]').nextElementSibling.textContent = plural(
    mins,
    "минута",
    "минуты",
    "минут",
  )
}

function setupReveal() {
  const nodes = document.querySelectorAll(".reveal")
  if (!nodes.length) return

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    nodes.forEach((node) => node.classList.add("is-visible"))
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible")
          observer.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  )

  nodes.forEach((node) => observer.observe(node))
}

function setupParallax() {
  if (prefersReducedMotion) return

  const layers = [...document.querySelectorAll("[data-parallax]")]
  if (!layers.length) return

  let ticking = false

  const update = () => {
    const vh = window.innerHeight
    for (const layer of layers) {
      const parent = layer.closest(".photo-break")
      if (!parent) continue
      const rect = parent.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > vh) continue
      const progress = (vh / 2 - (rect.top + rect.height / 2)) / vh
      layer.style.transform = `translate3d(0, ${progress * 28}px, 0)`
    }
    ticking = false
  }

  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(update)
  }

  window.addEventListener("scroll", onScroll, { passive: true })
  update()
}

function setupCarousel(root) {
  const track = root.querySelector(".carousel__track")
  const slides = [...root.querySelectorAll(".carousel__slide")]
  const dotsRoot = root.querySelector(".carousel__dots")
  const prevBtn = root.querySelector("[data-carousel-prev]")
  const nextBtn = root.querySelector("[data-carousel-next]")
  if (!track || !slides.length || !dotsRoot) return

  let index = 0
  let autoTimer = null
  let pointerStartX = 0
  let pointerDelta = 0
  let dragging = false

  const dots = slides.map((_, i) => {
    const button = document.createElement("button")
    button.type = "button"
    button.className = "carousel__dot"
    button.setAttribute("role", "tab")
    button.setAttribute("aria-label", `Фото ${i + 1}`)
    button.addEventListener("click", () => goTo(i, true))
    dotsRoot.appendChild(button)
    return button
  })

  function render() {
    track.style.transform = `translate3d(${-index * 100}%, 0, 0)`
    slides.forEach((slide, i) => {
      const active = i === index
      slide.classList.toggle("is-active", active)
      slide.setAttribute("aria-hidden", active ? "false" : "true")
    })
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index)
      dot.setAttribute("aria-selected", i === index ? "true" : "false")
    })
  }

  function goTo(nextIndex, pauseAuto = false) {
    index = (nextIndex + slides.length) % slides.length
    render()
    if (pauseAuto) restartAuto(true)
  }

  function next(pauseAuto = false) {
    goTo(index + 1, pauseAuto)
  }

  function prev(pauseAuto = false) {
    goTo(index - 1, pauseAuto)
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer)
      autoTimer = null
    }
  }

  function startAuto() {
    if (prefersReducedMotion) return
    stopAuto()
    autoTimer = setInterval(() => next(false), 4500)
  }

  function restartAuto(pausedInteraction) {
    stopAuto()
    if (pausedInteraction) {
      setTimeout(startAuto, 7000)
    } else {
      startAuto()
    }
  }

  prevBtn?.addEventListener("click", () => prev(true))
  nextBtn?.addEventListener("click", () => next(true))

  const viewport = root.querySelector(".carousel__viewport")
  viewport?.addEventListener(
    "pointerdown",
    (event) => {
      dragging = true
      pointerStartX = event.clientX
      pointerDelta = 0
      viewport.setPointerCapture?.(event.pointerId)
      stopAuto()
    },
    { passive: true },
  )

  viewport?.addEventListener(
    "pointermove",
    (event) => {
      if (!dragging) return
      pointerDelta = event.clientX - pointerStartX
    },
    { passive: true },
  )

  const endDrag = () => {
    if (!dragging) return
    dragging = false
    if (Math.abs(pointerDelta) > 45) {
      if (pointerDelta < 0) next(true)
      else prev(true)
    } else {
      restartAuto(true)
    }
    pointerDelta = 0
  }

  viewport?.addEventListener("pointerup", endDrag)
  viewport?.addEventListener("pointercancel", endDrag)
  viewport?.addEventListener("pointerleave", endDrag)

  root.addEventListener("mouseenter", stopAuto)
  root.addEventListener("mouseleave", startAuto)
  root.addEventListener("focusin", stopAuto)
  root.addEventListener("focusout", startAuto)

  render()
  startAuto()
}

function setupSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href")
      if (!id || id === "#") return
      const target = document.querySelector(id)
      if (!target) return
      event.preventDefault()
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" })
    })
  })
}

updateCountdown()
setInterval(updateCountdown, 30000)
setupReveal()
setupParallax()
setupSmoothAnchors()

const carousel = document.getElementById("gallery-carousel")
if (carousel) setupCarousel(carousel)
