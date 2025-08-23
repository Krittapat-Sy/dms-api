import { ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

export function validate<T extends ZodSchema>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
        const data = req.body;
        const parsed = schema.safeParse(data);
        if (!parsed.success) {
            const issues = parsed.error.issues.map(i => ({
                path: i.path.join("."),
                message: i.message,
            }));
            return res.status(400).json({ error: "VALIDATION_ERROR", issues });
        }
        req.body = parsed.data; 
        next();
    };
}

