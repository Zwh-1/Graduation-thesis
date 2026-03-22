# *📘 系统 API 开发文档 (v1.0)**

## **1. 🏗️ 架构概览**

- **通信协议**: HTTPS (生产环境) / HTTP (本地开发)
- **数据格式**: `application/json`
- 认证机制:
  - 普通接口：无认证 / API Key (机构)
  - 用户接口：**SIWE (Sign-In with Ethereum)** 签名认证 (推荐) 或 JWT
- **版本控制**: URL 路径前缀 `/api/v1`
- **跨域策略 (CORS)**: 仅允许受信任的前端域名访问

### **核心交互流程**

1. **前端**: 加载电路 -> 本地生成 Proof -> 调用 API 提交。
2. **后端**: 接收 Proof -> **本地 SnarkJS 预验证** -> 异步发送链上交易 -> 返回 TaskID。
3. **前端**: 轮询 TaskID 状态 -> 展示结果。

------

## **2. 🔐 通用规范**

### **2.1 响应结构 (Standard Response)**

所有 API 返回统一封装格式：

```
{
  "code": 200,          // 业务状态码 (200: 成功, 4xx: 客户端错误, 5xx: 服务端错误)
  "message": "success", // 提示信息
  "data": {             // 业务数据 payload
    "...": "..."
  },
  "timestamp": 1710234567890
}
```

**错误响应示例**:

```
{
  "code": 4001,
  "message": "Invalid ZK Proof: Verification failed",
  "data": null,
  "timestamp": 1710234567890
}
```

### **2.2 公共请求头 (Headers)**

| Header          | 必填 | 说明                                  |
| :-------------- | :--- | :------------------------------------ |
| `Content-Type`  | ✅    | `application/json`                    |
| `Authorization` | ⚠️    | `Bearer <token>` (用户登录后的 Token) |
| `X-Request-ID`  | ❌    | 链路追踪 ID (可选，用于调试)          |

------

## **3. 📡 详细接口定义**

### **模块一：系统配置与发现 (System & Config)**

*用途：前端启动时获取必要的公钥、电路版本等信息，无需登录。*

#### **3.1 获取验证密钥哈希**

- **描述**: 获取当前后端使用的 ZK 验证密钥 (VK) 哈希，供前端校验本地电路版本是否匹配。

- **Method**: `GET`

- **Path**: `/api/v1/config/vk-hash`

- Response:

  ```
  {
    "code": 200,
    "data": {
      "vkHash": "0x1a2b3c... (64 chars)",
      "circuitVersion": "v2.1.0",
      "maxFileSize": 5242880
    }
  }
  ```

#### **3.2 获取可信机构白名单**

- **描述**: 获取所有已注册的医院/机构公钥列表。

- **Method**: `GET`

- **Path**: `/api/v1/config/issuers`

- Query Params:

  - `status`: `active` | `revoked` (默认 active)

- Response:

  ```
  {
    "code": 200,
    "data": [
      {
        "issuerId": "HOSP_BEIJING_001",
        "name": "北京协和医院",
        "publicKey": "0x...",
        "expiryDate": "2026-12-31T23:59:59Z",
        "status": "active"
      }
    ]
  }
  ```

------

### **模块二：用户认证 (Authentication)**

*用途：基于钱包地址的去中心化登录 (SIWE)。*

#### **3.3 获取登录挑战 (Get Challenge)**

- **描述**: 前端请求一个随机 Nonce，用于构造签名消息。

- **Method**: `GET`

- **Path**: `/api/v1/auth/challenge`

- **Query Params**: `address` (用户钱包地址, e.g., `0xAb58...`)

- Response:

  ```
  {
    "code": 200,
    "data": {
      "nonce": "a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8",
      "expirationTime": "2026-03-12T10:35:00Z", // 5分钟后过期
      "messageToSign": "Welcome to HealthZK!\n\nClick to sign in.\n\nNonce: a1b2c3d4..."
    }
  }
  ```

#### **3.4 验证签名并登录 (Verify Signature)**

- **描述**: 前端使用钱包签名后，发送签名值换取 JWT Token。

- **Method**: `POST`

- **Path**: `/api/v1/auth/login`

- Body:

  ```
  {
    "address": "0xAb58...",
    "signature": "0x1234abcd...",
    "nonce": "a1b2c3d4..."
  }
  ```

- Response:

  ```
  {
    "code": 200,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600,
      "userProfile": {
        "address": "0xAb58...",
        "firstLogin": true
      }
    }
  }
  ```

------

### **模块三：核心验证业务 (Verification Core)**

