/**
 * ZKP 电路工具模块
 * 
 * 功能：
 * 1. 加载 WASM 电路文件
 * 2. 生成 Witness（见证数据）
 * 3. 生成零知识证明
 * 4. 验证证明有效性
 * 
 * 隐私保护：
 * - Witness 数据绝不泄露至日志或链上
 * - 使用 Poseidon 哈希保护敏感输入
 * - 所有异步操作在 Web Worker 中执行（可选）
 */

import { groth16 } from 'snarkjs';
import { Buffer } from 'buffer';

// 电路文件路径（公共目录）
const CIRCUIT_WASM_PATH = '/zkp/health_circuit.wasm';
const CIRCUIT_ZKEY_PATH = '/zkp/health_circuit.zkey';

// 健康数据输入接口（私有 Witness）
export interface HealthWitness {
  // 年龄：必须 > 0 且 < 150
  age: number;
  // 收缩压：正常范围 90-140
  systolic_bp: number;
  // 舒张压：正常范围 60-90
  diastolic_bp: number;
  // 空腹血糖：正常范围 3.9-6.1 mmol/L
  fasting_glucose: number;
  // 随机盐值：防止彩虹表攻击
  salt: string;
}

// 公开信号接口（Public Signals，将上链）
export interface HealthPublicSignals {
  // 年龄范围证明：1=成年，0=未成年
  is_adult: number;
  // 血压正常证明：1=正常，0=异常
  bp_normal: number;
  // 血糖正常证明：1=正常，0=异常
  glucose_normal: number;
  // 健康数据哈希（保护原始数据）
  health_hash: string;
}

// 证明结果接口
export interface ZKProofResult {
  // Groth16 证明对象
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  // 公开信号
  publicSignals: HealthPublicSignals;
  // 证明生成耗时（毫秒）
  proofTime: number;
}

// 验证结果接口
export interface VerificationResult {
  // 验证是否通过
  valid: boolean;
  // 验证耗时（毫秒）
  verifyTime: number;
  // 错误信息（如有）
  error?: string;
}

/**
 * 加载电路 WASM 文件
 * 
 * 性能优化：
 * - 使用缓存避免重复加载
 * - WASM 文件预加载
 */
let wasmCache: any = null;

export async function loadCircuit(): Promise<any> {
  if (wasmCache) {
    return wasmCache;
  }

  try {
    const response = await fetch(CIRCUIT_WASM_PATH);
    if (!response.ok) {
      throw new Error(`加载电路文件失败：${response.status}`);
    }
    
    const wasmBuffer = await response.arrayBuffer();
    const wasmModule = await WebAssembly.compile(wasmBuffer);
    const wasmInstance = await WebAssembly.instantiate(wasmModule, {
      js: {
        // 提供必要的 JS 函数给 WASM 调用
        log: (msg: string) => {
          // 生产环境应禁用日志，避免泄露
          if (process.env.NODE_ENV === 'development') {
            console.log('[Circuit Log]:', msg);
          }
        }
      }
    });
    
    wasmCache = wasmInstance;
    return wasmCache;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    throw new Error('加载 WASM 电路失败：' + errorMessage);
  }
}

/**
 * 生成 Witness（见证数据）
 * 
 * 隐私保护：
 * - 输入数据在内存中立即销毁
 * - 不在日志中输出 Witness
 * 
 * @param witness 健康数据见证
 * @returns Witness 文件内容（Buffer）
 */
export async function generateWitness(witness: HealthWitness): Promise<Buffer> {
  // 输入验证：防止恶意数据
  validateHealthInput(witness);
  
  try {
    const circuit = await loadCircuit();
    
    // 将输入转换为电路可接受的格式
    const input: Record<string, any> = {
      age: witness.age.toString(),
      systolic_bp: witness.systolic_bp.toString(),
      diastolic_bp: witness.diastolic_bp.toString(),
      fasting_glucose: witness.fasting_glucose.toString(),
      salt: witness.salt
    };
    
    // 生成 Witness
    // 注意：witness.wtns 是电路实例的方法
    const witnessBuffer = await circuit.witnessCalculator?.calculateWTNSBin(input, 0);
    
    if (!witnessBuffer) {
      throw new Error('Witness 生成失败：电路未正确初始化');
    }
    
    // 立即清除明文输入（隐私保护）
    Object.keys(input).forEach(key => {
      input[key] = '***';
    });
    
    return Buffer.from(witnessBuffer);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    throw new Error('生成 Witness 失败：' + errorMessage);
  }
}

/**
 * 生成零知识证明
 * 
 * 性能指标：
 * - 目标生成时间：< 5 秒
 * - 约束数量：< 10,000
 * - 证明大小：< 200 KB
 * 
 * @param witness 健康数据见证
 * @returns 证明结果
 */
