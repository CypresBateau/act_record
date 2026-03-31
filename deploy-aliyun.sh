#!/bin/bash

echo "========================================="
echo "校研会活动管理系统 - 阿里云部署脚本"
echo "========================================="
echo ""

# 更新系统
echo "[1/8] 更新系统包..."
sudo apt update && sudo apt upgrade -y

# 安装Node.js 18.x
echo ""
echo "[2/8] 安装 Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
echo ""
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# 安装MongoDB
echo ""
echo "[3/8] 安装 MongoDB..."
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# 启动MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
echo "MongoDB status:"
sudo systemctl status mongod --no-pager

# 安装Git
echo ""
echo "[4/8] 安装 Git..."
sudo apt install -y git

# 安装PM2（进程管理器）
echo ""
echo "[5/8] 安装 PM2..."
sudo npm install -g pm2

# 克隆项目（需要先上传到GitHub/Gitee）
echo ""
echo "[6/8] 准备项目目录..."
echo "请手动上传项目文件到服务器，或使用 git clone"
echo "建议目录: /home/ubuntu/act_record"

# 创建项目目录
sudo mkdir -p /home/ubuntu/act_record
cd /home/ubuntu/act_record

echo ""
echo "[7/8] 项目配置提示..."
echo "1. 上传项目文件到 /home/ubuntu/act_record"
echo "2. 创建 .env 文件，配置环境变量"
echo "3. 运行 npm run install-all 安装依赖"
echo "4. 运行 npm run seed 初始化数据库"
echo "5. 运行 npm run build 构建前端"
echo "6. 使用 PM2 启动应用"

# 安装Nginx（可选，用于反向代理）
echo ""
echo "[8/8] 安装 Nginx..."
sudo apt install -y nginx

echo ""
echo "========================================="
echo "基础环境安装完成！"
echo "========================================="
echo ""
echo "下一步操作："
echo "1. 上传项目文件"
echo "2. 配置 .env 文件"
echo "3. 运行部署命令"
echo ""
