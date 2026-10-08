/* Live drainage-basin figure for the home page.
   A random terrain is filled with a priority flood from a single outlet, which gives every cell one
   downstream neighbour: a D8 drainage tree, as in MRRpy. Rain parcels land on cells, travel downstream
   (slowly on hillslopes, faster in large channels) and are counted when they leave the outlet. That
   count, binned in time, is the hydrograph drawn under the basin. Click the basin to add a storm. */
(function () {
  "use strict";
  var canvas = document.getElementById("basin");
  if (!canvas || !canvas.getContext) return;
  var fig = canvas.closest(".basin-fig");
  var ctl = fig ? fig.querySelector(".basin-ctl") : null;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- seeded random numbers ---------- */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rand = rng(20270210);

  /* ---------- terrain and drainage tree ---------- */
  var NX = 84, NY = 66, N = NX * NY;

  function valueNoise(gx, gy) {
    var w = gx + 2, g = new Float32Array(w * (gy + 2));
    for (var i = 0; i < g.length; i++) g[i] = rand();
    return function (x, y) {
      var x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
      var sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      var a = g[y0 * w + x0], b = g[y0 * w + x0 + 1], c = g[(y0 + 1) * w + x0], d = g[(y0 + 1) * w + x0 + 1];
      return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
    };
  }
  var octaves = [[4, 3, 1], [8, 6, 0.5], [16, 12, 0.25], [32, 24, 0.125]].map(function (o) {
    return { f: valueNoise(o[0], o[1]), gx: o[0], gy: o[1], a: o[2] };
  });
  function noise(x, y) {
    var s = 0;
    for (var i = 0; i < octaves.length; i++) {
      var o = octaves[i];
      var u = ((x / NX) * o.gx) % o.gx, v = ((y / NY) * o.gy) % o.gy;
      s += o.a * o.f(u < 0 ? u + o.gx : u, v < 0 ? v + o.gy : v);
    }
    return s / 1.875;
  }

  // basin outline: a lobed blob that tapers toward the outlet at the bottom
  var inside = new Uint8Array(N);
  var p1 = rand() * 6.28, p2 = rand() * 6.28, p3 = rand() * 6.28;
  var cx = NX / 2, cy = NY * 0.44;
  for (var y = 0; y < NY; y++) {
    for (var x = 0; x < NX; x++) {
      var dy = (y - cy) / (NY * 0.5);
      var taper = 1 - 0.62 * Math.pow(Math.max(0, Math.min(1, dy)), 1.4);
      var dx = (x - cx) / (NX * 0.47 * taper);
      var th = Math.atan2(dy, dx);
      var r = Math.sqrt(dx * dx + dy * dy);
      var lim = 0.9 + 0.08 * Math.sin(2 * th + p1) + 0.06 * Math.sin(3 * th + p2) + 0.04 * Math.sin(5 * th + p3)
        + 0.1 * (noise(x * 1.7, y * 1.7) - 0.5);
      if (r < lim && x > 0 && y > 0 && x < NX - 1 && y < NY - 1) inside[y * NX + x] = 1;
    }
  }
  // outlet: lowest inside cell near the centre column
  var outlet = -1;
  for (var yy = NY - 1; yy >= 0 && outlet < 0; yy--) {
    for (var off = 0; off <= 3 && outlet < 0; off++) {
      var c1 = yy * NX + Math.round(cx) + off, c2 = yy * NX + Math.round(cx) - off;
      if (inside[c1]) outlet = c1; else if (inside[c2]) outlet = c2;
    }
  }

  var ox = outlet % NX, oy = (outlet / NX) | 0, maxD = 0, z = new Float32Array(N);
  for (var i = 0; i < N; i++) {
    var d = Math.hypot((i % NX) - ox, ((i / NX) | 0) - oy);
    if (d > maxD) maxD = d;
  }
  // distance to the divide (BFS from cells outside the basin): divides are ridges
  var dOut = new Float32Array(N).fill(1e9), queue = [];
  for (i = 0; i < N; i++) if (!inside[i]) { dOut[i] = 0; queue.push(i); }
  for (var qh = 0; qh < queue.length; qh++) {
    var qc = queue[qh], qx = qc % NX, qy = (qc / NX) | 0;
    for (var kk = 0; kk < 4; kk++) {
      var ax = qx + [1, -1, 0, 0][kk], ay = qy + [0, 0, 1, -1][kk];
      if (ax < 0 || ay < 0 || ax >= NX || ay >= NY) continue;
      var an = ay * NX + ax;
      if (dOut[an] > dOut[qc] + 1) { dOut[an] = dOut[qc] + 1; queue.push(an); }
    }
  }
  for (i = 0; i < N; i++) {
    var dist = Math.hypot((i % NX) - ox, ((i / NX) | 0) - oy) / maxD;
    var ridge = Math.max(0, 1 - dOut[i] / 7);
    z[i] = 0.85 * dist + 0.75 * noise(i % NX, (i / NX) | 0) + 0.45 * ridge * ridge;
  }

  // binary heap keyed on priority
  var hk = new Float32Array(N), hv = new Int32Array(N), hn = 0;
  function push(k, v) {
    var j = hn++;
    while (j > 0) {
      var p = (j - 1) >> 1;
      if (hk[p] <= k) break;
      hk[j] = hk[p]; hv[j] = hv[p]; j = p;
    }
    hk[j] = k; hv[j] = v;
  }
  function pop() {
    var top = hv[0], k = hk[--hn], v = hv[hn], j = 0;
    for (;;) {
      var l = 2 * j + 1, r2 = l + 1, m = j, mk = k;
      if (l < hn && hk[l] < mk) { m = l; mk = hk[l]; }
      if (r2 < hn && hk[r2] < mk) { m = r2; }
      if (m === j) break;
      hk[j] = hk[m]; hv[j] = hv[m]; j = m;
    }
    hk[j] = k; hv[j] = v;
    return top;
  }

  var parent = new Int32Array(N).fill(-1);
  var filled = new Float32Array(N);
  var seen = new Uint8Array(N);
  var order = [];
  var DX = [-1, 0, 1, -1, 1, -1, 0, 1], DY = [-1, -1, -1, 0, 0, 1, 1, 1];
  push(z[outlet], outlet); seen[outlet] = 1; filled[outlet] = z[outlet];
  while (hn > 0) {
    var cprio = hk[0];
    var c = pop();
    order.push(c);
    filled[c] = cprio;
    var cxp = c % NX, cyp = (c / NX) | 0;
    for (var k = 0; k < 8; k++) {
      var nx = cxp + DX[k], ny = cyp + DY[k];
      if (nx < 0 || ny < 0 || nx >= NX || ny >= NY) continue;
      var n = ny * NX + nx;
      if (!inside[n] || seen[n]) continue;
      seen[n] = 1;
      parent[n] = c;
      push(Math.max(z[n], cprio + 1e-4) + rand() * 0.003, n);
    }
  }
  for (i = 0; i < N; i++) if (inside[i] && !seen[i]) inside[i] = 0;

  var acc = new Float32Array(N), cells = [];
  for (i = order.length - 1; i >= 0; i--) {
    c = order[i];
    acc[c] += 1;
    if (parent[c] >= 0) acc[parent[c]] += acc[c];
  }
  for (i = 0; i < N; i++) if (inside[i]) cells.push(i);
  var maxAcc = acc[outlet];
  var CHAN = 14;
  var edgeLen = new Float32Array(N), speed = new Float32Array(N), chanCells = [];
  for (i = 0; i < N; i++) {
    if (!inside[i]) continue;
    var p = parent[i];
    edgeLen[i] = p < 0 ? 1 : (((p % NX) !== (i % NX)) && (((p / NX) | 0) !== ((i / NX) | 0)) ? 1.414 : 1);
    var isChan = acc[i] >= CHAN;
    speed[i] = isChan ? 3.2 + 10 * Math.pow(acc[i] / maxAcc, 0.35) : 2.1;
    if (isChan) chanCells.push(i);
  }
  var minX = NX, maxX = 0, minY = NY, maxY = 0;
  cells.forEach(function (ci) {
    var a = ci % NX, b = (ci / NX) | 0;
    if (a < minX) minX = a; if (a > maxX) maxX = a; if (b < minY) minY = b; if (b > maxY) maxY = b;
  });
  var fMin = Infinity, fMax = -Infinity;
  cells.forEach(function (ci) { if (filled[ci] < fMin) fMin = filled[ci]; if (filled[ci] > fMax) fMax = filled[ci]; });

  /* ---------- layout ---------- */
  var W = 0, H = 0, dpr = 1, cs = 6, bx = 0, by = 0, panelTop = 0, panelH = 0;
  var terrain = document.createElement("canvas");
  var colors = {};

  function hexToRgb(h) {
    h = h.trim().replace("#", "");
    if (h.length === 3) h = h.replace(/(.)/g, "$1$1");
    var v = parseInt(h, 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  function readColors() {
    var s = getComputedStyle(document.documentElement);
    ["--basin-lo", "--basin-mid", "--basin-hi", "--basin-shadow", "--channel", "--water", "--rain", "--accent", "--ink", "--ink-3", "--card", "--rule"].forEach(function (k) {
      colors[k.slice(2)] = s.getPropertyValue(k).trim() || "#888888";
    });
  }
  function rgba(hex, a) {
    var c3 = hexToRgb(hex);
    return "rgba(" + c3[0] + "," + c3[1] + "," + c3[2] + "," + a + ")";
  }
  function cxOf(ci) { return bx + ((ci % NX) - minX + 0.5) * cs; }
  function cyOf(ci) { return by + (((ci / NX) | 0) - minY + 0.5) * cs; }

  function layout() {
    var rect = canvas.getBoundingClientRect();
    if (!rect.width) return false;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    var basinH = H * 0.7;
    var bw = maxX - minX + 1, bh = maxY - minY + 1;
    cs = Math.min((W * 0.92) / bw, (basinH * 0.94) / bh);
    bx = (W - bw * cs) / 2;
    by = (basinH - bh * cs) / 2 + 6;
    panelTop = H * 0.735; panelH = H * 0.235;
    drawTerrain();
    return true;
  }

  function drawTerrain() {
    terrain.width = canvas.width; terrain.height = canvas.height;
    var t = terrain.getContext("2d");
    t.setTransform(dpr, 0, 0, dpr, 0, 0);
    t.clearRect(0, 0, W, H);
    var lo = hexToRgb(colors["basin-lo"]), mid = hexToRgb(colors["basin-mid"]), hi = hexToRgb(colors["basin-hi"]);
    var shadow = hexToRgb(colors["basin-shadow"]);
    var cell = Math.ceil(cs) + 0.5;
    for (var j = 0; j < cells.length; j++) {
      var ci = cells[j], x0 = ci % NX, y0 = (ci / NX) | 0;
      var e = (filled[ci] - fMin) / (fMax - fMin);
      var zl = inside[ci - 1] ? filled[ci - 1] : filled[ci], zr = inside[ci + 1] ? filled[ci + 1] : filled[ci];
      var zu = inside[ci - NX] ? filled[ci - NX] : filled[ci], zd = inside[ci + NX] ? filled[ci + NX] : filled[ci];
      var shade = 0.5 + ((zl - zr) + (zu - zd)) * 14;
      shade = Math.max(0, Math.min(1, shade));
      var m = Math.pow(e, 0.7);
      var a0 = m < 0.5 ? lo : mid, a1 = m < 0.5 ? mid : hi, mm = m < 0.5 ? m * 2 : (m - 0.5) * 2;
      var rr = a0[0] + (a1[0] - a0[0]) * mm, gg = a0[1] + (a1[1] - a0[1]) * mm, bb = a0[2] + (a1[2] - a0[2]) * mm;
      var sh = (1 - shade) * 0.32, li = shade * 0.1;
      rr = rr + (shadow[0] - rr) * sh + (255 - rr) * li;
      gg = gg + (shadow[1] - gg) * sh + (255 - gg) * li;
      bb = bb + (shadow[2] - bb) * sh + (255 - bb) * li;
      t.fillStyle = "rgb(" + (rr | 0) + "," + (gg | 0) + "," + (bb | 0) + ")";
      t.fillRect(bx + (x0 - minX) * cs, by + (y0 - minY) * cs, cell, cell);
    }
    // watershed divide: cell edges that face outside the basin
    t.beginPath();
    for (j = 0; j < cells.length; j++) {
      ci = cells[j]; x0 = bx + ((ci % NX) - minX) * cs; var y1 = by + (((ci / NX) | 0) - minY) * cs;
      if (!inside[ci - NX]) { t.moveTo(x0, y1); t.lineTo(x0 + cs, y1); }
      if (!inside[ci + NX]) { t.moveTo(x0, y1 + cs); t.lineTo(x0 + cs, y1 + cs); }
      if (!inside[ci - 1]) { t.moveTo(x0, y1); t.lineTo(x0, y1 + cs); }
      if (!inside[ci + 1]) { t.moveTo(x0 + cs, y1); t.lineTo(x0 + cs, y1 + cs); }
    }
    t.strokeStyle = rgba(colors["ink-3"], 0.55);
    t.lineWidth = 1;
    t.stroke();
    // channel network, width grows with drained area
    t.lineCap = "round";
    var buckets = 7;
    for (var b = 0; b < buckets; b++) {
      t.beginPath();
      for (j = 0; j < chanCells.length; j++) {
        ci = chanCells[j];
        var s = Math.sqrt(acc[ci] / maxAcc);
        if (Math.min(buckets - 1, Math.floor(s * buckets * 1.4)) !== b) continue;
        var pc = parent[ci];
        t.moveTo(cxOf(ci), cyOf(ci));
        if (pc >= 0) t.lineTo(cxOf(pc), cyOf(pc)); else t.lineTo(cxOf(ci), cyOf(ci) + cs * 1.4);
      }
      var sMid = (b + 0.5) / (buckets * 1.4);
      t.lineWidth = Math.max(0.7, cs * (0.14 + 0.62 * sMid));
      t.strokeStyle = rgba(colors.channel, 0.42 + 0.5 * sMid);
      t.stroke();
    }
    // outlet
    var ox2 = cxOf(outlet), oy2 = cyOf(outlet) + cs * 1.4;
    t.fillStyle = colors.card; t.strokeStyle = colors.ink; t.lineWidth = 1.5;
    t.beginPath(); t.arc(ox2, oy2, 4.5, 0, 6.283); t.fill(); t.stroke();
    t.font = "500 10.5px 'IBM Plex Mono', monospace";
    t.fillStyle = colors["ink-3"];
    t.textAlign = "left"; t.textBaseline = "middle";
    t.fillText("OUTLET", ox2 + 10, oy2);
    // hydrograph panel frame
    t.strokeStyle = rgba(colors["ink-3"], 0.35); t.lineWidth = 1;
    t.beginPath();
    t.moveTo(14, panelTop + 0.5); t.lineTo(W - 14, panelTop + 0.5);
    t.moveTo(14, panelTop + panelH + 0.5); t.lineTo(W - 14, panelTop + panelH + 0.5);
    t.stroke();
    t.fillStyle = colors["ink-3"];
    t.textAlign = "left"; t.textBaseline = "top";
    t.fillText("RAIN", 16, panelTop + 6);
    t.textBaseline = "bottom";
    t.fillText("Q AT OUTLET", 16, panelTop + panelH - 6);
    t.textAlign = "right";
    t.fillText("NOW", W - 16, panelTop + panelH - 6);
  }

  /* ---------- simulation ---------- */
  var MAXP = 3600, pc = new Int32Array(MAXP), pt = new Float32Array(MAXP), np = 0;
  var flow = new Float32Array(N), flowS = new Float32Array(N);
  var storms = [], ripples = [], T = 0, nextAuto = 0.5;
  var BIN = 0.2, NB = 190, qSm = new Float32Array(NB), qBins = new Float32Array(NB), rBins = new Float32Array(NB), binT = 0, qNow = 0, rNow = 0, yMax = 40, rMax = 1;
  var autoCount = 0;

  function addStorm(opts) { storms.push(opts); }
  function scheduleAuto() {
    autoCount++;
    var uniform = autoCount % 2 === 1;
    var ci = cells[(rand() * cells.length) | 0];
    addStorm({
      t0: T, dur: 2.6 + rand() * 2.6, peak: 420 + rand() * 360,
      cx: ci % NX, cy: (ci / NX) | 0, rad: uniform ? 0 : 8 + rand() * 7
    });
    nextAuto = T + 10.5 + rand() * 4;
  }
  function stormRate(s) {
    var u = (T - s.t0) / s.dur;
    if (u < 0 || u > 1) return 0;
    var v = Math.sin(Math.PI * u);
    return s.peak * v * v;
  }
  function gauss() { return Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(6.283 * rand()); }

  function step(dt) {
    T += dt;
    if (T >= nextAuto) scheduleAuto();
    // rain
    var rain = 0;
    for (var s = storms.length - 1; s >= 0; s--) {
      var st = storms[s];
      if (T > st.t0 + st.dur) { storms.splice(s, 1); continue; }
      var rate = stormRate(st);
      rain += rate;
      st.carry = (st.carry || 0) + rate * dt;
      while (st.carry >= 1) {
        st.carry -= 1;
        if (np >= MAXP) continue;
        var ci;
        if (st.rad > 0) {
          ci = -1;
          for (var tries = 0; tries < 5 && ci < 0; tries++) {
            var gx = Math.round(st.cx + gauss() * st.rad * 0.6), gy = Math.round(st.cy + gauss() * st.rad * 0.6);
            if (gx > 0 && gy > 0 && gx < NX && gy < NY && inside[gy * NX + gx]) ci = gy * NX + gx;
          }
          if (ci < 0) continue;
        } else {
          ci = cells[(rand() * cells.length) | 0];
        }
        pc[np] = ci; pt[np] = rand() * 0.6; np++;
      }
    }
    // move parcels downstream
    flow.fill(0);
    var out = 0;
    for (var i = np - 1; i >= 0; i--) {
      var c = pc[i];
      pt[i] += (speed[c] * dt) / edgeLen[c];
      while (pt[i] >= 1) {
        pt[i] -= 1;
        var p = parent[c];
        if (p < 0) { c = -1; break; }
        c = p;
      }
      if (c < 0) {
        out++;
        np--; pc[i] = pc[np]; pt[i] = pt[np];
        continue;
      }
      pc[i] = c;
      flow[c] += 1;
    }
    for (var j = 0; j < chanCells.length; j++) {
      var cc = chanCells[j];
      flowS[cc] += (flow[cc] - flowS[cc]) * Math.min(1, dt * 6);
    }
    // bins for the hydrograph and hyetograph
    qNow += out; rNow += rain * dt; binT += dt;
    while (binT >= BIN) {
      binT -= BIN;
      qBins.copyWithin(0, 1); rBins.copyWithin(0, 1);
      qBins[NB - 1] = qNow / BIN; rBins[NB - 1] = rNow / BIN;
      qNow = 0; rNow = 0;
    }
    for (var r = ripples.length - 1; r >= 0; r--) if (T - ripples[r].t > 0.9) ripples.splice(r, 1);
  }

  /* ---------- drawing ---------- */
  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(terrain, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";

    // flood wave: water in channels, width grows with the current flow
    var buckets = 6;
    for (var b = 0; b < buckets; b++) {
      ctx.beginPath();
      var any = false;
      for (var j = 0; j < chanCells.length; j++) {
        var ci = chanCells[j], f = flowS[ci];
        if (f < 0.35) continue;
        var w = Math.min(1, Math.sqrt(f) / 7);
        if (Math.min(buckets - 1, Math.floor(w * buckets)) !== b) continue;
        var p = parent[ci];
        ctx.moveTo(cxOf(ci), cyOf(ci));
        if (p >= 0) ctx.lineTo(cxOf(p), cyOf(p)); else ctx.lineTo(cxOf(ci), cyOf(ci) + cs * 1.4);
        any = true;
      }
      if (!any) continue;
      var wm = (b + 0.6) / buckets;
      ctx.lineWidth = Math.max(1, cs * (0.25 + 1.25 * wm));
      ctx.strokeStyle = rgba(colors.water, 0.55 + 0.4 * wm);
      ctx.stroke();
    }

    // parcels
    ctx.fillStyle = rgba(colors.water, 0.9);
    ctx.beginPath();
    var sz = Math.max(1.2, cs * 0.26);
    for (var i = 0; i < np; i++) {
      var c = pc[i], pp = parent[c], t = pt[i];
      var x0 = cxOf(c), y0 = cyOf(c), x1, y1;
      if (pp >= 0) { x1 = cxOf(pp); y1 = cyOf(pp); } else { x1 = x0; y1 = y0 + cs * 1.4; }
      ctx.rect(x0 + (x1 - x0) * t - sz / 2, y0 + (y1 - y0) * t - sz / 2, sz, sz);
    }
    ctx.fill();

    // rain streaks over active storms
    ctx.strokeStyle = rgba(colors.rain, 0.55);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var s = 0; s < storms.length; s++) {
      var st = storms[s], k = stormRate(st) / 900, nStreak = Math.round(k * 90);
      for (var n = 0; n < nStreak; n++) {
        var ci2 = st.rad > 0 ? -1 : cells[(rand() * cells.length) | 0];
        var sx, sy;
        if (st.rad > 0) {
          sx = bx + (st.cx - minX + 0.5 + gauss() * st.rad * 0.7) * cs;
          sy = by + (st.cy - minY + 0.5 + gauss() * st.rad * 0.7) * cs;
        } else { sx = cxOf(ci2); sy = cyOf(ci2); }
        ctx.moveTo(sx + 2.5, sy - 9); ctx.lineTo(sx, sy);
      }
    }
    ctx.stroke();

    // click ripples
    for (var r = 0; r < ripples.length; r++) {
      var rp = ripples[r], u = (T - rp.t) / 0.9;
      ctx.strokeStyle = rgba(colors.accent, 0.8 * (1 - u));
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(rp.x, rp.y, 6 + u * cs * 9, 0, 6.283); ctx.stroke();
    }

    // hyetograph (bars hang from the top) and hydrograph (line from the bottom)
    var x0p = 14, x1p = W - 14, bw = (x1p - x0p) / NB;
    var curR = 0, curQ = 0;
    for (i = 0; i < NB; i++) { if (rBins[i] > curR) curR = rBins[i]; if (qSm[i] > curQ) curQ = qSm[i]; }
    rMax = Math.max(rMax * 0.995, curR * 1.1, 300);
    yMax = Math.max(yMax * 0.997, curQ * 1.15, 60);
    var rH = panelH * 0.32;
    ctx.fillStyle = rgba(colors.rain, 0.75);
    for (i = 0; i < NB; i++) {
      if (rBins[i] <= 0) continue;
      var h = (rBins[i] / rMax) * rH;
      ctx.fillRect(x0p + i * bw, panelTop + 1, Math.max(1, bw - 0.6), h);
    }
    var base = panelTop + panelH - 1, qH = panelH * 0.62;
    for (i = 0; i < NB; i++) {
      var sum = 0, cnt = 0;
      for (var k2 = -3; k2 <= 3; k2++) { var ii = i + k2; if (ii >= 0 && ii < NB) { sum += qBins[ii]; cnt++; } }
      qSm[i] = sum / cnt;
    }
    ctx.beginPath();
    ctx.moveTo(x0p, base);
    for (i = 0; i < NB; i++) ctx.lineTo(x0p + (i + 0.5) * bw, base - (qSm[i] / yMax) * qH);
    ctx.lineTo(x1p, base);
    ctx.closePath();
    ctx.fillStyle = rgba(colors.accent, 0.13);
    ctx.fill();
    ctx.beginPath();
    for (i = 0; i < NB; i++) {
      var yq = base - (qSm[i] / yMax) * qH;
      if (i === 0) ctx.moveTo(x0p + 0.5 * bw, yq); else ctx.lineTo(x0p + (i + 0.5) * bw, yq);
    }
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  /* ---------- loop, controls, visibility ---------- */
  var running = false, wantRun = !reduce, visible = true, last = 0, raf = 0;
  function frame(now) {
    raf = 0;
    if (!running) return;
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    step(dt);
    draw();
    raf = requestAnimationFrame(frame);
  }
  function sync() {
    var should = wantRun && visible && !document.hidden;
    if (should && !running) {
      running = true; last = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
    } else if (!should && running) {
      running = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    if (fig) fig.classList.toggle("is-paused", !wantRun);
    if (ctl) {
      ctl.setAttribute("aria-pressed", String(!wantRun));
      var lab = ctl.querySelector("[data-label]");
      if (lab) lab.textContent = wantRun ? "Pause" : "Play";
    }
  }

  function prefill(seconds) {
    var steps = Math.round(seconds * 30);
    for (var i = 0; i < steps; i++) step(1 / 30);
  }

  canvas.addEventListener("click", function (e) {
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left, my = e.clientY - rect.top;
    var gx = Math.floor((mx - bx) / cs) + minX, gy = Math.floor((my - by) / cs) + minY;
    if (gx < 0 || gy < 0 || gx >= NX || gy >= NY || !inside[gy * NX + gx]) return;
    addStorm({ t0: T, dur: 2.2, peak: 700, cx: gx, cy: gy, rad: 7 });
    ripples.push({ x: mx, y: my, t: T });
    if (!wantRun) { wantRun = true; sync(); }
  });
  if (ctl) ctl.addEventListener("click", function () { wantRun = !wantRun; sync(); });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; sync(); }, { threshold: 0.05 }).observe(canvas);
  }
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("themechange", function () { readColors(); drawTerrain(); draw(); });

  readColors();
  function init() {
    if (!layout()) return;
    if (reduce) prefill(9);
    else prefill(4);
    draw();
    sync();
  }
  if ("ResizeObserver" in window) {
    var first = true;
    new ResizeObserver(function () {
      if (first) { first = false; init(); return; }
      if (layout()) draw();
    }).observe(canvas);
  } else {
    init();
    window.addEventListener("resize", function () { if (layout()) draw(); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { drawTerrain(); draw(); });
})();
