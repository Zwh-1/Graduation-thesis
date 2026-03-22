/**
 * WASM 预加载 Hook
 * 
 * 功能：
 * 1. 提前加载 ZKP 电路 WASM 文件
 * 2. 缓存已加载的电路
 * 3. 提供加载进度
 * 
 * 性能优化：
 * - 避免重复加载
 * - 后台预加载
 * - 内存管理
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface WasmLoadState {
  loading: boolean;
  loaded: boolean;
  error: string | null;
  progress: number; // 0-100
}

const CIRCUIT_WASM_PATH = '/zkp/health_circuit.wasm';
const CIRCUIT_ZKEY_PATH = '/zkp/health_circuit.zkey';

// 全局缓存
let wasmCache: any = null;
let zkeyCache: Uint8Array | null = null;

export function useWasmPreload() {
  const [state, setState] = useState<WasmLoadState>({
    loading: false,
    loaded: false,
    error: null,
    progress: 0,
  });

  // 预加载 WASM 和 zkey 文件
  const preload = useCallback(async () => {
    if (state.loaded || state.loading) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, progress: 0 }));

    try {
      // 步骤 1：加载 WASM 文件（30% 进度）
      setState(prev => ({ ...prev, progress: 30 }));
      
      const wasmResponse = await fetch(CIRCUIT_WASM_PATH);
      if (!wasmResponse.ok) {
        // 文件不存在，跳过 WASM 加载
        console.warn('[WASM 预加载] WASM 文件不存在，跳过');
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          loaded: false,
          error: null, // 不是错误，只是文件不存在
        }));
        return;
      }
      
      const wasmBuffer = await wasmResponse.arrayBuffer();
      
      // 检查 buffer 是否为空
      if (wasmBuffer.byteLength === 0) {
        console.warn('[WASM 预加载] WASM 文件为空，跳过');
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          loaded: false,
          error: null,
        }));
        return;
      }
      
      const wasmModule = await WebAssembly.compile(wasmBuffer);
      wasmCache = { module: wasmModule, buffer: wasmBuffer };
      
      // 步骤 2：加载 zkey 文件（60% 进度）
      setState(prev => ({ ...prev, progress: 60 }));
      
      const zkeyResponse = await fetch(CIRCUIT_ZKEY_PATH);
      if (!zkeyResponse.ok) {
        console.warn('[WASM 预加载] zkey 文件不存在，跳过');
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          loaded: false,
          error: null,
        }));
        return;
      }
      
      const zkeyBuffer = await zkeyResponse.arrayBuffer();
      
      // 检查 buffer 是否为空
      if (zkeyBuffer.byteLength === 0) {
        console.warn('[WASM 预加载] zkey 文件为空，跳过');
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          loaded: false,
          error: null,
        }));
        return;
      }
      
      zkeyCache = new Uint8Array(zkeyBuffer);
      
      // 步骤 3：完成（100% 进度）
      setState(prev => ({ ...prev, progress: 100, loaded: true, loading: false }));
      
      console.log('[WASM 预加载] 完成');
    } catch (error: unknown) {
      // 任何加载错误都视为非致命错误，允许页面继续运行
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.warn('[WASM 预加载] 失败（降级模式）:', errorMessage);
      setState(prev => ({
        ...prev,
        loading: false,
        loaded: false,
        // 不设置错误，让页面可以继续运行
        error: null,
      }));
    }
  }, [state.loaded, state.loading]);

  // 获取缓存的 WASM
  const getCachedWasm = useCallback(() => {
    return wasmCache;
  }, []);

  // 获取缓存的 zkey
  const getCachedZkey = useCallback(() => {
    return zkeyCache;
  }, []);

  // 自动预加载
  useEffect(() => {
    preload();
  }, [preload]);

  return {
    ...state,
    preload,
    getCachedWasm,
    getCachedZkey,
  };
}

/**
 * 检查 WASM 是否已预加载
 */
export function isWasmPreloaded(): boolean {
  return wasmCache !== null && zkeyCache !== null;
}

/**
 * 清除缓存（用于内存管理）
 */
export function clearWasmCache() {
  wasmCache = null;
  zkeyCache = null;
  console.log('[WASM 缓存] 已清除');
}
