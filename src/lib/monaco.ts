import * as monaco from "monaco-editor";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import workerTypings from "./jsWorker/worker.d.ts?raw";

Object.assign(self, {
  MonacoEnvironment: {
    getWorker() {
      return new TsWorker();
    },
  },
});

const defaultCompilerOptions = monaco.languages.typescript.javascriptDefaults.getCompilerOptions();
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  ...defaultCompilerOptions,
  lib: ["es2015"],
});
monaco.languages.typescript.javascriptDefaults.addExtraLib(workerTypings, "ts:filename/turtle.d.ts");

export default monaco;
