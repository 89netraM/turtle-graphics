import * as monaco from "monaco-editor";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import workerTypings from "../jsWorker/worker.d.ts?raw";
import halloweenTheme from "./halloweenTheme.json";

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
// @ts-ignore: Some type info is lost on JSON files
monaco.editor.defineTheme("Halloween", halloweenTheme);

export default monaco;
