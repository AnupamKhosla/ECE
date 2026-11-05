/* Runs in <head>, before CSS: no system-theme override and no theme flash. */
(function () {
  'use strict';
  var root = document.documentElement;
  function parse(value) {
    try { return JSON.parse(value) === 'dark' ? 'dark' : 'light'; }
    catch (e) { return 'light'; }
  }
  var mode = 'light';
  try { mode = parse(localStorage.getItem('ece-theme')); } catch (e) {}
  root.setAttribute('data-theme', mode);

  function refresh() {
    document.querySelectorAll('.theme-switch button').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
    });
  }
  function apply(value, save) {
    mode = value === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', mode);
    if (save) { try { localStorage.setItem('ece-theme', JSON.stringify(mode)); } catch (e) {} }
    refresh();
  }
  function createSwitch() {
    var group = document.createElement('div');
    group.className = 'theme-switch';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'Colour theme');
    [['light', '☀ Light'], ['dark', '☾ Dark']].forEach(function (choice) {
      var button = document.createElement('button');
      button.type = 'button';
      button.dataset.mode = choice[0];
      button.textContent = choice[1];
      button.setAttribute('aria-pressed', String(choice[0] === mode));
      button.onclick = function () { apply(choice[0], true); };
      group.appendChild(button);
    });
    return group;
  }
  window.ECETheme = { get: function () { return mode; }, set: function (value) { apply(value, true); }, createSwitch: createSwitch, refresh: refresh };
  window.addEventListener('storage', function (event) {
    if (event.key === 'ece-theme' || event.key === null) apply(parse(event.newValue), false);
  });
  document.addEventListener('DOMContentLoaded', function () {
    var toolbar = document.querySelector('body[data-standalone-lesson] .toolbar');
    if (toolbar) toolbar.prepend(createSwitch());
  });
})();
