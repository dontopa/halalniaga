/**
 * Audit the Malay translation layer.
 *
 * 1. Every literal t('...') call in src must have a dictionary entry.
 * 2. Every data dictionary key must match a string in the content/seed files
 *    (catches typos that would silently fall back to English).
 *
 * Run: node scripts/check-i18n.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const srcDir = join(root, 'src');
const dictDir = join(srcDir, 'i18n', 'dictionaries');

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const sourceFiles = walk(srcDir).filter(
  (file) =>
    /\.(ts|tsx)$/.test(file) &&
    !file.startsWith(dictDir) &&
    !file.endsWith('src/i18n/messages.ts'),
);

const literalKeys = new Map(); // key -> [file:line]
const dynamicCalls = [];

const visit = (node, file, sf) => {
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 't') {
    const [first] = node.arguments;
    if (first && (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first))) {
      const key = first.text;
      const pos = sf.getLineAndCharacterOfPosition(node.getStart(sf));
      if (!literalKeys.has(key)) literalKeys.set(key, []);
      literalKeys.get(key).push(`${relative(root, file)}:${pos.line + 1}`);
    } else if (first) {
      dynamicCalls.push(`${relative(root, file)}:${first.getText(sf)}`);
    }
  }
  ts.forEachChild(node, (child) => visit(child, file, sf));
};

for (const file of sourceFiles) {
  const sf = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  visit(sf, file, sf);
}

const dictKeys = new Set();
for (const file of walk(dictDir)) {
  const sf = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const collect = (node) => {
    if (ts.isVariableDeclaration(node) && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
      for (const prop of node.initializer.properties) {
        if (ts.isPropertyAssignment(prop) && (ts.isStringLiteral(prop.name) || ts.isIdentifier(prop.name))) {
          dictKeys.add(prop.name.text);
        }
      }
    }
    ts.forEachChild(node, collect);
  };
  collect(sf);
}

console.log(`Source t() literal keys: ${literalKeys.size}`);
console.log(`Dictionary keys:          ${dictKeys.size}`);
console.log(`Dynamic t() calls:        ${dynamicCalls.length}`);

const missing = [...literalKeys.entries()].filter(([key]) => !dictKeys.has(key));
if (missing.length) {
  console.log(`\nMISSING dictionary entries (${missing.length}):`);
  for (const [key, places] of missing.sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  - ${JSON.stringify(key)}  (${places[0]})`);
  }
} else {
  console.log('\nOK: every literal t() key has a translation.');
}

/* ------------------------------------------------------------------ */
/* Data keys must exist in the content sources they translate.         */
/* ------------------------------------------------------------------ */

const stringsFromTs = (file) => {
  const sf = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const out = new Set();
  const collect = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      out.add(node.text);
    }
    ts.forEachChild(node, collect);
  };
  collect(sf);
  return out;
};

const stringsFromJson = (file) => {
  const value = JSON.parse(readFileSync(file, 'utf8'));
  const out = new Set();
  const collect = (node) => {
    if (typeof node === 'string') out.add(node);
    else if (Array.isArray(node)) node.forEach(collect);
    else if (node && typeof node === 'object') Object.values(node).forEach(collect);
  };
  collect(value);
  return out;
};

const dataSources = new Set([
  ...stringsFromJson(join(srcDir, 'content', 'site.json')),
  ...stringsFromJson(join(srcDir, 'content', 'vendor.json')),
  ...stringsFromJson(join(srcDir, 'content', 'suppliers.json')),
  ...stringsFromJson(join(srcDir, 'content', 'products.json')),
  ...stringsFromTs(join(srcDir, 'domain', 'seed.ts')),
  ...stringsFromTs(join(srcDir, 'domain', 'store.tsx')),
]);

const dataDict = ts.createSourceFile(
  join(dictDir, 'data.ts'),
  readFileSync(join(dictDir, 'data.ts'), 'utf8'),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS,
);
const orphanDataKeys = [];
const collectData = (node) => {
  if (ts.isVariableDeclaration(node) && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
    for (const prop of node.initializer.properties) {
      if (ts.isPropertyAssignment(prop) && (ts.isStringLiteral(prop.name) || ts.isIdentifier(prop.name))) {
        const key = prop.name.text;
        if (!dataSources.has(key)) orphanDataKeys.push(key);
      }
    }
  }
  ts.forEachChild(node, collectData);
};
collectData(dataDict);

if (orphanDataKeys.length) {
  console.log(`\nDATA keys with no matching source string (${orphanDataKeys.length}):`);
  for (const key of orphanDataKeys) console.log(`  - ${JSON.stringify(key)}`);
} else {
  console.log('OK: every data dictionary key matches a content/seed string.');
}

if (missing.length || orphanDataKeys.length) process.exitCode = 1;
