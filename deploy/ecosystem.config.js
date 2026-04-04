module.exports = {
  apps: [
    {
      name: "buslens-frontend",
      script: "npm",
      args: "start",
      cwd: "/home/ubuntu/buslens-ag/frontend",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
