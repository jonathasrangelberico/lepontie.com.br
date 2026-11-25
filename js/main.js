(function () {
  "use strict";

  var WA_NUMBER = "351910739973";
  document.documentElement.classList.remove("no-js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header ---------- */
  var header = document.querySelector(".header");

  /* ---------- Menu mobile ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("menuToggle");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false);
  });

  /* ---------- Parallax suave ---------- */
  var layers = Array.prototype.map.call(document.querySelectorAll("[data-parallax]"), function (el) {
    return { el: el, box: el.parentElement, speed: parseFloat(el.dataset.parallax) || 0.1 };
  });

  function updateParallax() {
    var vh = window.innerHeight;
    layers.forEach(function (l) {
      var r = l.box.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var offset = (r.top + r.height / 2 - vh / 2) * -l.speed;
      l.el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      header.classList.toggle("is-scrolled", window.scrollY > 30);
      if (!reduceMotion) updateParallax();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Revelação, fio e contadores ---------- */
  var reveals = document.querySelectorAll(".reveal");
  reveals.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
      return c.classList.contains("reveal");
    });
    var idx = siblings.indexOf(el);
    if (idx > 0) el.style.setProperty("--d", Math.min(idx * 0.1, 0.6) + "s");
  });

  function runCounter(el) {
    var target = parseInt(el.dataset.count, 10);
    if (reduceMotion) { el.textContent = target; return; }
    var start = null, duration = 1800;
    (function step(ts) {
      if (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p >= 1) return;
      }
      requestAnimationFrame(step);
    })();
  }

  var watched = document.querySelectorAll(".reveal, .thread, [data-count]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.classList.contains("reveal")) el.classList.add("is-visible");
        if (el.classList.contains("thread")) el.classList.add("is-drawn");
        if (el.hasAttribute("data-count")) runCounter(el);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    watched.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
    document.querySelectorAll(".thread").forEach(function (el) { el.classList.add("is-drawn"); });
    document.querySelectorAll("[data-count]").forEach(function (el) { el.textContent = el.dataset.count; });
  }

  /* ---------- Formulário → WhatsApp ---------- */
  var form = document.getElementById("waForm");
  var note = document.getElementById("formNote");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nome = form.nome.value.trim();
    var pais = form.pais.value.trim();
    var ocasiao = form.ocasiao.value;
    var mensagem = form.mensagem.value.trim();

    form.nome.closest(".field").classList.toggle("is-invalid", !nome);
    form.ocasiao.closest(".field").classList.toggle("is-invalid", !ocasiao);

    if (!nome || !ocasiao) {
      note.textContent = "Por favor, informe o seu nome e a ocasião da peça.";
      (nome ? form.ocasiao : form.nome).focus();
      return;
    }
    note.textContent = "";

    var texto =
      "Olá, LêPontiê! Vim pelo site e gostaria de encomendar uma peça exclusiva.\n\n" +
      "*Nome:* " + nome + "\n" +
      (pais ? "*País:* " + pais + "\n" : "") +
      "*Ocasião:* " + ocasiao +
      (mensagem ? "\n*Sobre a peça:* " + mensagem : "");

    window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(texto), "_blank", "noopener");
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
