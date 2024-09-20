/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    rewrites: async () => {
        return [
            {
                source: "/api/ws",
                destination: process.env.WS_URL,
            },
        ];
    }
};

export default nextConfig;
