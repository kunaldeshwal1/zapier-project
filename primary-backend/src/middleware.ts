import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWTPassword } from "./config";

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): any {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(403).json({
      message: "No authorization header found"
    });
  }

  const token = authHeader.split(' ')[1]; // Extract token after 'Bearer '
  
  try {
    const payload = jwt.verify(token, JWTPassword);
    //@ts-ignore
    req.id = payload.id;
    next();
  } catch (err) {
    res.status(403).json({
      message: "You are not logged in",
    });
  }
}