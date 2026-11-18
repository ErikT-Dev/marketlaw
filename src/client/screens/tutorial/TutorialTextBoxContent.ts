export type TutorialTextBoxContent = {
  readonly stepLine: string;
  readonly paragraphs: ReadonlyArray<string>;
  readonly actionLine: string | null;
  readonly button: "continue" | "finish" | null;
};
