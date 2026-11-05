/* Local learning models only. These controls do not connect to instruments. */
(function () {
  'use strict';
  function byId(id) { return document.getElementById(id); }
  function write(id, value) { byId(id).textContent = value; }
  function observe(ids, update) {
    ids.forEach(function (id) { byId(id).addEventListener('input', update); });
    update();
  }

  if (byId('bridge-trainer')) {
    function bridge() {
      var fault = byId('bridge-fault').value;
      var start = byId('bridge-red').value, end = byId('bridge-black').value;
      var names = { A: 'A (~1)', B: 'B (~2)', P: '+', N: '−' };
      var edges = [
        ['A', 'P', 1, 'D1'], ['B', 'P', 1, 'D2'],
        ['N', 'A', 1, 'D3'], ['N', 'B', 1, 'D4']
      ];
      if (fault === 'open') edges = edges.filter(function (e) { return e[3] !== 'D1'; });
      if (fault === 'short') {
        edges[0] = ['A', 'P', 0, 'D1 short'];
        edges.push(['P', 'A', 0, 'D1 short']);
      }
      var best = null;
      function walk(node, seen, drop, path) {
        if (node === end) {
          if (!best || drop < best.drop) best = { drop: drop, path: path };
          return;
        }
        edges.forEach(function (e) {
          if (e[0] === node && seen.indexOf(e[1]) < 0) {
            walk(e[1], seen.concat(e[1]), drop + e[2], path.concat(e[3]));
          }
        });
      }
      walk(start, [start], 0, []);
      write('bridge-reading', best ? (best.drop * 0.6).toFixed(2) + ' V' : 'OL');
      var explanation;
      if (start === end) explanation = 'Both probes are on the same node; this tests no junction.';
      else if (!best) explanation = 'No forward path from ' + names[start] + ' to ' + names[end] + ' in this model.';
      else explanation = 'Conducting path from ' + names[start] + ' to ' + names[end] + ': ' + best.path.join(' → ') + '. ' +
        (best.drop === 0 ? 'A short bypasses the junction.' : best.drop + ' forward junction(s) in the simulated path.');
      write('bridge-explanation', explanation);
    }
    observe(['bridge-fault', 'bridge-red', 'bridge-black'], bridge);
  }

  if (byId('igbt-loss')) {
    var lossIds = ['loss-current', 'loss-vce', 'loss-duty', 'loss-energy', 'loss-frequency'];
    observe(lossIds, function () {
      write('loss-duty-out', byId('loss-duty').value + '%');
      var valid = lossIds.every(function (id) {
        var input = byId(id);
        return input.value !== '' && input.validity.valid && Number.isFinite(+input.value);
      });
      if (!valid) {
        ['loss-conduction', 'loss-switching', 'loss-total'].forEach(function (id) { write(id, '—'); });
        return;
      }
      var conduction = +byId('loss-current').value * +byId('loss-vce').value * +byId('loss-duty').value / 100;
      // mJ × kHz = W.
      var switching = +byId('loss-energy').value * +byId('loss-frequency').value;
      write('loss-conduction', conduction.toFixed(1) + ' W');
      write('loss-switching', switching.toFixed(1) + ' W');
      write('loss-total', (conduction + switching).toFixed(1) + ' W');
    });
  }

  if (byId('pwm-model')) {
    observe(['pwm-frequency', 'pwm-duty'], function () {
      var frequency = +byId('pwm-frequency').value;
      var duty = +byId('pwm-duty').value / 100;
      var period = 1000 / frequency;
      write('pwm-frequency-out', frequency + ' kHz');
      write('pwm-duty-out', Math.round(duty * 100) + '%');
      write('pwm-period', period.toFixed(1) + ' µs');
      write('pwm-on', (period * duty).toFixed(1) + ' µs');
      write('pwm-off', (period * (1 - duty)).toFixed(1) + ' µs');
      var path = 'M10 90';
      for (var i = 0; i < 3; i++) {
        var x = 10 + 200 * i;
        path += ' V25 H' + (x + 200 * duty) + ' V90 H' + (x + 200);
      }
      byId('pwm-path').setAttribute('d', path);
    });
  }

  if (byId('job-sheet')) {
    var fields = byId('job-sheet').querySelectorAll('.job-field');
    function syncPrint() {
      fields.forEach(function (field) {
        var input = field.querySelector('.screen-field');
        field.querySelector('.print-value').textContent = input.value || ' ';
      });
    }
    byId('job-sheet').addEventListener('input', syncPrint);
    window.addEventListener('beforeprint', syncPrint);
    byId('print-job').addEventListener('click', function () { syncPrint(); window.print(); });
    syncPrint();
  }
})();
