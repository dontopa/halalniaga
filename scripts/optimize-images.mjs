import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const dir = 'public/images';
const files = (await readdir(dir)).filter((file) => file.endsWith('.jpg'));

for (const file of files) {
  const input = path.join(dir, file);
  const output = path.join(dir, file.replace(/\.jpg$/, '.webp'));
  await sharp(input)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toFile(output);
  const before = (await stat(input)).size;
  const after = (await stat(output)).size;
  await unlink(input);
  console.log(
    `${file} -> ${path.basename(output)} (${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB)`,
  );
}
