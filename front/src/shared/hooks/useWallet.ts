/**
 * 钱包连接状态管理 Hook
 * 
 * 功能：
 * 1. 检测钱包连接状态
 * 2. 管理钱包地址
 * 3. 自动连接已保存的钱包
 * 
 * 隐私保护：
 * - 仅存储钱包地址（公开信息）
 * - 不存储私钥或助记词
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { hasPrivacySpace } from '@/shared/utils/zkp/privacySpace';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  isLoading: boolean;
}

/**
 * 获取存储的钱包地址
 */
function getStoredWallet(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('wallet_address') || null;
}

/**
 * 存储钱包地址
 */
function storeWallet(address: string) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('wallet_address', address);
}

/**
 * 清除存储的钱包地址
 */
function clearStoredWallet() {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem('wallet_address');
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isLoading: true,
  });

  // 初始化时检查已保存的钱包
  useEffect(() => {
    const storedAddress = getStoredWallet();
    
    if (storedAddress) {
      // 检查是否有隐私空间
      const hasSpace = hasPrivacySpace(storedAddress);
      
      setState({
        isConnected: hasSpace,
        address: storedAddress,
        isLoading: false,
      });
    } else {
      setState({
        isConnected: false,
        address: null,
        isLoading: false,
      });
    }
  }, []);

  // 连接钱包
  const connect = useCallback((address: string) => {
    storeWallet(address);
    setState({
      isConnected: true,
      address,
      isLoading: false,
    });
  }, []);

  // 断开连接
  const disconnect = useCallback(() => {
    clearStoredWallet();
    setState({
      isConnected: false,
      address: null,
      isLoading: false,
    });
  }, []);

  // 刷新状态（用于外部触发）
  const refresh = useCallback(() => {
    const storedAddress = getStoredWallet();
    
    if (storedAddress) {
      const hasSpace = hasPrivacySpace(storedAddress);
      
      setState({
        isConnected: hasSpace,
        address: storedAddress,
        isLoading: false,
      });
    } else {
      setState({
        isConnected: false,
        address: null,
        isLoading: false,
      });
    }
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    refresh,
  };
}

/**
 * 格式化钱包地址（用于显示）
 * 例如：0x1234...5678
 */
export function formatAddress(address: string | null): string {
  if (!address || address.length < 10) {
    return address || '';
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * 复制地址到剪贴板
 */
export async function copyAddress(address: string | null): Promise<boolean> {
  if (!address) {
    return false;
  }
  
  try {
    await navigator.clipboard.writeText(address);
    return true;
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
}
