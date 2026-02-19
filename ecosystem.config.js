// PM2 Ecosystem Config
// SEO Blog SaaS runs on port 3001 — does NOT touch zerofrictionhire.com (port 3000)
// Uses Next.js standalone output: .next/standalone/server.js

module.exports = {
  apps: [
    {
      name: "seo-blog-saas",
      script: ".next/standalone/server.js",
      cwd: "/var/www/seo-blog-saas",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "700M",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        HOSTNAME: "0.0.0.0",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
        HOSTNAME: "0.0.0.0",
      },
      error_file: "/var/log/pm2/seo-blog-saas-error.log",
      out_file: "/var/log/pm2/seo-blog-saas-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
