import { z } from 'zod';
export declare const NodeBase: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    slug: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    slug: string;
    description?: string | undefined;
    icon?: string | undefined;
}, {
    title: string;
    slug: string;
    description?: string | undefined;
    icon?: string | undefined;
}>;
export declare const NodeCreate: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    slug: z.ZodString;
} & {
    parentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    position: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    title: string;
    slug: string;
    description?: string | undefined;
    icon?: string | undefined;
    parentId?: string | null | undefined;
    position?: number | undefined;
}, {
    title: string;
    slug: string;
    description?: string | undefined;
    icon?: string | undefined;
    parentId?: string | null | undefined;
    position?: number | undefined;
}>;
export declare const NodeUpdate: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    icon: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    slug: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | undefined;
    icon?: string | undefined;
    slug?: string | undefined;
}, {
    title?: string | undefined;
    description?: string | undefined;
    icon?: string | undefined;
    slug?: string | undefined;
}>;
export type NodeCreateInput = z.infer<typeof NodeCreate>;
export type NodeUpdateInput = z.infer<typeof NodeUpdate>;
export declare const LoginSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof LoginSchema>;
