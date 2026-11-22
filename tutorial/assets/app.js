/* ECE Workbench — sidebar, hub, progress, live reload. Needs assets/toc.js loaded first. */
(function () {
  "use strict";
  var TOC = window.TOC || { books: [] };
  var path = location.pathname;
  var inSub = /\/(practice|theory|career|reference|welding)\/[^\/]*$/.test(path);
  var ROOT = inSub ? "../" : "";
  var here = inSub ? path.split("/").slice(-2).join("/") : "index.html";
  var LOCAL = /^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname);
  var fromFile = location.protocol === "file:";

  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  var done = store("ece-done") || {};

  /* flatten chapters */
  var all = [];
  TOC.books.forEach(function (b) { b.parts.forEach(function (p) { p.chapters.forEach(function (c) { c.book = b.id; c.part = p.title; all.push(c); }); }); });
  var byFile = new Map(all.map(function (c) { return [c.file, c]; }));
  var current = all.filter(function (c) { return c.file === here; })[0];
  if (current) document.body.classList.add("book-" + current.book);

  function loadInParallel(chapters, load) {
    var next = 0;
    async function worker() {
      while (next < chapters.length) await load(chapters[next++]);
    }
    return Promise.all(Array.from({ length: Math.min(12, chapters.length) }, worker));
  }

  /* ---- existence + modified time via HEAD (works when served over http) ---- */
  var meta = {}; // file -> {ok, lm, len}
  function head(file) {
    return fetch(ROOT + file, { method: "HEAD", cache: "no-store" })
      .then(function (r) { return { ok: r.ok, lm: r.headers.get("Last-Modified"), len: r.headers.get("Content-Length") }; })
      .catch(function () { return { ok: false, lm: null }; });
  }
  all.forEach(function (c) { meta[c.file] = { ok: !c.planned, lm: null }; });

  /* ---- sidebar ---- */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sideGroup(label, groupName, className, active) {
    var group = el("details", className);
    group.setAttribute("name", groupName);
    group.classList.toggle("current-group", active);
    var summary = el("summary");
    summary.textContent = label;
    group.appendChild(summary);
    return group;
  }
  function buildSide() {
    var side = document.getElementById("side");
    if (!side) return;
    side.innerHTML = "";
    var brand = el("a", "brand", '<span class="dot"></span><span>ECE Workbench</span>');
    brand.href = ROOT + "index.html";
    side.appendChild(brand);
    side.appendChild(themeSwitch());
    if (inSub) {
      var searchForm = el("form", "searchbox");
      searchForm.action = ROOT + "index.html#chapter-search";
      searchForm.setAttribute("role", "search");
      var query = el("input");
      query.type = "search";
      query.name = "q";
      query.required = true;
      query.minLength = 2;
      query.placeholder = "Search chapters";
      query.setAttribute("aria-label", "Search chapters");
      query.setAttribute("enterkeyhint", "search");
      searchForm.appendChild(query);
      side.appendChild(searchForm);
    }
    var nav = el("nav", "side-nav");
    nav.setAttribute("aria-label", "Course chapters");
    side.appendChild(nav);
    TOC.books.forEach(function (b) {
      var activeBook = !!current && current.book === b.id;
      var book = sideGroup(b.title, "ece-books", "side-book", activeBook);
      nav.appendChild(book);
      b.parts.forEach(function (p) {
        var part = sideGroup(p.title, "ece-parts-" + b.id, "side-part", activeBook && current.part === p.title);
        book.appendChild(part);
        p.chapters.forEach(function (c) {
          var a = el("a", "nav", '<span class="num">' + c.n + '</span><span class="t">' + c.title + "</span>");
          a.href = ROOT + c.file;
          a.dataset.file = c.file;
          if (c.file === here) {
            a.classList.add("current");
            a.setAttribute("aria-current", "page");
          }
          if (done[c.file]) a.classList.add("done");
          part.appendChild(a);
        });
      });
    });
    var cur = side.querySelector(".current");
    if (cur) {
      cur.closest(".side-book").open = true;
      cur.closest(".side-part").open = true;
      side.scrollTop = Math.max(0, cur.offsetTop - side.clientHeight / 2);
    }

    var mb = el("button", "menu-btn", "☰ Chapters");
    mb.type = "button";
    mb.setAttribute("aria-controls", "side");
    function setDrawer(open) {
      document.body.classList.toggle("nav-open", open);
      mb.setAttribute("aria-expanded", String(open));
    }
    setDrawer(false);
    mb.onclick = function () { setDrawer(!document.body.classList.contains("nav-open")); };
    document.body.insertBefore(mb, document.body.firstChild);
    document.addEventListener("click", function (e) {
      if (document.body.classList.contains("nav-open") && !side.contains(e.target) && !mb.contains(e.target)) setDrawer(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        setDrawer(false);
        mb.focus();
      }
    });
  }
  /* Shared early theme bootstrap provides a light-default, explicit choice. */
  function themeSwitch() { return window.ECETheme.createSwitch(); }
  function paintTheme() { window.ECETheme.refresh(); }
  function markPending() {
    document.querySelectorAll(".side a.nav").forEach(function (a) {
      var m = meta[a.dataset.file];
      var c = byFile.get(a.dataset.file);
      a.classList.toggle("pending", !!m && !m.ok && !c.planned);
      a.classList.toggle("planned", !!m && !m.ok && !!c.planned);
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
    btn.onclick = function () {
      if (done[here]) delete done[here]; else done[here] = Date.now();
      store("ece-done", done);
      paint();
      var sideLink = document.querySelector(".side a.nav.current");
      if (sideLink) sideLink.classList.toggle("done", !!done[here]);
    };
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
          else if (!m.ok && c.planned) badge = '<span class="badge wip">planned</span>';
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
    if (fromFile) return;
    fetch(location.pathname, { method: "HEAD", cache: "no-store" }).then(function (r) {
      var s = (r.headers.get("Last-Modified") || "") + "|" + (r.headers.get("Content-Length") || "");
      if (myStamp === null) myStamp = s;
      else if (s !== myStamp) { try { sessionStorage.setItem("ece-scroll:" + location.pathname, String(scrollY)); } catch (e) {} location.reload(); }
    }).catch(function () {});
  }
  try { var y = sessionStorage.getItem("ece-scroll:" + location.pathname); if (y) { sessionStorage.removeItem("ece-scroll:" + location.pathname); addEventListener("load", function () { scrollTo(0, +y); }); } } catch (e) {}

  /* Watch available chapters on the hub and pending chapters while reading locally. */
  var watched = LOCAL || !inSub ? all : all.filter(function (c) { return c.planned; });
  var checking = false;
  var checkedOnce = false;
  function toast(msg) { var t = document.querySelector(".toast") || document.body.appendChild(el("div", "toast")); t.textContent = msg; t.classList.add("show"); setTimeout(function () { t.classList.remove("show"); }, 5000); }

  async function tick() {
    if (fromFile || (LOCAL && document.hidden)) return;
    if (LOCAL) liveReload();
    if (checking || !watched.length) return;
    checking = true;
    var changed = false;
    try {
      await loadInParallel(watched, async function (c) {
        var before = meta[c.file];
        var after = await head(c.file);
        meta[c.file] = after;
        if (before.ok !== after.ok || before.lm !== after.lm || before.len !== after.len) changed = true;
        if (checkedOnce && after.ok && !before.ok) toast("New chapter ready: " + c.n + " · " + c.title);
      });
      checkedOnce = true;
      if (inSub) watched = watched.filter(function (c) { return !meta[c.file].ok; });
      if (changed) { markPending(); renderHub(); }
    } finally {
      checking = false;
    }
  }

  /* ---- hub search: show catalogue matches immediately, then add matches in chapter text ---- */
  function setupSearch() {
    var box = document.getElementById("search");
    var out = document.getElementById("search-out");
    if (!box || !out) return;
    var contents = new Map();
    var catalogue = all.map(function (c) {
      return { chapter: c, code: simplify(c.n), title: simplify(c.title), description: simplify(c.d) };
    });
    var loading;
    var complete = fromFile;
    var missingText = false;

    function simplify(text) {
      return text.normalize("NFKC").trim().toLowerCase();
    }

    async function load(c) {
      try {
        var response = await fetch(ROOT + c.file, { cache: LOCAL ? "no-store" : "default" });
        if (!response.ok) throw new Error("Chapter unavailable");
        var doc = new DOMParser().parseFromString(await response.text(), "text/html");
        doc.querySelectorAll("script,style,svg,nav,aside").forEach(function (n) { n.remove(); });
        doc.querySelectorAll("td,th,li,p,h1,h2,h3,h4,div,br,summary,figcaption").forEach(function (n) { n.append(" "); });
        var main = doc.querySelector("main");
        if (!main) throw new Error("Chapter text missing");
        var text = main.textContent.trim().replace(/\s+/g, " ");
        contents.set(c.file, { text: text, normalized: simplify(text) });
      } catch (error) {
        if (!c.planned) missingText = true;
      }
    }

    function paint(q) {
      var words = Array.from(new Set(q.split(/\s+/)));
      var hits = [];
      catalogue.forEach(function (entry) {
        var chapter = entry.chapter;
        var content = contents.get(chapter.file);
        var text = content ? content.normalized : "";
        var metadata = entry.code + " " + entry.title + " " + entry.description;
        if (!words.every(function (word) { return metadata.includes(word) || text.includes(word); })) return;
        var score = entry.code === q ? 500 : 0;
        if (entry.title.includes(q)) score += 60;
        if (entry.description.includes(q)) score += 20;
        words.forEach(function (word) {
          if (entry.title.includes(word)) score += 30;
          if (entry.description.includes(word)) score += 8;
          for (var index = text.indexOf(word), count = 0; index !== -1 && count < 12; count++, index = text.indexOf(word, index + word.length)) score++;
        });
        hits.push({ entry: entry, content: content, score: score });
      });
      hits.sort(function (a, b) { return b.score - a.score; });
      var fragment = document.createDocumentFragment();
      var focused = out.contains(document.activeElement) ? document.activeElement.getAttribute("href") : null;
      var refocus;
      var phrase = new RegExp(words.slice().sort(function (a, b) { return b.length - a.length; })
        .map(function (word) { return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|"), "ig");
      hits.slice(0, 12).forEach(function (hit) {
        var c = hit.entry.chapter;
        var link = el("a", "ch " + c.book);
        var id = el("span", "n");
        var title = el("b");
        var snippet = el("span", "d");
        var text = c.d;
        var offset = hit.content ? hit.content.text.search(phrase) : -1;
        if (offset !== -1 && !hit.entry.title.includes(q) && hit.entry.code !== q) {
          var first = Math.max(0, offset - 65);
          var last = Math.min(hit.content.text.length, offset + 135);
          text = (first ? "…" : "") + hit.content.text.slice(first, last) + (last < hit.content.text.length ? "…" : "");
        }
        link.href = ROOT + c.file;
        if (link.getAttribute("href") === focused) refocus = link;
        id.textContent = c.n;
        title.textContent = c.title;
        var cursor = 0;
        for (var match of text.matchAll(phrase)) {
          var mark = el("mark");
          mark.textContent = match[0];
          snippet.append(text.slice(cursor, match.index), mark);
          cursor = match.index + match[0].length;
        }
        snippet.append(text.slice(cursor));
        link.append(id, title, snippet);
        fragment.append(link);
      });
      var status = "";
      if (!complete) status = "Checking chapter text…";
      else if (fromFile) status = hits.length ? "Showing matches in chapter titles and summaries." : "No title or summary matches.";
      else if (missingText) status = hits.length ? "Some chapter text could not be loaded." : "No matches in the chapters that could be searched.";
      else if (!hits.length) status = "No chapter matches.";
      if (status) {
        var note = el("p", "pill");
        note.textContent = status;
        fragment.append(note);
      }
      out.replaceChildren(fragment);
      if (refocus) refocus.focus({ preventScroll: true });
    }

    var timer = null;
    function run() {
      var q = simplify(box.value);
      if (q.length < 2) { out.replaceChildren(); return; }
      paint(q);
      if (!complete && !loading) {
        loading = loadInParallel(all, load).then(function () {
          complete = true;
          var latest = simplify(box.value);
          if (latest.length >= 2) paint(latest);
        });
      }
    }
    box.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(run, 250); });
    var initialQuery = new URLSearchParams(location.search).get("q");
    if (initialQuery) {
      box.value = initialQuery;
      run();
    }
  }

  buildSide();
  setupSearch();
  var topSwitch = document.getElementById("theme-top");
  if (topSwitch) topSwitch.appendChild(themeSwitch());
  paintTheme();
  chapterExtras();
  markPending();
  renderHub();
  tick();
  // Live updates only while the course is being written locally; the public site checks once.
  if (LOCAL && !fromFile) {
    setInterval(tick, 8000);
    document.addEventListener("visibilitychange", tick);
  }
  else document.querySelectorAll(".livepill").forEach(function (el) { el.remove(); });
})();
