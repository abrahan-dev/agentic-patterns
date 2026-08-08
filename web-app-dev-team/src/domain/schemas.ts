import { z } from "zod";
import { Role, roles } from "./roles.ts";
import {
  RunStatus,
  SpecificationReviewDecision as ReviewDecision,
  TurnDecision,
} from "./workflow-values.ts";

export const roleSchema = z.enum(roles);
export { Role, roles } from "./roles.ts";
export const featureIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Must be a lowercase kebab-case ID.");

const agentTurnBaseSchema = z.object({
  summary: z.string().min(1),
  artifacts: z.array(z.string()),
  evidence: z.array(z.string()),
  reason: z.string().min(1),
});

export const specifierTurnSchema = agentTurnBaseSchema.extend({
  role: z.literal(Role.Specifier),
  featureId: featureIdSchema,
  specification: z.string().min(1),
  assumptions: z.array(z.string()),
  outOfScope: z.array(z.string()),
  decision: z.literal(TurnDecision.Handoff),
  nextRole: z.literal(Role.Architect),
});
export type SpecifierTurn = z.infer<typeof specifierTurnSchema>;

export const changePlanSchema = z
  .object({
    applicationName: featureIdSchema,
    contexts: z.array(featureIdSchema).min(1),
    dataRequired: z.boolean(),
    backendRequired: z.boolean(),
    frontendRequired: z.boolean(),
  })
  .refine(
    ({ dataRequired, backendRequired, frontendRequired }) =>
      dataRequired || backendRequired || frontendRequired,
    "At least one implementation surface is required.",
  );
export type ChangePlan = z.infer<typeof changePlanSchema>;

export const architectTurnSchema = agentTurnBaseSchema.extend({
  role: z.literal(Role.Architect),
  design: z.string().min(1),
  changePlan: changePlanSchema,
  domainModel: z.array(z.string()),
  apiContract: z.array(z.string()),
  security: z.array(z.string()),
  constraints: z.array(z.string()),
  risks: z.array(z.string()),
  decision: z.literal(TurnDecision.Handoff),
  nextRole: z.enum([
    Role.Specifier,
    Role.UiDesigner,
    Role.DataEngineer,
    Role.BackendCoder,
    Role.FrontendCoder,
    Role.Qa,
  ]),
});
export type ArchitectTurn = z.infer<typeof architectTurnSchema>;

export const uiDesignerTurnSchema = agentTurnBaseSchema.extend({
  role: z.literal(Role.UiDesigner),
  screens: z.array(z.string()),
  interactions: z.array(z.string()),
  interfaceStates: z.array(z.string()),
  accessibility: z.array(z.string()),
  decision: z.literal(TurnDecision.Handoff),
  nextRole: z.enum([
    Role.Architect,
    Role.DataEngineer,
    Role.BackendCoder,
    Role.FrontendCoder,
    Role.Qa,
  ]),
});
export type UiDesignerTurn = z.infer<typeof uiDesignerTurnSchema>;

export const dataEngineerTurnSchema = agentTurnBaseSchema.extend({
  role: z.literal(Role.DataEngineer),
  schemaChanges: z.array(z.string()),
  migrations: z.array(z.string()),
  persistenceMappings: z.array(z.string()),
  tests: z.array(z.string()),
  decision: z.literal(TurnDecision.Handoff),
  nextRole: z.enum([Role.Architect, Role.BackendCoder, Role.FrontendCoder, Role.Qa]),
});
export type DataEngineerTurn = z.infer<typeof dataEngineerTurnSchema>;

export const backendCoderTurnSchema = agentTurnBaseSchema.extend({
  role: z.literal(Role.BackendCoder),
  changes: z.array(z.string()),
  tests: z.array(z.string()),
  apiProcedures: z.array(z.string()),
  domainDecisions: z.array(z.string()),
  decision: z.literal(TurnDecision.Handoff),
  nextRole: z.enum([Role.Architect, Role.FrontendCoder, Role.Qa]),
});
export type BackendCoderTurn = z.infer<typeof backendCoderTurnSchema>;

