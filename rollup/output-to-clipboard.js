import { spawn } from "child_process";

export function outputToClipboard() {
  return {
    /**
     * @param {{
     * [fileName: string]: {
     *     type: "chunk" | "asset";
     *     code: string;
     *     fileName: string;
     *     name: string;
     *   }
     * }} bundle
     */
    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        const item = bundle[fileName];

        if (item.type === "chunk") {
          const clip = spawn("xclip", ["-i", "-sel", "clip"], {
            stdio: ["pipe", "ignore", "ignore"],
          });

          clip.stdin.end(item.code);
        }
      }
    },
  };
}
