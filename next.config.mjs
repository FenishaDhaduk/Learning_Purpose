/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    skipTrailingSlashRedirect: true,
    skipMiddlewareUrlNormalize: true,

    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Add a rule to handle .node files using file-loader
        config.module.rules.push({
            test: /\.(node)$/,
            use: 'file-loader',
        });

        return config;
    },
};

export default nextConfig;
