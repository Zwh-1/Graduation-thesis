"use client"

import { useEffect, useState, useRef } from "react"
import "@/types/home/css/Hero.css"
import { Shield, Zap, UserCheck } from "lucide-react"
import ParticleBackground from "./ParticleBackground"
import {
    cn,
    HeroSectionProps,
    DEFAULT_PARTICLE_COUNT,
    PERFORMANCE_PARTICLE_COUNT,
    IMAGE_LOAD_TIMEOUT,
    SCROLL_CONFIG,
    calculateScrollProgress,
    DEFAULT_BACKGROUND_IMAGE,
    calculateAnimationDuration,
} from "@/types/home/HeroType"
import { ImageNext } from "@/shared/components/index"
import { useI18n } from "@/shared/utils/I18nProvider"

// ==================== 组件实现 ====================

/**
 * HeroSection 组件
 *
 * 主题：基于零知识证明 (ZKP) 的轻量级健康隐私系统
 * 特性：粒子背景、3D 视差、智能滚动检测、情感化微交互
 *
 * @param props - 组件属性
 * @returns HeroSection 组件
 */
export default function HeroSection({
    className = "",
    title = "保护隐私的健康数据验证",
    subtitle = "无需上传原始病历，即可完成合规审计。用数学证明确保隐私只留在本地，全面落实数据可用不可见。",
    compactTitle = "ZK-Health Core",
    compactSubtitle = "零知识验证 · 隐私优先 · 合规审计",
    backgroundImage,
    onCtaClick,
    performanceMode = false,
    enableParticles = true,
    isNight = true,
}: HeroSectionProps) {
    const { t } = useI18n()
    // ==================== 状态管理 ====================

    const [scrollProgress, setScrollProgress] = useState(0)
    const [scrollVelocity, setScrollVelocity] = useState(0)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)

    const requestRef = useRef<number>(0)
    const lastScrollYRef = useRef<number>(0)
    const imageLoadTimeoutRef = useRef<number>(0)

    // ==================== 样式计算 ====================

    // 确定使用的背景图片（优先使用传入的，否则使用默认）
    const useBackgroundImage = backgroundImage || DEFAULT_BACKGROUND_IMAGE

    // 判断是否为紧凑模式
    const isCompact = scrollProgress > SCROLL_CONFIG.compactThreshold

    // 计算高度（100vh -> 16vh）
    const heightVh =
        SCROLL_CONFIG.maxHeightVh -
        scrollProgress * (SCROLL_CONFIG.maxHeightVh - SCROLL_CONFIG.minHeightVh)

    // 计算动画持续时间
    const animationDuration = calculateAnimationDuration(scrollVelocity)

    // 获取粒子数量
    const particleCount = performanceMode
        ? PERFORMANCE_PARTICLE_COUNT
        : DEFAULT_PARTICLE_COUNT

    // 计算内容透明度
    const contentOpacity = isCompact ? 0 : 1
    const compactContentOpacity = isCompact ? 1 : 0

    // 背景遮罩样式
    const backgroundOverlayStyle = {
        backgroundColor: isCompact
            ? (isNight ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)")
            : (isNight ? "rgba(15, 23, 42, 0.4)" : "rgba(255, 255, 255, 0.4)"),
    }

    // ==================== 逻辑处理 ====================

    /**
     * 处理滚动事件
     * 计算滚动进度、速度，并更新状态
     */
    const handleScroll = () => {
        const currentScroll = window.scrollY

        // 计算滚动速度（当前滚动位置 - 上一帧滚动位置）
        const velocity = currentScroll - lastScrollYRef.current
        setScrollVelocity(velocity)

        // 更新上一帧滚动位置
        lastScrollYRef.current = currentScroll

        // 计算滚动进度（0-1）
        const progress = calculateScrollProgress(currentScroll, SCROLL_CONFIG)
        setScrollProgress(progress)
    }

    /**
     * 滚动监听器
     * 使用 requestAnimationFrame 优化性能
     */
    useEffect(() => {
        const onScroll = () => {
            // 取消上一帧的动画请求
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current)
            }
            // 请求下一帧动画
            requestRef.current = requestAnimationFrame(handleScroll)
        }

        // 添加滚动事件监听
        window.addEventListener("scroll", onScroll, { passive: true })

        // 立即执行一次
        handleScroll()

        // 清理函数
        return () => {
            window.removeEventListener("scroll", onScroll)
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current)
            }
            // 清除图片加载超时
            if (imageLoadTimeoutRef.current) {
                clearTimeout(imageLoadTimeoutRef.current)
            }
        }
    }, [])

    /**
     * 处理背景图片加载成功
     */
    const handleImageLoad = () => {
        setImageLoaded(true)
    }

    /**
     * 处理背景图片加载失败
     * @param error - 错误事件
     */
    const handleImageError = () => {
        console.warn("背景图片加载失败，使用默认背景色")
        setHasError(true)
        setImageLoaded(false)
    }

    /**
     * 设置图片加载超时
     * 防止图片加载卡死
     */
    useEffect(() => {
        imageLoadTimeoutRef.current = window.setTimeout(() => {
            if (!imageLoaded && !hasError) {
                console.warn("背景图片加载超时")
                handleImageError()
            }
        }, IMAGE_LOAD_TIMEOUT)

        return () => {
            if (imageLoadTimeoutRef.current) {
                clearTimeout(imageLoadTimeoutRef.current)
            }
        }
    }, [imageLoaded, hasError])

    // ==================== 渲染辅助 ====================

    /**
     * 渲染背景图片层
     */
    const renderBackgroundImageLayer = () => {
        if (!enableParticles || hasError) return null

        return (
            <div
                className="hero-background-image-layer"
                style={{
                    opacity: imageLoaded ? 1 : 0,
                    transition: "opacity 0.5s ease-in-out",
                }}
            >
                <ImageNext
                    src={useBackgroundImage}
                    alt="背景图片"
                    className="hero-background-image"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="eager"
                />
            </div>
        )
    }

    /**
     * 渲染装饰网格层
     */
    const renderGridLayer = () => (
        <div
            className="hero-grid-layer"
            style={{
                backgroundImage: isNight
                    ? `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                       linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`
                    : `linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
                       linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
                transform: `translate3d(${scrollProgress * 50}px, 0, 0)`,
                willChange: "transform",
            }}
        />
    )

    /**
     * 渲染粒子背景层
     */
    const renderParticleLayer = () => {
        if (!enableParticles) return null

        return (
            <ParticleBackground
                scrollProgress={scrollProgress}
                particleCount={particleCount}
                enableConnections={!performanceMode}
                performanceMode={performanceMode}
                isNight={isNight}
            />
        )
    }

    /**
     * 渲染 CTA 按钮组
     */
    const renderCtaButtons = () => (
        <div className="hero-cta-buttons">
            <button
                onClick={onCtaClick}
                className="hero-cta-primary"
            >
                <span className="hero-cta-primary-content">
                    {t('hero.ctaPrimary')}
                    <svg
                        className="hero-cta-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                        ></path>
                    </svg>
                </span>
            </button>

            <button className={cn("hero-cta-secondary", isNight ? "" : "text-slate-900 border-slate-300 hover:bg-slate-100")}>
                {t('hero.ctaSecondary')}
            </button>
        </div>
    )

    /**
     * 渲染底部滚动指示器
     */
    const renderScrollIndicator = () => {
        if (isCompact) return null

        return (
            <div className="hero-scroll-indicator">
                <div className="hero-scroll-indicator-content">
                    <span className="text-xs uppercase tracking-widest">
                        {t('hero.scrollDown')}
                    </span>
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        ></path>
                    </svg>
                </div>
            </div>
        )
    }

    // ==================== 主渲染 ====================

    return (
        <section
            className={cn(
                "hero-section",
                className
            )}
            style={{
                height: `${heightVh}vh`,
                backgroundColor:
                    hasError || !backgroundImage ? (isNight ? "#0f172a" : "#f8fafc") : "transparent",
            }}
        >
            {/* ================= 背景图片层 ================= */}
            {renderBackgroundImageLayer()}

            {/* ================= 背景装饰光球 ================= */}
            <div className={isNight ? "hero-orb-1" : ""} />
            <div className={isNight ? "hero-orb-2" : ""} />

            {/* ================= 背景遮罩层 ================= */}
            <div
                className="hero-background-overlay"
                style={backgroundOverlayStyle}
            />

            {/* ================= 装饰网格层 ================= */}
            {renderGridLayer()}

            {/* ================= 粒子背景层 ================= */}
            {renderParticleLayer()}

            {/* ================= 滚动进度指示器 ================= */}
            <div
                className="hero-scrollbar"
                style={{
                    width: `${scrollProgress * 100}%`,
                    transition:
                        calculateAnimationDuration(scrollVelocity) === "0.2s"
                            ? "none"
                            : "width 0.1s linear",
                }}
            />

            {/* ================= 宽松模式内容层 ================= */}
            <div
                className="hero-content-layer"
                style={{
                    opacity: contentOpacity,
                    transform: `translate3d(0, 0, 0)`,
                    transition: `opacity ${animationDuration} ease-out`,
                    pointerEvents: isCompact ? "none" : "auto",
                    willChange: "opacity, transform",
                }}
            >
                <div
                    className={cn(
                        "transition-all duration-500 ease-out flex flex-col",
                        isCompact
                            ? "hidden"
                            : "hero-content-container"
                    )}
                >
                    {/* 顶部标签 */}
                    <div className="mb-6 flex justify-center">
                        <span className={cn(
                            "px-5 py-2 rounded-full border text-sm font-medium tracking-wide shadow-sm flex items-center gap-2",
                            isNight
                                ? "bg-teal-500/10 border-teal-500/20 text-teal-300"
                                : "bg-teal-50 border-teal-200 text-teal-700"
                        )}>
                            <span className="relative flex h-2 w-2">
                                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isNight ? "bg-teal-400" : "bg-teal-500")}></span>
                                <span className={cn("relative inline-flex rounded-full h-2 w-2", isNight ? "bg-teal-500" : "bg-teal-600")}></span>
                            </span>
                            {t('hero.badge')}
                        </span>
                    </div>

                    {/* 主标题 */}
                    <h1
                        className={cn(
                            "hero-title",
                            "text-5xl md:text-7xl drop-shadow-lg transition-colors duration-300",
                            isNight ? "text-white" : "text-slate-900"
                        )}
                    >
                        {isNight ? (
                            <>
                                <span className="hero-gradient-text">{t('hero.title')}</span>{t('hero.titleSuffix')}
                            </>
                        ) : (
                            <>
                                <span className="text-teal-600">{t('hero.title')}</span>{t('hero.titleSuffix')}
                            </>
                        )}
                    </h1>

                    {/* 副标题 */}
                    <p
                        className={cn(
                            "hero-subtitle",
                            "text-lg md:text-xl max-w-2xl transition-colors duration-300",
                            isNight ? "text-teal-100" : "text-slate-600"
                        )}
                    >
                        {t('hero.subtitle')}
                    </p>

                    {/* 特性展示 */}
                    <div className="mt-8 flex justify-center w-full">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                            {/* 特性卡 1 */}
                            <div className={cn(
                                "flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 group cursor-default",
                                isNight
                                    ? "bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-1"
                                    : "bg-white/90 border-slate-200/80 backdrop-blur-sm hover:bg-white hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/15 hover:-translate-y-1"
                            )}>
                                <div className={cn("hero-icon-glow", isNight ? "hero-icon-glow-night" : "hero-icon-glow-day")}>
                                    <Shield className={cn("w-6 h-6", isNight ? "text-teal-400" : "text-teal-600")} />
                                </div>
                                <h3 className={cn("font-semibold text-lg mb-2", isNight ? "text-white" : "text-slate-900")}>{t('hero.feature1Title')}</h3>
                                <p className={cn("text-sm text-center leading-relaxed", isNight ? "text-slate-400" : "text-slate-600")}>
                                    {t('hero.feature1Desc')}
                                </p>
                            </div>
                            {/* 特性卡 2 */}
                            <div className={cn(
                                "flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 group cursor-default",
                                isNight
                                    ? "bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-1"
                                    : "bg-white/90 border-slate-200/80 backdrop-blur-sm hover:bg-white hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/15 hover:-translate-y-1"
                            )}>
                                <div className={cn("hero-icon-glow", isNight ? "hero-icon-glow-night" : "hero-icon-glow-day")}>
                                    <Zap className={cn("w-6 h-6", isNight ? "text-teal-400" : "text-teal-600")} />
                                </div>
                                <h3 className={cn("font-semibold text-lg mb-2", isNight ? "text-white" : "text-slate-900")}>{t('hero.feature2Title')}</h3>
                                <p className={cn("text-sm text-center leading-relaxed", isNight ? "text-slate-400" : "text-slate-600")}>
                                    {t('hero.feature2Desc')}
                                </p>
                            </div>
                            {/* 特性卡 3 */}
                            <div className={cn(
                                "flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 group cursor-default",
                                isNight
                                    ? "bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-1"
                                    : "bg-white/90 border-slate-200/80 backdrop-blur-sm hover:bg-white hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/15 hover:-translate-y-1"
                            )}>
                                <div className={cn("hero-icon-glow", isNight ? "hero-icon-glow-night" : "hero-icon-glow-day")}>
                                    <UserCheck className={cn("w-6 h-6", isNight ? "text-teal-400" : "text-teal-600")} />
                                </div>
                                <h3 className={cn("font-semibold text-lg mb-2", isNight ? "text-white" : "text-slate-900")}>{t('hero.feature3Title')}</h3>
                                <p className={cn("text-sm text-center leading-relaxed", isNight ? "text-slate-400" : "text-slate-600")}>
                                    {t('hero.feature3Desc')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA 按钮组 */}
                    {renderCtaButtons()}
                </div>
            </div>

            {/* ================= 紧凑模式内容层 ================= */}
            <div
                className="hero-compact-layer"
                style={{
                    opacity: compactContentOpacity,
                    pointerEvents: isCompact ? "auto" : "none",
                    transition: `opacity ${animationDuration} ease-out`,
                }}
            >
                <div className="flex items-center gap-6">
                    {/* 紧凑模式标题 */}
                    <h1 className={cn("text-2xl md:text-3xl font-bold whitespace-nowrap drop-shadow-lg", isNight ? "text-white" : "text-slate-900")}>
                        {t('hero.compactTitle')}
                    </h1>

                    {/* 紧凑模式副标题 */}
                    <p className={cn("text-sm md:text-base uppercase tracking-widest hidden md:block drop-shadow-md", isNight ? "text-teal-100" : "text-slate-600")}>
                        {t('hero.compactSubtitle')}
                    </p>
                </div>
            </div>

            {/* ================= 底部滚动指示器 ================= */}
            {renderScrollIndicator()}
        </section>
    )
}
