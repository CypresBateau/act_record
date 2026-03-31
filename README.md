# 校研究生会活动归档系统

## 项目概述

校研究生会活动归档系统（Graduate Student Union Activity Archive System）是一个全栈Web应用，用于管理和归档研究生会的各类活动。系统实现了基于角色的访问控制（RBAC）、活动全生命周期管理、文件管理、开销跟踪等功能。

**当前版本**: 1.0.0
**开发语言**: JavaScript (Node.js + React)
**数据库**: MongoDB
**许可证**: MIT

---

## 核心功能

### 1. 用户认证与授权

- **用户注册/登录**：基于JWT的身份认证机制
- **角色管理**：支持三种角色（主席、部长、部员）
- **权限控制**：细粒度的权限管理系统
- **个人资料管理**：用户可更新个人信息、修改密码
- **账户状态管理**：支持账户启用/禁用

### 2. 活动管理

#### 2.1 基本信息管理
- 活动标题、描述、时间、地点
- 活动形式：线上、线下、线上线下结合
- 部门归属：五个部门（学术部、办公室、实践部、文体部、宣传部）
- 活动标签：支持多标签分类

#### 2.2 活动状态跟踪
- **计划中**：活动正在筹备阶段
- **进行中**：活动正在执行
- **已完成**：活动成功完成，可填写总结
- **已取消**：活动因故取消

#### 2.3 参与人数管理
- 预期参与人数
- 实际参与人数
- 自动计算参与率

#### 2.4 预算与开销管理
- 预算计划：设定活动预算金额
- 实际开销：记录每笔支出
- 开销分类：场地费、物料费、人员费、交通费、其他
- 预算对比：自动计算实际开销，标识超支情况
- 开销明细：每条开销记录包含提交人、提交时间、金额、分类、描述

#### 2.5 活动检索与筛选
- **多维度筛选**：按部门、状态、形式、时间范围筛选
- **全文搜索**：支持标题、描述、地点、标签的模糊搜索
- **分页加载**：支持大量数据的高效展示
- **排序功能**：按创建时间、开始时间等字段排序

### 3. 文件管理

#### 3.1 文件上传
- 单文件上传
- 批量文件上传（最多10个）
- 文件大小限制：10MB
- 支持的文件类型：
  - 图片：JPEG, PNG, GIF, WebP
  - 文档：PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
  - 视频：MP4, MPEG, MOV

#### 3.2 文件分类
- **活动文件**：活动策划、方案等文档
- **宣传文案**：宣传海报、推文等
- **照片记录**：活动现场照片
- **报销凭证**：发票、收据等财务凭证

#### 3.3 文件操作
- 文件预览（部分格式）
- 文件下载
- 文件删除
- 文件信息编辑（描述、分类）
- 按分类筛选

### 4. 用户管理（管理员功能）

- **用户列表**：查看所有用户
- **用户搜索**：按用户名、姓名、邮箱搜索
- **用户筛选**：按角色、部门筛选
- **创建用户**：批量或单个创建用户账户
- **编辑用户**：修改用户信息（姓名、角色、部门、联系方式）
- **账户控制**：启用/禁用用户账户
- **密码重置**：管理员可重置任意用户密码
- **删除用户**：删除用户账户（不可删除自己）
- **用户统计**：查看用户总数、活跃用户、各角色/部门分布

### 5. 数据统计与分析

#### 5.1 活动统计
- 活动总数
- 已完成活动数量
- 各部门活动分布
- 各状态活动分布
- 总预算与总开销对比

#### 5.2 可视化展示
- 数据图表展示（前端实现）
- 实时数据更新

### 6. 权限系统

#### 角色权限矩阵

| 功能 | 主席 | 部长 | 部员 |
|------|------|------|------|
| 查看所有部门活动 | ✓ | ✓ | ✗ |
| 查看本部门活动 | ✓ | ✓ | ✓ |
| 创建所有部门活动 | ✓ | ✓ | ✗ |
| 创建本部门活动 | ✓ | ✓ | ✓ |
| 编辑所有活动 | ✓ | ✓ | ✗ |
| 编辑本部门活动 | ✓ | ✓ | ✓ |
| 删除活动 | ✓ | ✓ | ✗ |
| 上传/删除文件 | ✓ | ✓ | ✓（本部门） |
| 用户管理 | ✓ | ✓ | ✗ |
| 查看统计数据 | ✓ | ✓ | ✓（本部门） |

