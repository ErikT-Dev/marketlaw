export type BudgetCheck = {
  readonly by: "harness" | "other check" | "not built";
  readonly where: string;
};
