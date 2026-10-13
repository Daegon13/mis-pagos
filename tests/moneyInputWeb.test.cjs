const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { TextInput } = require('react-native-web');
const { load } = require('./helpers/load.cjs');

function propsFor(platform) {
  const code = ts.transpileModule(fs.readFileSync('src/features/financial-profile/moneyInput.ts', 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  new Function('require', 'exports', code)(name => {
    assert.equal(name, 'react-native');
    return { Platform: { OS: platform } };
  }, exports);
  return exports;
}

test('web money input stays a text field with decimal keyboard hint; native keeps decimal pad', () => {
  const web = propsFor('web');
  const native = propsFor('android');
  assert.deepEqual(web.moneyInputProps, { inputMode: 'decimal' });
  assert.deepEqual(web.percentInputProps, { inputMode: 'numeric' });
  assert.deepEqual(native.moneyInputProps, { keyboardType: 'decimal-pad' });
  const markup = renderToStaticMarkup(React.createElement(TextInput,
    { ...web.moneyInputProps, value: '1.234,56', onChangeText: () => {} }));
  assert.match(markup, /type="text"/);
  assert.match(markup, /inputMode="decimal"/i);
  assert.match(markup, /value="1\.234,56"/);
});

test('typed and pasted monetary formats retain exact minor units', () => {
  const { parseBalanceMinor } = load('src/features/financial-profile/money.ts');
  for (const [text, expected] of [
    ['1234', 123400], ['1234,56', 123456], ['1234.56', 123456],
    ['1.234,56', 123456], ['1,234.56', 123456], ['-500,20', -50020],
  ]) assert.equal(parseBalanceMinor(text), expected, text);
});
