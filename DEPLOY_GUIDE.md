# 校研究生会活动归档系统 — 阿里云完整部署指南

> 本文档记录了从零开始将项目部署到阿里云 ECS 的完整过程，包含实际遇到的问题及解决方案。

---

## 一、前置准备

### 1. 本地准备
- 项目代码已上传至 GitHub（本项目：https://github.com/CypresBateau/act_record）
- 确保 `.gitignore` 中**没有**排除 `client/public` 目录（注意：通用模板里的 Gatsby 规则会误排除 `public`，需要注释掉）

### 2. 阿里云服务器
- 系统：Ubuntu 22.04 LTS
- 配置建议：2核 2GB 内存（学生机足够）
- 使用 root 用户登录

---

## 二、上传代码到服务器

SSH 连接服务器后，将代码克隆到 `/home/ubuntu/` 目录：

```bash
cd /home/ubuntu
git clone https://github.com/CypresBateau/act_record.git
cd act_record
```

> **注意**：即使用 root 用户登录，也建议克隆到 `/home/ubuntu/act_record`，因为 `nginx.conf.example` 中的静态文件路径已按此配置好，无需额外修改。

---

## 三、初始化服务器环境

```bash
chmod +x deploy-aliyun.sh
./deploy-aliyun.sh
```

脚本会自动安装 Node.js 18、MongoDB 6、PM2、Nginx。

### 常见问题1：脚本中途弹出"Which services should be restarted?"对话框

- 使用**左右方向键**切换到 `<Ok>`，按 Enter 确认
- 如果键盘无响应，按 `Ctrl+C` 退出，重新运行脚本

### 常见问题2：MongoDB 安装后 `mongod.service not found`

脚本可能未成功安装 MongoDB，手动执行：

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
# 提示是否覆盖时输入 y

echo "deb [signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list

apt update && apt install -y mongodb-org
systemctl start mongod && systemctl enable mongod
```

---

## 四、配置环境变量

```bash
cd /home/ubuntu/act_record
cp .env.example .env
nano .env
```

修改以下内容（其他保持不变）：

```env
NODE_ENV=production
JWT_SECRET=填入一个复杂的随机字符串，例如：actrecord_2024_xXkJ9mPqR7vL3nZw
CLIENT_URL=http://你的服务器IP
```

保存退出：`Ctrl+X` → `Y` → `Enter`

---

## 五、安装依赖、初始化数据库、构建前端

```bash
npm run install-all
npm run seed
npm run build
```

### 常见问题3：`npm run seed` 报 MongooseServerSelectionError

MongoDB 未启动，执行：
```bash
systemctl start mongod && systemctl enable mongod
```
然后重新运行 `npm run seed`。

### 常见问题4：`npm run build` 报 `Could not find index.html`

`client/public` 目录未上传到 GitHub（被 `.gitignore` 误排除）。

在本地修复 `.gitignore`，注释掉 Gatsby 的 `public` 规则：
```
# Gatsby files
.cache/
# public  # 注释掉这行，否则会排除 client/public
```

然后本地执行：
```bash
git add client/public .gitignore
git commit -m "修复：添加 client/public 目录"
git push
```

服务器端拉取：
```bash
git pull
npm run build
```

### 常见问题5：`npm run build` 报 React Hooks 规则错误

`useForm` / `useMutation` 在 early return 之后调用，违反 React Hooks 规则。

需要将这两个 Hook 移到 early return 之前，early return 放到所有 Hook 调用之后。本项目已修复，正常情况不会再出现。

---

## 六、启动应用（PM2）

```bash
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 常见问题6：`quick-deploy.sh` 报"请不要使用 root 用户运行此脚本"

脚本检测到 root 用户会直接退出。跳过该脚本，按上述步骤手动执行即可，效果完全一致。

---

## 七、配置 Nginx

```bash
cp /home/ubuntu/act_record/nginx.conf.example /etc/nginx/sites-available/act-record
nano /etc/nginx/sites-available/act-record
```

将文件中的 `your_server_ip_or_domain` 替换为实际服务器 IP，保存退出。

```bash
ln -s /etc/nginx/sites-available/act-record /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
```

---

## 八、阿里云安全组配置

在阿里云控制台 → ECS → 安全组 → 入方向，添加以下规则：

| 端口 | 协议 | 来源 | 用途 |
|------|------|------|------|
| 22 | TCP | 0.0.0.0/0 | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP |
| 443 | TCP | 0.0.0.0/0 | HTTPS（可选） |
| 5000 | TCP | 0.0.0.0/0 | 后端API（临时调试用，配置好Nginx后可关闭） |

> **注意**：安全组未开放 80 端口是部署后无法访问最常见的原因。

---

## 九、验证部署

浏览器访问 `http://你的服务器IP`，使用默认账号登录：

- 用户名：`admin`
- 密码：`admin123`

**首次登录后立即修改密码！**

---

## 十、用户数据管理

### 导出用户数据
```bash
mongoexport --db student_union_archive --collection users --out /root/users_backup.json
```

### 导入用户数据
```bash
mongoimport --db student_union_archive --collection users --file /root/users_backup.json
```

### 备份整个数据库
```bash
mongodump --db student_union_archive --out /root/backup_$(date +%Y%m%d)
```

### 恢复数据库
```bash
mongorestore --db student_union_archive /root/backup_20240101/student_union_archive
```

---

## 十一、日常运维

### PM2 常用命令
```bash
pm2 status                  # 查看应用状态
pm2 logs act-record         # 查看实时日志
pm2 restart act-record      # 重启应用
pm2 stop act-record         # 停止应用
```

### 更新代码后重新部署
```bash
cd /home/ubuntu/act_record
git pull
npm run install-all         # 如有新依赖
npm run build               # 重新构建前端
pm2 restart act-record      # 重启后端
```

### Nginx 常用命令
```bash
nginx -t                            # 测试配置是否正确
systemctl restart nginx             # 重启 Nginx
tail -f /var/log/nginx/error.log    # 查看错误日志
```

### MongoDB 常用命令
```bash
systemctl status mongod     # 查看 MongoDB 状态
systemctl restart mongod    # 重启 MongoDB
mongosh                     # 进入数据库命令行
```

---

## 十二、故障排查

| 现象 | 排查步骤 |
|------|----------|
| 网页打不开 | 1. 检查安全组80端口是否开放 2. `pm2 status` 确认应用运行 3. `systemctl status nginx` 确认Nginx运行 |
| 502 Bad Gateway | `pm2 status` 查看应用是否崩溃，`pm2 logs` 查看错误原因 |
| 登录失败/API报错 | `pm2 logs act-record` 查看后端日志 |
| MongoDB连接失败 | `systemctl status mongod`，如未运行则 `systemctl start mongod` |
| 重启服务器后无法访问 | 确认已执行 `pm2 startup && pm2 save`，Nginx 默认开机自启 |
