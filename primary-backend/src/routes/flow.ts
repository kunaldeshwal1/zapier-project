import { Router } from "express";
import { prismaClient } from "db";
import authMiddleware from "../middleware";


const router = Router();

router.get("/",authMiddleware,async(req,res)=>{
    //@ts-ignore
    const id = req.id;
    const flows = await prismaClient.flow.findMany({
        where: {
            zap: {
                userId: parseInt(id)
            }
        },
        include: {
            zap: true
        }
    });

    res.json({
        flows,
    })
})
router.post('/nodeandedge',authMiddleware,async(req,res)=>{
    const body = req.body;
    const flowData = await prismaClient.flow.create({
        data:{
            node:body.nodeDetails,
            edge:body.edgeDetails,
            zapId:body.zapId
        }
    })
})

export const flowRouter = router;