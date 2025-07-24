module.exports = {
  apps: [
    {
      name: 'logwatch-next-3106',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 3106,
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
    },
  ],
}; 