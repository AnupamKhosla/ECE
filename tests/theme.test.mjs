import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fs.readFileSync(new URL('../tutorial/assets/theme.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../tutorial/assets/theme.css', import.meta.url), 'utf8');

function boot(saved, blocked = false) {
  const attrs = {}, listeners = {}, buttons = [];
  let stored = saved;
  const context = {
    document: {
      documentElement: { setAttribute: (key, value) => { attrs[key] = value; } },
      querySelectorAll: () => buttons,
      querySelector: () => null,
      addEventListener() {},
      createElement(tag) {
        const node = { dataset: {}, attributes: {}, children: [],
          setAttribute(key, value) { this.attributes[key] = value; },
          appendChild(child) { this.children.push(child); } };
        if (tag === 'button') buttons.push(node);
        return node;
      }
    },
    window: { addEventListener: (event, fn) => { listeners[event] = fn; } },
    // A dark OS preference must not choose the initial theme.
    matchMedia: () => ({ matches: true }),
    localStorage: {
      getItem() { if (blocked) throw Error('Storage unavailable'); return stored; },
      setItem(key, value) { if (blocked) throw Error('Storage unavailable'); stored = value; }
    }
  };
  vm.runInNewContext(script, context);
  return { api: context.window.ECETheme, attrs, listeners, buttons, saved: () => stored };
}

test('light is the default under a dark OS, including legacy and invalid settings', () => {
  for (const saved of [null, '"auto"', 'null', '"unknown"', '{invalid', '"light"']) {
    assert.equal(boot(saved).attrs['data-theme'], 'light', String(saved));
  }
  assert.equal(boot('"dark"').attrs['data-theme'], 'dark');
});

test('explicit choice updates every switch and survives a new page', () => {
  const page = boot(null);
  page.api.createSwitch(); page.api.createSwitch();
  assert.equal(page.buttons.length, 4);
  page.buttons[1].onclick();
  assert.equal(page.attrs['data-theme'], 'dark');
  assert.deepEqual(page.buttons.map(b => b.attributes['aria-pressed']), ['false', 'true', 'false', 'true']);
  assert.equal(boot(page.saved()).api.get(), 'dark');
  page.buttons[0].onclick();
  assert.equal(boot(page.saved()).api.get(), 'light');
});

test('blocked storage still allows switching; tab changes and reset synchronise', () => {
  const page = boot(null, true);
  page.api.set('dark'); assert.equal(page.api.get(), 'dark');
  page.listeners.storage({ key: 'ece-theme', newValue: '"light"' });
  assert.equal(page.api.get(), 'light');
  page.listeners.storage({ key: 'ece-theme', newValue: '"dark"' });
  assert.equal(page.api.get(), 'dark');
  page.listeners.storage({ key: null, newValue: null });
  assert.equal(page.api.get(), 'light');
});

function tokens(selector) {
  const block = css.slice(css.indexOf(selector) + selector.length).split('}')[0];
  return Object.fromEntries([...block.matchAll(/--([\w-]+):([^;]+);/g)].map(m => [m[1], m[2].trim()]));
}
function resolve(palette, name) {
  const value = palette[name];
  return value.startsWith('var(') ? resolve(palette, value.slice(6, -1)) : value;
}
function luminance(hex) {
  let s = hex.slice(1);
  if (s.length === 3) s = [...s].map(c => c + c).join('');
  const channels = s.match(/../g).map(c => parseInt(c, 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
function contrast(a, b) {
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high + .05) / (low + .05);
}
for (const mode of ['light', 'dark']) {
  test(`${mode} palette meets reading, label, button and control contrast targets`, () => {
    const p = { ...tokens(':root{'), ...(mode === 'dark' ? tokens(':root[data-theme="dark"]{') : {}) };
    const check = (fg, bg, min) => {
      const ratio = contrast(resolve(p, fg), resolve(p, bg));
      assert.ok(ratio >= min, `${mode} ${fg} on ${bg}: ${ratio.toFixed(2)} < ${min}`);
    };
    for (const bg of ['bg', 'panel', 'wash', 'code']) {
      check('ink', bg, 7); check('muted', bg, 4.5); check('focus', bg, 3);
      for (const accent of ['practice', 'theory', 'career', 'ref', 'warn', 'tip']) check(accent, bg, 4.5);
    }
    for (const accent of ['practice', 'theory', 'career', 'ref', 'warn', 'tip']) {
      check(accent, accent + '-soft', 4.5); check('muted', accent + '-soft', 4.5);
      check('on-accent', accent, 4.5);
    }
    for (const bg of ['bg', 'panel']) check('control-border', bg, 3);
    check('on-success', 'success', 4.5); check('on-new', 'new', 4.5);
  });
}

test('every styled HTML page loads the theme bootstrap before its stylesheet', () => {
  function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
  }
  const files = walk(fileURLToPath(new URL('../tutorial', import.meta.url))).filter(f => f.endsWith('.html'));
  let checked = 0;
  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const stylesheet = html.indexOf('assets/style.css');
    if (stylesheet < 0) continue;
    assert.ok(html.indexOf('assets/theme.js') > 0 && html.indexOf('assets/theme.js') < stylesheet, file);
    checked++;
  }
  assert.ok(checked >= 77);
  for (const file of ['../semiconductor-explained.html', '../tutorial/theory/pn-junction-deep-dive.html']) {
    const html = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.ok(html.indexOf('assets/theme.js') < html.indexOf('<style>'), file);
    assert.ok(html.includes('data-standalone-lesson') && html.includes('assets/legacy-theme.css'), file);
  }
  assert.ok(!css.includes('prefers-color-scheme'));
});
