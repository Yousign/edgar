/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ['**/.*'],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
  browserNodeBuiltinsPolyfill: {
    modules: {
      fs: true,
      'fs/promises': true,
      zlib: true,
      http: true,
      https: true,
      url: true,
    },
  },
};
