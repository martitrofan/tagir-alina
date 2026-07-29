const WEDDING_AT = new Date("2026-08-13T13:20:00+03:00").getTime()

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

  if (!("IntersectionObserver" in window)) {
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
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
  )

  nodes.forEach((node) => observer.observe(node))
}

function setupSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href")
      if (!id || id === "#") return
      const target = document.querySelector(id)
      if (!target) return
      event.preventDefault()
      target.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  })
}

updateCountdown()
setInterval(updateCountdown, 30000)
setupReveal()
setupSmoothAnchors()
