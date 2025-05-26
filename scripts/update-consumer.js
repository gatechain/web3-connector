import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置使用方项目路径，这里假设是相对于当前项目的上级目录的 webfront
const CONSUMER_PROJECT_PATH = path.resolve(__dirname, '../../web3-connector-test');

function updateConsumerPackage() {
  const packagePath = path.resolve(CONSUMER_PROJECT_PATH, 'node_modules/web3-connector-v4');

  // 确保目标目录存在
  if (!fs.existsSync(packagePath)) {
    console.log('Consumer package directory not found:', packagePath);
    return;
  }

  // 确保目标 dist 目录存在
  const targetDistDir = path.resolve(packagePath, 'dist');
  if (!fs.existsSync(targetDistDir)) {
    fs.mkdirSync(targetDistDir, { recursive: true });
  }

  // 复制构建文件到使用方的 node_modules
  const sourceDir = path.resolve(__dirname, '../dist');

  // 使用 -f 强制复制，即使文件相同
  exec(`cp -Rf ${sourceDir}/* ${targetDistDir}/`, (error, stdout, stderr) => {
    if (error && error.code !== 1) {
      // 忽略状态码 1 的错误（文件相同的情况）
      console.error('Error copying files:', error);
      return;
    }
    if (stderr && !stderr.includes('are identical')) {
      console.error('Error output:', stderr);
      return;
    }
    console.log('Successfully updated consumer package');
  });
}

// 执行更新
updateConsumerPackage();
