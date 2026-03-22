/**
 * ZKP 证明生成 Web Worker
 * 
 * 功能：
 * 1. 在后台线程生成 ZKP 证明
 * 2. 避免阻塞主线程
 * 3. 提供进度更新
 * 
 * 性能优化：
 * - 不阻塞 UI
 * - 支持取消操作
 * - 内存隔离
 */

import { groth16 } from 'snarkjs';
import { Buffer } from 'buffer';

// Worker 消息类型
interface WorkerMessage {
  type: 'GENERATE_PROOF' | 'CANCEL';
  payload?: {
    witness: {
      age: number;
      systolic_bp: number;
      diastolic_bp: number;
      fasting_glucose: number;
      salt: string;
    };
    zkeyData: Uint8Array;
  };
}

interface WorkerResponse {
  type: 'SUCCESS' | 'ERROR' | 'PROGRESS';
  payload?: any;
  error?: string;
}

// 监听主线程消息
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  try {
    if (type === 'GENERATE_PROOF' && payload) {
      const { witness, zkeyData } = payload;

      // 步骤 1：生成 Witness
      postMessage({
        type: 'PROGRESS',
        payload: { stage: 'generating_witness', progress: 30 },
      } as WorkerResponse);

      const input: Record<string, any> = {
        age: witness.age.toString(),
        systolic_bp: witness.systolic_bp.toString(),
        diastolic_bp: witness.diastolic_bp.toString(),
        fasting_glucose: witness.fasting_glucose.toString(),
        salt: witness.salt,
      };

      // 加载电路（从缓存或重新加载）
      const wasmModule = await loadWasm();
      const circuit = await (wasmModule as any).witnessCalculator;
      
      const witnessBuffer = await circuit.calculateWTNSBin(input, 0);
      
      // 步骤 2：生成证明
      postMessage({
        type: 'PROGRESS',
        payload: { stage: 'generating_proof', progress: 60 },
      } as WorkerResponse);

      const witnessUint8Array = new Uint8Array(witnessBuffer);
      
      const { proof, publicSignals } = await groth16.prove(
        zkeyData,
        witnessUint8Array
      );

      // 步骤 3：完成
      postMessage({
        type: 'PROGRESS',
        payload: { stage: 'complete', progress: 100 },
      } as WorkerResponse);

      // 发送结果
      postMessage({
        type: 'SUCCESS',
        payload: {
          proof: {
            pi_a: proof.pi_a,
            pi_b: proof.pi_b,
            pi_c: proof.pi_c,
            protocol: (proof as any).protocol || 'groth16',
            curve: (proof as any).curve || 'bn128',
          },
          publicSignals: {
            is_adult: Number(publicSignals[0]),
            bp_normal: Number(publicSignals[1]),
            glucose_normal: Number(publicSignals[2]),
            health_hash: publicSignals[3],
          },
        },
      } as WorkerResponse);

      // 立即清除敏感数据
      Object.keys(input).forEach(key => {
        input[key] = '***';
      });
    } else if (type === 'CANCEL') {
      // 取消操作（可选实现）
      console.log('[Worker] 收到取消请求');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[Worker] 错误:', error);
    
    postMessage({
      type: 'ERROR',
      error: errorMessage,
    } as WorkerResponse);
  }
};

// 加载 WASM（简化版本）
async function loadWasm() {
  // 实际项目中应该从缓存或预加载获取
  const wasmPath = '/zkp/health_circuit.wasm';
  const response = await fetch(wasmPath);
  const wasmBuffer = await response.arrayBuffer();
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const wasmInstance = await WebAssembly.instantiate(wasmModule, {
    env: {
      memory: new WebAssembly.Memory({ initial: 256 }),
    },
  });
  return wasmInstance;
}

export {};
