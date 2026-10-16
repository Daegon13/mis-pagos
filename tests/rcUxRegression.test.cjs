const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { load } = require('./helpers/load.cjs');

const source = path => fs.readFileSync(path, 'utf8');
const { hsvToHex, hexToHsv } = load('src/features/space/colorPicker.ts');

test('visual colors roundtrip through hexadecimal and reject malformed input', () => {
  for (const color of ['#D8A2B4', '#8D6FAA', '#000000', '#FFFFFF', '#123456']) {
    assert.equal(hsvToHex(hexToHsv(color)), color);
  }
  assert.equal(hsvToHex({ hue: 0, saturation: 1, value: 1 }), '#FF0000');
  assert.equal(hsvToHex({ hue: 120, saturation: 1, value: 1 }), '#00FF00');
  assert.equal(hexToHsv('#12345'), null);
  assert.equal(hexToHsv('not-a-color'), null);
});

test('beta feedback has Home and Help entries and a retained route', () => {
  assert.match(source('src/features/home/Home.tsx'), /Ayudanos a mejorar Mis Pagos/);
  assert.match(source('src/features/home/Home.tsx'), /onBetaFeedback/);
  assert.match(source('src/app/index.tsx'), /router\.push\("\/help\/beta-feedback"\)/);
  assert.match(source('src/features/help/HelpScreen.tsx'), /Ayudanos a decidir/);
  assert.match(source('src/features/help/HelpScreen.tsx'), /router\.push\("\/help\/beta-feedback"/);
  assert.match(source('src/app/help/beta-feedback.tsx'), /BetaFeedbackScreen/);
});

test('notifications and Tu espacio keep visible navigation with fallbacks', () => {
  assert.match(source('src/app/index.tsx'), />Notificaciones<\/Text>/);
  assert.match(source('src/app/index.tsx'), /router\.push\("\/notifications"/);
  assert.match(source('src/app/notifications.tsx'), /NotificationSettingsScreen/);
  assert.match(source('src/app/space.tsx'), /router\.canGoBack\(\) \? router\.back\(\) : router\.replace\("\/"\)/);
  assert.match(source('src/app/personalize.tsx'), /router\.canGoBack\(\) \? router\.back\(\) : router\.replace\("\/space"\)/);
});

test('Home financial sections retain the approved polish surfaces', () => {
  const home = source('src/features/home/Home.tsx');
  assert.match(home, /<View style={styles.hero}>[\s\S]*?Disponible real/);
  assert.match(home, /<View style={styles.projection}>[\s\S]*?Ingresos previstos/);
  assert.match(home, /<View style=\{\[styles.section, styles.card\]\}>[\s\S]*?Tu plan del mes/);
  assert.match(home, /<View style=\{\[styles.section, styles.card\]\}>[\s\S]*?Próximos movimientos/);
  assert.match(home, /\{interpretation && <View style=\{\[styles.section, styles.card\]\}>/);
});