*用途：提交 ZK 证明，触发后端预验证及上链流程。这是系统最核心的接口。*

#### **3.5 提交零知识证明 (Submit ZK Proof)**

- **描述**: 用户上传本地生成的 Proof 和 Public Inputs。后端将进行**链下预验证**，通过后异步上链。

- **Method**: `POST`

- **Path**: `/api/v1/verify/submit`

- **Auth**: Required (`Bearer Token`)

- **Rate Limit**: 5 requests / minute / user

- Body:

  ```
  {
    "proof": {
      "pi_a": ["1", "2", ...],
      "pi_b": [["1", "2"], ["3", "4"]],
      "pi_c": ["5", "6", ...]
    },
    "publicInputs": ["1", "0"], // 例如：[isValid, timestamp_hash]
    "nonce": "unique-uuid-string", // 防重放
    "metadata": {
      "circuitVersion": "v2.1.0",
      "inputHash": "0x..." // 原始数据的哈希，用于审计
    }
  }
  ```

- Response (立即返回，不等待上链):

  ```
  {
    "code": 200,
    "message": "Proof verified locally. Transaction queued.",
    "data": {
      "taskId": "task_889900",
      "estimatedTime": 15, // 预计上链时间 (秒)
      "status": "PROCESSING"
    }
  }
  ```

- 错误码:

  - `4001`: Proof 数学验证失败 (SnarkJS 报错)。
  - `4002`: Nonce 重复使用 (重放攻击)。
  - `4003`: 电路版本不匹配。

#### **3.6 查询验证任务状态 (Get Task Status)**

- **描述**: 前端轮询此接口以获取链上确认结果。

- **Method**: `GET`

- **Path**: `/api/v1/verify/status/:taskId`

- **Auth**: Required

- Response (处理中):

  ```
  {
    "code": 200,
    "data": {
      "taskId": "task_889900",
      "status": "PROCESSING", // PENDING, PROCESSING, CONFIRMED, FAILED
      "progress": "Waiting for block confirmation...",
      "txHash": null
    }
  }
  ```

- Response (成功):

  ```
  {
    "code": 200,
    "data": {
      "taskId": "task_889900",
      "status": "CONFIRMED",
      "txHash": "0x998877...",
      "blockNumber": 12345678,
      "result": {
        "verified": true,
        "onChainData": "..." 
      }
    }
  }
  ```

------

### **模块四：机构管理 (Issuer Management)**

*用途：仅限授权管理员或机构账号调用，用于注册公钥。*

#### **3.7 注册机构公钥**

- **描述**: 提交由根密钥签名的新业务公钥证书。

- **Method**: `POST`

- **Path**: `/api/v1/issuers/register`

- **Auth**: Required (Admin Role or mTLS)

- Body:

  ```
  {
    "issuerId": "HOSP_SH_002",
    "publicKeyHex": "0x...",
    "certificateSignature": "0x...", // Root Key 对 (PK + Expiry) 的签名
    "expiryTimestamp": 1735689600
  }
  ```

------

## **4. 🛠️ 后端实现指南 (NestJS)**

### **4.1 项目结构建议**

```
src/
├── auth/               # 认证模块 (SIWE, JWT Guard)
├── config/             # 配置模块 (VK 加载, 区块链 Provider)
├── verify/             # 核心验证模块
│   ├── verify.controller.ts
│   ├── verify.service.ts    # 调用 snarkjs, 队列管理
│   ├── dto/                 # 数据验证类 (class-validator)
│   └── strategies/          # 链下验证策略
├── blockchain/         # 区块链交互模块 (ethers.js)
├── common/             # 通用过滤器, 拦截器, 装饰器
└── main.ts
```

### **4.2 关键代码片段：验证服务 (verify.service.ts)**

