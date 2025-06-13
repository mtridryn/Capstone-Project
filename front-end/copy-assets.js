import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to copy directory recursively
function copyDir(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  }
}

// Copy public assets to dist
console.log('📁 Copying public assets to dist...');

const publicDir = join(__dirname, 'public');
const distDir = join(__dirname, 'dist');

if (existsSync(publicDir)) {
  copyDir(publicDir, distDir);
  console.log('✅ Public assets copied successfully!');
} else {
  console.log('❌ Public directory not found!');
}

// List copied files
console.log('\n📋 Files in dist:');
function listFiles(dir, prefix = '') {
  if (!existsSync(dir)) return;
  
  const entries = readdirSync(dir, { withFileTypes: true });
  for (let entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      console.log(`${prefix}📁 ${entry.name}/`);
      listFiles(fullPath, prefix + '  ');
    } else {
      console.log(`${prefix}📄 ${entry.name}`);
    }
  }
}

listFiles(distDir);
