import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Unlock, ShieldCheck,
  AlertTriangle, RefreshCw, CheckCircle, XCircle,
  User, Ruler, Weight
} from 'lucide-react';
import { calculateBMI, RULES } from '@/types/home/Pricay';
import InputGroup from '@/types/home/Pricay';
import '@/types/home/css/Privacy.css';
import { useI18n } from '@/shared/utils/I18nProvider';

export default function PrivacyDemo() {
  const { t } = useI18n();

  const [mode, setMode] = useState('zkp');
  const [step, setStep] = useState('idle');

  const [formData, setFormData] = useState({
    age: 25,
    height: 175,
    weight: 70
  });

  // 验证结果
  interface ValidationResult {
    success: boolean;
    bmi: number;
    message: string;
    details: {
      isAdult: boolean;
      isHealthyBMI: boolean;
      reason: string | null;
    }
  }

  const [result, setResult] = useState<ValidationResult | null>(null);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    // 重置状态以便重新演示
    if (step !== 'idle') setStep('idle');
    setResult(null);
  };

  // 模拟证明生成过程
  const handleProve = () => {
    setStep('proving');
    setResult(null);

    // 模拟 ZKP 电路计算延迟 (1.5 秒)
    setTimeout(() => {
      const bmi = calculateBMI(formData.height, formData.weight);
      const age = typeof formData.age === 'string' ? parseInt(formData.age) : formData.age;
      const isAdult = age >= RULES.minAge;
      const isHealthyBMI = bmi >= RULES.bmiMin && bmi <= RULES.bmiMax;

      const success = isAdult && isHealthyBMI;

      setResult({
        success,
        bmi,
        message: success ? t('privacy.msgPass') : t('privacy.msgFail'),
        details: {
          isAdult,
          isHealthyBMI,
          reason: !isAdult ? t('privacy.reasonAge') : !isHealthyBMI ? t('privacy.reasonBmi') : null
        }
      });
      setStep('verified');
    }, 1500);
  };

  const resetDemo = () => {
    setStep('idle');
    setResult(null);
  };

  return (
    <section className="privacy-section">
      <div className="privacy-container">

        {/* 头部说明 */}
        <div className="privacy-header">
          <h2 className="privacy-title">
            {t('privacy.title')}
          </h2>
          <p className="privacy-subtitle"
            dangerouslySetInnerHTML={{ __html: t('privacy.subtitle') }}
          />

          {/* 模式切换 */}
          <div className="privacy-mode-switch">
            <span className={`privacy-mode-label ${mode === 'traditional' ? 'active-traditional' : ''}`}>
              {t('privacy.modeTraditional')}
            </span>
            <button
              onClick={() => { setMode(mode === 'zkp' ? 'traditional' : 'zkp'); resetDemo(); }}
              className="privacy-toggle"
            >
              <div className={`privacy-toggle-bg ${mode}`}></div>
              <span className="sr-only">{t('privacy.toggleLabel')}</span>
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                className="privacy-toggle-thumb"
              >
                {mode === 'zkp' ? <Lock size={14} className="text-teal-600" /> : <Unlock size={14} className="text-slate-500" />}
              </motion.span>
            </button>
            <span className={`privacy-mode-label ${mode === 'zkp' ? 'active-zkp' : ''}`}>
              {t('privacy.modeZkp')}
            </span>
          </div>
        </div>

        {/* 演示主区域 */}
        <div className="privacy-main-content relative z-10">

          {/* 1. 用户输入端 */}
          <div className="privacy-demo-section relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-teal-500"></div>
            <div className="privacy-form-title flex items-center space-x-2">
              <User className="text-teal-500" />
              <h3>{t('privacy.userDataTitle')}</h3>
            </div>

            <div className="privacy-form-grid">
              <InputGroup
                label={t('privacy.labelAge')}
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                icon={<RefreshCw size={16} />}
                min={1} max={120}
              />
              <InputGroup
                label={t('privacy.labelHeight')}
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                icon={<Ruler size={16} />}
                min={50} max={250}
              />
              <InputGroup
                label={t('privacy.labelWeight')}
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                icon={<Weight size={16} />}
                min={20} max={300}
              />
            </div>

            <div className="privacy-actions">
              {step === 'idle' ? (
                <button
                  onClick={handleProve}
                  className="privacy-btn privacy-btn-primary"
                >
                  <ShieldCheck size={20} />
                  <span>{mode === 'zkp' ? t('privacy.btnProveZkp') : t('privacy.btnProveTraditional')}</span>
                </button>
              ) : (
                <button
                  onClick={resetDemo}
                  className="privacy-btn privacy-btn-secondary"
                >
                  <RefreshCw size={20} className={step === 'proving' ? 'animate-spin' : ''} />
                  <span>{step === 'proving' ? t('privacy.btnCalculating') : t('privacy.btnReset')}</span>
                </button>
              )}
            </div>

            <p className="privacy-note justify-center !mt-4">
              {t('privacy.localNote')}
            </p>
          </div>

          {/* 2. 处理引擎 */}
          <div className="flex flex-col items-center justify-center relative py-8 md:py-0 min-w-[200px]">
            {/* 连接线动画 */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-10 transform -translate-y-1/2"></div>
            <div className="md:hidden absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-200 dark:bg-slate-700 -z-10 transform -translate-x-1/2"></div>

            {/* 数据包粒子动画 */}
            <AnimatePresence>
              {step === 'proving' && (
                <>
                  <motion.div
                    initial={{ x: -100, opacity: 0, scale: 0.5 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute left-0 md:left-[10%] top-1/2 -translate-y-1/2 z-20"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${mode === 'zkp' ? 'bg-teal-500' : 'bg-red-500'}`}>
                      <span className="text-white text-[10px] font-bold">Data</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: 0, opacity: 0, scale: 0.5 }}
                    animate={{ x: 100, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut", delay: 0.8 }}
                    className="absolute right-0 md:right-[10%] top-1/2 -translate-y-1/2 z-20"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${mode === 'zkp' ? 'bg-green-500' : 'bg-red-500'}`}>
                      <span className="text-white text-[10px] font-bold">{mode === 'zkp' ? 'Proof' : 'Raw'}</span>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* 黑盒本体 */}
            <div className={`
              relative w-32 h-32 rounded-2xl flex items-center justify-center shadow-2xl z-10
              transition-all duration-500 bg-white dark:bg-slate-800
              ${step === 'proving' ? 'scale-110 ring-4 ring-teal-500/30' : 'scale-100'}
              ${mode === 'zkp' ? 'border-2 border-teal-500' : 'border-2 border-slate-400'}
            `}>
              {step === 'proving' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-2xl border-t-2 border-r-2 border-teal-500 opacity-50"
                />
              )}

              <div className="text-center z-10">
                {mode === 'zkp' ? (
                  <Lock className={`w-10 h-10 mx-auto ${step === 'proving' ? 'text-teal-500' : 'text-slate-400'}`} />
                ) : (
                  <Unlock className={`w-10 h-10 mx-auto ${step === 'proving' ? 'text-slate-600' : 'text-slate-400'}`} />
                )}
                <p className="text-[10px] mt-1 font-mono text-slate-500 uppercase">
                  {mode === 'zkp' ? 'ZK-Circuit' : 'Plain Text'}
                </p>
              </div>

              {/* 悬浮日志 */}
              {mode === 'zkp' && step === 'proving' && (
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-48 bg-slate-900 border border-slate-700 text-green-400 text-[10px] font-mono p-2 rounded shadow-2xl">
                  <p>{'>'} Generator...</p>
                  <p>{'>'} Computing...</p>
                  <p className="animate-pulse">{'>'} Encrypting...</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. 验证输出端 */}
          <div className="privacy-demo-section flex flex-col items-stretch relative overflow-hidden min-h-[300px]">
            <div className={`absolute top-0 left-0 w-full h-1 ${mode === 'zkp' ? 'bg-green-500' : 'bg-red-500'}`}></div>

            <div className="privacy-demo-title flex items-center space-x-2">
              {mode === 'zkp' ? <ShieldCheck className="text-green-500" /> : <AlertTriangle className="text-red-500" />}
              <h3>
                {mode === 'zkp' ? t('privacy.verifierTitleZkp') : t('privacy.verifierTitleTraditional')}
              </h3>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {step === 'idle' && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center text-slate-500"
                  >
                    <div className="privacy-status-indicator idle mb-2">
                      <CheckCircle size={16} />
                    </div>
                    <p>{t('privacy.waiting')}</p>
                  </motion.div>
                )}

                {step === 'proving' && (
                  <motion.div
                    key="proving"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <div className="privacy-status-indicator proving mb-2">
                      <RefreshCw size={16} />
                    </div>
                    <p className="privacy-status-text !text-teal-600">{t('privacy.verifying')}</p>
                  </motion.div>
                )}

                {step === 'verified' && result && (
                  <motion.div
                    key="verified"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full flex-col flex"
                  >
                    <div className={`privacy-result-card ${result.success ? 'success' : 'failure'}`}>
                      {result.success ? <CheckCircle className="privacy-result-icon" /> : <XCircle className="privacy-result-icon" />}
                      <div className="privacy-result-content">
                        <p className="privacy-result-title">{result.success ? t('privacy.resultPass') : t('privacy.resultFail')}</p>
                        <p className="privacy-result-message">{result.message}</p>
                      </div>
                    </div>

                    <div className="privacy-data-display">
                      <div className="privacy-data-header flex justify-between">
                        <span>Payload Data</span>
                        <span className={`px-2 rounded ${mode === 'zkp' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                          {mode === 'zkp' ? 'ZKP' : 'RAW'}
                        </span>
                      </div>

                      <div className="privacy-data-content">
                        {mode === 'zkp' ? (
                          <div className="privacy-zkp-data">
                            <div><span className="privacy-zkp-brace">{'{'}</span><span className="privacy-zkp-comment">  ZK Proof Object</span></div>
                            <div className="pl-4"><span className="privacy-zkp-key">proof</span><span className="privacy-zkp-colon">: </span><span className="privacy-zkp-value-proof">&quot;0x3a...8f2b&quot;</span>,</div>
                            <div className="pl-4"><span className="privacy-zkp-key">publicInputs</span><span className="privacy-zkp-colon">: </span><span className="privacy-zkp-brace">{'{'}</span></div>
                            <div className="pl-8"><span className="privacy-zkp-key">rule_met</span><span className="privacy-zkp-colon">: </span><span className={`privacy-zkp-value-bool text-[${result.success ? '#4ade80' : '#ef4444'}]`}>{result.success.toString()}</span>,</div>
                            <div className="pl-8"><span className="privacy-zkp-key">timestamp</span><span className="privacy-zkp-colon">: </span><span className="privacy-zkp-value-timestamp">{new Date().toISOString().slice(11, 19)}</span></div>
                            <div className="pl-4"><span className="privacy-zkp-brace">{'}'}</span></div>
                            <div><span className="privacy-zkp-brace">{'}'}</span></div>
                            <div className="privacy-note mt-2">
                              <span className="privacy-note-success privacy-note-icon">✓</span>
                              <span>{t('privacy.zkpNote')}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="privacy-traditional-data">
                            <div><span className="privacy-traditional-brace">{'{'}</span><span className="privacy-traditional-comment">  Raw Plain Text</span></div>
                            <div className="pl-4"><span className="privacy-traditional-key">age</span><span className="privacy-traditional-colon">: </span><span className="privacy-traditional-value">{formData.age}</span>,</div>
                            <div className="pl-4"><span className="privacy-traditional-key">height</span><span className="privacy-traditional-colon">: </span><span className="privacy-traditional-value">{formData.height}</span>,</div>
                            <div className="pl-4"><span className="privacy-traditional-key">weight</span><span className="privacy-traditional-colon">: </span><span className="privacy-traditional-value">{formData.weight}</span>,</div>
                            <div className="pl-4"><span className="privacy-traditional-key">bmi</span><span className="privacy-traditional-colon">: </span><span className="privacy-traditional-value">{calculateBMI(formData.height, formData.weight)}</span>,</div>
                            <div className="pl-4"><span className="privacy-traditional-key">ip_address</span><span className="privacy-traditional-colon">: </span><span className="privacy-traditional-ip">&quot;192.168.x.x&quot;</span></div>
                            <div><span className="privacy-traditional-brace">{'}'}</span></div>
                            <div className="privacy-note mt-2">
                              <span className="privacy-note-warning privacy-note-icon">⚠</span>
                              <span>{t('privacy.traditionalNote')}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* 底部解释 */}
        <div className="privacy-footer">
          <div className="privacy-footer-item">
            <div className="w-2 h-2 rounded-full bg-green-500 privacy-footer-icon"></div>
            <p dangerouslySetInnerHTML={{ __html: t('privacy.footerZkp') }} />
          </div>
          <div className="privacy-footer-item">
            <div className="w-2 h-2 rounded-full bg-red-500 privacy-footer-icon"></div>
            <p dangerouslySetInnerHTML={{ __html: t('privacy.footerTraditional') }} />
          </div>
        </div>

      </div>
    </section>
  );
}
