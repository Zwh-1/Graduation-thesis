import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { workflowSteps, containerVariants, cardVariants } from '@/types/home/Workflow';
import '@/types/home/css/Workflow.css';
import { useI18n } from '@/shared/utils/I18nProvider';

export default function WorkflowSection() {
  const { t } = useI18n();

  return (
    <section className="workflow-section" id="workflow">
      <div className="workflow-container">

        {/* 标题区域 */}
        <div className="workflow-title-area">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="workflow-title"
          >
            {t('workflow.sectionTitle')}
          </motion.h2>
          <p className="workflow-subtitle">
            {t('workflow.subtitle')}
          </p>
          <p className="workflow-description">
            {t('workflow.description')}
          </p>
        </div>

        {/* 流程容器 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="workflow-container-relative"
        >

          {/* --- 背景连接线 (SVG) --- */}
          <div className="workflow-svg-line">
            {/* 移动端：垂直线 */}
            <svg className="workflow-svg-mobile">
              <motion.path
                d="M4,0 V400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-300 dark:text-gray-700"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5 }}
              />
            </svg>
            {/* 桌面端：水平线 */}
            <svg className="workflow-svg-desktop">
              <motion.path
                d="M0,32 H800"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="8 4"
                className="text-teal-300 dark:text-teal-700"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5 }}
              />
            </svg>
          </div>

          {/* 卡片网格 */}
          <div className="workflow-card-grid">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.id}
                variants={cardVariants}
                className="workflow-card"
              >
                {/* 图标容器 */}
                <div className={`workflow-icon-container ${step.bgColor} ${step.borderColor}`}>
                  {step.isCore && (
                    <div className="workflow-core-badge">CORE</div>
                  )}
                  <div className={`workflow-icon-container-hover border-current ${step.color}`} />
                  <span className={step.color}>
                    {step.icon}
                  </span>
                </div>

                {/* 连接箭头 */}
                {index < workflowSteps.length - 1 && (
                  <>
                    <ArrowDown className="workflow-arrow-down md:hidden" size={20} />
                    <ArrowRight className="workflow-arrow-right hidden md:block" size={20} />
                  </>
                )}

                {/* 文字内容 */}
                <h3 className="workflow-card-title">
                  {t(`workflow.step${step.id}Title` as Parameters<typeof t>[0])}
                </h3>
                <p className="workflow-card-subtitle">
                  {t(`workflow.step${step.id}Subtitle` as Parameters<typeof t>[0])}
                </p>
                <p className="workflow-card-description">
                  {t(`workflow.step${step.id}Desc` as Parameters<typeof t>[0])}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}