export type RulebookParsed<T> = {
  readonly value: T;
  readonly problems: ReadonlyArray<string>;
};
