import { PrismaClient } from "@prisma/client";
import { UserGroup } from "../src/const.js";

const prisma = new PrismaClient();

const SettingsIds = {
  NotificationTime: "notificationTime",
  OtherSetting: "otherSetting"
}

const settingDescriptions: Record<string, string> = {
  [SettingsIds.NotificationTime]: "Время оповещения",
  [SettingsIds.OtherSetting]: "Описание настройки123",
};

const upsertSettings = async () => {
  const settingIdsValues = Object.values(SettingsIds);

  const promises = settingIdsValues.map(async (id) => {
    const defaultTime = new Date();
    defaultTime.setHours(10, 0, 0, 0);
    const setting = await prisma.settings.upsert({
      where: { id },
      update: {},
      create: {
        id,
        description: settingDescriptions[id] || "Описание не указано",
        value: (id === "notificationTime") ? defaultTime.toISOString() : "Значение не указано",
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