**权限说明**：
- **主席**：拥有系统所有权限，可跨部门操作
- **部长**：拥有系统所有权限，可跨部门操作
- **部员**：仅限本部门操作，不能跨部门查看或编辑

---

## 技术栈

### 后端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 16+ | 服务器运行环境 |
| Express.js | ^4.18.2 | Web应用框架 |
| MongoDB | 4.4+ | NoSQL数据库 |
| Mongoose | ^7.6.3 | MongoDB ODM |
| JWT | ^9.0.2 | 身份认证令牌 |
| bcryptjs | ^2.4.3 | 密码加密 |
| Multer | ^1.4.5-lts.1 | 文件上传中间件 |
| Helmet | ^7.1.0 | HTTP安全头 |
| express-rate-limit | ^7.1.5 | API限流 |
| CORS | ^2.8.5 | 跨域资源共享 |
| dotenv | ^16.3.1 | 环境变量管理 |

### 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI框架 |
| Material-UI (MUI) | ^5.x | 组件库 |
| React Router | ^6.x | 路由管理 |
| React Hook Form | ^7.x | 表单处理 |
| Axios | ^1.x | HTTP客户端 |
| Day.js | ^1.x | 日期处理 |

### 开发工具

- **nodemon**: 开发时自动重启服务器
- **concurrently**: 同时运行多个npm脚本

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                         客户端 (React)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   页面组件    │  │  React Router │  │  AuthContext │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│          │                  │                  │             │
│          └──────────────────┴──────────────────┘             │
│                         Axios                               │
└─────────────────────────────────────────────────────────────┘
                            │ HTTP/HTTPS
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     服务器 (Express.js)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  中间件层                                              │  │
│  │  • CORS  • Helmet  • Rate Limiting  • Body Parser    │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  认证中间件 (JWT)                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Auth路由  │  │Activity  │  │ User路由  │  │ File路由  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│        │              │              │              │       │
│        └──────────────┴──────────────┴──────────────┘       │
│                   Mongoose ODM                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB 数据库                          │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │ users集合     │         │ activities   │                 │
│  │              │         │   集合        │                 │
│  └──────────────┘         └──────────────┘                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      文件系统                                 │
│                    uploads/ 目录                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 数据模型

### User 模型

```javascript
{
  _id: ObjectId,
  username: String,        // 用户名（唯一，3-20字符）
  password: String,        // 加密密码（bcrypt，最少6字符）
  name: String,           // 真实姓名（最多50字符）
  role: String,           // 角色：'主席' | '部长' | '部员'
  department: String,     // 部门：'学术部' | '办公室' | '实践部' | '文体部' | '宣传部'
                         // 注：主席可以没有部门
  email: String,         // 邮箱（可选，格式验证）
  phone: String,         // 手机号（可选，11位数字）
  isActive: Boolean,     // 账户状态（默认true）
  lastLogin: Date,       // 最后登录时间
  createdAt: Date,       // 创建时间（自动）
  updatedAt: Date        // 更新时间（自动）
}
```

**索引**：
- `username`: unique
- `createdAt`: -1

**方法**：
- `comparePassword(password)`: 验证密码
- `getPermissions()`: 获取用户权限对象

### Activity 模型