export const frontendCoderTurnSchema = agentTurnBaseSchema.extend({
  role: z.literal(Role.FrontendCoder),
  changes: z.array(z.string()),
  tests: z.array(z.string()),
  screens: z.array(z.string()),
  apiUsage: z.array(z.string()),
  decision: z.literal(TurnDecision.Handoff),
  nextRole: z.enum([Role.Architect, Role.Qa]),
});
export type FrontendCoderTurn = z.infer<typeof frontendCoderTurnSchema>;

export const qaTurnSchema = agentTurnBaseSchema.extend({
  role: z.literal(Role.Qa),
  scenariosTested: z.array(z.string()),
  commands: z.array(z.string()),
  failures: z.array(z.string()),
  failureOwner: z
    .enum([Role.Architect, Role.DataEngineer, Role.BackendCoder, Role.FrontendCoder])
    .nullable(),
  decision: z.enum(TurnDecision),
  nextRole: z
    .enum([Role.Architect, Role.DataEngineer, Role.BackendCoder, Role.FrontendCoder])
    .nullable(),
});
export type QaTurn = z.infer<typeof qaTurnSchema>;

export const agentTurnSchema = z.discriminatedUnion("role", [
  specifierTurnSchema,
  architectTurnSchema,
  uiDesignerTurnSchema,
  dataEngineerTurnSchema,
  backendCoderTurnSchema,
  frontendCoderTurnSchema,
  qaTurnSchema,
]);
export type AgentTurn = z.infer<typeof agentTurnSchema>;

export const tokenUsageSchema = z.object({
  inputTokens: z.number().int().nonnegative(),
  cachedInputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  reasoningOutputTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
});
export type TokenUsage = z.infer<typeof tokenUsageSchema>;

export const tokenTotalsSchema = z.object({
  team: tokenUsageSchema,
  byRole: z.object({
    [Role.Specifier]: tokenUsageSchema,
    [Role.Architect]: tokenUsageSchema,
    [Role.UiDesigner]: tokenUsageSchema,
    [Role.DataEngineer]: tokenUsageSchema,
    [Role.BackendCoder]: tokenUsageSchema,
    [Role.FrontendCoder]: tokenUsageSchema,
    [Role.Qa]: tokenUsageSchema,
  }),
});
export type TokenTotals = z.infer<typeof tokenTotalsSchema>;

export const agentExecutionSchema = z.object({
  sequence: z.number().int().positive(),
  turn: z.number().int().positive(),
  role: roleSchema,
  startedAt: z.string(),
  completedAt: z.string(),
  status: z.enum([RunStatus.Completed, RunStatus.Failed]).default(RunStatus.Completed),
  usage: tokenUsageSchema.nullable(),
  commands: z
    .array(
      z.object({
        command: z.string(),
        exitCode: z.number().int().nullable(),
      }),
    )
    .default([]),
  changedFiles: z.array(z.string()).default([]),
});
export type AgentExecution = z.infer<typeof agentExecutionSchema>;

export const localCommandResultSchema = z.object({
  command: z.string(),
  exitCode: z.number().int(),
  output: z.string(),
});
export type LocalCommandResult = z.infer<typeof localCommandResultSchema>;

export const localCheckSchema = z.object({
  sequence: z.number().int().positive(),
  turn: z.number().int().positive(),
  role: roleSchema,
  kind: z.enum(["gherkin", "quality-gate"]),
  createdAt: z.string(),
  passed: z.boolean(),
  summary: z.string(),
  details: z.array(z.string()),
  commands: z.array(localCommandResultSchema),
});
export type LocalCheck = z.infer<typeof localCheckSchema>;

