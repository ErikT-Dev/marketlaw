import type { RandomDraw } from "./RandomDraw.ts";
import type { RandomEntry } from "./RandomEntry.ts";
import type { RandomKind } from "./RandomKind.ts";
import type { RandomPurpose } from "./RandomPurpose.ts";

export class ScriptedRandom {
  private readonly entries: ReadonlyArray<RandomEntry>;
  private nextIndex = 0;
  private readonly foundProblems: string[] = [];

  constructor(entries: ReadonlyArray<RandomEntry>) {
    this.entries = entries;
  }

  next(kind: RandomKind, purpose: RandomPurpose): RandomDraw {
    const entry = this.entries[this.nextIndex];
    if (entry === undefined || (purpose === "setup" && entry.kind !== kind)) {
      if (purpose === "play") {
        this.foundProblems.push(`the rules asked for a random ${kind} the scenario does not list`);
      }
      return { kind: "free" };
    }
    this.nextIndex += 1;
    if (entry.kind !== kind) {
      this.foundProblems.push(
        `the rules asked for a random ${kind}, but random result ${this.nextIndex} is a ${entry.kind}`,
      );
      return { kind: "free" };
    }
    return { kind: "listed", value: entry.value };
  }

  problems(): ReadonlyArray<string> {
    const unused = this.entries.length - this.nextIndex;
    return unused > 0
      ? [...this.foundProblems, `${unused} listed random results were never asked for`]
      : [...this.foundProblems];
  }
}