```javascript
{
  _id: ObjectId,
  title: String,                    // 活动标题（必填，最多100字符）
  description: String,              // 活动描述（必填，最多2000字符）
  department: String,               // 所属部门（必填）
  startTime: Date,                  // 开始时间（必填）
  endTime: Date,                    // 结束时间（必填，必须晚于开始时间）
  location: String,                 // 活动地点（必填，最多200字符）
  format: String,                   // 活动形式：'线上' | '线下' | '线上线下结合'
  status: String,                   // 状态：'计划中' | '进行中' | '已完成' | '已取消'
  organizer: ObjectId,              // 组织者（关联User._id）

  participants: {
    expected: Number,               // 预期人数
    actual: Number                  // 实际人数
  },

  budget: {
    planned: Number,                // 计划预算（默认0）
    actual: Number                  // 实际预算（已废弃，由expenses计算）
  },

  expenses: [{                      // 开销记录（嵌入式文档数组）
    _id: ObjectId,
    item: String,                   // 开销项目
    amount: Number,                 // 金额
    category: String,               // 分类：'场地费' | '物料费' | '人员费' | '交通费' | '其他'
    receipt: String,                // 报销凭证路径（可选）
    description: String,            // 描述
    submittedBy: ObjectId,          // 提交人
    submittedAt: Date               // 提交时间
  }],

  files: [{                         // 文件记录（嵌入式文档数组）
    _id: ObjectId,
    filename: String,               // 存储文件名
    originalName: String,           // 原始文件名
    path: String,                   // 文件路径
    size: Number,                   // 文件大小（字节）
    mimetype: String,               // MIME类型
    category: String,               // 文件分类
    description: String,            // 文件描述
    uploadedBy: ObjectId,           // 上传人
    uploadedAt: Date                // 上传时间
  }],

  promotionContent: String,         // 宣传内容（最多5000字符）
  summary: String,                  // 活动总结（最多2000字符）
  tags: [String],                   // 标签数组（每个最多20字符）
  isArchived: Boolean,              // 是否归档（默认false）

  createdAt: Date,                  // 创建时间（自动）
  updatedAt: Date                   // 更新时间（自动）
}
```

**虚拟字段**（不存储在数据库）：
- `actualBudget`: 计算所有expenses的总和
- `isOverBudget`: 判断是否超出预算
- `duration`: 活动时长（小时）

**索引**：
- `{department: 1, createdAt: -1}`: 复合索引
- `startTime`: 1
- `status`: 1
- `{title: 'text', description: 'text'}`: 全文索引

---

## 安装与配置

### 环境要求

- **Node.js**: 16.x 或更高版本
- **MongoDB**: 4.4 或更高版本
- **npm**: 7.x 或更高版本
- **操作系统**: Windows 10+, macOS 10.15+, Linux（Ubuntu 20.04+）

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd act_record
```

#### 2. 安装依赖

```bash
# 同时安装服务器和客户端依赖
npm run install-all

# 或者分别安装
npm install           # 安装服务器依赖
cd client && npm install  # 安装客户端依赖
```

#### 3. 配置环境变量

创建 `.env` 文件（参考 `.env.example`）：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/student_union_archive

# JWT密钥（请修改为随机字符串）
JWT_SECRET=your_very_secure_random_secret_key_here

# 服务器配置
PORT=5000
NODE_ENV=development

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# 前端地址（CORS配置）
CLIENT_URL=http://localhost:3000
```

**重要**：
- `JWT_SECRET` 必须设置为强随机字符串（建议32位以上）
- 生产环境请修改 `NODE_ENV=production`

#### 4. 启动MongoDB

确保MongoDB服务正在运行：

```bash
# Windows (以服务形式运行)
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

验证MongoDB连接：

```bash
mongosh
# 或
mongo
```

#### 5. 初始化数据库（可选）

运行种子脚本创建测试数据：

```bash
npm run seed
```

该脚本将创建：
- 15个测试用户（1主席 + 5部长 + 9部员）
- 12个测试活动（含文件和开销记录）

**测试账户**：

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 主席 | admin | admin123 |
| 学术部长 | xueshubuz | password123 |
| 办公室长 | bangongshiz | password123 |
| 实践部长 | shijianbuz | password123 |
| 文体部长 | wentibuz | password123 |
| 宣传部长 | xuanchuanbuz | password123 |
| 学术部员 | xueshuy1 | password123 |

#### 6. 启动应用

```bash
# 开发模式（推荐，同时启动前后端）
npm run dev

