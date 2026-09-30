const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function load(file) {
  const exports = {};
  new Function('exports', 'require', ts.transpileModule(fs.readFileSync(file, 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(exports, name => {
    if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`);
    if (name.startsWith('.')) return load(path.join(path.dirname(file), `${name}.ts`));
    return require(name);
  });
  return exports;
}
module.exports = { load };
