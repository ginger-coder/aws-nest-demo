#!/bin/bash
set -e

echo "====== 开始部署 Nest.js 应用到 AWS Lambda ======"

echo "移除.aws-sam目录"
rm -rf .aws-sam

echo "移除dist目录"
rm -rf dist

# 1. 构建 Nest.js 应用
echo "正在构建 Nest.js 应用..."
yarn run build

# 2. 构建 SAM 应用
echo "正在构建 SAM 应用..."
sam build

# 3. 部署 SAM 应用
echo "正在部署 SAM 应用..."
sam deploy --guided

echo "====== 部署完成 ======"