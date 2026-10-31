(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.querySelector(".particle-canvas");
  const context = canvas?.getContext("2d", { alpha: true });
  const particles = [];
  let width = 0;
  let height = 0;
  let animationFrame = 0;
  let lastFrame = 0;

  if (canvas && context) {
    const createParticle = (randomY = true) => ({
      x: Math.random() * width,
      y: randomY ? Math.random() * height : height + Math.random() * 70,
      size: 2 + Math.random() * 8,
      speed: 0.12 + Math.random() * 0.34,
      drift: (Math.random() - 0.5) * 0.22,
      alpha: 0.12 + Math.random() * 0.36,
      angle: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.003,
    });

    const resizeCanvas = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = width < 640 ? 22 : width < 1000 ? 34 : 52;
      particles.length = 0;
      for (let index = 0; index < count; index += 1) particles.push(createParticle());
      if (reducedMotion) drawParticles(false);
    };

    const drawParticles = (move = true) => {
      context.clearRect(0, 0, width, height);
      for (const particle of particles) {
        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.angle);
        context.fillStyle = `rgba(168, 85, 247, ${particle.alpha})`;
        context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        context.restore();
        if (move) {
          particle.y -= particle.speed;
          particle.x += particle.drift;
          particle.angle += particle.spin;
          if (particle.y < -particle.size) Object.assign(particle, createParticle(false));
          if (particle.x < -12) particle.x = width + 10;
          if (particle.x > width + 12) particle.x = -10;
        }
      }
    };

    const animateParticles = (timestamp) => {
      if (timestamp - lastFrame > 32) {
        drawParticles(true);
        lastFrame = timestamp;
      }
      animationFrame = window.requestAnimationFrame(animateParticles);
    };

    resizeCanvas();
    if (!reducedMotion) animationFrame = window.requestAnimationFrame(animateParticles);
    window.addEventListener("resize", resizeCanvas, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else if (!document.hidden && !reducedMotion && !animationFrame) {
        animationFrame = window.requestAnimationFrame(animateParticles);
      }
    });
  }

  const revealItems = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const closeMenu = () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation menu");
    navLinks?.classList.remove("is-open");
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    navLinks?.classList.toggle("is-open", !isOpen);
  });

  navLinks?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (navLinks?.classList.contains("is-open") && !event.target.closest(".nav-shell")) closeMenu();
  });

  const sections = document.querySelectorAll("main section[id]");
  const navItems = document.querySelectorAll(".nav-link");
  if ("IntersectionObserver" in window) {
    const activeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navItems.forEach((item) => {
          const active = item.getAttribute("href") === `#${entry.target.id}`;
          item.classList.toggle("is-active", active);
          if (active) item.setAttribute("aria-current", "location");
          else item.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-28% 0px -58% 0px", threshold: 0 });
    sections.forEach((section) => activeObserver.observe(section));
  }

  const roleOutput = document.querySelector("#role-text");
  const roles = ["MCA Student", "Full-Stack Developer", "AI/ML Project Builder", "Big-Data Enthusiast"];
  if (roleOutput && !reducedMotion) {
    let roleIndex = 0;
    let characterIndex = roles[0].length;
    let deleting = true;
    const typeNext = () => {
      const currentRole = roles[roleIndex];
      characterIndex += deleting ? -1 : 1;
      roleOutput.textContent = currentRole.slice(0, characterIndex);
      let delay = deleting ? 38 : 68;
      if (characterIndex <= 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 360;
      } else if (characterIndex >= roles[roleIndex].length) {
        deleting = true;
        delay = 1900;
      }
      window.setTimeout(typeNext, delay);
    };
    window.setTimeout(typeNext, 1700);
  }

  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