export async function generateProof(witness: HealthWitness): Promise<ZKProofResult> {
  const startTime = performance.now();
  
  try {
    // 步骤 1：加载 zkey 文件（证明密钥）
    const zkeyResponse = await fetch(CIRCUIT_ZKEY_PATH);
    if (!zkeyResponse.ok) {
      throw new Error(`加载 zkey 文件失败：${zkeyResponse.status}`);
    }
    const zkeyData = await zkeyResponse.arrayBuffer();
    const zkeyUint8Array = new Uint8Array(zkeyData);
    
    // 步骤 2：生成 Witness
    const witnessBuffer = await generateWitness(witness);
    const witnessUint8Array = new Uint8Array(witnessBuffer);
    
    // 步骤 3：生成 Groth16 证明
    const { proof, publicSignals } = await groth16.prove(
      zkeyUint8Array,
      witnessUint8Array
    );
    
    const endTime = performance.now();
    const proofTime = endTime - startTime;
    
    // 性能日志（仅开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ZKP] 证明生成耗时：${proofTime.toFixed(2)}ms`);
      console.log(`[ZKP] 公开信号：`, publicSignals);
    }
    
    return {
      proof: {
        pi_a: proof.pi_a,
        pi_b: proof.pi_b,
        pi_c: proof.pi_c,
        protocol: (proof as any).protocol || 'groth16',
        curve: (proof as any).curve || 'bn128'
      },
      publicSignals: {
        is_adult: Number(publicSignals[0]),
        bp_normal: Number(publicSignals[1]),
        glucose_normal: Number(publicSignals[2]),
        health_hash: publicSignals[3]
      },
      proofTime
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    throw new Error('生成 ZKP 证明失败：' + errorMessage);
  }
}

/**
 * 验证证明有效性
 * 
 * 验证流程：
 * 1. 加载验证密钥（vkey）
 * 2. 调用 groth16.verify
 * 3. 返回验证结果
 * 
 * @param proof 证明对象
 * @param publicSignals 公开信号
 * @returns 验证结果
 */
export async function verifyProof(
  proof: ZKProofResult['proof'],
  publicSignals: HealthPublicSignals
): Promise<VerificationResult> {
  const startTime = performance.now();
  
  try {
    // 注意：实际项目中需要从合约或可信源获取 vkey
    // 这里简化处理，假设 vkey 已预加载
    const vkey = await loadVerificationKey();
    
    const isValid = await groth16.verify(
      vkey,
      [
        publicSignals.is_adult.toString(),
        publicSignals.bp_normal.toString(),
        publicSignals.glucose_normal.toString(),
        publicSignals.health_hash
      ],
      proof
    );
    
    const endTime = performance.now();
    const verifyTime = endTime - startTime;
    
    return {
      valid: isValid,
      verifyTime
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      valid: false,
      verifyTime: 0,
      error: errorMessage
    };
  }
}

/**
 * 加载验证密钥（vkey）
 * 
 * 安全说明：
 * - vkey 应从可信源获取（如合约部署时的公开记录）
 * - 避免使用本地缓存的 vkey（可能被篡改）
 */
let vkeyCache: any = null;

async function loadVerificationKey(): Promise<any> {
  if (vkeyCache) {
    return vkeyCache;
  }
  
  // 注意：实际项目中需要从链上合约或可信 API 获取
  // 这里使用简化方式
  try {
    const response = await fetch('/zkp/vkey.json');
    if (!response.ok) {
      throw new Error('加载验证密钥失败');
    }
    vkeyCache = await response.json();
    return vkeyCache;
  } catch (error) {
    // 如果 vkey 文件不存在，使用默认空对象（仅开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.warn('使用默认 vkey（仅开发环境）');
      vkeyCache = {};
      return vkeyCache;
    }
    throw error;
  }
}

/**
 * 健康数据输入验证
 * 
 * 业务规则：
 * 1. 年龄：0 < age < 150
 * 2. 收缩压：60 <= systolic <= 250
 * 3. 舒张压：40 <= diastolic <= 150
 * 4. 血糖：1.0 <= glucose <= 20.0
 * 
 * 防御攻击：
 * - 负数输入
 * - 极大值溢出
 * - 非数字类型
 */
function validateHealthInput(input: HealthWitness): void {
  const errors: string[] = [];
  
  // 年龄验证
  if (typeof input.age !== 'number' || input.age <= 0 || input.age >= 150) {
    errors.push('年龄必须在 0-150 之间');
  }
  
  // 收缩压验证
  if (typeof input.systolic_bp !== 'number' || 
      input.systolic_bp < 60 || 
      input.systolic_bp > 250) {
    errors.push('收缩压必须在 60-250 之间');
  }
  
  // 舒张压验证
  if (typeof input.diastolic_bp !== 'number' || 
      input.diastolic_bp < 40 || 
      input.diastolic_bp > 150) {
    errors.push('舒张压必须在 40-150 之间');
  }
  
  // 血糖验证
  if (typeof input.fasting_glucose !== 'number' || 
      input.fasting_glucose < 1.0 || 
      input.fasting_glucose > 20.0) {
    errors.push('血糖必须在 1.0-20.0 mmol/L 之间');
  }
  
  // 盐值验证（防止彩虹表）
  if (!input.salt || input.salt.length < 16) {
    errors.push('盐值长度必须 >= 16');
  }
  
  if (errors.length > 0) {
    throw new Error('健康数据验证失败：' + errors.join('；'));
  }
}

/**
 * 生成随机盐值
 * 
 * 密码学安全：
 * - 使用 crypto.getRandomValues
 * - 长度 >= 16 字节
 */
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
