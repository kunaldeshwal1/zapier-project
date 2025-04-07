import { Router } from "express";
import { prismaClient } from "db";

const router = Router();

router.get("/available",async(req,res)=>{
    const availableTrigger = await prismaClient.availableTrigger.findMany({});
    console.log(availableTrigger)
    res.json({
        availableTrigger
    })
})

export const triggerRouter = router;