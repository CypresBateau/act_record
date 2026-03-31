# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Graduate Student Union Activity Archive System (校研究生会活动归档系统) - A full-stack web application for managing and archiving graduate student union activities with role-based access control, file management, and expense tracking.

**Stack**: Node.js/Express backend with MongoDB, React 18 frontend with Material-UI

## Development Commands

### Installation & Setup
```bash
npm run install-all    # Install both server and client dependencies
npm run setup          # Install dependencies and seed database
npm run seed           # Seed database with initial data
```

### Running the Application
```bash
npm run dev            # Start both server and client concurrently (recommended for development)
npm run server         # Start backend server only (nodemon on port 5000)
npm run client         # Start React frontend only (port 3000)
npm start              # Start production server
```

### Building for Production
```bash
npm run build          # Build React client for production
```

### Testing Individual Components
- Backend server runs on port 5000
- Frontend dev server runs on port 3000 with proxy configured to backend
- Frontend build is served as static files from backend in production

## Architecture

### Backend Structure (`server/`)

**Entry Point**: `server/index.js` - Express app with security middleware (helmet, rate limiting), CORS, MongoDB connection, and route registration

**Data Models** (`server/models/`):
- **User.js**: User authentication with bcrypt password hashing. Three role-based permission levels:
  - `主席` (President): Full access to all departments
  - `部长` (Department Head): Full access to all departments
  - `部员` (Member): Limited access to their own department only
  - Permissions calculated via `getPermissions()` method
  - Five departments: 学术部, 办公室, 实践部, 文体部, 宣传部

- **Activity.js**: Activity records with embedded schemas for expenses and files
  - Virtual fields: `actualBudget`, `isOverBudget`, `duration`
  - Text search indexes on title and description
  - Validation: endTime must be after startTime
  - Status workflow: 计划中 → 进行中 → 已完成/已取消

**Authentication** (`server/middleware/auth.js`):
- JWT-based authentication with 7-day token expiration
- Four middleware functions:
  - `auth`: Validates JWT and attaches user to request
  - `checkDepartmentAccess`: Verifies department-level access
  - `requireAdmin`: Restricts to 主席 or 部长 roles
  - `checkEditPermission`: Dynamic permission check based on activity ownership and user role
- `generateToken(userId)`: Creates JWT tokens

**Routes** (`server/routes/`):
- `auth.js`: User authentication (register, login, profile management)
- `activities.js`: CRUD operations for activities, stats endpoints
- `users.js`: User management (admin only)
- `files.js`: File upload/download with Multer, organized by activity

### Frontend Structure (`client/src/`)

**State Management**:
- `contexts/AuthContext.js`: React Context for authentication state, user info, permissions
  - Automatically verifies token on mount
  - Provides login, register, logout, updateProfile, changePassword functions
  - Exposes `permissions` object derived from user role

**API Layer** (`services/api.js`):
- Axios instance with JWT token interceptor
- Automatic redirect to `/login` on 401 responses
- Service modules: `authService`, `activityService`, `fileService`, `userService`
- Constants exported: `DEPARTMENTS`, `ROLES`, `ACTIVITY_STATUS`, `ACTIVITY_FORMATS`, `FILE_CATEGORIES`, `EXPENSE_CATEGORIES`

**Pages** (`pages/`):
- `LoginPage.js`, `RegisterPage.js`: Authentication flows
- `DashboardPage.js`: Overview with statistics
- `ActivitiesPage.js`: Activity list with filtering
- `CreateActivityPage.js`, `EditActivityPage.js`: Activity forms
- `ActivityDetailPage.js`: Activity view with files and expenses
- `ProfilePage.js`: User profile management
- `UsersPage.js`: User administration (admin only)

**Components** (`components/`):
- `Layout.js`: Main layout with navigation and role-based menu items
- `LoadingScreen.js`: Loading state display

### Permission System

The permission system is hierarchical:
1. **主席 & 部长**: Can view and edit all activities across all departments
2. **部员**: Can only view and edit activities within their assigned department

Check permissions using:
- Backend: `req.user.role` and `req.user.department`
- Frontend: `useAuth().permissions.canViewAll`, `permissions.canEditAll`, `permissions.departments`

### File Management

