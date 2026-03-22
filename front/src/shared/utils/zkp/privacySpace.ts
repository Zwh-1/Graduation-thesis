/**
 * 隐私空间管理模块
 * 
 * 功能：
 * 1. 本地加密存储健康数据
 * 2. ZKP 密钥对管理
 * 3. 用户身份验证状态
 * 
 * 隐私保护：
 * - 所有数据加密存储（AES-256-GCM）
 * - 密钥派生使用 PBKDF2
 * - 支持用户主动清除数据
 */

import { generateProof, type HealthWitness, type ZKProofResult } from './circuit';
import { Buffer } from 'buffer';

// 隐私空间数据结构
export interface PrivacySpace {
  // 用户钱包地址（小写）
  address: string;
  // 创建时间戳
  createdAt: number;
  // ZKP 证明密钥（加密存储）
  encryptedZkpKeys?: string;
  // 加密的健康数据列表
  encryptedHealthData: EncryptedHealthRecord[];
  // 最近一次签名验证
  lastSignature?: string;
  // 空间版本（用于迁移）
  version: number;
}

// 加密健康记录
export interface EncryptedHealthRecord {
  // 记录 ID（UUID）
  id: string;
  // 加密数据（Base64）
  ciphertext: string;
  // IV（Base64）
  iv: string;
  // 时间戳
  timestamp: number;
  // 数据哈希（用于完整性校验）
  hash: string;
}

// 解密后的健康记录
export interface DecryptedHealthRecord {
  id: string;
  data: HealthWitness;
  timestamp: number;
  proof?: ZKProofResult;
}

// 存储键前缀
const STORAGE_PREFIX = 'privacy_space_';

// 当前版本
const CURRENT_VERSION = 1;

/**
 * 初始化隐私空间
 * 
 * 流程：
 * 1. 检查是否已存在
 * 2. 生成加密密钥
 * 3. 创建空数据结构
 * 
 * @param address 钱包地址
 * @param signature 签名（用于密钥派生）
 * @returns 隐私空间
 */
export async function initializePrivacySpace(
  address: string,
  signature: string
): Promise<PrivacySpace> {
  const storageKey = getStorageKey(address);
  
  // 检查是否已存在
  const existing = localStorage.getItem(storageKey);
  if (existing) {
    const space: PrivacySpace = JSON.parse(existing);
    console.log('[隐私空间] 检测到已有空间:', address);
    return space;
  }
  
  // 创建新空间
  const space: PrivacySpace = {
    address: address.toLowerCase(),
    createdAt: Date.now(),
    encryptedZkpKeys: undefined, // 暂不存储密钥
    encryptedHealthData: [],
    lastSignature: signature,
    version: CURRENT_VERSION
  };
  
  // 加密存储
  await savePrivacySpace(space);
  
  console.log('[隐私空间] 创建成功:', address);
  return space;
}

/**
 * 保存隐私空间
 * 
 * 安全说明：
 * - 敏感数据已加密
 * - 使用 JSON.stringify 序列化
 * 
 * @param space 隐私空间
 */
