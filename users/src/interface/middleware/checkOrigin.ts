import { Request, Response, NextFunction } from "express";

export async function checkOrigin (req: Request, res: Response, next: NextFunction){
    const origin = req.headers.host === 'localhost:3000';
    
    if (origin) {
        return next();
    }else{
        return res.status(403).json({ message: "Forbidden" });
    }

    next();
};