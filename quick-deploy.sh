#!/bin/bash

echo "========================================="
echo "校研会活动管理系统 - 快速部署"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}请不要使用root用户运行此脚本${NC}"
    echo "建议创建普通用户并使用sudo"
    exit 1
fi

# 获取当前目录
PROJECT_DIR=$(pwd)

echo -e "${GREEN}[1/5] 检查环境...${NC}"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js 未安装${NC}"
    echo "请先运行 deploy-aliyun.sh 安装环境"
    exit 1
fi

# 检查MongoDB
if ! command -v mongod &> /dev/null; then
    echo -e "${RED}错误: MongoDB 未安装${NC}"
    echo "请先运行 deploy-aliyun.sh 安装环境"
    exit 1
fi

# 检查PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}安装 PM2...${NC}"
    sudo npm install -g pm2
fi

echo -e "${GREEN}Node.js: $(node -v)${NC}"
echo -e "${GREEN}npm: $(npm -v)${NC}"
echo -e "${GREEN}PM2: $(pm2 -v)${NC}"

echo ""
echo -e "${GREEN}[2/5] 配置环境变量...${NC}"
echo ""

# 检查.env文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}.env 文件不存在，从模板创建...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}请编辑 .env 文件配置环境变量${NC}"
        echo -e "${YELLOW}至少需要修改: JWT_SECRET, CLIENT_URL${NC}"
        read -p "按回车继续（确认已配置 .env）..."
    else
        echo -e "${RED}错误: .env.example 不存在${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}.env 文件已存在${NC}"
fi

echo ""
echo -e "${GREEN}[3/5] 安装依赖...${NC}"
echo ""

# 安装依赖
npm run install-all

if [ $? -ne 0 ]; then
    echo -e "${RED}依赖安装失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}[4/5] 初始化数据库和构建前端...${NC}"
echo ""

# 初始化数据库
read -p "是否初始化数据库（会清空现有数据）? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run seed
fi

# 构建前端
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}前端构建失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}[5/5] 启动应用...${NC}"
echo ""

# 创建日志目录
mkdir -p logs

# 使用PM2启动
pm2 stop act-record 2>/dev/null
pm2 delete act-record 2>/dev/null
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置PM2开机自启
pm2 startup | grep -v PM2 | bash

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "应用状态: ${GREEN}$(pm2 list | grep act-record)${NC}"
echo ""
echo -e "${YELLOW}下一步操作：${NC}"
echo "1. 配置 Nginx 反向代理（参考 DEPLOY.md）"
echo "2. 访问 http://你的服务器IP"
echo ""
echo -e "${YELLOW}常用命令：${NC}"
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs act-record"
echo "  重启应用: pm2 restart act-record"
echo "  停止应用: pm2 stop act-record"
echo ""
