/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    rewrites: async () => {
        return [
            {
                source: "/api/ws",
                destination: "http://127.0.0.1:8080/ws",
            },
        ];
    }
};

export default nextConfig;