# 或分别启动
npm run server    # 启动后端服务器（端口5000）
npm run client    # 启动前端开发服务器（端口3000）
```

#### 7. 访问应用

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:5000
- **健康检查**: http://localhost:5000/api/health

---

## API接口文档

### 基础信息

- **Base URL**: `http://localhost:5000/api`
- **认证方式**: JWT Bearer Token
- **请求头**:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```

### 认证接口 (`/api/auth`)

#### POST /register - 用户注册

**请求体**：
```json
{
  "username": "string (3-20字符)",
  "password": "string (最少6字符)",
  "name": "string (真实姓名)",
  "role": "主席 | 部长 | 部员",
  "department": "学术部 | 办公室 | 实践部 | 文体部 | 宣传部 (非主席必填)",
  "email": "string (可选)",
  "phone": "string (可选，11位)"
}
```

**响应**：
```json
{
  "message": "注册成功",
  "token": "jwt_token_string",
  "user": {
    "id": "user_id",
    "username": "username",
    "name": "姓名",
    "role": "角色",
    "department": "部门",
    "permissions": { /* 权限对象 */ }
  }
}
```

#### POST /login - 用户登录

**请求体**：
```json
{
  "username": "string",
  "password": "string"
}
```

**响应**：同注册接口

#### GET /me - 获取当前用户信息

**需要认证**: ✓

**响应**：
```json
{
  "user": {
    "id": "user_id",
    "username": "username",
    "name": "姓名",
    "role": "角色",
    "department": "部门",
    "email": "邮箱",
    "phone": "电话",
    "permissions": {
      "canViewAll": true,
      "canEditAll": true,
      "canDelete": true,
      "departments": ["学术部", "办公室", ...]
    },
    "lastLogin": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /profile - 更新个人资料

**需要认证**: ✓

**请求体**：
```json
{
  "name": "string (可选)",
  "email": "string (可选)",
  "phone": "string (可选)"
}
```

#### PUT /password - 修改密码

**需要认证**: ✓

**请求体**：
```json
{
  "currentPassword": "string",
  "newPassword": "string (最少6字符)"
}
```

#### GET /verify - 验证Token

**需要认证**: ✓

**响应**：
```json
{
  "valid": true,
  "user": { /* 用户信息 */ }
}
```

### 活动接口 (`/api/activities`)

#### GET / - 获取活动列表

**需要认证**: ✓

**查询参数**：
- `page`: 页码（默认1）
- `limit`: 每页数量（默认10）
- `department`: 部门筛选
- `status`: 状态筛选
- `format`: 形式筛选
- `search`: 搜索关键词
- `startDate`: 开始时间筛选（ISO 8601格式）
- `endDate`: 结束时间筛选
- `sortBy`: 排序字段（默认createdAt）
- `sortOrder`: 排序方式 asc/desc（默认desc）

**响应**：
```json
{
  "activities": [ /* 活动数组 */ ],
  "totalPages": 10,
  "currentPage": 1,
  "total": 95,
  "hasMore": true
}
```

#### GET /:id - 获取活动详情

**需要认证**: ✓

**响应**：
```json
{
  "activity": {
    "_id": "activity_id",
    "title": "活动标题",
    "description": "活动描述",
    "department": "学术部",
    "startTime": "2024-01-01T14:00:00.000Z",
    "endTime": "2024-01-01T16:00:00.000Z",
    "location": "图书馆报告厅",
    "format": "线下",
    "status": "已完成",
    "organizer": {
      "_id": "user_id",
      "name": "组织者姓名",
      "department": "学术部"
    },
    "participants": {
      "expected": 100,
      "actual": 85
    },
    "budget": {
      "planned": 2000
    },
    "expenses": [ /* 开销数组 */ ],
    "files": [ /* 文件数组 */ ],
    "promotionContent": "宣传文案",
    "summary": "活动总结",
    "tags": ["学术", "讲座"],
    "actualBudget": 1450,
    "isOverBudget": false,
    "duration": 2,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST / - 创建活动

**需要认证**: ✓

**请求体**：
```json
{
  "title": "string (必填)",
  "description": "string (必填)",
  "department": "string (必填)",
  "startTime": "ISO 8601 (必填)",
  "endTime": "ISO 8601 (必填)",
  "location": "string (必填)",
  "format": "线上 | 线下 | 线上线下结合 (必填)",
  "participants": {
    "expected": 100,
    "actual": 0
  },
  "budget": {
    "planned": 5000
  },
  "promotionContent": "string (可选)",
  "tags": ["标签1", "标签2"]
}
```

**权限**：部员只能创建本部门活动

#### PUT /:id - 更新活动

**需要认证**: ✓
**权限检查**: ✓

**请求体**：（所有字段可选）
```json
{
  "title": "string",
  "description": "string",
  "startTime": "ISO 8601",
  "endTime": "ISO 8601",
  "location": "string",
  "format": "string",
  "status": "计划中 | 进行中 | 已完成 | 已取消",
  "participants": { "expected": 120, "actual": 100 },
  "budget": { "planned": 6000 },
  "promotionContent": "string",
  "summary": "string",
  "tags": ["array"]
}
```

#### DELETE /:id - 删除活动

**需要认证**: ✓
**权限检查**: ✓

**权限**：主席和部长可删除

#### POST /:id/expenses - 添加开销

**需要认证**: ✓
**权限检查**: ✓

**请求体**：
```json
{
  "item": "string (必填)",
  "amount": 500 (必填),
  "category": "场地费 | 物料费 | 人员费 | 交通费 | 其他 (必填)",
  "description": "string (可选)"
}
```

#### PUT /:id/expenses/:expenseId - 更新开销

**需要认证**: ✓
**权限检查**: ✓

**请求体**：（所有字段可选）
```json
{
  "item": "string",
  "amount": 600,
  "category": "string",
  "description": "string"
}
```

#### DELETE /:id/expenses/:expenseId - 删除开销

**需要认证**: ✓
**权限检查**: ✓

#### GET /stats/overview - 获取活动统计

**需要认证**: ✓

**响应**：
```json
{
  "overview": {
    "totalActivities": 50,
    "completedActivities": 20,
    "totalBudget": 100000,
    "totalExpenses": 85000
  },
  "departmentStats": [
    { "_id": "学术部", "count": 10, "completedCount": 5 }
  ],
  "statusStats": [
    { "_id": "已完成", "count": 20 }
  ]
}
```

### 文件接口 (`/api/files`)

#### POST /upload/:activityId - 上传文件

**需要认证**: ✓
**权限检查**: ✓
**Content-Type**: `multipart/form-data`

**请求体**：
- `file`: File对象（必填）
- `category`: 活动文件 | 宣传文案 | 照片记录 | 报销凭证（必填）
- `description`: string（可选）

**限制**：
- 最大文件大小：10MB
- 支持的格式：图片、文档、视频

#### POST /upload-multiple/:activityId - 批量上传

**需要认证**: ✓
**权限检查**: ✓
**Content-Type**: `multipart/form-data`

**请求体**：
- `files`: File数组（最多10个）
- `category`: string（必填）
- `description`: string（可选）

#### GET /:activityId - 获取文件列表

**需要认证**: ✓

**查询参数**：
- `category`: 按分类筛选

**响应**：
```json
{
  "files": [
    {
      "_id": "file_id",
      "filename": "123456-file.pdf",
      "originalName": "活动策划.pdf",
      "size": 102400,
      "mimetype": "application/pdf",
      "category": "活动文件",
      "description": "活动策划方案",
      "uploadedBy": {
        "_id": "user_id",
        "name": "上传者"
      },
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /download/:activityId/:fileId - 下载文件

**需要认证**: ✓

**响应**：文件流

#### DELETE /:activityId/:fileId - 删除文件

**需要认证**: ✓
**权限检查**: ✓

#### PUT /:activityId/:fileId - 更新文件信息

**需要认证**: ✓
**权限检查**: ✓

**请求体**：
```json
{
  "description": "string (可选)",
  "category": "string (可选)"
}
```

### 用户管理接口 (`/api/users`)

**注意**：所有用户管理接口需要管理员权限（主席或部长）

#### POST / - 创建用户

**需要认证**: ✓
**需要权限**: 管理员

**请求体**：同注册接口

#### GET / - 获取用户列表

**需要认证**: ✓
**需要权限**: 管理员

**查询参数**：
- `page`: 页码
- `limit`: 每页数量
- `department`: 部门筛选
- `role`: 角色筛选
- `search`: 搜索关键词（用户名、姓名、邮箱）

#### GET /:id - 获取用户详情

**需要认证**: ✓
**需要权限**: 管理员

#### PUT /:id - 更新用户信息

**需要认证**: ✓
**需要权限**: 管理员

**请求体**：
```json
{
  "name": "string",
  "role": "string",
  "department": "string",
  "email": "string",
  "phone": "string",
  "isActive": true
}
```

**限制**：不能修改自己的角色

#### DELETE /:id - 删除用户

**需要认证**: ✓
**需要权限**: 管理员

**限制**：不能删除自己

#### PUT /:id/toggle-status - 启用/禁用用户

**需要认证**: ✓
**需要权限**: 管理员

**限制**：不能禁用自己

#### PUT /:id/reset-password - 重置密码

**需要认证**: ✓
**需要权限**: 管理员

**请求体**：
```json
{
  "newPassword": "string (最少6字符)"
}
```

#### GET /stats/overview - 用户统计

**需要认证**: ✓
**需要权限**: 管理员

**响应**：
```json
{
  "totalUsers": 50,
  "activeUsers": 48,
  "inactiveUsers": 2,
  "usersByRole": [
    { "_id": "部员", "count": 40 }
  ],
  "usersByDepartment": [
    { "_id": "学术部", "count": 10 }
  ]
}
```

---

## 前端路由

| 路径 | 组件 | 权限 | 说明 |
|------|------|------|------|
| `/login` | LoginPage | 公开 | 登录页面 |
| `/register` | RegisterPage | 公开 | 注册页面 |
| `/dashboard` | DashboardPage | 需要登录 | 仪表板 |
| `/activities` | ActivitiesPage | 需要登录 | 活动列表 |
| `/activities/new` | CreateActivityPage | 需要登录 | 创建活动 |
| `/activities/:id` | ActivityDetailPage | 需要登录 | 活动详情 |
| `/activities/:id/edit` | EditActivityPage | 需要登录 | 编辑活动 |
| `/users` | UsersPage | 管理员 | 用户管理 |
| `/profile` | ProfilePage | 需要登录 | 个人资料 |

---

## 数据库管理

### 使用MongoDB Compass（推荐）

1. **下载安装**：https://www.mongodb.com/try/download/compass
2. **连接数据库**：
   - 连接字符串：`mongodb://localhost:27017`
   - 数据库：`student_union_archive`
3. **功能**：
   - 可视化浏览集合和文档
   - 执行查询和聚合
   - 创建索引
   - 导入/导出数据

### 使用mongosh（命令行）

```bash
# 连接数据库
mongosh mongodb://localhost:27017/student_union_archive

# 常用命令
show collections                    # 查看所有集合
db.users.find().pretty()           # 查看用户
db.activities.find().pretty()      # 查看活动

# 查询示例
db.users.find({ role: "主席" })
db.activities.find({ status: "已完成" })

# 更新示例
db.users.updateOne(
  { username: "admin" },
  { $set: { name: "新名字" } }
)

# 删除示例
db.activities.deleteOne({ _id: ObjectId("...") })

# 聚合查询
db.activities.aggregate([
  { $group: { _id: "$department", count: { $sum: 1 } } }
])

# 创建索引
db.activities.createIndex({ department: 1, createdAt: -1 })

# 数据备份
mongodump --db student_union_archive --out ./backup

# 数据恢复
mongorestore --db student_union_archive ./backup/student_union_archive
```

### 使用VS Code扩展

1. 安装扩展：`MongoDB for VS Code`
2. 连接数据库
3. 在VS Code中管理数据

---

## 生产环境部署

### 构建生产版本

```bash
# 1. 构建前端
npm run build

# 2. 设置环境变量
NODE_ENV=production

# 3. 启动生产服务器
npm start
```

### 生产环境配置清单

- [ ] 修改 `JWT_SECRET` 为强随机字符串
- [ ] 设置 `NODE_ENV=production`
- [ ] 配置生产MongoDB连接（使用MongoDB Atlas或自建）
- [ ] 配置HTTPS（使用Nginx反向代理）
- [ ] 启用防火墙，只开放必要端口
- [ ] 配置日志系统
- [ ] 设置自动备份策略
- [ ] 配置进程管理器（PM2）

### 使用PM2部署

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start server/index.js --name "student-union-api"

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启应用
pm2 restart student-union-api

# 设置开机自启
pm2 startup
pm2 save
```

### Nginx配置示例

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 前端静态文件
    location / {
        root /path/to/act_record/client/build;
        try_files $uri /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 文件上传
    location /uploads {
        alias /path/to/act_record/uploads;
    }
}
```

---

## 安全特性

### 已实现的安全措施

1. **身份认证**：
   - JWT Token机制，7天有效期
   - 密码bcrypt加密（salt rounds: 10）
   - Token自动刷新机制

2. **权限控制**：
   - 基于角色的访问控制（RBAC）
   - 细粒度的资源权限检查
   - 防止越权访问

3. **数据验证**：
   - 所有输入数据经过验证
   - Mongoose Schema验证
   - 文件类型和大小限制

4. **API安全**：
   - Helmet.js设置安全HTTP头
   - CORS跨域限制
   - Rate Limiting（生产环境100请求/分钟）
   - 请求大小限制（10MB）

5. **数据库安全**：
   - 参数化查询（防SQL注入）
   - MongoDB连接池配置
   - 敏感字段不返回（密码）

### 安全建议

1. **定期更新依赖**：
   ```bash
   npm audit
   npm audit fix
   ```

2. **设置强密码策略**：
   - 最少8位字符
   - 包含大小写字母、数字、特殊字符

3. **启用HTTPS**：生产环境必须使用HTTPS

4. **定期备份**：
   - 每日备份数据库
   - 异地备份

5. **监控日志**：
   - 监控异常登录
   - API错误日志
   - 数据库慢查询

---

## 故障排查

### 常见问题

#### 1. MongoDB连接失败

**错误**：`MongoDB连接失败: MongoServerError`

**解决方案**：
```bash
# 检查MongoDB服务状态
# Windows
net start MongoDB

# macOS
brew services list

# Linux
sudo systemctl status mongod

# 检查端口占用
netstat -an | findstr 27017
```

#### 2. 端口占用

**错误**：`Error: listen EADDRINUSE: address already in use :::5000`

**解决方案**：
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

#### 3. 前端代理错误

**错误**：`Proxy error: Could not proxy request`

**解决方案**：
- 确保后端服务器已启动
- 检查 `client/package.json` 中的proxy配置
- 重启前端开发服务器

#### 4. 文件上传失败

**错误**：`文件大小超过限制`

**解决方案**：
- 检查 `.env` 中的 `MAX_FILE_SIZE`
- 确保 `uploads/` 目录存在且有写权限

#### 5. JWT Token过期

**错误**：`Token已过期`

**解决方案**：
- 重新登录获取新Token
- 检查系统时间是否正确

### 日志查看

```bash
# 开发环境
# 直接查看控制台输出

# 生产环境（使用PM2）
pm2 logs student-union-api

# 查看MongoDB日志
# Windows: C:\Program Files\MongoDB\Server\<version>\log\mongod.log
# macOS: /usr/local/var/log/mongodb/
# Linux: /var/log/mongodb/mongod.log
```

---

## 开发指南

### 项目结构

```
act_record/
├── server/                      # 后端代码
│   ├── models/                  # 数据模型
│   │   ├── User.js
│   │   └── Activity.js
│   ├── routes/                  # 路由控制器
│   │   ├── auth.js
│   │   ├── activities.js
│   │   ├── users.js
│   │   └── files.js
│   ├── middleware/              # 中间件
│   │   └── auth.js
│   ├── utils/                   # 工具函数
│   │   └── seed.js
│   └── index.js                 # 入口文件
├── client/                      # 前端代码
│   ├── public/                  # 静态资源
│   ├── src/
│   │   ├── components/          # 公共组件
│   │   │   └── Layout.js
│   │   ├── pages/               # 页面组件
│   │   │   ├── LoginPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── ActivitiesPage.js
│   │   │   ├── ActivityDetailPage.js
│   │   │   ├── CreateActivityPage.js
│   │   │   ├── EditActivityPage.js
│   │   │   ├── UsersPage.js
│   │   │   ├── ProfilePage.js
│   │   │   └── RegisterPage.js
│   │   ├── contexts/            # React Context
│   │   │   └── AuthContext.js
│   │   ├── services/            # API服务
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── uploads/                     # 文件上传目录（运行时生成）
├── .env                         # 环境变量（需自己创建）
├── .env.example                 # 环境变量示例
├── .gitignore
├── package.json
└── README.md
```

### 添加新功能

#### 后端

1. **创建数据模型**（如需要）：
   ```javascript
   // server/models/NewModel.js
   const mongoose = require('mongoose');

   const newSchema = new mongoose.Schema({
     // 定义字段
   }, {
     timestamps: true
   });

   module.exports = mongoose.model('NewModel', newSchema);
   ```

2. **创建路由**：
   ```javascript
   // server/routes/newRoute.js
   const express = require('express');
   const { auth } = require('../middleware/auth');
   const router = express.Router();

   router.get('/', auth, async (req, res) => {
     // 实现逻辑
   });

   module.exports = router;
   ```

3. **注册路由**：
   ```javascript
   // server/index.js
   const newRoutes = require('./routes/newRoute');
   app.use('/api/new', newRoutes);
   ```

#### 前端

1. **创建API服务**：
   ```javascript
   // client/src/services/api.js
   export const newService = {
     getAll: () => api.get('/new'),
     create: (data) => api.post('/new', data),
   };
   ```

2. **创建页面组件**：
   ```javascript
   // client/src/pages/NewPage.js
   import React from 'react';
   import { newService } from '../services/api';

   const NewPage = () => {
     // 实现逻辑
     return <div>New Feature</div>;
   };

   export default NewPage;
   ```

3. **添加路由**：
   ```javascript
   // client/src/App.js
   import NewPage from './pages/NewPage';

   <Route path="/new" element={<NewPage />} />
   ```

### 代码规范

- **JavaScript**: ES6+语法
- **缩进**: 2个空格
- **命名**:
  - 文件名：PascalCase（组件）或camelCase（工具）
  - 变量/函数：camelCase
  - 常量：UPPER_SNAKE_CASE
  - 组件：PascalCase
- **注释**: 复杂逻辑添加注释
- **错误处理**: 所有async函数使用try-catch

---

## 性能优化

### 已实现的优化

1. **数据库**：
   - 索引优化（复合索引、文本索引）
   - 连接池配置（10-50连接）
   - 虚拟字段减少存储

2. **API**：
   - 分页加载
   - 字段选择（select）
   - 聚合查询优化

3. **前端**：
   - React 18并发特性
   - 组件懒加载
   - 状态管理优化

### 未来优化方向

- [ ] Redis缓存
- [ ] CDN静态资源
- [ ] 图片压缩和懒加载
- [ ] 服务端渲染（SSR）
- [ ] WebSocket实时通知

---

## 贡献指南

欢迎贡献代码！请遵循以下流程：

1. Fork项目
2. 创建功能分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 提交Pull Request

---

## 更新日志

### v1.0.0 (2025-01-01)

**首次发布**

- ✅ 用户认证与授权系统
- ✅ 活动全生命周期管理
- ✅ 文件上传与管理
- ✅ 开销记录与预算跟踪
- ✅ 基于角色的权限控制
- ✅ 数据统计与分析
- ✅ 响应式UI设计
- ✅ 完整的API文档

---

## 许可证

MIT License

Copyright (c) 2025 Graduate Student Union

---

## 联系方式

- **项目维护者**：Graduate Student Union
- **问题反馈**：提交Issue到项目仓库
- **技术支持**：参考本文档故障排查章节

---

## 致谢

感谢所有使用和贡献本项目的开发者和用户。

**技术栈鸣谢**：
- [Node.js](https://nodejs.org/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Material-UI](https://mui.com/)
- [Express.js](https://expressjs.com/)
