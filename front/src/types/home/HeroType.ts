// ==================== 类型定义 ====================
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
/**
 * HeroSection 组件的属性接口
 */
interface HeroSectionProps {
    className?: string // 自定义 CSS 类名
    title?: string // 主标题文本
    subtitle?: string // 副标题文本
    compactTitle?: string // 紧凑模式下的标题
    compactSubtitle?: string // 紧凑模式下的副标题
    backgroundImage?: string // 背景图片 URL（可选）
    onCtaClick?: () => void // CTA 按钮点击回调函数
    performanceMode?: boolean // 性能模式（减少粒子数量）
    enableParticles?: boolean // 是否启用粒子背景
    isNight?: boolean // 是否为夜间模式
}

/**
 * 滚动配置常量
 */
interface ScrollConfig {
    startShrinkAt: number // 开始收缩的滚动位置
    endShrinkAt: number // 完全收缩的滚动位置
    minHeightVh: number // 最小高度（vh）
    maxHeightVh: number // 最大高度（vh）
    compactThreshold: number // 紧凑模式阈值
}

// ==================== 常量定义 ====================

/** 默认背景图片路径 */
const DEFAULT_BACKGROUND_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

/** 紧凑模式切换阈值 */
const COMPACT_THRESHOLD = 0.3

/** 快速滚动速度阈值（像素/帧） */
const FAST_SCROLL_THRESHOLD = 50

/** 粒子数量配置 */
const PARTICLE_COUNTS = {
    normal: 200,
    performance: 50,
}
/** 滚动配置常量 */
const SCROLL_CONFIG: ScrollConfig = {
    startShrinkAt: 0,
    endShrinkAt: 600,
    minHeightVh: 16,
    maxHeightVh: 100,
    compactThreshold: COMPACT_THRESHOLD,
}

/** 默认粒子数量 */
const DEFAULT_PARTICLE_COUNT = 200

/** 性能模式粒子数量 */
const PERFORMANCE_PARTICLE_COUNT = 50

/** 图片加载超时（毫秒） */
const IMAGE_LOAD_TIMEOUT = 5000


// ==================== 辅助函数 ====================

/**
 * 计算滚动进度（0-1）
 * @param currentScroll - 当前滚动位置
 * @param config - 滚动配置
 * @returns 滚动进度（0-1）
 */
function calculateScrollProgress(
    currentScroll: number,
    config: ScrollConfig
): number {
    const progress =
        (currentScroll - config.startShrinkAt) /
        (config.endShrinkAt - config.startShrinkAt)
    return Math.max(0, Math.min(1, progress))
}

/**
 * 计算动画持续时间（根据滚动速度）
 * @param scrollVelocity - 滚动速度
 * @returns 动画持续时间字符串
 */
function calculateAnimationDuration(scrollVelocity: number): string {
    const isFastScrolling = Math.abs(scrollVelocity) > FAST_SCROLL_THRESHOLD
    return isFastScrolling ? "0.2s" : "0.4s"
}

/**
 * 获取粒子数量（根据性能模式）
 * @param performanceMode - 是否启用性能模式
 * @returns 粒子数量
 */
function getParticleCount(performanceMode: boolean): number {
    return performanceMode
        ? PARTICLE_COUNTS.performance
        : PARTICLE_COUNTS.normal
}

// ==================== 导出工具函数 ====================

/**
 * cn 函数：合并 Tailwind CSS 类名
 * @param inputs - 类名输入
 * @returns 合并后的类名字符串
 */
function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs))
}

// ==================== 导出类型和常量 ====================

export {
    cn,
    DEFAULT_PARTICLE_COUNT,
    PERFORMANCE_PARTICLE_COUNT,
    IMAGE_LOAD_TIMEOUT,
    SCROLL_CONFIG,
    calculateScrollProgress,
    DEFAULT_BACKGROUND_IMAGE,
    calculateAnimationDuration,
}
export type { HeroSectionProps }
