
// 将流程步骤提取为数组，方便维护和复用
import type { Variants } from 'framer-motion';
import { FileText, ShieldCheck, Lock } from 'lucide-react';

const workflowSteps = [
  {
    id: 1,
    title: "workflow.step1Title",
    subtitle: "Local Data Encapsulation",
    description: "workflow.step1Desc",
    icon: <FileText className="w-6 h-6" />,
    color: "text-teal-500",
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
    borderColor: "border-teal-200 dark:border-teal-800"
  },
  {
    id: 2,
    title: "workflow.step2Title",
    subtitle: "ZK-Proof Generation",
    description: "workflow.step2Desc",
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    isCore: true // 标记为核心步骤，用于特殊高亮
  },
  {
    id: 3,
    title: "workflow.step3Title",
    subtitle: "Anonymous Verification",
    description: "workflow.step3Desc",
    icon: <Lock className="w-6 h-6" />,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800"
  }
];

// 统一管理动画效果，使代码更整洁
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // 子元素依次延迟出现，产生波浪效果
      delayChildren: 0.2
    }
  }
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 12,
      duration: 0.8
    }
  }
};

const lineVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 1.5,
      ease: 'easeInOut' as const
    }
  }
};

export {
  workflowSteps,
  containerVariants,
  cardVariants,
  lineVariants
};