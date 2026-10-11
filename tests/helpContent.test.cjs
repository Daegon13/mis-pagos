const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { load } = require('./helpers/load.cjs');

const { HELP_CATEGORIES, HELP_TOPICS, CONTEXTUAL_TOPIC_IDS, getHelpTopic } =
  load('src/features/help/helpContent.ts');

test('help topics have unique stable IDs and every category has content', () => {
  const ids = HELP_TOPICS.map(topic => topic.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(HELP_CATEGORIES.map(category => category.id),
    ['money', 'planning', 'movements', 'space', 'discoveries']);
  for (const category of HELP_CATEGORIES) {
    assert.ok(HELP_TOPICS.some(topic => topic.category === category.id));
  }
  for (const topic of HELP_TOPICS) {
    assert.ok(topic.shortDescription && topic.body);
    assert.ok(HELP_CATEGORIES.some(category => category.id === topic.category));
    for (const relatedId of topic.relatedTopicIds ?? []) assert.ok(getHelpTopic(relatedId));
  }
});

test('required glossary terms and core explanations are available', () => {
  const terms = new Set(HELP_TOPICS.filter(topic => topic.glossaryDefinition)
    .map(topic => topic.glossaryTitle ?? topic.title));
  for (const term of ['Saldo actual', 'Comprometido', 'Disponible real', 'Proyección',
    'Ingreso esperado', 'Movimiento', 'Gasto', 'Ingreso', 'Pendiente', 'Vencido',
    'Completado', 'Cancelado', 'Reserva objetivo', 'Libre para usar',
    'Ritmo de referencia', 'Asignación', 'Tu espacio', 'Tema', 'Intereses',
    'Atmósfera', 'Descubrimiento']) assert.ok(terms.has(term), term);
  for (const id of ['available-real', 'projection', 'reserve', 'free-to-use', 'pace',
    'allocations', 'spending-simulation', 'balance-reconciliation', 'space', 'discoveries'])
    assert.ok(getHelpTopic(id), id);
});

test('contextual links resolve and registry stays independent of financial writes', () => {
  for (const id of CONTEXTUAL_TOPIC_IDS) assert.ok(getHelpTopic(id), id);
  const source = fs.readFileSync('src/features/help/helpContent.ts', 'utf8');
  assert.doesNotMatch(source, /\b(?:from|require)\s*\(?\s*['"][^'"]*(?:repositories|paymentLifecycle|spendingPlan|database|sqlite)[^'"]*['"]/i);
});

test('help text colors meet readable contrast in every current theme', () => {
  const { THEMES } = load('src/domain/personalization.ts');
  const { themeFor } = load('src/features/personalization/themes.ts');
  const luminance = hex => {
    const channels = hex.slice(1).match(/../g).map(value => Number.parseInt(value, 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const contrast = (first, second) => {
    const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };
  for (const { id, label } of THEMES) {
    const theme = themeFor(id);
    for (const [foreground, background] of [
      ['textPrimary', 'background'], ['textSecondary', 'background'],
      ['textPrimary', 'surface'], ['textSecondary', 'surface'],
      ['primary', 'background'], ['primary', 'surface'], ['primary', 'primarySurface'],
      ['textOnPrimary', 'primary'],
    ]) assert.ok(contrast(theme[foreground], theme[background]) >= 4.5,
      `${label}: ${foreground} on ${background}`);
  }
});
