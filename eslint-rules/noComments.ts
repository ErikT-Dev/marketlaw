import type { Rule } from "eslint";

export const noComments: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow every code comment; names and structure carry the meaning" },
    messages: {
      noComment: "No code comments. Rename or restructure instead (rules/typescript.md).",
    },
    schema: [],
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (comment.loc !== undefined && comment.loc !== null) {
            context.report({ loc: comment.loc, messageId: "noComment" });
          }
        }
      },
    };
  },
};
