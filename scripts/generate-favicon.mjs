import sharp from 'sharp';
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

async function generateFavicon() {
  const inputPath = join(rootDir, 'public/images/avatar-green.jpg');
  const outputDir = join(rootDir, 'public');
  
  const image = sharp(inputPath);
  
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = await Promise.all(
    sizes.map(size => 
      image.clone().resize(size, size, { fit: 'cover' }).png().toBuffer()
    )
  );
  
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * numImages;
  
  let dataOffset = headerSize + dirSize;
  const chunks = [];
  
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(numImages, 4);
  chunks.push(header);
  
  for (let i = 0; i < numImages; i++) {
    const size = sizes[i];
    const pngData = pngBuffers[i];
    
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(pngData.length, 8);
    entry.writeUInt32LE(dataOffset, 12);
    
    chunks.push(entry);
    dataOffset += pngData.length;
  }
  
  for (const pngData of pngBuffers) {
    chunks.push(pngData);
  }
  
  const icoBuffer = Buffer.concat(chunks);
  await writeFile(join(outputDir, 'favicon.ico'), icoBuffer);
  
  console.log('Favicon generated:', icoBuffer.length, 'bytes');
}

generateFavicon().catch(console.error);
