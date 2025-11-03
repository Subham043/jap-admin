module.exports = {
  apps: [
    {
      name: "JAP_ADMIN",
      port: "3300",
      exec_mode: "cluster",
      instances: "max",
      script: "node_modules/next/dist/bin/next",
      args: "start",
    },
  ],
};
