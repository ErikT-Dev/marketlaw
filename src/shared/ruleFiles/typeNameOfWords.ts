import * as v from "valibot";
import { TypeName } from "../catalogue/TypeName";
import type { Result } from "../Result";
import type { RuleFileProblem } from "./RuleFileProblem";

const SERVICE_TYPE_WORDS = "Service type";

export function typeNameOfWords(words: string, line: number): Result<TypeName, RuleFileProblem> {
  if (words === SERVICE_TYPE_WORDS) {
    return { isOk: true, value: "Service" };
  }
  if (words === "Service") {
    return {
      isOk: false,
      error: { line, word: words, message: `the Service type is written "${SERVICE_TYPE_WORDS}"` },
    };
  }
  if (!v.is(TypeName, words)) {
    return { isOk: false, error: { line, word: words, message: "unknown type, stat or sector" } };
  }
  return { isOk: true, value: words };
}