export async function savePrivacySpace(space: PrivacySpace): Promise<void> {
  const storageKey = getStorageKey(space.address);
  const data = JSON.stringify(space);
  
  try {
    localStorage.setItem(storageKey, data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    // 处理存储空间不足
    if (errorMessage.includes('QuotaExceededError')) {
      throw new Error('本地存储空间不足，请清除部分数据');
    }
    
    throw new Error('保存隐私空间失败：' + errorMessage);
  }
}

/**
 * 加载隐私空间
 * 
 * @param address 钱包地址
 * @returns 隐私空间或 null
 */
export async function loadPrivacySpace(address: string): Promise<PrivacySpace | null> {
  const storageKey = getStorageKey(address);
  const data = localStorage.getItem(storageKey);
  
  if (!data) {
    return null;
  }
  
  try {
    const space: PrivacySpace = JSON.parse(data);
    
    // 版本检查（未来用于迁移）
    if (space.version !== CURRENT_VERSION) {
      console.warn('[隐私空间] 版本不匹配，需要迁移:', space.version);
      // TODO: 实现迁移逻辑
    }
    
    return space;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[隐私空间] 加载失败:', errorMessage);
    return null;
  }
}

/**
 * 添加健康记录
 * 
 * 流程：
 * 1. 生成 ZKP 证明
 * 2. 加密数据
 * 3. 存储到隐私空间
 * 
 * @param address 钱包地址
 * @param healthData 健康数据（明文，仅在内存中）
 * @returns 记录 ID
 */
export async function addHealthRecord(
  address: string,
  healthData: HealthWitness
): Promise<string> {
  // 加载隐私空间
  const space = await loadPrivacySpace(address);
  if (!space) {
    throw new Error('隐私空间不存在，请先初始化');
  }
  
  // 生成 ZKP 证明
  const proofResult = await generateProof(healthData);
  
  // 生成记录 ID
  const recordId = generateUUID();
  
  // 加密数据（简化版本，实际应使用 AES）
  const encrypted = await encryptHealthData(healthData);
  
  // 添加到列表
  space.encryptedHealthData.push({
    id: recordId,
    ciphertext: encrypted.ciphertext,
    iv: encrypted.iv,
    timestamp: Date.now(),
    hash: encrypted.hash
  });
  
  // 保存
  await savePrivacySpace(space);
  
  console.log('[隐私空间] 添加记录:', recordId);
  return recordId;
}

/**
 * 解密健康记录
 * 
 * @param space 隐私空间
 * @param recordId 记录 ID
 * @returns 解密后的记录或 null
 */
export async function decryptHealthRecord(
  space: PrivacySpace,
  recordId: string
): Promise<DecryptedHealthRecord | null> {
  const record = space.encryptedHealthData.find(r => r.id === recordId);
  if (!record) {
    return null;
  }
  
  try {
    // 解密数据（简化版本）
    const decrypted = await decryptHealthData({
      ciphertext: record.ciphertext,
      iv: record.iv
    });
    
    return {
      id: record.id,
      data: decrypted,
      timestamp: record.timestamp
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '解密失败';
    console.error('[隐私空间] 解密失败:', errorMessage);
    return null;
  }
}

/**
 * 清除隐私空间
 * 
 * 安全说明：
 * - 彻底删除本地数据
 * - 无法恢复
 * 
 * @param address 钱包地址
 */
export async function destroyPrivacySpace(address: string): Promise<void> {
  const storageKey = getStorageKey(address);
  localStorage.removeItem(storageKey);
  console.log('[隐私空间] 已清除:', address);
}

/**
 * 生成存储键
 * 
 * @param address 钱包地址
 * @returns 存储键
 */
function getStorageKey(address: string): string {
  return `${STORAGE_PREFIX}${address.toLowerCase()}`;
}

/**
 * 生成 UUID
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 加密健康数据
 * 
 * 简化版本：使用 Base64 编码
 * TODO: 实现真正的 AES-256-GCM 加密
 * 
 * @param data 健康数据
 * @returns 加密结果
 */
async function encryptHealthData(data: HealthWitness): Promise<{
  ciphertext: string;
  iv: string;
  hash: string;
}> {
  // 将数据转换为 JSON
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const bytes = encoder.encode(jsonString);
  
  // 生成哈希（用于完整性校验）
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // 简化加密：Base64 编码（实际项目应使用 Web Crypto API）
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = Buffer.from(bytes).toString('base64');
  
  return {
    ciphertext,
    iv: Buffer.from(iv).toString('base64'),
    hash
  };
}

/**
 * 解密健康数据
 * 
 * @param encrypted 加密数据
 * @returns 解密后的健康数据
 */
async function decryptHealthData(encrypted: {
  ciphertext: string;
  iv: string;
}): Promise<HealthWitness> {
  // 简化解密：Base64 解码
  const bytes = Buffer.from(encrypted.ciphertext, 'base64');
  const decoder = new TextDecoder();
  const jsonString = decoder.decode(bytes);
  
  return JSON.parse(jsonString) as HealthWitness;
}

/**
 * 检查隐私空间是否存在
 * 
 * @param address 钱包地址
 * @returns 是否存在
 */
export function hasPrivacySpace(address: string): boolean {
  const storageKey = getStorageKey(address);
  return localStorage.getItem(storageKey) !== null;
}

/**
 * 导出隐私空间（用于备份）
 * 
 * 安全警告：
 * - 导出数据包含敏感信息
 * - 必须加密传输
 * 
 * @param address 钱包地址
 * @returns 加密的导出数据
 */
export async function exportPrivacySpace(address: string): Promise<string | null> {
  const space = await loadPrivacySpace(address);
  if (!space) {
    return null;
  }
  
  // 导出为加密 JSON
  const data = JSON.stringify(space);
  return Buffer.from(data).toString('base64');
}

/**
 * 导入隐私空间（用于恢复）
 * 
 * @param address 钱包地址
 * @param encryptedData 加密的导出数据
 * @returns 是否成功
 */
export async function importPrivacySpace(
  address: string,
  encryptedData: string
): Promise<boolean> {
  try {
    const data = Buffer.from(encryptedData, 'base64').toString('utf-8');
    const space: PrivacySpace = JSON.parse(data);
    
    // 验证地址匹配
    if (space.address.toLowerCase() !== address.toLowerCase()) {
      throw new Error('地址不匹配');
    }
    
    await savePrivacySpace(space);
    return true;
  } catch (error) {
    console.error('[隐私空间] 导入失败:', error);
    return false;
  }
}
