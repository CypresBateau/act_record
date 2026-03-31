# 阿里云服务器部署指南

## 一、申请阿里云学生服务器

### 1. 学生认证
1. 访问 https://developer.aliyun.com/plan/student
2. 点击"学生认证"
3. 上传学生证或学籍验证报告
4. 等待审核通过（1-3个工作日）

### 2. 购买服务器
- **推荐配置**：
  - CPU: 2核
  - 内存: 2GB
  - 带宽: 1-3Mbps
  - 系统: Ubuntu 22.04 LTS
  - 价格: 首月免费或 ¥9.5/月

### 3. 安全组配置
在阿里云控制台配置安全组规则，开放以下端口：
- **22** (SSH)
- **80** (HTTP)
- **443** (HTTPS，可选)
- **5000** (后端API，临时测试用)
- **27017** (MongoDB，仅限内网访问)

---

## 二、服务器环境配置

### 1. 连接到服务器
```bash
# Windows PowerShell 或 Mac/Linux Terminal
ssh root@你的服务器IP

# 首次连接需要输入密码（购买时设置的）
```

### 2. 创建普通用户（推荐）
```bash
# 创建用户
adduser ubuntu
usermod -aG sudo ubuntu

# 切换到新用户
su - ubuntu
```

### 3. 安装基础环境
```bash
# 下载部署脚本
wget https://raw.githubusercontent.com/你的仓库/deploy-aliyun.sh
# 或者手动创建 deploy-aliyun.sh 并粘贴脚本内容

# 添加执行权限
chmod +x deploy-aliyun.sh

# 运行脚本
./deploy-aliyun.sh
```

**或手动安装：**

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 安装 MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | \
  sudo gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# 4. 安装 Git 和 PM2
sudo apt install -y git
sudo npm install -g pm2

# 5. 安装 Nginx
sudo apt install -y nginx
```

---

## 三、部署项目

### 1. 上传项目文件

**方法A: 使用Git（推荐）**
```bash
# 先将项目推送到 GitHub 或 Gitee
# 然后在服务器上克隆
cd ~
git clone https://github.com/你的用户名/act_record.git
cd act_record
```

**方法B: 使用SCP上传**
```bash
# 在本地电脑上运行（Windows用PowerShell）
scp -r D:\01_work\act_record ubuntu@服务器IP:/home/ubuntu/
```

**方法C: 使用FTP工具**
- 下载 WinSCP 或 FileZilla
- 连接到服务器
- 上传整个项目文件夹

### 2. 配置环境变量

```bash
cd ~/act_record

# 创建 .env 文件
nano .env
```

粘贴以下内容（修改为实际值）：
```env
# MongoDB 配置
MONGODB_URI=mongodb://localhost:27017/student_union_archive

# JWT 密钥（随机生成一个复杂字符串）
JWT_SECRET=your_random_secret_key_here_change_this

# 服务器端口
PORT=5000
NODE_ENV=production

# 文件上传配置
UPLOAD_PATH=uploads
MAX_FILE_SIZE=10485760

# 前端URL（使用服务器IP或域名）
CLIENT_URL=http://你的服务器IP
```

保存并退出（Ctrl+X，然后Y，然后Enter）

### 3. 安装依赖并构建
```bash
# 安装所有依赖
npm run install-all

# 初始化数据库
npm run seed

