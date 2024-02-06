/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    skipTrailingSlashRedirect: true,
    skipMiddlewareUrlNormalize: true,
    env: {
      API_ENDPOINT: "http://localhost:3000/api/",
      
    },
};

export default nextConfig;
