import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imgDir = path.join(process.cwd(), 'public', 'imagenes');
const files = fs.readdirSync(imgDir).filter(f => f.endsWith('.png'));

for (const file of files) {
  const input = path.join(imgDir, file);
  const output = path.join(imgDir, file.replace('.png', '.webp'));

  if (fs.existsSync(output)) {
    console.log(`⏩ Skipping ${file} (webp already exists)`);
    continue;
  }

  const stats = fs.statSync(input);
  const sizeKB = (stats.size / 1024).toFixed(1);

  try {
    await sharp(input)
      .webp({ quality: 80 })
      .toFile(output);

    const newStats = fs.statSync(output);
    const newSizeKB = (newStats.size / 1024).toFixed(1);
    console.log(`✅ ${file} (${sizeKB}KB) → ${file.replace('.png', '.webp')} (${newSizeKB}KB) — ${((1 - newStats.size / stats.size) * 100).toFixed(0)}% smaller`);
  } catch (err) {
    console.error(`❌ Error converting ${file}:`, err.message);
  }
}

console.log('\nDone! All images converted to WebP.');
