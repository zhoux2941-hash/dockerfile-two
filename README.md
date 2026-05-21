---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 304402205a260d802be441e040eec1a7a8e95f9fdf71f103858d03ad55e2ba7dce333c90022007e7d36fa788806c2f32121b831a48207cfcac6f37f3657eb1b3375a56f98a94
    ReservedCode2: 30460221008dc6fc636d31f7872d6c8ab1f4f92d912766bd3402367c66987da9d765990710022100df2d7b989ec970d4f7479e9fa8d568cd7703b79da22740350873c29250f00a93
---

# 任务管理系统 - Node.js 版本

## 项目概览

这是一个基于 **Node.js + Express + SQLite** 构建的完整任务管理系统，包含后端 API 和前端界面。项目采用分层架构设计，具有模块化、可扩展的特点，适合用于 AI Agent 评估场景中的 7 轮提示词测试。

## 项目结构（31个文件）

```
environment/repo/
├── src/
│   ├── app.js                          # Express 应用主入口
│   ├── config/
│   │   └── database.js                 # 数据库配置与初始化（含种子数据）
│   ├── controllers/                     # 控制器层
│   │   ├── userController.js           # 用户管理
│   │   ├── projectController.js        # 项目管理
│   │   ├── taskController.js           # 任务管理
│   │   ├── commentController.js        # 评论管理
│   │   └── notificationController.js   # 通知管理
│   ├── models/                          # 数据模型层
│   │   ├── userModel.js                # 用户模型
│   │   ├── projectModel.js             # 项目模型
│   │   ├── taskModel.js                # 任务模型
│   │   ├── commentModel.js             # 评论模型
│   │   └── notificationModel.js        # 通知模型
│   ├── routes/                          # 路由定义
│   │   ├── userRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── commentRoutes.js
│   │   └── notificationRoutes.js
│   ├── services/                        # 业务服务层
│   │   └── notificationService.js      # 通知服务
│   ├── middleware/                      # 中间件
│   │   ├── authMiddleware.js           # JWT 认证中间件
│   │   ├── errorHandler.js             # 全局错误处理
│   │   └── requestLogger.js            # 请求日志
│   └── utils/                          # 工具函数
│       ├── validation.js               # 数据验证
│       └── formatter.js                # 数据格式化
├── public/                             # 前端资源
│   ├── index.html                      # 主页面
│   ├── css/styles.css                  # 样式表
│   └── js/app.js                       # 前端逻辑
├── data/                               # 数据库目录
├── package.json                        # 项目依赖配置
└── .gitignore                          # Git 忽略配置

environment/
├── Dockerfile                          # Docker 构建配置
├── instance_1/
│   └── instruction.md                  # 7轮提示词场景
└── ssh_plugin/                         # SSH 远程连接插件
```

## 核心功能特性

### 1. 用户认证与权限管理

系统实现了完整的用户认证体系，包括 JWT 令牌认证、密码加密存储（bcryptjs）、角色权限控制（admin/manager/user/guest）。用户可以登录、查看个人资料，系统支持基于角色的访问控制。

### 2. 项目管理系统

支持项目的创建、更新、删除、搜索功能。每个项目包含名称、描述、负责人、状态、优先级等属性。系统自动计算项目统计信息，包括任务总数、完成率、工时统计等。

### 3. 任务管理系统

任务系统支持完整的 CRUD 操作，包括标题、描述、项目关联、指派人员、状态、优先级、工时估算、截止日期等字段。任务支持标签管理，可以按状态、优先级、项目等条件筛选。

### 4. 评论与通知系统

每个任务都可以添加评论，支持任务的讨论和沟通。通知系统会在任务分配、任务完成、收到评论等事件发生时自动发送通知。用户可以查看未读通知计数、标记已读等操作。

### 5. 前端交互界面

