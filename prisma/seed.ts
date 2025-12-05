import { PrismaClient } from "@prisma/client";
import { UserGroup } from "../src/const.js";

const prisma = new PrismaClient();

const groupDescriptions: Record<string, string> = {
  [UserGroup.Admin]: "Администратор системы",
  [UserGroup.WaitConfirm]: "Ожидает подтверждения доступа",
  [UserGroup.Azs]: "АЗС сотрудник",
  [UserGroup.AzsWithStore]: "АЗС сотрудник с магазином",
  [UserGroup.Gpn]: "ГПН сотрудник",
};

const upsertGroups = async () => {
  const groupIds = Object.values(UserGroup);

  const promises = groupIds.map(async (id) => {
    const group = await prisma.group.upsert({
      where: {
        id,
      },
      update: {},
      create: {
        id,
        description: groupDescriptions[id] || "Описание не указано",
      },
    });

    return group;
  });

  const groups = await Promise.all(promises);

  return groups;
};

try {
  await prisma.$connect();
  await upsertGroups();
  await prisma.$disconnect();
} catch {
  await prisma.$disconnect();
  throw new Error("A mistake in the base of the seed ");
}
