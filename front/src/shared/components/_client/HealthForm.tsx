'use client';

import { useState, useCallback, useEffect } from 'react';
import { Shield, Activity, Droplet, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useI18n } from '@/shared/utils/I18nProvider';
import { generateProof, generateSalt, type HealthWitness, type ZKProofResult } from '@/shared/utils/zkp/circuit';
import { addHealthRecord } from '@/shared/utils/zkp/privacySpace';
import { useWasmPreload } from '@/shared/hooks/useWasmPreload';
import { generateProofWithWorker } from '@/shared/utils/zkp/circuit-optimized';

// 表单数据接口
interface HealthFormData {
  age: string;
  systolic_bp: string;
  diastolic_bp: string;
  fasting_glucose: string;
}

// 验证状态
interface ValidationState {
  isValid: boolean;
  errors: Record<string, string>;
}

// 组件属性
interface HealthFormProps {
  walletAddress: string;
  onSuccess?: (recordId: string) => void;
  onError?: (error: string) => void;
}

/**
 * 健康数据输入表单组件
 * 
 * 功能：
 * 1. 输入健康数据（年龄、血压、血糖）
 * 2. 实时验证数据有效性
 * 3. 生成 ZKP 证明
 * 4. 存储到隐私空间
 * 
 * 隐私保护：
 * - 数据仅在内存中明文存在
 * - 提交后立即清除明文
 * - 使用加密存储
 */