Files are uploaded via Multer to the `uploads/` directory, organized by activity ID. Each file has:
- Category: 活动文件, 宣传文案, 照片记录, 报销凭证
- Metadata: originalName, size, mimetype, uploadedBy, uploadedAt
- Files are embedded in Activity documents as subdocuments

### Environment Variables

Required in `.env` (see `.env.example`):
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `PORT`: Backend server port (default: 5000)
- `NODE_ENV`: development/production
- `UPLOAD_PATH`: File upload directory
- `MAX_FILE_SIZE`: Maximum file size in bytes
- `CLIENT_URL`: Frontend URL for CORS

## Important Implementation Notes

1. **Database Seeding**: Use `npm run seed` to populate initial data via `server/utils/seed.js`

2. **JWT Authentication**: Tokens are stored in localStorage and sent via Authorization header. Backend validates and attaches user to `req.user`

3. **File Uploads**: Use `multipart/form-data` for file uploads. Files are stored in filesystem, paths stored in MongoDB

4. **Virtual Fields**: Activity model has computed fields (actualBudget, isOverBudget, duration) - ensure `virtuals: true` in serialization

5. **Text Search**: Activities support full-text search on title and description fields via MongoDB text index

6. **Department Access Control**: Always check department permissions for 部员 role - middleware handles this but be aware when adding new routes

7. **前端代理**: 开发环境中，前端通过 `client/package.json` 中的代理配置，将 `/api` 请求转发到 `http://localhost:5000`

## 阿里云部署

项目针对阿里云 ECS（Ubuntu 22.04 LTS）设计，所有部署工具均已包含在仓库中。

### 部署相关文件
- `deploy-aliyun.sh`：一次性服务器环境初始化脚本（安装 Node.js 18、MongoDB 6、PM2、Nginx）
- `quick-deploy.sh`：应用部署脚本（安装依赖、构建前端、启动 PM2）
- `ecosystem.config.js`：PM2 进程配置——应用名 `act-record`，端口 5000，日志存于 `logs/`
- `nginx.conf.example`：Nginx 反向代理模板（服务前端静态文件，代理 `/api` 和 `/uploads`）
- `frpc.ini` / `frps.ini`：FRP（内网穿透）配置，适用于无公网 IP 时的隧道访问方式

### 生产部署步骤（在阿里云服务器上执行）
```bash
# 1. 首次部署——初始化服务器环境
chmod +x deploy-aliyun.sh && ./deploy-aliyun.sh

# 2. 从本地 Windows 上传项目文件
scp -r D:\01_work\act_record ubuntu@<服务器IP>:/home/ubuntu/

# 3. 在服务器上配置生产环境变量
cp .env.example .env
# 修改：NODE_ENV=production、JWT_SECRET=<强随机字符串>、CLIENT_URL=http://<服务器IP>

# 4. 执行应用部署
chmod +x quick-deploy.sh && ./quick-deploy.sh

# 5. 配置 Nginx
sudo cp nginx.conf.example /etc/nginx/sites-available/act-record
sudo nano /etc/nginx/sites-available/act-record  # 替换 your_server_ip_or_domain
sudo ln -s /etc/nginx/sites-available/act-record /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

### 阿里云安全组——需开放端口
| 端口 | 用途 |
|------|------|
| 22 | SSH |
| 80 | HTTP（Nginx） |
| 443 | HTTPS（可选） |
| 5000 | 后端 API（临时测试，Nginx 配置完成后可关闭） |

### PM2 常用命令
```bash
pm2 status                    # 查看应用状态
pm2 logs act-record           # 查看日志
pm2 restart act-record        # 重启应用
pm2 startup && pm2 save       # 设置开机自启
```

### 生产环境 .env 与开发环境的主要差异
- `NODE_ENV=production`：限流收紧为 100 次/分钟
- `CLIENT_URL=http://<服务器IP>`：CORS 必填项
- `JWT_SECRET`：必须使用强随机字符串（不能用开发默认值）
- `MONGODB_URI`：保持 `mongodb://localhost:27017/student_union_archive`（本地 MongoDB）

### 数据库初始化后的默认管理员账号
- 用户名：`admin` / 密码：`admin123`——**首次登录后立即修改**

### 备选方案：FRP 内网穿透（本地部署）
无云服务器时，可使用 `frpc.ini` 配合 cpolar / ngrok / FRP 实现临时访问，详见 `TUNNEL.md`。