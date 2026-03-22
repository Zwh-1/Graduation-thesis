/**
 * 优化版 ZKP 电路工具（使用 Web Worker）
 * 
 * 功能：
 * 1. 使用 Web Worker 生成证明（不阻塞 UI）
 * 2. WASM 预加载支持
 * 3. 进度回调
 * 
 * 性能优化：
 * - 后台生成证明
 * - WASM 缓存
 * - 内存管理
 */

import type { HealthWitness, ZKProofResult, HealthPublicSignals } from './circuit';

// Worker 实例（单例）
let workerInstance: Worker | null = null;

// 获取 Worker 实例
function getWorker(): Worker {
  if (!workerInstance) {
    // 动态导入 Worker
    workerInstance = new Worker(
      new URL('@/shared/workers/zkpWorker.ts', import.meta.url)
    );
  }
  return workerInstance;
}

/**
 * 使用 Worker 生成 ZKP 证明（异步，不阻塞 UI）
 * 
 * @param witness 健康数据（Witness）
 * @param zkeyData zkey 文件数据
 * @param onProgress 进度回调
 * @returns Promise<ZKProofResult>
 */
export async function generateProofWithWorker(
  witness: HealthWitness,
  zkeyData: Uint8Array,
  onProgress?: (stage: string, progress: number) => void
): Promise<ZKProofResult> {
  const startTime = performance.now();
  
  return new Promise((resolve, reject) => {
    const worker = getWorker();
    
    // 监听 Worker 消息
    worker.onmessage = (event) => {
      const { type, payload, error } = event.data;
      
      if (type === 'PROGRESS' && onProgress) {
        const { stage, progress } = payload;
        onProgress(stage, progress);
      } else if (type === 'SUCCESS') {
        const endTime = performance.now();
        const proofTime = endTime - startTime;
        
        resolve({
          proof: payload.proof,
          publicSignals: payload.publicSignals as HealthPublicSignals,
          proofTime,
        });
      } else if (type === 'ERROR') {
        reject(new Error(error || '证明生成失败'));
      }
    };
    
    // 监听错误
    worker.onerror = (error) => {
      console.error('[Worker] 错误:', error);
      reject(new Error('Worker 错误：' + error.message));
    };
    
    // 发送证明生成请求
    worker.postMessage({
      type: 'GENERATE_PROOF',
      payload: {
        witness,
        zkeyData,
      },
    });
  });
}

/**
 * 终止 Worker（用于清理）
 */
export function terminateWorker() {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
    console.log('[Worker] 已终止');
  }
}

/**
 * 预加载 Worker（提前初始化）
 */
export function preloadWorker() {
  if (!workerInstance) {
    getWorker();
    console.log('[Worker] 已预加载');
  }
}
