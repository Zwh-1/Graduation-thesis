'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Smartphone, Cloud, Coins, AlertCircle, CheckCircle, XCircle, Activity } from 'lucide-react';
import { ethers } from 'ethers';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/shared/utils/I18nProvider';
import { useWallet } from '@/shared/hooks/useWallet';
import HealthForm from '@/shared/components/_client/HealthForm';
import { hasPrivacySpace } from '@/shared/utils/zkp/privacySpace';

// 钱包类型定义
interface WalletOption {
  id: string;
  name: string;
  icon: string;
  installed?: boolean;
  recommended?: boolean;
  deepLink?: string;
}

// 连接步骤状态
type ConnectionStep = 'idle' | 'connecting' | 'signing' | 'initializing' | 'inputHealth' | 'success' | 'error';

export default function ConnectPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { connect: connectWallet } = useWallet();
  const [step, setStep] = useState<ConnectionStep>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showDemoMode, setShowDemoMode] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [qrValue, setQrValue] = useState<string>('');
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // 检测环境，动态排序钱包列表
  const [wallets, setWallets] = useState<WalletOption[]>([]);

  useEffect(() => {
    // 检测 MetaMask 插件
    const hasMetaMask = typeof window !== 'undefined' && window.ethereum;
    // 检测移动端
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    const detectedWallets: WalletOption[] = [];

    if (hasMetaMask) {
      detectedWallets.push({
        id: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        installed: true,
        recommended: true,
      });
    }

    // 总是显示扫码选项
    detectedWallets.push({
      id: 'walletconnect',
      name: t('connect.walletConnectDesc'),
      icon: '📱',
      recommended: !hasMetaMask,
    });

    // 其他钱包
    detectedWallets.push(
      { id: 'okx', name: 'OKX Wallet', icon: '🟢' },
      { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵' },
      { id: 'trust', name: 'Trust Wallet', icon: '💜' }
    );

    setWallets(detectedWallets);
  }, [t]);

  // 处理钱包连接
  const handleConnect = async (walletId: string) => {
    try {
      setStep('connecting');
      setStatusMessage(t('connect.connectingIdentity'));

      if (walletId === 'walletconnect') {
        // WalletConnect 扫码连接 - 显示二维码
        await connectWalletConnect();
      } else if (walletId === 'metamask') {
        // MetaMask 连接
        await connectInjected();
      } else {
        // 其他钱包：尝试 deep link 或显示提示
        setStep('error');
        setStatusMessage(t('connect.notSupported').replace('{walletId}', walletId));
      }
    } catch (error: unknown) {
      console.error('连接失败:', error);
      setStep('error');
      
      // 类型守卫：检查 error 是否为 Error 对象
      const errorMessage = error instanceof Error 
        ? error.message 
        : t('connect.errorConnect');
      
      setStatusMessage(errorMessage);
    }
  };

  // WalletConnect 连接 - 显示演示二维码
  const connectWalletConnect = async () => {
    try {
      // 演示二维码（实际项目中应使用 WalletConnect v2 SDK）
      const demoUri = 'wc:00e46b90-0467-4776-816c-2a9d2789f8e6@1?bridge=https://bridge.walletconnect.org&key=6f9e7a7d7f7e7d7f7e7d7f7e7d7f7e7d7f7e7d7f7e7d7f7e7d7f7e7d7f7e7d7f';
      setQrValue(demoUri);
      setShowQRCode(true);
      
      // 模拟连接成功（实际项目中需要监听连接事件）
      setTimeout(() => {
        // 这里仅用于演示，实际需要等待用户扫码
        console.log('等待用户扫码...');
      }, 1000);
    } catch (error: unknown) {
      // 类型守卫：检查 error 是否为 Error 对象
      const errorMessage = error instanceof Error 
        ? error.message 
        : '未知错误';
      throw new Error('扫码连接失败：' + errorMessage);
    }
  };

  // 注入式钱包连接（MetaMask）
  const connectInjected = async () => {
    try {
      if (!window.ethereum) {
        throw new Error(t('connect.noMetaMask'));
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];

      setWalletAddress(address);
      await handleSignMessage(address);
    } catch (error: unknown) {
      // 类型守卫：检查 error 是否为 Error 对象
      const errorMessage = error instanceof Error 
        ? error.message 
        : t('connect.errorConnect');
      throw new Error(t('connect.errorConnect') + ': ' + errorMessage);
    }
  };

  // 处理签名验证
  const handleSignMessage = async (address: string) => {
    try {
      setStep('signing');
      setStatusMessage(t('connect.verifyingIdentity'));

      const message = t('connect.signMessage')
        .replace('{address}', address)
        .replace('{timestamp}', Date.now().toString());

      // MetaMask 签名
      if (!window.ethereum) {
        throw new Error(t('connect.noMetaMask'));
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      await initializePrivacySpace(address, signature);
    } catch (error: unknown) {
      console.error('签名失败:', error);
      setStep('error');
      setStatusMessage(t('connect.errorSign'));
    }
  };

  // 初始化本地隐私空间
  const initializePrivacySpace = async (address: string, signature: string) => {
    try {
      setStep('initializing');
      setStatusMessage(t('connect.buildingCircuit'));

      // 模拟 ZKP 密钥对生成（实际项目中调用 snarkjs）
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 检查是否为新用户
      const storageKey = `privacy_space_${address.toLowerCase()}`;
      const newUser = !hasPrivacySpace(address);
      setIsNewUser(newUser);

      if (newUser) {
        // 新用户：初始化隐私空间
        localStorage.setItem(storageKey, JSON.stringify({
          address: address.toLowerCase(),
          createdAt: Date.now(),
          encryptedZkpKeys: undefined,
          encryptedHealthData: [],
          lastSignature: signature,
          version: 1
        }));
        
        // 保存钱包地址到全局状态
        connectWallet(address);
        
        setStatusMessage(t('connect.privacySpaceCreated'));
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // 显示健康数据输入表单
        setShowHealthForm(true);
        setStep('inputHealth');
      } else {
        setStatusMessage(t('connect.welcomeBack'));
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // 保存钱包地址到全局状态
        connectWallet(address);
        
        // 老用户直接进入成功状态
        setStep('success');
        setStatusMessage(t('connect.success'));
        
        // 延迟跳转到首页
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (error: unknown) {
      console.error('初始化失败:', error);
      setStep('error');
      setStatusMessage(t('connect.errorInit'));
    }
  };

  // 处理健康数据输入成功
  const handleHealthDataSuccess = (recordId: string) => {
    console.log('[ConnectPage] 健康记录已保存:', recordId);
    setStep('success');
    setStatusMessage(t('connect.success'));
    
    // 延迟跳转到首页
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };
  
  // 处理健康数据输入失败
  const handleHealthDataError = (error: string) => {
    console.error('[ConnectPage] 健康数据输入失败:', error);
    setStep('error');
    setStatusMessage('健康数据保存失败：' + error);
  };

  // 渲染连接步骤动画
  const renderStepAnimation = () => {
    const steps = [
      {
        id: 'connecting',
        icon: '🔗',
        title: t('connect.stepConnecting.title'),
        desc: t('connect.stepConnecting.desc'),
      },
      {
        id: 'signing',
        icon: '✍️',
        title: t('connect.stepSigning.title'),
        desc: t('connect.stepSigning.desc'),
      },
      {
        id: 'initializing',
        icon: '🛡️',
        title: t('connect.stepInitializing.title'),
        desc: t('connect.stepInitializing.desc'),
      },
      {
        id: 'inputHealth',
        icon: '📝',
        title: '输入健康数据',
        desc: '提供您的健康数据以生成零知识证明',
      },
    ];

    const currentStepIndex = steps.findIndex((s) => s.id === step);

    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md mx-auto animate-fade-in">
        <div className="space-y-6">
          {steps.map((s, index) => (
            <div
              key={s.id}
              className={`flex items-center gap-4 transition-all duration-500 ${
                index <= currentStepIndex ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${
                  index < currentStepIndex
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : index === currentStepIndex
                    ? 'bg-blue-100 dark:bg-blue-900/30 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-700'
                }`}
              >
                {s.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {s.desc}
                </p>
              </div>
              {index < currentStepIndex && (
                <CheckCircle className="text-green-500" size={24} />
              )}
              {index === currentStepIndex && step !== 'success' && (
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          ))}

          {step === 'success' && (
            <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-500" size={24} />
                <p className="font-medium text-green-800 dark:text-green-300">
                  {statusMessage}
                </p>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <XCircle className="text-red-500" size={24} />
                <p className="font-medium text-red-800 dark:text-red-300">
                  {statusMessage}
                </p>
              </div>
              <button
                onClick={() => setStep('idle')}
                className="mt-3 w-full py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                {t('connect.retry')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 主页面渲染
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 顶部：价值主张与安全背书 */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex justify-center items-center gap-2 mb-4">
            <ShieldCheck className="text-teal-500" size={48} />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {t('connect.title')}
            </h1>
          </div>

          {/* 动态轮换副标题 */}
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            {t('connect.subtitle')}
          </p>

          {/* 安全徽章栏 */}
          <div className="flex justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm">
              <Smartphone className="text-green-500" size={18} />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('connect.badgeLocal')}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm">
              <Coins className="text-blue-500" size={18} />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('connect.badgeGas')}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm">
              <Cloud className="text-purple-500" size={18} />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('connect.badgeNoUpload')}
              </span>
            </div>
          </div>
        </div>

        {/* 核心区：智能钱包选择器 或 三步验证动画 */}
        {step !== 'idle' && step !== 'inputHealth' ? (
          renderStepAnimation()
        ) : step === 'inputHealth' && walletAddress ? (
          // 显示健康数据输入表单
          <div className="animate-fade-in">
            <HealthForm
              walletAddress={walletAddress}
              onSuccess={handleHealthDataSuccess}
              onError={handleHealthDataError}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 animate-fade-in">
            {/* 选项卡 */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {t('connect.selectTitle')}
              </h2>

              {/* 推荐钱包列表 */}
              <div className="space-y-3">
                {wallets
                  .filter((w) => w.recommended)
                  .map((wallet) => (
                    <div
                      key={wallet.id}
                      className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer group"
                      onClick={() => handleConnect(wallet.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{wallet.icon}</span>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {wallet.name}
                          </h3>
                          {wallet.installed && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {t('connect.installed')} · 🚀 {t('connect.fastest')}
                            </p>
                          )}
                        </div>
                      </div>
                      <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">
                        {t('connect.connectBtn')}
                      </button>
                    </div>
                  ))}
              </div>

              {/* 所有钱包列表 */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  {t('connect.allWallets')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wallets
                    .filter((w) => !w.recommended)
                    .map((wallet) => (
                      <div
                        key={wallet.id}
                        className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                        onClick={() => handleConnect(wallet.id)}
                      >
                        <span className="text-2xl">{wallet.icon}</span>
                        <span className="font-medium text-slate-900 dark:text-white flex-1">
                          {wallet.name}
                        </span>
                        <button className="px-4 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors">
                          {t('connect.connect')}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* 新手引导 */}
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-400 mb-3">
                  {t('connect.newUserTitle')}
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setShowDemoMode(true)}
                    className="px-6 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium rounded-lg transition-colors"
                  >
                    {t('connect.demoMode')}
                  </button>
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                  >
                    {t('connect.downloadWallet')}
                  </a>
                </div>
              </div>
            </div>

            {/* 隐私声明 */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-500 mt-0.5 shrink-0" size={20} />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>{t('connect.privacyDisclaimer')}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 演示模式模态框 */}
        {showDemoMode && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-lg w-full">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {t('connect.demoModalTitle')}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {t('connect.demoModalDesc')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDemoMode(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
                >
                  {t('connect.demoModalClose')}
                </button>
                <button
                  onClick={() => {
                    setShowDemoMode(false);
                    // 进入演示模式逻辑
                    window.location.href = '/demo';
                  }}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
                >
                  {t('connect.demoModalStart')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 二维码模态框 */}
        {showQRCode && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
              {qrValue && (
                <div className="bg-white p-4 rounded-xl inline-block mb-4">
                  <QRCodeSVG 
                    value={qrValue} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              )}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {t('connect.qrModalTitle')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {t('connect.qrModalDesc')}
              </p>
              <button
                onClick={() => setShowQRCode(false)}
                className="px-6 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors"
              >
                {t('connect.qrModalCancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