```
import { Injectable, BadRequestException } from '@nestjs/common';
import { groth16 } from 'snarkjs';
import { readFileSync } from 'fs';
import { BlockchainService } from '../blockchain/blockchain.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class VerifyService {
  private vk: any;

  constructor(
    private blockchainService: BlockchainService,
    private redisService: RedisService,
  ) {
    // 启动时加载验证密钥 (生产环境建议从加密存储加载)
    this.vk = JSON.parse(readFileSync('./keys/vk.json').toString());
  }

  async submitProof(proofDto: any, userId: string) {
    const { proof, publicInputs, nonce } = proofDto;

    // 1. 检查 Nonce 防重放 (Redis)
    const isUsed = await this.redisService.get(`nonce:${nonce}`);
    if (isUsed) throw new BadRequestException('Nonce already used');

    // 2. 链下预验证 (核心优化点)
    try {
      const isValid = await groth16.verify(this.vk, publicInputs, proof);
      if (!isValid) {
        throw new BadRequestException('ZK Proof mathematical verification failed');
      }
    } catch (e) {
      throw new BadRequestException('Invalid proof structure or calculation error');
    }

    // 3. 锁定 Nonce (设置短过期时间，防止并发竞争)
    await this.redisService.set(`nonce:${nonce}`, 'processing', 300);

    // 4. 异步上链 (放入队列或直接触发，不要 await)
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 保存初始状态
    await this.redisService.set(`task:${taskId}`, JSON.stringify({
      status: 'PROCESSING',
      userId,
      createdAt: Date.now()
    }), 3600);

    // 触发区块链交易
    this.blockchainService.sendVerificationTx(taskId, proof, publicInputs, nonce)
      .then((txHash) => {
        // 更新状态为已发送
        this.redisService.set(`task:${taskId}`, JSON.stringify({
           status: 'PENDING_CHAIN', txHash 
        }), 3600);
      })
      .catch((err) => {
        // 更新状态为失败
        this.redisService.set(`task:${taskId}`, JSON.stringify({
           status: 'FAILED', error: err.message 
        }), 3600);
        // 释放 Nonce 锁 (允许重试)
        this.redisService.del(`nonce:${nonce}`);
      });

    return { taskId, status: 'PROCESSING' };
  }
}
```

------

## **5. 💻 前端集成指南 (Axios)**

### **5.1 Axios 实例配置 (**`src/utils/request.ts`**)**

```
import axios from 'axios';

const request = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 10000,
});

// 请求拦截器：注入 Token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // 添加防 CSRF 头 (如果需要)
  config.headers['X-Request-ID'] = crypto.randomUUID();
  return config;
});

// 响应拦截器：统一错误处理
request.interceptors.response.use(
  (response) => {
    if (response.data.code !== 200) {
      // 业务逻辑错误
      throw new Error(response.data.message || 'Business Error');
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期，跳转登录
      window.location.href = '/login';
    } else if (error.response?.status === 429) {
      alert('操作过于频繁，请稍后重试');
    }
    return Promise.reject(error);
  }
);

export default request;
```

### **5.2 调用示例：提交证明**

```
import request from '@/utils/request';
import { groth16 } from 'snarkjs'; // 前端也需引入用于生成 proof

export async function generateAndSubmit(healthData, signature) {
  // 1. 本地生成 Proof (Web Worker 中执行更佳)
  const { proof, publicInputs } = await groth16.fullProve(
    { healthData, signature }, 
    'circuit.wasm', 
    'circuit.zkey'
  );

  // 2. 获取 Nonce (可选，如果后端要求先获取)
  // const { data: { nonce } } = await request.get('/auth/challenge?address=...');

  // 3. 提交给后端
  const result = await request.post('/verify/submit', {
    proof,
    publicInputs,
    nonce: crypto.randomUUID(), // 前端生成唯一 ID
    metadata: { circuitVersion: 'v2.1.0' }
  });

  return result.data.taskId;
}

// 轮询状态
export async function pollTaskStatus(taskId) {
  let attempts = 0;
  while (attempts < 20) { // 最多轮询 20 次
    await new Promise(r => setTimeout(r, 2000)); // 每 2 秒查一次
    const res = await request.get(`/verify/status/${taskId}`);
    
    if (res.data.status === 'CONFIRMED') return res.data;
    if (res.data.status === 'FAILED') throw new Error('On-chain verification failed');
    
    attempts++;
  }
  throw new Error('Timeout waiting for confirmation');
}
```

------

## **6. 🚀 部署与测试建议**

1. Swagger 文档:
   - 在 NestJS 中安装 `@nestjs/swagger`。
   - 启动后访问 `http://localhost:3000/api-docs` 即可看到交互式文档，方便前端对接。
2. 压力测试:
   - 使用 `k6` 或 `JMeter` 模拟高并发提交 Proof，观察后端 CPU (SnarkJS 计算密集) 和内存使用情况。
   - 重点测试 Redis 锁在高并发下的表现，确保 Nonce 防重放无误。
3. 安全审计:
   - 确保 `/verify/submit` 接口有严格的 Rate Limiting。
   - 检查 CORS 配置，严禁 `*` 通配符，必须指定前端域名。

这份文档涵盖了从架构设计到代码实现的完整流程，您可以直接将其作为毕业设计的**“系统实现”**章节的核心内容，或作为开发团队的执行标准。