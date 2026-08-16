import { cp, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const assetsDirectory = path.join(process.cwd(), "node_modules/monaco-editor/min/vs/assets");
const workerFilename = (await readdir(assetsDirectory)).find((filename) => /^editor\.worker-.+\.js$/.test(filename));

if (!workerFilename) {
  throw new Error("The installed Monaco editor worker could not be found.");
}

const targetDirectory = path.join(process.cwd(), "public/vendor/monaco");
await mkdir(targetDirectory, { recursive: true });
await cp(path.join(assetsDirectory, workerFilename), path.join(targetDirectory, "editor.worker.js"));
