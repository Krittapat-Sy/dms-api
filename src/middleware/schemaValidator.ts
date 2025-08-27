import { ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

type RequestPart = "body" | "params" | "query";

export function validate<T extends ZodSchema>(schema: T, part: RequestPart = "body") {
    return (req: Request, res: Response, next: NextFunction) => {
        const data = (req as any)[part];

        const parsed = schema.safeParse(data);
        if (!parsed.success) {
            const issues = parsed.error.issues.map(i => ({
                path: i.path.join("."),
                message: i.message,
            }));
            return res.status(400).json({ error: "VALIDATION_ERROR", issues });
        }
        next();
    };
}

