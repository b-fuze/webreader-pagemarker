import { readFile as readFileCb } from "fs";
import { join } from "path";
import { promisify } from "util";

const readFile = promisify(readFileCb);

/**
 * @param {{ headerFile: string }}
 */
export function userscriptHeader({ headerFile }) {
  let updated = false;
  let headerSource = "";

  return {
    buildStart() {
      this.addWatchFile(headerFile);
    },
    watchChange(file) {
      const cwd = process.cwd();
      if (join(cwd, file) === join(cwd, headerFile)) {
        updated = false;
      }
    },
    /**
     * @param {strin} code
     * @param {{
     *   code: string;
     *   fileName: string;
     *   name: string;
     * }} chunkInfo
     */
    async renderChunk(code, chunkInfo) {
      if (!updated) {
        headerSource = await readFile(headerFile, { encoding: "utf8" });
        updated = true;
      }

      return headerSource + code;
    },
  };
}


