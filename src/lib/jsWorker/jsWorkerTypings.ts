import { JSDocLink, JSDocLinkCode, JSDocLinkPlain, JSDocParameterTag, JSDocText, Project, ScriptKind } from "ts-morph";
import workerTypings from "./worker.d.ts?raw";

export function getJsWorkerTypings(): Array<FunctionDocumentation> {
  const project = new Project({ useInMemoryFileSystem: true });
  const declarationFile = project.createSourceFile("worker.d.ts", workerTypings, { scriptKind: ScriptKind.TS });
  return declarationFile.getFunctions().flatMap((func) => {
    const docs = func.getJsDocs()[0];
    return new FunctionDocumentation(
      func.getName()!,
      mapJsDocComment(docs.getComment()),
      func.getReturnType().getText(),
      docs
        .getTags()
        .filter((tag) => tag instanceof JSDocParameterTag)
        .map(
          (tag) =>
            new ParameterDocumentation(
              tag.getName(),
              mapJsDocComment(tag.getComment()),
              func.getParameter(tag.getName())!.getType().getText()!,
            ),
        ),
    );
  });
}

function mapJsDocComment(
  comment: string | (JSDocText | JSDocLink | JSDocLinkCode | JSDocLinkPlain | undefined)[] | undefined,
): Array<DocumentationText> {
  if (typeof comment === "string") {
    return mapTextComment(comment);
  }
  if (comment == null) {
    return [];
  }

  return comment.flatMap((comment) => {
    if (comment instanceof JSDocText) {
      return mapTextComment(comment.getFullText());
    } else if (comment instanceof JSDocLink || comment instanceof JSDocLinkPlain) {
      const { url, label } = expandLinkText(comment.getFullText());
      return [new DocumentationTextLink([new DocumentationTextPlain(label ?? url)], url)];
    } else if (comment instanceof JSDocLinkCode) {
      const { url, label } = expandLinkText(comment.getFullText());
      return [new DocumentationTextLink([new DocumentationTextCode(label ?? url)], url)];
    } else {
      return [];
    }
  });
}

const linkRegex = /^\{@link(?:code|plain)? (.*?)(?: \| (.*))?\}$/;
function expandLinkText(linkText: string): { url: string; label: string | null } {
  const match = linkText.match(linkRegex);
  if (match == null) {
    throw new Error("No link in link!");
  }
  return {
    url: match[1],
    label: match[2],
  };
}

const codeRegex = /`([^\b](?:.*?[^\b])?)`/g;
function mapTextComment(text: string): Array<DocumentationText> {
  const codeMatches = [...text.matchAll(codeRegex)];
  if (codeMatches.length === 0) {
    return [new DocumentationTextPlain(text)];
  }
  let prevIndex = 0;
  const content: Array<DocumentationText> = [];
  for (const match of codeMatches) {
    content.push(new DocumentationTextPlain(text.substring(prevIndex, match.index)));
    content.push(new DocumentationTextCode(match[1]));
    prevIndex = match.index + match[0].length;
  }
  if (prevIndex < text.length) {
    content.push(new DocumentationTextPlain(text.substring(prevIndex)));
  }
  return content;
}

export class FunctionDocumentation {
  public constructor(
    public readonly name: string,
    public readonly description: ReadonlyArray<DocumentationText>,
    public readonly returnType: string,
    public readonly parameters: ReadonlyArray<ParameterDocumentation>,
  ) {}
}

export class ParameterDocumentation {
  public constructor(
    public readonly name: string,
    public readonly description: ReadonlyArray<DocumentationText>,
    public readonly type: string,
  ) {}
}

export class DocumentationText {}

export class DocumentationTextPlain extends DocumentationText {
  public constructor(public readonly text: string) {
    super();
  }
}

export class DocumentationTextCode extends DocumentationText {
  public constructor(public readonly text: string) {
    super();
  }
}

export class DocumentationTextLink extends DocumentationText {
  public constructor(
    public readonly content: ReadonlyArray<DocumentationText>,
    public readonly url: string,
  ) {
    super();
  }
}
