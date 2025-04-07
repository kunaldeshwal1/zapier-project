import { Router } from "express";
import authMiddleware from "../middleware";
import { SigninSchema, SignupSchema } from "../types";
import { prismaClient } from "db";
import jwt from "jsonwebtoken";
import { JWTPassword } from "../config";

const router = Router();

router.post("/signup", async (req, res): Promise<any> => {
  const body = req.body;
  const parsedData = SignupSchema.safeParse(body);
  console.log(parsedData.data)
  if (!parsedData.success) {
    return res.status(411).json({
      message: "Data is not in correct format",
    });
  }
  const userExists = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.email,
    },
  });

  if (userExists) {
    return res.status(411).json({
      message: "User already exists",
    });
  }

  await prismaClient.user.create({
    data: {
      email: parsedData.data.email,
      password: parsedData.data.password,
      name: parsedData.data.name,
    },
  });

  //await sendEmail
  return res.status(200).json({
    message: "Please verify your email ",
  });
});

router.post("/signin", async (req, res): Promise<any> => {
  const body = req.body;
  const parsedData = SigninSchema.safeParse(body);
  if (!parsedData.success) {
    return res.status(411).json({
      message: "Data is not in correct format",
    });
  }

  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.username,
      password: parsedData.data.password,
    },
  });
  if (!user) {
    return res.status(403).json({
      message: "Incorrect Credentials",
    });
  }
  //jwt
  const token = jwt.sign(
    {
      id: user.id,
    },
    JWTPassword
  );
  res.json({ token: token,name:user.name });
});
router.post("/logout", authMiddleware, async (req, res):Promise<any> => {
  //@ts-ignore
  const id = req.id;
  
  try {
    // Since JWT is stateless, we just send a success response
    // The client should handle removing the token
    return res.json({
      message: "Logged out successfully"
    });
  } catch (error:any) {
    return res.status(500).json({
      message: "Error logging out",
      error: error.message
    });
  }
});
router.get("/user", authMiddleware, async (req, res) => {
  //@ts-ignore
  const id = req.id;

  const user = await prismaClient.user.findFirst({
    where: {
      id,
    },
    select: {
      email: true,
      name: true,
    },
  });
});

export const userRouter = router;
