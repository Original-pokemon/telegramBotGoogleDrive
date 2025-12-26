import { PrismaClient } from "@prisma/client";
import { UserGroup, Settings } from "../src/const.js";

const prisma = new PrismaClient();

const settingDescriptions: Record<string, string> = {
  [Settings.NotificationTime]: "Время оповещения",
};

const upsertSettings = async () => {
  const settingIds = Object.values(Settings);

  const promises = settingIds.map(async (id) => {
    const defaultTime = new Date();
    defaultTime.setHours(10, 0, 0, 0);

    const setting = await prisma.settings.upsert({
      where: { id },
      update: {},
      create: {
        id,
        description: settingDescriptions[id] || "Описание не указано",
        value: defaultTime,
      },
    });

    return setting;
  });

  const settings = await Promise.all(promises);

  return settings;
};

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
  await upsertSettings();
  await prisma.$disconnect();
} catch {
  await prisma.$disconnect();
  throw new Error("A mistake in the base of the seed ");
}