export const workspaceBootstrapSchema = z.object({
  template: z.literal("enterprise-web-app"),
  templateVersion: z.literal(1),
  status: z.enum(["created", "skipped"]),
  reason: z.string().min(1),
  applicationName: featureIdSchema,
  contexts: z.array(featureIdSchema).min(1),
  surfaces: z.array(z.enum(["backend", "frontend"])),
  persistence: z.boolean(),
  createdAt: z.string(),
  createdFiles: z.array(z.string()),
  commands: z.array(localCommandResultSchema),
});
export type WorkspaceBootstrap = z.infer<typeof workspaceBootstrapSchema>;

export const specificationReviewDecisionSchema = z.discriminatedUnion("decision", [
  z.object({
    decision: z.literal(ReviewDecision.Approved),
    feedback: z.null(),
  }),
  z.object({
    decision: z.literal(ReviewDecision.ChangesRequested),
    feedback: z.string().min(1),
  }),
]);
export type SpecificationReviewDecision = z.infer<
  typeof specificationReviewDecisionSchema
>;

export const publishedSpecificationSchema = z.object({
  sequence: z.number().int().positive(),
  featureId: featureIdSchema,
  path: z.string().regex(/^specifications\/[0-9]{6}-[a-z0-9]+(?:-[a-z0-9]+)*\.feature$/),
  createdAt: z.string(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  sourceReviewId: z.string().min(1),
});
export type PublishedSpecification = z.infer<typeof publishedSpecificationSchema>;

const specificationReviewBaseSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  specification: specifierTurnSchema,
});

export const specificationReviewSchema = z.discriminatedUnion("decision", [
  specificationReviewBaseSchema.extend({
    decision: z.literal(ReviewDecision.Approved),
    feedback: z.null(),
    publishedSpecification: publishedSpecificationSchema,
  }),
  specificationReviewBaseSchema.extend({
    decision: z.literal(ReviewDecision.ChangesRequested),
    feedback: z.string().min(1),
    publishedSpecification: z.null(),
  }),
]);
export type SpecificationReview = z.infer<typeof specificationReviewSchema>;

export const handoffSchema = z.object({
  id: z.string(),
  sequence: z.number().int().nonnegative(),
  from: z.union([roleSchema, z.literal("user")]),
  to: roleSchema.nullable(),
  createdAt: z.string(),
  turn: agentTurnSchema.nullable(),
});
export type Handoff = z.infer<typeof handoffSchema>;

export const interruptionSchema = z.object({
  sequence: z.number().int().positive(),
  role: roleSchema,
  turn: z.number().int().positive(),
  createdAt: z.string(),
  reason: z.string().min(1),
  logPath: z.string().min(1),
});
export type Interruption = z.infer<typeof interruptionSchema>;

export const runStateSchema = z.object({
  version: z.literal(4),
  id: z.string(),
  prompt: z.string().min(1),
  workspace: z.string().min(1),
  status: z.enum(RunStatus),
  currentRole: roleSchema.nullable(),
  turns: z.number().int().nonnegative(),
  maxTurns: z.number().int().positive(),
  messages: z.array(handoffSchema),
  specificationReviews: z.array(specificationReviewSchema).default([]),
  finalSummary: z.string().nullable(),
  failure: z.string().nullable(),
  mode: z.enum(["delivery", "restitution"]).default("delivery"),
  targetSpecification: publishedSpecificationSchema.nullable().default(null),
  interruptions: z.array(interruptionSchema).default([]),
  tokenTotals: tokenTotalsSchema.default(() => ({
    team: {
      inputTokens: 0,
      cachedInputTokens: 0,
      outputTokens: 0,
      reasoningOutputTokens: 0,
      totalTokens: 0,
    },
    byRole: Object.fromEntries(
      roles.map((role) => [
        role,
        {
          inputTokens: 0,
          cachedInputTokens: 0,
          outputTokens: 0,
          reasoningOutputTokens: 0,
          totalTokens: 0,
        },
      ]),
    ) as Record<Role, TokenUsage>,
  })),
  executions: z.array(agentExecutionSchema).default([]),
  localChecks: z.array(localCheckSchema).default([]),
  workspaceBootstrap: workspaceBootstrapSchema.nullable().default(null),
});
export type RunState = z.infer<typeof runStateSchema>;
