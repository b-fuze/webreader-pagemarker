import typescript from "@rollup/plugin-typescript";
import { userscriptHeader } from "./rollup/userscript-header";
import { outputToClipboard } from "./rollup/output-to-clipboard";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/webreader.js",
    format: "iife",
  },
  plugins: [
    typescript(),
    outputToClipboard(),
    userscriptHeader({
      headerFile: "./src/header.ts",
    }),
  ],
};