提供了完整的管理界面，包括仪表盘（显示统计信息、最近任务、进行中项目）、用户管理、项目管理、任务管理、通知中心等模块。界面支持数据的增删改查、搜索筛选、分页等功能。

## 技术架构亮点

### 分层架构设计

项目采用标准的 MVC 架构，清晰的分层设计使得代码结构清晰、易于维护：

- **Models 层**：直接与数据库交互，封装数据操作逻辑
- **Controllers 层**：处理业务逻辑，协调 Models 和 Views
- **Routes 层**：定义 API 端点，将请求路由到对应 Controller
- **Services 层**：封装复杂业务逻辑，如通知服务
- **Middleware 层**：处理跨切面逻辑，如认证、日志、错误处理

### 数据库设计

使用 SQLite 作为数据库，内置初始化脚本，包含以下表结构：

- `users`：用户表（id、username、email、password_hash、role）
- `projects`：项目表（id、name、description、owner_id、status、priority）
- `tasks`：任务表（id、title、description、project_id、assignee_id、reporter_id、status、priority）
- `comments`：评论表（id、task_id、user_id、content）
- `notifications`：通知表（id、user_id、type、title、message、read）
- `task_tags`：任务标签关联表

### 安全特性

- 密码使用 bcrypt 进行加密存储
- JWT 令牌认证保护 API 端点
- 输入数据验证和清理
- SQL 注入防护（通过参数化查询）
- CORS 跨域资源共享配置

## 运行方式

### 本地运行

```bash
cd environment/repo
npm install
node src/app.js
```

访问地址：`http://localhost:8080`

### Docker 构建运行

```bash
cd environment
docker build -t task-manager .
docker run -d -p 8080:8080 -p 2222:22 task-manager
```

## API 端点列表

### 用户接口

- `GET /api/users` - 获取所有用户
- `GET /api/users/:id` - 获取用户详情（含统计信息）
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户
- `POST /api/users/login` - 用户登录

### 项目接口

- `GET /api/projects` - 获取所有项目（支持状态、优先级筛选）
- `GET /api/projects/search?q=` - 搜索项目
- `GET /api/projects/:id` - 获取项目详情（含任务列表）
- `GET /api/projects/:id/stats` - 获取项目统计
- `POST /api/projects` - 创建项目
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### 任务接口

- `GET /api/tasks` - 获取所有任务（支持多条件筛选）
- `GET /api/tasks/search?q=` - 搜索任务
- `GET /api/tasks/overdue` - 获取逾期任务
- `GET /api/tasks/tag/:tag` - 按标签获取任务
- `GET /api/tasks/user/:userId` - 获取用户的任务
- `GET /api/tasks/:id` - 获取任务详情（含评论和标签）
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务

### 通知接口

- `GET /api/notifications/:userId` - 获取用户通知
- `GET /api/notifications/:userId/recent` - 获取最近通知
- `GET /api/notifications/:userId/unread-count` - 获取未读数量
- `POST /api/notifications` - 创建通知
- `PUT /api/notifications/:id/read` - 标记已读
- `PUT /api/notifications/:userId/read-all` - 全部标记已读
- `DELETE /api/notifications/:id` - 删除通知

## 种子数据说明

系统初始化时会自动创建以下示例数据：

**用户（4个）**：

- admin（管理员）
- john_doe（普通用户）
- jane_smith（普通用户）
- bob_wilson（经理）

**项目（3个）**：

- Website Redesign（进行中，高优先级）
- Mobile App Development（进行中，高优先级）
- API Integration（规划中，中优先级）

**任务（5个）**：

- Design homepage mockup（进行中，已分配给 john_doe）
- Implement user authentication（待处理，已分配给 jane_smith）
- Set up CI/CD pipeline（待处理，已分配给 john_doe）
- Write API documentation（已完成）
- Database schema optimization（待处理，未分配）

## 刻意植入的缺陷

为满足 7 轮提示词评估需求，项目中刻意植入了以下缺陷：

