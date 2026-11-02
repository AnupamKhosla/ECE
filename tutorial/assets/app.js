/* ECE Workbench — sidebar, hub, progress, live reload. Needs assets/toc.js loaded first. */
(function () {
  "use strict";
  var TOC = window.TOC || { books: [] };
  var path = location.pathname;
  var inSub = /\/(practice|theory|career|reference)\/[^\/]*$/.test(path);
  var ROOT = inSub ? "../" : "";
  var here = inSub ? path.split("/").slice(-2).join("/") : "index.html";

  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  var done = store("ece-done") || {};

  /* theme */
  var savedTheme = store("ece-theme");
  if (savedTheme === "light" || savedTheme === "dark") document.documentElement.setAttribute("data-theme", savedTheme);

  /* flatten chapters */
  var all = [];
  TOC.books.forEach(function (b) { b.parts.forEach(function (p) { p.chapters.forEach(function (c) { c.book = b.id; c.part = p.title; all.push(c); }); }); });
  var current = all.filter(function (c) { return c.file === here; })[0];
  if (current) document.body.classList.add("book-" + current.book);

  /* ---- existence + modified time via HEAD (works when served over http) ---- */
  var meta = {}; // file -> {ok, lm}
  function head(file) {
    return fetch(ROOT + file, { method: "HEAD", cache: "no-store" })
      .then(function (r) { return { ok: r.ok, lm: r.headers.get("Last-Modified"), len: r.headers.get("Content-Length") }; })
      .catch(function () { return { ok: location.protocol === "file:", lm: null }; });
  }
  function checkAll() {
    return Promise.all(all.map(function (c) { return head(c.file).then(function (m) { meta[c.file] = m; }); }));
  }

  /* ---- sidebar ---- */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function buildSide() {
    var side = document.getElementById("side");
    if (!side) return;
    side.innerHTML = "";
    var brand = el("a", "brand", '<span class="dot"></span><span>ECE Workbench</span>');
    brand.href = ROOT + "index.html";
    side.appendChild(brand);
    side.appendChild(themeSwitch());
    TOC.books.forEach(function (b) {
      side.appendChild(el("h4", null, b.title));
      b.parts.forEach(function (p) {
        side.appendChild(el("h5", null, p.title));
        p.chapters.forEach(function (c) {
          var a = el("a", "nav", '<span class="num">' + c.n + '</span><span class="t">' + c.title + "</span>");
          a.href = ROOT + c.file;
          a.dataset.file = c.file;
          if (c.file === here) a.classList.add("current");
          if (done[c.file]) a.classList.add("done");
          side.appendChild(a);
        });
      });
    });
    var cur = side.querySelector(".current");
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "center" });

    if (!document.querySelector(".menu-btn")) {
      var mb = el("button", "menu-btn", "☰ Chapters");
      mb.onclick = function () { document.body.classList.toggle("nav-open"); };
      document.body.appendChild(mb);
      document.addEventListener("click", function (e) {
        if (document.body.classList.contains("nav-open") && !side.contains(e.target) && e.target !== mb) document.body.classList.remove("nav-open");
      });
    }
  }
  /* Light / Dark / Auto switch. Auto follows the computer's setting. */
  function themeSwitch() {
    var wrap = el("div", "theme-switch");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Colour theme");
    [["light", "☀ Light"], ["dark", "☾ Dark"], ["auto", "Auto"]].forEach(function (o) {
      var b = el("button", null, o[1]);
      b.type = "button";
      b.dataset.mode = o[0];
      b.onclick = function () {
        if (o[0] === "auto") { document.documentElement.removeAttribute("data-theme"); store("ece-theme", "auto"); }
        else { document.documentElement.setAttribute("data-theme", o[0]); store("ece-theme", o[0]); }
        paintTheme();
      };
      wrap.appendChild(b);
    });
    return wrap;
  }
  function paintTheme() {
    var mode = store("ece-theme") || "auto";
    document.querySelectorAll(".theme-switch button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.mode === mode)); });
  }
  function markPending() {
    document.querySelectorAll(".side a.nav").forEach(function (a) {
      var m = meta[a.dataset.file];
      a.classList.toggle("pending", !!m && !m.ok);
    });
  }

  /* ---- chapter page extras ---- */
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60); }
  function chapterExtras() {
    var main = document.querySelector("main.page");
    if (!main || !current) return;
    var h2s = main.querySelectorAll("h2");
    h2s.forEach(function (h) { if (!h.id) h.id = slug(h.textContent); });
    if (location.hash) { var target = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (target) setTimeout(function () { target.scrollIntoView(); }, 0); }
    var otp = main.querySelector(".otp[data-auto]");
    if (otp && h2s.length) {
      var ol = el("ol");
      h2s.forEach(function (h) { var li = el("li"); var a = el("a", null, h.textContent); a.href = "#" + h.id; li.appendChild(a); ol.appendChild(li); });
      otp.innerHTML = "<b>On this page</b>"; otp.appendChild(ol);
    }
    /* persistent checklists */
    main.querySelectorAll("ul.checklist input[type=checkbox]").forEach(function (cb, i) {
      var key = "ece-chk:" + here + ":" + i;
      if (store(key)) cb.checked = true;
      cb.addEventListener("change", function () { store(key, cb.checked); });
    });
    /* done bar + pager */
    var bar = el("div", "donebar");
    var btn = el("button");
    function paint() { btn.textContent = done[here] ? "✓ Chapter done" : "Mark this chapter done"; btn.classList.toggle("is-done", !!done[here]); }
    btn.onclick = function () { if (done[here]) delete done[here]; else done[here] = Date.now(); store("ece-done", done); paint(); buildSide(); markPending(); };
    paint();
    bar.appendChild(btn);
    bar.appendChild(el("span", null, "Your progress is saved in this browser only."));
    main.appendChild(bar);
    var same = all.filter(function (c) { return c.book === current.book; });
    var i = same.indexOf(current);
    var pager = el("nav", "pager");
    if (i > 0) { var p = el("a", "prev", "<small>← Previous</small>" + same[i - 1].n + " · " + same[i - 1].title); p.href = ROOT + same[i - 1].file; pager.appendChild(p); } else pager.appendChild(el("span"));
    if (i < same.length - 1) { var n = el("a", "next", "<small>Next →</small>" + same[i + 1].n + " · " + same[i + 1].title); n.href = ROOT + same[i + 1].file; pager.appendChild(n); }
    main.appendChild(pager);
  }

  /* ---- hub ---- */
  function fmtTime(lm) { if (!lm) return ""; var d = new Date(lm); return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
  function renderHub() {
    var hub = document.getElementById("hub");
    if (!hub) return;
    var now = Date.now();
    var statsBox = document.getElementById("bookstats");
    if (statsBox) {
      statsBox.innerHTML = "";
      TOC.books.forEach(function (b) {
        var chs = all.filter(function (c) { return c.book === b.id; });
        var ready = chs.filter(function (c) { return meta[c.file] && meta[c.file].ok; }).length;
        var mine = chs.filter(function (c) { return done[c.file]; }).length;
        var card = el("a", "book " + b.id, '<span class="pill">' + chs.length + ' chapters</span><h3>' + b.title + '</h3><p>' + b.blurb + '</p><div class="bar"><i style="width:' + Math.round(100 * ready / chs.length) + '%"></i></div><small>' + ready + " of " + chs.length + " written · " + mine + " done by you</small>");
        card.href = "#" + b.id; card.style.textDecoration = "none"; card.style.color = "inherit";
        statsBox.appendChild(card);
      });
    }
    hub.innerHTML = "";
    TOC.books.forEach(function (b) {
      var sec = el("section"); sec.id = b.id;
      sec.appendChild(el("h2", null, b.title));
      sec.appendChild(el("p", "lede", b.blurb));
      b.parts.forEach(function (p) {
        var part = el("div", "part");
        part.appendChild(el("h3", null, p.title));
        part.appendChild(el("p", null, p.blurb));
        var list = el("div", "chlist");
        p.chapters.forEach(function (c) {
          var m = meta[c.file] || {};
          var a = el("a", "ch " + b.id + (m.ok ? "" : " pending"));
          a.href = ROOT + c.file;
          var badge = "";
          if (done[c.file]) badge = '<span class="badge done">done</span>';
          else if (!m.ok) badge = '<span class="badge wip">writing…</span>';
          else if (m.lm && now - new Date(m.lm).getTime() < 25 * 60 * 1000) badge = '<span class="badge new">new</span>';
          a.innerHTML = badge + '<span class="n">' + c.n + '</span><b>' + c.title + '</b><span class="d">' + c.d + "</span>";
          list.appendChild(a);
        });
        part.appendChild(list);
        sec.appendChild(part);
      });
      hub.appendChild(sec);
    });
    var feed = document.getElementById("feed");
    if (feed) {
      var recent = all.filter(function (c) { return meta[c.file] && meta[c.file].ok && meta[c.file].lm; })
        .sort(function (a, b) { return new Date(meta[b.file].lm) - new Date(meta[a.file].lm); }).slice(0, 12);
      feed.innerHTML = recent.length ? "" : "<div>Chapters will appear here as they are written.</div>";
      recent.forEach(function (c) {
        var d = el("div", null, "<time>" + fmtTime(meta[c.file].lm) + "</time>");
        var a = el("a", null, c.n + " · " + c.title); a.href = ROOT + c.file; d.appendChild(a); feed.appendChild(d);
      });
    }
  }

  /* ---- live reload: if this page's file changes on disk, reload in place ---- */
  var myStamp = null;
  function liveReload() {
    if (location.protocol === "file:") return;
    fetch(location.pathname, { method: "HEAD", cache: "no-store" }).then(function (r) {
      var s = (r.headers.get("Last-Modified") || "") + "|" + (r.headers.get("Content-Length") || "");
      if (myStamp === null) myStamp = s;
      else if (s !== myStamp) { try { sessionStorage.setItem("ece-scroll:" + location.pathname, String(scrollY)); } catch (e) {} location.reload(); }
    }).catch(function () {});
  }
  try { var y = sessionStorage.getItem("ece-scroll:" + location.pathname); if (y) { sessionStorage.removeItem("ece-scroll:" + location.pathname); addEventListener("load", function () { scrollTo(0, +y); }); } } catch (e) {}

  /* toast for new chapters while reading */
  var known = null;
  function toast(msg) { var t = document.querySelector(".toast") || document.body.appendChild(el("div", "toast")); t.textContent = msg; t.classList.add("show"); setTimeout(function () { t.classList.remove("show"); }, 5000); }

  function tick() {
    checkAll().then(function () {
      var ready = all.filter(function (c) { return meta[c.file] && meta[c.file].ok; }).map(function (c) { return c.file; });
      if (known) ready.forEach(function (f) { if (known.indexOf(f) < 0) { var c = all.filter(function (x) { return x.file === f; })[0]; toast("New chapter ready: " + c.n + " · " + c.title); } });
      known = ready;
      markPending(); renderHub();
    });
    liveReload();
  }

  /* ---- full-text search on the hub: fetches each written chapter once, then searches its text ---- */
  function setupSearch() {
    var box = document.getElementById("search");
    var out = document.getElementById("search-out");
    if (!box || !out) return;
    var cache = {}; // file -> plain text
    function load(c) {
      if (cache[c.file] !== undefined) return Promise.resolve();
      return fetch(ROOT + c.file, { cache: "no-store" }).then(function (r) { return r.ok ? r.text() : ""; }).then(function (h) {
        var doc = new DOMParser().parseFromString(h, "text/html");
        doc.querySelectorAll("script,style,svg,nav,aside").forEach(function (n) { n.remove(); });
        doc.querySelectorAll("td,th,li,p,h1,h2,h3,h4,div,br,summary,figcaption").forEach(function (n) { n.append(" "); });
        var m = doc.querySelector("main");
        cache[c.file] = m ? m.textContent.replace(/\s+/g, " ") : "";
      }).catch(function () { cache[c.file] = ""; });
    }
    function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
    var timer = null;
    function run() {
      var q = box.value.trim().toLowerCase();
      if (q.length < 2) { out.innerHTML = ""; return; }
      out.innerHTML = '<div class="pill">Searching…</div>';
      var ready = all.filter(function (c) { return meta[c.file] && meta[c.file].ok; });
      Promise.all(ready.map(load)).then(function () {
        var words = q.split(/\s+/);
        var hits = [];
        ready.forEach(function (c) {
          var t = cache[c.file] || "", lt = t.toLowerCase(), score = 0;
          if (!words.every(function (w) { return lt.indexOf(w) >= 0; })) return;
          words.forEach(function (w) { var i = -1; while ((i = lt.indexOf(w, i + 1)) >= 0) score++; if ((c.title).toLowerCase().indexOf(w) >= 0) score += 50; });
          var at = lt.indexOf(words[0]);
          var snip = t.slice(Math.max(0, at - 70), at + 130);
          hits.push({ c: c, score: score, snip: snip });
        });
        hits.sort(function (a, b) { return b.score - a.score; });
        if (!hits.length) { out.innerHTML = '<p class="pill">No chapter mentions that yet.</p>'; return; }
        out.innerHTML = hits.slice(0, 12).map(function (h) {
          var s = esc(h.snip);
          words.forEach(function (w) { s = s.replace(new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>"); });
          return '<a class="ch ' + h.c.book + '" href="' + ROOT + h.c.file + '"><span class="n">' + h.c.n + '</span><b>' + h.c.title + '</b><span class="d">…' + s + '…</span></a>';
        }).join("");
      });
    }
    box.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(run, 250); });
  }

  buildSide();
  setupSearch();
  var topSwitch = document.getElementById("theme-top");
  if (topSwitch) topSwitch.appendChild(themeSwitch());
  paintTheme();
  chapterExtras();
  renderHub();
  tick();
  setInterval(tick, 8000);
})();
