// 全局 Window 类型扩展
// 用于支持浏览器插件注入的属性（如 MetaMask 的 ethereum）

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isAutoRefreshOn?: boolean;
      providers?: any[];
      request: (request: { method: string; params?: any[] | Record<string, any> }) => Promise<any>;
      send?: (method: string, params?: any[]) => Promise<any>;
      sendAsync?: (request: { method: string; params?: any[] }, callback: (error: any, response: any) => void) => void;
      on?: (eventName: string, callback: (...args: any[]) => void) => void;
      removeListener?: (eventName: string, callback: (...args: any[]) => void) => void;
      selectedAddress?: string;
      networkVersion?: string;
      chainId?: string;
    };
  }
}

export {};
