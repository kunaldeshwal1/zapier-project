
import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();

async function main() {
  // Create Triggers
  await prismaClient.availableTrigger.create({
    data: {
      id: "github-push",
      name: "GitHub Push",
      image: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    },
  });
  await prismaClient.availableAction.create({
    data: {
      id: "discord-message",
      name: "Send Discord Message",
      image: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png",
    },
  });

  await prismaClient.availableAction.create({
    data: {
      id: "send-email",
      name: "Send Email",
      image: "https://cdn-icons-png.flaticon.com/512/561/561127.png",
    },
  });
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });