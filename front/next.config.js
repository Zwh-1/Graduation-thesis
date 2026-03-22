/** @type {import('next').NextConfig} */
const nextConfig = {
  // 强制使用 Webpack，禁用 Turbopack
  // Next.js 16 默认使用 Turbopack，通过此配置切换回 Webpack
  webpack: (config, { isServer, dev }) => {
    // 客户端配置优化
    if (!isServer) {
      // 为 snarkjs 和 circomlib 提供 Node.js polyfills
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        buffer: require.resolve('buffer/'),
        stream: require.resolve('stream-browserify'),
      };
      
      // 优化 ZKP 相关的打包
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // 单独打包 ZKP 相关库
            zkp: {
              name: 'zkp-bundle',
              test: /[\\/]node_modules[\\/](snarkjs|circomlib)[\\/]/,
              priority: 10,
            },
            // 单独打包 ethers
            ethers: {
              name: 'ethers-bundle',
              test: /[\\/]node_modules[\\/]ethers[\\/]/,
              priority: 9,
            },
          },
        },
      };
      
      // 配置 Web Worker 支持
      config.module = {
        ...config.module,
        rules: [
          ...config.module.rules,
          {
            test: /\.worker\.ts$/,
            use: {
              loader: 'worker-loader',
              options: {
                inline: 'no-fallback',
              },
            },
          },
        ],
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