# 构建前端
npm run build
```

### 4. 使用PM2启动应用

**创建 PM2 配置文件：**
```bash
nano ecosystem.config.js
```

粘贴以下内容：
```javascript
module.exports = {
  apps: [{
    name: 'act-record',
    script: 'server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
```

**启动应用：**
```bash
# 启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 设置开机自启
pm2 startup
pm2 save
```

---

## 四、配置Nginx反向代理

### 1. 创建Nginx配置
```bash
sudo nano /etc/nginx/sites-available/act-record
```

粘贴以下内容：
```nginx
server {
    listen 80;
    server_name 你的服务器IP;  # 或域名

    # 前端静态文件
    location / {
        root /home/ubuntu/act_record/client/build;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # API代理
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # 文件上传
    location /uploads {
        alias /home/ubuntu/act_record/uploads;
    }
}
```

### 2. 启用配置
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/act-record /etc/nginx/sites-enabled/

# 删除默认配置
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 设置开机自启
sudo systemctl enable nginx
```

---

## 五、访问应用

打开浏览器访问：
- **http://你的服务器IP**

默认管理员账号：
- 用户名: `admin`
- 密码: `admin123`

**重要：登录后立即修改默认密码！**

---

## 六、常用运维命令

### PM2 命令
```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs act-record

# 重启应用
pm2 restart act-record

# 停止应用
pm2 stop act-record

# 查看监控
pm2 monit
```

### MongoDB 命令
```bash
# 连接数据库
mongosh

# 查看数据库
show dbs

# 使用数据库
use student_union_archive

# 查看集合
show collections

# 退出
exit
```

### Nginx 命令
```bash
# 测试配置
sudo nginx -t

# 重启
sudo systemctl restart nginx

# 查看状态
sudo systemctl status nginx

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 查看访问日志
sudo tail -f /var/log/nginx/access.log
```

### 系统监控
```bash
# 查看CPU和内存使用
htop
# 或
top

# 查看磁盘使用
df -h

# 查看端口占用
sudo netstat -tulpn | grep LISTEN
```

---

## 七、数据备份

### 1. MongoDB备份
```bash
# 创建备份脚本
nano ~/backup.sh
```

内容：
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR

# 备份MongoDB
mongodump --db student_union_archive --out $BACKUP_DIR/mongo_$DATE

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz ~/act_record/uploads

# 删除7天前的备份
find $BACKUP_DIR -name "mongo_*" -mtime +7 -exec rm -rf {} \;
find $BACKUP_DIR -name "uploads_*" -mtime +7 -exec rm -f {} \;

echo "Backup completed: $DATE"
```

```bash
# 添加执行权限
chmod +x ~/backup.sh

# 设置定时任务（每天凌晨2点备份）
crontab -e
# 添加一行：
0 2 * * * /home/ubuntu/backup.sh >> /home/ubuntu/backup.log 2>&1
```

### 2. 恢复备份
```bash
# 恢复MongoDB
mongorestore --db student_union_archive /path/to/backup/student_union_archive

# 恢复上传文件
tar -xzf uploads_20240101_020000.tar.gz -C ~/act_record/
```

---

## 八、域名配置（可选）

### 1. 购买域名
- 在阿里云或其他域名注册商购买域名（如：xxxxx.com）

### 2. 配置DNS解析
在域名控制台添加A记录：
- 主机记录: `@` 或 `www`
- 记录类型: `A`
- 记录值: `你的服务器IP`
- TTL: `10分钟`

### 3. 更新Nginx配置
```bash
sudo nano /etc/nginx/sites-available/act-record
```

修改 `server_name`:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

重启Nginx:
```bash
sudo systemctl restart nginx
```

### 4. 配置HTTPS（推荐）
```bash
# 安装certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 测试自动续期
sudo certbot renew --dry-run
```

---

## 九、故障排查

### 应用无法访问
```bash
# 检查PM2状态
pm2 status

# 查看应用日志
pm2 logs act-record --lines 100

# 检查端口占用
sudo netstat -tulpn | grep 5000

# 检查防火墙
sudo ufw status
```

### MongoDB连接失败
```bash
# 检查MongoDB状态
sudo systemctl status mongod

# 查看MongoDB日志
sudo tail -f /var/log/mongodb/mongod.log

# 重启MongoDB
sudo systemctl restart mongod
```

### Nginx 502错误
```bash
# 检查后端是否运行
pm2 status

# 检查Nginx配置
sudo nginx -t

# 查看Nginx错误日志
sudo tail -f /var/log/nginx/error.log
```

---

## 十、安全建议

1. **修改SSH端口**（可选）
2. **禁用root登录**
3. **配置防火墙**（UFW）
4. **定期更新系统**: `sudo apt update && sudo apt upgrade`
5. **使用强密码**
6. **及时修改默认管理员密码**
7. **定期备份数据**
8. **配置HTTPS**（使用Let's Encrypt免费证书）

---

## 问题反馈

部署过程中遇到问题，可以：
1. 查看应用日志: `pm2 logs`
2. 查看Nginx日志: `sudo tail -f /var/log/nginx/error.log`
3. 查看MongoDB日志: `sudo tail -f /var/log/mongodb/mongod.log`
