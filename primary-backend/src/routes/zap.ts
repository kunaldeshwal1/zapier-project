import { Router } from "express";
import authMiddleware from "../middleware";
import { ZapCreateSchema } from "../types";
import { prismaClient } from "db";
const router = Router();

router.post("/", authMiddleware, async (req, res): Promise<any> => {
  //@ts-ignore
  const id = req.id;
  const body = req.body;
  const parsedData = ZapCreateSchema.safeParse(body);
  if (!parsedData.success) {
    return res.status(411).json({
      message: "Incorrect Inputs",
    });
  }

  const zapId = await prismaClient.$transaction(async tx => {
    const availableTrigger = await tx.availableTrigger.findUnique({
      where: { id: parsedData.data.availableTriggerId }
    });

    if (!availableTrigger) {
      throw new Error(`AvailableTrigger with ID ${parsedData.data.availableTriggerId} does not exist`);
    }
    const zap = await tx.zap.create({
      data: {
        triggerId: "",
        userId: parseInt(id),
        actions: {
          create: parsedData.data.actions.map((x, index) => ({
            actionId: x.availableActionId,
            sortingOrder: index,
            metadata: x.actionMetadata
          }))
        },
        flow: {
          create: {
            node: body.flow.node,
            edge: body.flow.edge
          }
        }
      }
    })
    const trigger = await tx.trigger.create({
      data: {
        triggerId: parsedData.data.availableTriggerId,
        zapId: zap.id,
        name: availableTrigger.name  // Add the name from the availableTrigger
      }
    })
    await tx.zap.update({
      where: {
        id: zap.id
      },
      data: {
        triggerId: trigger.id
      }
    })
    return zap.id;
  })
  return res.json({ zapId })
})
router.delete("/:zapId", authMiddleware, async (req, res): Promise<any> => {
  //@ts-ignore
  const id = req.id;
  const zapId = req.params.zapId;
  //find zap with id and user id
  //delkte the zap
  try {
    await prismaClient.$transaction(async (tx) => {
      const zap = await tx.zap.findFirst({
        where: {
          id: zapId
        }
      })
      if (!zap) {
        throw new Error("No zap found")
      }
      await tx.zap.delete({
        where: {
          id: zapId
        }
      })
    })

    return res.json({ message: "Zap deleted successfully" });
  } catch (error: any) {
    return res.status(400).json({
      message: "Failed to delete zap",
      error: error.message
    });
  }
})
router.get("/", authMiddleware, async (req, res): Promise<any> => {
  //@ts-ignore
  const id = req.id;
  const zaps = await prismaClient.zap.findMany({
    where: {
      userId: id
    },
    include: {
      actions: {
        include: {
          type: true
        }
      },
      trigger: {
        include: {
          type: true
        }
      }
    }
  })
  return res.json({ zaps })
});

router.get("/:zapId", authMiddleware, async (req, res): Promise<any> => {
  //@ts-ignore
  const id = req.id;
  const zapId = req.params.zapId;
  const zap = await prismaClient.zap.findFirst({
    where: {
      id: zapId,
      userId: id
    },
    include: {
      actions: {
        include: {
          type: true
        }
      },
      trigger: {
        include: {
          type: true
        }
      },
      flow: true
    }
  })

  return res.json({ zap })
});
export const zapRouter = router;
