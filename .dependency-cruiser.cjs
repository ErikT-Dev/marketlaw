module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "rules-imports-only-shared",
      severity: "error",
      from: { path: "^src/rules/" },
      to: { path: "^src/", pathNot: "^src/(rules|shared)/" },
    },
    {
      name: "shared-imports-only-shared",
      severity: "error",
      from: { path: "^src/shared/" },
      to: { path: "^src/", pathNot: "^src/shared/" },
    },
    {
      name: "bots-and-hosts-import-only-shared",
      severity: "error",
      from: { path: "^src/(bots|hosts)/" },
      to: { path: "^src/", pathNot: ["^src/shared/", "^src/$1/"] },
    },
    {
      name: "client-imports-only-shared-and-hosts",
      severity: "error",
      from: { path: "^src/client/" },
      to: { path: "^src/", pathNot: "^src/(client|shared|hosts)/" },
    },
    {
      name: "server-never-imports-client-or-hosts",
      severity: "error",
      from: { path: "^src/server/" },
      to: { path: "^src/(client|hosts)/" },
    },
    {
      name: "rules-uses-no-packages",
      severity: "error",
      from: { path: "^src/rules/" },
      to: { dependencyTypes: ["npm", "npm-dev", "core"], pathNot: "^node_modules/valibot/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.client.json" },
    exclude: { path: "\.test\.tsx?$" },
  },
};
