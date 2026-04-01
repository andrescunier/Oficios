import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist/assets');
const MAX_ENTRY_BYTES = 220 * 1024;
const MAX_REACT_VENDOR_BYTES = 340 * 1024;

if (!fs.existsSync(DIST_DIR)) {
  console.error('dist/assets not found. Run build first.');
  process.exit(1);
}

const files = fs.readdirSync(DIST_DIR);

const findByPrefix = (prefix) => files.find((file) => file.startsWith(prefix) && file.endsWith('.js'));

const entryFile = findByPrefix('index-');
const reactVendorFile = findByPrefix('react-vendor-');

if (!entryFile || !reactVendorFile) {
  console.error('Required bundle chunks not found in dist/assets');
  process.exit(1);
}

const entrySize = fs.statSync(path.join(DIST_DIR, entryFile)).size;
const reactVendorSize = fs.statSync(path.join(DIST_DIR, reactVendorFile)).size;

if (entrySize > MAX_ENTRY_BYTES) {
  console.error(`Main entry chunk too large: ${entrySize} bytes > ${MAX_ENTRY_BYTES}`);
  process.exit(1);
}

if (reactVendorSize > MAX_REACT_VENDOR_BYTES) {
  console.error(`React vendor chunk too large: ${reactVendorSize} bytes > ${MAX_REACT_VENDOR_BYTES}`);
  process.exit(1);
}

console.log(`Bundle budget OK. entry=${entrySize} react-vendor=${reactVendorSize}`);
