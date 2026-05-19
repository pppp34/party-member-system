/**
 * 阿里云 OSS 部署脚本
 * 用于将党员管理系统部署到阿里云 OSS
 */

const OSS = require('ali-oss');
const fs = require('fs');
const path = require('path');

// 阿里云 OSS 配置
const client = new OSS({
  region: 'oss-cn-shanghai',
  accessKeyId: 'LTAI5t6BipFkjnMQ5aLjhSia',
  accessKeySecret: 'rm0ul2Ikgms0ReQF5pZzVO73J9JQvu',
  bucket: 'party-member-system'
});

const localDir = path.join(__dirname);

// 上传文件到 OSS
async function putObject(ossPath, localPath) {
  try {
    await client.put(ossPath, localPath);
    console.log(`✅ 上传成功: ${ossPath}`);
    return true;
  } catch (err) {
    console.error(`❌ 上传失败: ${ossPath}`, err.message);
    return false;
  }
}

// 递归上传目录
async function uploadDir(dir, prefix = '') {
  const files = fs.readdirSync(dir);
  let success = 0;
  let failed = 0;

  for (const file of files) {
    const localPath = path.join(dir, file);
    const stat = fs.statSync(localPath);
    const ossPath = prefix ? `${prefix}/${file}` : file;

    if (stat.isDirectory()) {
      const result = await uploadDir(localPath, ossPath);
      success += result.success;
      failed += result.failed;
    } else {
      // 跳过 .git 和 node_modules
      if (!file.includes('.git') && !file.includes('node_modules') && !file.includes('.json')) {
        const result = await putObject(ossPath, localPath);
        if (result) success++;
        else failed++;
      }
    }
  }

  return { success, failed };
}

// 设置静态网站托管
async function setupStaticWebsite() {
  try {
    await client.putBucketWebsite('party-member-system', {
      index: 'index.html',
      error: 'index.html'
    });
    console.log('✅ 静态网站托管配置成功');
  } catch (err) {
    if (err.code === 'BucketAlreadyOwnedByYou') {
      console.log('ℹ️ 静态网站托管已配置');
    } else {
      console.error('❌ 静态网站托管配置失败:', err.message);
    }
  }
}

// 设置存储桶公共读权限
async function setupBucketACL() {
  try {
    await client.putBucketACL('party-member-system', 'public-read');
    console.log('✅ 存储桶公共读权限设置成功');
  } catch (err) {
    if (err.code === 'BucketAlreadyOwnedByYou') {
      console.log('ℹ️ 存储桶权限已配置');
    } else {
      console.error('❌ 存储桶权限设置失败:', err.message);
    }
  }
}

// 设置 CORS（跨域访问）
async function setupCORS() {
  try {
    await client.putBucketCORS('party-member-system', [
      {
        allowedOrigin: '*',
        allowedMethod: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
        allowedHeader: ['*'],
        exposeHeader: ['ETag'],
        maxAgeSeconds: '3600'
      }
    ]);
    console.log('✅ CORS 配置成功');
  } catch (err) {
    if (err.code === 'BucketAlreadyOwnedByYou') {
      console.log('ℹ️ CORS 已配置');
    } else {
      console.error('❌ CORS 配置失败:', err.message);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始部署党员管理系统到阿里云 OSS...\n');

  try {
    // 上传所有文件
    console.log('📤 上传文件...');
    const result = await uploadDir(localDir);
    console.log(`\n📊 上传统计: 成功 ${result.success} 个, 失败 ${result.failed} 个`);

    // 配置静态网站
    console.log('\n🌐 配置静态网站托管...');
    await setupStaticWebsite();

    // 配置存储桶权限
    console.log('\n🔓 配置存储桶公共读权限...');
    await setupBucketACL();

    // 配置 CORS
    console.log('\n🔒 配置跨域访问...');
    await setupCORS();

    console.log('\n========================================');
    console.log('🎉 部署完成！');
    console.log('========================================');
    console.log('\n访问地址:');
    console.log('https://party-member-system.oss-cn-shanghai.aliyuncs.com');
    console.log('\n或使用自定义域名（如已绑定）');

  } catch (err) {
    console.error('\n❌ 部署失败:', err);
  }
}

main();
