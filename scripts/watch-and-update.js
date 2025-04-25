import { watch } from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');

// 添加防抖，避免频繁更新
let timeout;
function debounce(func, wait) {
  clearTimeout(timeout);
  timeout = setTimeout(func, wait);
}

// 监听 dist 目录的变化
console.log('Watching for changes in dist directory...');
watch(DIST_DIR, { recursive: true }, (eventType, filename) => {
  console.log(`Detected change in dist/${filename}`);

  // 使用防抖，等待所有文件都构建完成
  debounce(() => {
    console.log('Updating consumer package...');
    exec('node scripts/update-consumer.js', (error, stdout, stderr) => {
      if (error) {
        console.error('Error updating consumer package:', error);
        return;
      }
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
    });
  }, 1000);
});
