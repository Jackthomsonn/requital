const { getDefaultConfig } = require("@expo/metro-config");
const { resolve } = require("path");

const workspaceRoot = resolve(__dirname, "../..");
const projectRoot = __dirname;

const config = getDefaultConfig(__dirname);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  resolve(projectRoot, "node_modules"),
  resolve(workspaceRoot, "node_modules"),
];

config.resolver.assetExts.push("cjs");

module.exports = config;
