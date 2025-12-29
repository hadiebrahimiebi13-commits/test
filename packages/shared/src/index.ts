import { z } from 'zod';

export const NodeBase = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  slug: z.string().min(1),
});

export const NodeCreate = NodeBase.extend({ parentId: z.string().nullable().optional(), position: z.number().optional() });
export const NodeUpdate = NodeBase.partial();

export type NodeCreateInput = z.infer<typeof NodeCreate>;
export type NodeUpdateInput = z.infer<typeof NodeUpdate>;

export const LoginSchema = z.object({ username: z.string(), password: z.string() });

export type LoginInput = z.infer<typeof LoginSchema>;

// Patient case schemas
export const CaseImageSchema = z.object({ url: z.string().url(), caption: z.string().optional() });

export const CaseQuestionSchema = z.object({
  prompt: z.string(),
  options: z.array(z.string()).min(1),
  correctIndex: z.number().int().nonnegative().optional(),
  explanation: z.string().optional(),
  order: z.number().int().optional(),
});

export const CaseCreate = z.object({
  title: z.string(),
  description: z.string().optional(),
  finalDiagnosis: z.string().optional(),
  images: z.array(CaseImageSchema).optional(),
  questions: z.array(CaseQuestionSchema).optional(),
});

export const AnswerSubmit = z.object({
  userId: z.string().optional(),
  answers: z.array(z.object({ questionId: z.string(), selectedIndex: z.number().int() }))
});

export type CaseCreateInput = z.infer<typeof CaseCreate>;
export type CaseQuestionInput = z.infer<typeof CaseQuestionSchema>;
export type AnswerSubmitInput = z.infer<typeof AnswerSubmit>;
