import type { TurtleAction } from "$lib/turtle-graphics";
import workerScript from "./worker.js?raw";

export class JsWorker {
  public static create(js: string): JsWorker {
    const blob = new Blob([`async function render() {${js}}\n${workerScript}`]);
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    URL.revokeObjectURL(url);
    return new JsWorker(worker);
  }

  private getActionsPromise: Promise<ReadonlyArray<TurtleAction>> | null = null;

  private constructor(private readonly worker: Worker) {
    this.getActions = this.getActions.bind(this);
  }

  public getActions(): Promise<ReadonlyArray<TurtleAction>> {
    return (
      this.getActionsPromise ??
      (this.getActionsPromise = new Promise(
        (resolve: (actions: ReadonlyArray<TurtleAction>) => void, reject: () => void) => {
          const onMessage = (e: MessageEvent<unknown>) => {
            if (!isResultData(e.data)) {
              return;
            }
            this.worker.removeEventListener("message", onMessage);
            this.worker.removeEventListener("error", onError);
            clearTimeout(timeoutId);
            if (e.data.error) {
              reject();
            } else {
              resolve(e.data.result ?? []);
            }
          };
          const onError = () => {
            this.worker.removeEventListener("message", onMessage);
            this.worker.removeEventListener("error", onError);
            clearTimeout(timeoutId);
            reject();
          };

          this.worker.addEventListener("message", onMessage);
          this.worker.addEventListener("error", onError);
          const timeoutId = setTimeout(() => reject(), 500);

          this.worker.postMessage({});
        },
      ))
    );
  }

  public dispose() {
    this.worker.terminate();
  }
}

function isResultData(data: unknown): data is { result?: ReadonlyArray<TurtleAction>; error?: true } {
  return (
    data instanceof Object &&
    (!("result" in data) || data.result instanceof Array || typeof data.result === "undefined")
  );
}
