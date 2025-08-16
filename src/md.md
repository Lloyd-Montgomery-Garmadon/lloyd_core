针对大型 TypeScript 后端服务项目，封装和完善工具类非常重要，既能提高开发效率，也有利于代码的可维护性、健壮性和扩展性。下面我帮你列一个比较丰富且实用的后端服务专用工具类清单和说明。

---

# 一、后端服务常见且实用的工具类分类及功能

| 工具类名称                | 主要功能描述                       | 备注              |
| -------------------- | ---------------------------- | --------------- |
| **logUtils.ts**      | 日志封装（支持等级、格式化、异步写文件/远程）      | 关键工具，方便排查和监控    |
| **errorUtils.ts**    | 自定义错误类、错误格式化、统一异常处理工具        | 方便统一抛错和错误日志     |
| **dbUtils.ts**       | 数据库连接管理、事务封装、数据转换            | 配合 ORM 或直接数据库操作 |
| **cacheUtils.ts**    | 缓存操作封装（Redis 等）、缓存策略管理       | 高性能缓存关键组件       |
| **authUtils.ts**     | 认证鉴权工具（JWT、OAuth、权限校验）       | 安全模块核心          |
| **cryptoUtils.ts**   | 加密、解密、哈希、签名等                 | 密码保护、数据加密       |
| **dateUtils.ts**     | 日期格式化、时区处理、时间计算              | 便于日志、数据时间处理     |
| **validateUtils.ts** | 输入校验、数据格式验证、规则定义             | 保证数据安全和完整       |
| **httpUtils.ts**     | HTTP 请求封装（客户端请求、接口调用）        | 方便调用第三方接口       |
| **responseUtils.ts** | API 响应格式封装、统一响应结构            | 规范接口输出          |
| **fileUtils.ts**     | 文件读写、上传处理、路径管理               | 文件服务相关          |
| **stringUtils.ts**   | 字符串处理（拼接、模板、格式转换）            | 方便文本操作          |
| **arrayUtils.ts**    | 数组处理（去重、过滤、分组）               | 辅助数据操作          |
| **objectUtils.ts**   | 对象深拷贝、合并、过滤、遍历               | 方便数据转换          |
| **envUtils.ts**      | 环境变量管理、配置文件读取                | 管理不同环境配置        |
| **promiseUtils.ts**  | 异步控制（超时、并发限制、重试机制）           | 处理复杂异步流程        |
| **queueUtils.ts**    | 任务队列、消息队列封装（RabbitMQ、Kafka等） | 高并发处理关键         |
| **serviceUtils.ts**  | 服务注册、服务发现、负载均衡辅助             | 微服务架构支持         |
| **emailUtils.ts**    | 邮件发送封装                       | 发送通知、验证码等       |
| **randomUtils.ts**   | 随机数、UUID 生成                  | 唯一标识、验证码生成      |
| **numberUtils.ts**   | 数字格式化、精度处理                   | 金额、百分比、计数器      |

---

# 二、后端常用工具类具体示例

### 1. **日志封装（logUtils.ts）**

* 支持控制台 + 文件输出
* 支持日志等级
* 支持异步写日志
* 支持接入远程日志系统

---

### 2. **错误处理（errorUtils.ts）**

```ts
export class ApiError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// 统一异常处理中间件示例 (Express)
export function errorHandler(err: any, req: any, res: any, next: any) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: err.message, details: err.details });
  } else {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
```

---

### 3. **JWT 认证工具（authUtils.ts）**

```ts
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'default_secret';

export function signToken(payload: object, expiresIn = '1h'): string {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyToken(token: string): object | null {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
```

---

### 4. **缓存工具（cacheUtils.ts，基于 Redis）**

```ts
import Redis from 'ioredis';

const redis = new Redis();

export async function getCache(key: string): Promise<string | null> {
  return await redis.get(key);
}

export async function setCache(key: string, value: string, expireSeconds?: number): Promise<void> {
  if (expireSeconds) {
    await redis.set(key, value, 'EX', expireSeconds);
  } else {
    await redis.set(key, value);
  }
}

export async function delCache(key: string): Promise<void> {
  await redis.del(key);
}
```

---

# 三、建议的工具类目录结构

```
src/
├── utils/
│   ├── authUtils.ts
│   ├── cacheUtils.ts
│   ├── cryptoUtils.ts
│   ├── dateUtils.ts
│   ├── dbUtils.ts
│   ├── emailUtils.ts
│   ├── errorUtils.ts
│   ├── fileUtils.ts
│   ├── httpUtils.ts
│   ├── logUtils.ts
│   ├── numberUtils.ts
│   ├── promiseUtils.ts
│   ├── randomUtils.ts
│   ├── responseUtils.ts
│   ├── stringUtils.ts
│   ├── validateUtils.ts
│   └── ...
```

---

# 四、总结

* **日志、错误处理、认证和缓存** 是后端项目最基础和关键的工具类模块。
* 结合具体项目技术栈，比如数据库类型、消息队列等，还可以扩展更多专用工具。
* 工具类设计要保持单一职责、易测试和类型安全。

---

如果你需要，我可以帮你写一份详细的工具库模板代码，或者帮你设计对应的接口和测试用例，方便你直接落地使用！你需要吗？