### BUG-001：数据库初始化语法错误

位置：`src/config/database.js` 第 18 行

```sql
CREATE TABLE IF NOT EXISTS IF NOT EXISTS projects (
```

问题：SQL 语句中 `IF NOT EXISTS` 重复两次，导致语法错误。系统启动时会抛出 SQLite 语法异常。

### BUG-002：JWT 密钥硬编码

位置：`src/controllers/userController.js` 和 `src/middleware/authMiddleware.js`

```javascript
const JWT_SECRET = 'your-secret-key-change-in-production';
```

问题：JWT 密钥使用硬编码的默认值，在生产环境中存在安全隐患。

### BUG-003：缺失的事务处理

位置：`src/controllers/taskController.js` 的 `create` 方法

```javascript
const task = TaskModel.create({...});
if (assignee_id) {
  await NotificationService.sendTaskAssignment(task);
}
```

问题：创建任务和发送通知之间缺少事务处理，如果通知发送失败，任务仍然会被创建，导致数据不一致。

### BUG-004：缺少输入验证

位置：各 Controller 的 create/update 方法

问题：大部门端点缺少对输入数据的严格验证，可能导致无效数据被写入数据库。

### BUG-005：SQL 注入风险

位置：`src/models/taskModel.js` 的 `searchTasks` 方法

```javascript
const searchPattern = `%${searchTerm}%`;
```

问题：虽然使用了参数化查询的语法，但在某些动态查询构建中仍存在潜在的 SQL 注入风险。

### BUG-006：缓存失效问题

位置：`src/services/notificationService.js`

问题：通知服务中查询团队成员时，每次都需要访问数据库，没有实现缓存机制，在高并发场景下会影响性能。

### BUG-007：错误处理不完善

位置：`src/app.js` 和各 Controller

问题：错误处理中间件虽然已实现，但很多异步操作缺少 try-catch 包装，错误可能被静默忽略。

## 提示词场景说明

`instance_1/instruction.md` 中包含 7 个渐进复杂的提示词场景：

### 第一轮：基础查询

用户可以查询用户列表、项目列表、任务列表等基础数据。

### 第二轮：数据创建

用户可以创建新的用户、项目、任务，测试系统的写入能力。

### 第三轮：数据更新

用户可以更新现有资源的信息，测试系统的更新逻辑。

### 第四轮：高级搜索

用户可以按条件筛选数据、搜索特定内容，测试系统的查询能力。

### 第五轮：错误调试

用户提供具体的错误信息，需要 Agent 定位并修复 BUG-001 及其他缺陷。

### 第六轮：功能增强

用户要求实现新功能（如任务评论、通知系统），需要 Agent 理解和扩展现有架构。

### 第七轮：性能优化

用户反馈系统响应缓慢，需要 Agent 分析性能瓶颈并实施优化方案（如添加缓存、优化查询）。

## 技术栈清单

- **运行时**：Node.js 20.x
- **Web 框架**：Express 4.18.2
- **数据库**：SQLite（better-sqlite3 9.2.2）
- **认证**：JSON Web Token（jsonwebtoken 9.0.2）
- **密码加密**：bcryptjs 2.4.3
- **唯一ID生成**：uuid 9.0.0
- **跨域支持**：cors 2.8.5
- **数据解析**：body-parser 1.20.2

## 环境变量配置

项目支持以下环境变量（可在 `.env` 文件中配置）：

- `PORT`：应用监听端口（默认 8080）
- `NODE_ENV`：运行环境（development/production）
- `JWT_SECRET`：JWT 签名密钥

## 注意事项

1. 数据库文件位于 `data/tasks.db`，首次运行时会自动创建并初始化
2. 种子数据仅在数据库为空时自动导入
3. 前端界面通过 REST API 与后端通信
4. SSH 插件配置在 2222 端口，用于远程开发连接
5. 所有 API 端点均支持 JSON 格式请求和响应