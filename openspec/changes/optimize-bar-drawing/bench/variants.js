// Each variant replaces BarElement.prototype.draw (or the ctx) in the page.
module.exports = {
  base: null,
  noopctx: `(() => { const real = chart.ctx; const noop = new Proxy(real, {get(t,k){ const v = t[k]; return typeof v === 'function' ? (()=>{}) : v; }, set(t,k,v){ return true; }});
    chart.getSortedVisibleDatasetMetas().forEach(m => { m.controller._ctx = noop; }); })()`,
  nosave: `(() => { const E = Chart.BarElement.prototype; const orig = E.draw;
    E.draw = function(ctx){ const s = ctx.save, r = ctx.restore; ctx.save = ctx.restore = () => {}; try { orig.call(this, ctx); } finally { delete ctx.save; delete ctx.restore; } }; })()`,
  batched: `(() => { const C = Chart.BarController.prototype;
    C.draw = function(){ const ctx = this._ctx; const els = this._cachedMeta.data; ctx.beginPath();
      for (const e of els) { const w = e.width, x = e.x - w/2, y = Math.min(e.y, e.base), h = Math.abs(e.base - e.y); ctx.rect(x, y, w, h); }
      ctx.fillStyle = els[0].options.backgroundColor; ctx.fill(); }; })()`
};
const geom = `
  const {x, y, base, width, height, horizontal, options: o, borderSkipped: sk} = this;
  const a = this.inflateAmount;
  let l, r, t, b;
  if (horizontal) { l = Math.min(x, base); r = Math.max(x, base); t = y - height / 2; b = y + height / 2; }
  else { l = x - width / 2; r = x + width / 2; t = Math.min(y, base); b = Math.max(y, base); }
  const w = r - l, h = b - t;
  const bwv = o.borderWidth;
  const bt = sk.top ? 0 : Math.min(Math.max(bwv, 0), h / 2), bb = sk.bottom ? 0 : Math.min(Math.max(bwv, 0), h / 2);
  const bl = sk.left ? 0 : Math.min(Math.max(bwv, 0), w / 2), br = sk.right ? 0 : Math.min(Math.max(bwv, 0), w / 2);
  const en = this.enableBorderRadius; const R = Math.min(w / 2, h / 2); const rv = Math.min(Math.max(o.borderRadius, 0), R);
  const tl = (!en || sk.top || sk.left) ? 0 : rv, tr = (!en || sk.top || sk.right) ? 0 : rv, blr = (!en || sk.bottom || sk.left) ? 0 : rv, brr = (!en || sk.bottom || sk.right) ? 0 : rv;
  const rounded = tl || tr || blr || brr;
  const path = (X, Y, W, H, r1, r2, r3, r4) => { if (rounded) Chart.helpers.addRoundedRectPath(ctx, {x: X, y: Y, w: W, h: H, radius: {topLeft: r1, topRight: r2, bottomLeft: r3, bottomRight: r4}}); else ctx.rect(X, Y, W, H); };
  const has = bt || bb || bl || br;
`;
module.exports.noclip = `(() => { Chart.BarElement.prototype.draw = function(ctx) { ${geom}
  const it = bt ? a : 0, ib = bb ? a : 0, il = bl ? a : 0, ir = br ? a : 0;
  const ix = l + bl, iy = t + bt, iw = w - bl - br, ih = h - bt - bb;
  const q1 = Math.max(0, tl - Math.max(bt, bl)), q2 = Math.max(0, tr - Math.max(bt, br)), q3 = Math.max(0, blr - Math.max(bb, bl)), q4 = Math.max(0, brr - Math.max(bb, br));
  if (has) {
    ctx.beginPath();
    path(l - il, t - it, w + il + ir, h + it + ib, tl, tr, blr, brr);
    path(ix + il, iy + it, iw - il - ir, ih - it - ib, q1, q2, q3, q4);
    ctx.fillStyle = o.borderColor; ctx.fill('evenodd');
    ctx.beginPath();
    path(ix - il, iy - it, iw + il + ir, ih + it + ib, q1, q2, q3, q4);
  } else {
    ctx.beginPath();
    path(ix - a, iy - a, iw + 2 * a, ih + 2 * a, q1, q2, q3, q4);
  }
  ctx.fillStyle = o.backgroundColor; ctx.fill();
}; })()`;
module.exports.fillrect = `(() => { Chart.BarElement.prototype.draw = function(ctx) { ${geom}
  if (has || rounded) throw new Error('fillrect only for plain bars');
  ctx.fillStyle = o.backgroundColor; ctx.fillRect(l - a, t - a, w + 2 * a, h + 2 * a);
}; })()`;
module.exports.noclipsave = module.exports.noclip.replace('Chart.BarElement.prototype.draw = function(ctx) {', 'const __d = function(ctx) {').replace(/\}; \}\)\(\)$/, '}; Chart.BarElement.prototype.draw = function(ctx){ ctx.save(); __d.call(this, ctx); ctx.restore(); }; })()');
module.exports.clipnosave = module.exports.noclip.replace("ctx.fillStyle = o.borderColor; ctx.fill('evenodd');", "ctx.fillStyle = o.borderColor; ctx.save(); ctx.beginPath(); path(l - il, t - it, w + il + ir, h + it + ib, tl, tr, blr, brr); ctx.clip(); ctx.beginPath(); path(l - il, t - it, w + il + ir, h + it + ib, tl, tr, blr, brr); path(ix + il, iy + it, iw - il - ir, ih - it - ib, q1, q2, q3, q4); ctx.fill('evenodd'); ctx.beginPath(); path(ix - il, iy - it, iw + il + ir, ih + it + ib, q1, q2, q3, q4); ctx.fillStyle = o.backgroundColor; ctx.fill(); ctx.restore(); return;");
module.exports.fillrectcache = module.exports.fillrect.replace("ctx.fillStyle = o.backgroundColor;", "if (ctx.__fs !== o.backgroundColor) { ctx.fillStyle = ctx.__fs = o.backgroundColor; }");
module.exports.noclipfr = module.exports.noclip.replace("ctx.beginPath();\n    path(ix - il, iy - it, iw + il + ir, ih + it + ib, q1, q2, q3, q4);\n  } else {", "if (!rounded) { ctx.fillStyle = o.backgroundColor; ctx.fillRect(ix - il, iy - it, iw + il + ir, ih + it + ib); return; }\n    ctx.beginPath();\n    path(ix - il, iy - it, iw + il + ir, ih + it + ib, q1, q2, q3, q4);\n  } else {");