export default function HealthForm({ 
  walletAddress, 
  onSuccess,
  onError 
}: HealthFormProps) {
  const { t } = useI18n();
  
  // WASM 预加载状态
  const { loading: wasmLoading, loaded: wasmLoaded, progress: wasmProgress, error: wasmError } = useWasmPreload();
  
  // 表单状态
  const [formData, setFormData] = useState<HealthFormData>({
    age: '',
    systolic_bp: '',
    diastolic_bp: '',
    fasting_glucose: ''
  });
  
  const [validation, setValidation] = useState<ValidationState>({
    isValid: false,
    errors: {}
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofStage, setProofStage] = useState<string>('');
  const [proofProgress, setProofProgress] = useState(0);
  const [proofResult, setProofResult] = useState<{
    isAdult: boolean;
    bpNormal: boolean;
    glucoseNormal: boolean;
    proofTime: number;
  } | null>(null);
  
  // 预加载 Worker
  useEffect(() => {
    if (wasmLoaded) {
      // 预加载 Worker（可选）
      import('@/shared/utils/zkp/circuit-optimized')
        .then(({ preloadWorker }) => preloadWorker())
        .catch(console.error);
    }
  }, [wasmLoaded]);
  
  // 实时验证输入
  const validateInput = useCallback((name: string, value: string): string => {
    const numValue = parseFloat(value);
    
    switch (name) {
      case 'age':
        if (isNaN(numValue) || numValue <= 0 || numValue >= 150) {
          return '年龄必须在 0-150 之间';
        }
        return '';
      
      case 'systolic_bp':
        if (isNaN(numValue) || numValue < 60 || numValue > 250) {
          return '收缩压必须在 60-250 之间';
        }
        return '';
      
      case 'diastolic_bp':
        if (isNaN(numValue) || numValue < 40 || numValue > 150) {
          return '舒张压必须在 40-150 之间';
        }
        return '';
      
      case 'fasting_glucose':
        if (isNaN(numValue) || numValue < 1.0 || numValue > 20.0) {
          return '血糖必须在 1.0-20.0 mmol/L 之间';
        }
        return '';
      
      default:
        return '';
    }
  }, []);
  
  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 更新表单数据
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    
    // 实时验证
    const error = validateInput(name, value);
    const newErrors = { ...validation.errors, [name]: error };
    const hasErrors = Object.values(newErrors).some(e => e !== '');
    
    setValidation({
      isValid: !hasErrors && Object.values(newData).every(v => v !== ''),
      errors: newErrors
    });
  };
  
  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validation.isValid) {
      onError?.('请修正所有错误后再提交');
      return;
    }
    
    setIsSubmitting(true);
    setProofProgress(0);
      setProofStage('preparing');
      
      try {
        // 准备健康数据（Witness）
        const witness: HealthWitness = {
          age: parseFloat(formData.age),
          systolic_bp: parseFloat(formData.systolic_bp),
          diastolic_bp: parseFloat(formData.diastolic_bp),
          fasting_glucose: parseFloat(formData.fasting_glucose),
          salt: generateSalt() // 生成随机盐值
        };
        
        let proof: ZKProofResult;
      
      // 根据 WASM 是否可用选择不同的证明生成方式
      if (wasmLoaded) {
        // 尝试使用 Worker 生成证明（优化版）
        setProofStage('loading_zkey');
        setProofProgress(20);
        
        try {
          const zkeyResponse = await fetch('/zkp/health_circuit.zkey');
          if (!zkeyResponse.ok || (await zkeyResponse.arrayBuffer()).byteLength === 0) {
            throw new Error('zkey 文件无效');
          }
          const zkeyData = new Uint8Array(await zkeyResponse.arrayBuffer());
          
          setProofStage('generating_proof');
          setProofProgress(40);
          
          proof = await generateProofWithWorker(
            witness,
            zkeyData,
            (stage, progress) => {
              setProofStage(stage);
              // 将 Worker 的 30-100 映射到 40-90
              setProofProgress(40 + (progress - 30) * 0.5);
            }
          );
        } catch (workerError) {
          console.warn('[健康表单] Worker 失败，尝试备用方案:', workerError);
          // Worker 失败，使用备用方案
          proof = await generateProof(witness);
        }
      } else {
        // WASM 不可用，使用原始方式（直接使用 snarkjs）
        console.log('[健康表单] 使用备用证明生成方式');
        setProofStage('generating_proof');
        setProofProgress(50);
        
        proof = await generateProof(witness);
      }
      
      setProofProgress(90);
      setProofStage('saving');
      
      // 保存证明结果用于显示
      setProofResult({
        isAdult: proof.publicSignals.is_adult === 1,
        bpNormal: proof.publicSignals.bp_normal === 1,
        glucoseNormal: proof.publicSignals.glucose_normal === 1,
        proofTime: proof.proofTime
      });
      
      // 添加到隐私空间
      const recordId = await addHealthRecord(walletAddress, witness);
      
      setProofProgress(100);
      setProofStage('complete');
      
      // 清除明文数据（隐私保护）
      setFormData({
        age: '',
        systolic_bp: '',
        diastolic_bp: '',
        fasting_glucose: ''
      });
      
      // 通知成功
      onSuccess?.(recordId);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : '证明生成失败';
      
      console.error('[健康表单] 提交失败:', error);
      setProofStage('error');
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
      {/* 顶部标题 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="text-teal-500" size={24} />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            健康数据隐私保护
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          使用零知识证明保护您的健康数据，无需暴露原始数据即可验证健康状况
        </p>
      </div>
      
      {/* WASM 加载状态 */}
      {wasmLoading && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-blue-500" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                正在初始化 ZKP 电路...
              </p>
              <div className="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${wasmProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* WASM 加载失败提示（非致命） */}
      {wasmError && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-500" size={20} />
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              ZKP 电路加载失败，将使用备用模式
            </p>
          </div>
        </div>
      )}
      
      {/* 表单 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 年龄 */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <User size={16} />
            年龄
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="例如：35"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                     bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
            min="1"
            max="149"
            step="1"
          />
          {validation.errors.age && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle size={12} />
              {validation.errors.age}
            </p>
          )}
        </div>
        
        {/* 血压 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Activity size={16} />
              收缩压（高压）
            </label>
            <input
              type="number"
              name="systolic_bp"
              value={formData.systolic_bp}
              onChange={handleInputChange}
              placeholder="例如：120"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              min="60"
              max="249"
              step="1"
            />
            {validation.errors.systolic_bp && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={12} />
                {validation.errors.systolic_bp}
              </p>
            )}
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Activity size={16} />
              舒张压（低压）
            </label>
            <input
              type="number"
              name="diastolic_bp"
              value={formData.diastolic_bp}
              onChange={handleInputChange}
              placeholder="例如：80"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
              min="40"
              max="149"
              step="1"
            />
            {validation.errors.diastolic_bp && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={12} />
                {validation.errors.diastolic_bp}
              </p>
            )}
          </div>
        </div>
        
        {/* 血糖 */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Droplet size={16} />
            空腹血糖（mmol/L）
          </label>
          <input
            type="number"
            name="fasting_glucose"
            value={formData.fasting_glucose}
            onChange={handleInputChange}
            placeholder="例如：5.2"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                     bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
            min="1.0"
            max="19.9"
            step="0.1"
          />
          {validation.errors.fasting_glucose && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle size={12} />
              {validation.errors.fasting_glucose}
            </p>
          )}
        </div>
        
        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={!validation.isValid || isSubmitting || wasmLoading}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 
                   text-white font-medium rounded-lg transition-colors
                   flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>生成证明中... {proofProgress > 0 && `(${proofProgress}%)`}</span>
            </>
          ) : (
            <>
              <Shield size={18} />
              <span>生成零知识证明</span>
            </>
          )}
        </button>
        
        {/* 证明生成进度 */}
        {isSubmitting && proofProgress > 0 && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="animate-spin text-blue-500" size={16} />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {proofStage === 'preparing' && '准备数据...'}
                {proofStage === 'loading_zkey' && '加载验证密钥...'}
                {proofStage === 'generating_witness' && '生成 Witness...'}
                {proofStage === 'generating_proof' && '生成零知识证明...'}
                {proofStage === 'saving' && '保存记录...'}
                {proofStage === 'complete' && '完成！'}
                {proofStage === 'error' && '发生错误'}
              </p>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${proofProgress}%` }}
              />
            </div>
          </div>
        )}
      </form>
      
      {/* 证明结果 */}
      {proofResult && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="text-green-500" size={20} />
            <h3 className="font-semibold text-green-800 dark:text-green-300">
              证明生成成功
            </h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">成年验证：</span>
              <span className={proofResult.isAdult ? 'text-green-600' : 'text-red-600'}>
                {proofResult.isAdult ? '✓ 已成年' : '✗ 未成年'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">血压正常：</span>
              <span className={proofResult.bpNormal ? 'text-green-600' : 'text-red-600'}>
                {proofResult.bpNormal ? '✓ 正常' : '✗ 异常'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">血糖正常：</span>
              <span className={proofResult.glucoseNormal ? 'text-green-600' : 'text-red-600'}>
                {proofResult.glucoseNormal ? '✓ 正常' : '✗ 异常'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-green-200 dark:border-green-800">
              <span className="text-slate-600 dark:text-slate-400">生成耗时：</span>
              <span className="text-slate-900 dark:text-white font-mono">
                {proofResult.proofTime.toFixed(2)} ms
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* 隐私说明 */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="text-blue-500 mt-0.5 shrink-0" size={16} />
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <strong>隐私保护：</strong>您的健康数据仅在本地加密存储，使用零知识证明技术，
            无需暴露原始数据即可验证健康状况。
          </p>
        </div>
      </div>
    </div>
  );
}
