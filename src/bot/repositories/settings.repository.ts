import logger from "#root/logger.js";
import { Settings } from "@prisma/client";
import Repository from "./repository.js";

export default class SettingsRepository extends Repository {
  async getSetting(id: string) {
    logger.trace(`Attempting to find setting with id: ${id}`);
    try {
      const setting = await this.client.settings.findUnique({
        where: { id },
      });
      if (setting) {
        logger.debug(`Setting found with id: ${id}`);
      } else {
        logger.debug(`Setting not found with id: ${id}`);
      }
      return setting;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error finding setting with id ${id}: ${error.message}`);
        throw new Error(
          `Error finding setting with id ${id}: \n${error.message}`,
        );
      }
      throw error;
    }
  }

  async getNotificationTime(): Promise<string> {
    logger.trace(`Attempting to retrieve notification time`);
    try {
      const setting = await this.client.settings.findUnique({
        where: { id: "notificationTime" },
      });

      const DEFAULT_TIME = "10:00";

      if (!setting || !setting.value) {
        logger.debug(`No notification time found, using default: ${DEFAULT_TIME}`);
        return DEFAULT_TIME;
      }

      // Извлекаем часы и минуты из объекта Date (форматируем в HH:mm)
      const hours = String(setting.value.getHours()).padStart(2, '0');
      const minutes = String(setting.value.getMinutes()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;

      logger.debug(`Successfully retrieved notification time: ${formattedTime}`);
      return formattedTime;

    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error retrieving notification time: ${error.message}`);
        throw new Error(
          `Error retrieving notification time: \n${error.message}`,
        );
      }
      throw error;
    }
  }

  async getAllSettings(): Promise<Settings[]> {
    logger.trace(`Attempting to retrieve all settings`);
    try {
      const settings = await this.client.settings.findMany({
        orderBy: {
          id: "asc",
        },
      });
      logger.debug(`Successfully retrieved ${settings.length} settings`);
      return settings;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error retrieving all settings: ${error.message}`);
        throw new Error(`Error retrieving all settings: \n${error.message}`);
      }
      throw error;
    }
  }

  async updateSetting(id: string, value: string): Promise<Settings> {
    logger.trace(`Attempting to update setting with id: ${id}`);
    try {
      const updatedSetting = await this.client.settings.update({
        where: { id },
        data: {
          value: isValidTimeFormat(value) ? this.timeStringToDate(value) : new Date(value)
        },
      });
      logger.debug(`Successfully updated setting with id: ${id}`);
      return updatedSetting;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error updating setting with id ${id}: ${error.message}`);
        throw new Error(
          `Error updating setting with id ${id}: \n${error.message}`,
        );
      }
      throw error;
    }
  }

  async updateNotificationTime(time: string): Promise<Settings> {
    logger.trace(`Attempting to update notification time to: ${time}`);

    if (!isValidTimeFormat(time)) {
      logger.error(`Invalid time format provided: "${time}"`);
      throw new Error(`Invalid time format: ${time}. Expected format: HH:MM`);
    }

    try {
      const updatedSetting = await this.client.settings.update({
        where: { id: "notificationTime" },
        data: {
          value: this.timeStringToDate(time) // Конвертируем строку в Date
        },
      });
      return updatedSetting;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error updating notification time: ${error.message}`);
        throw new Error(
          `Error updating notification time: \n${error.message}`,
        );
      }
      throw error;
    }
  }

  async createSetting({
    id,
    description,
    value,
  }: {
    id: string;
    description: string;
    value: string;
  }): Promise<Settings> {
    logger.trace(`Attempting to create setting with id: ${id}`);
    try {
      const newSetting = await this.client.settings.create({
        data: {
          id,
          description,
          value: isValidTimeFormat(value) ? this.timeStringToDate(value) : new Date(value)
        },
      });
      logger.debug(`Successfully created setting with id: ${id}`);
      return newSetting;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error creating setting with id ${id}: ${error.message}`);
        throw new Error(
          `Error creating setting with id ${id}: \n${error.message}`,
        );
      }
      throw error;
    }
  }

  async deleteSetting(id: string): Promise<void> {
    logger.trace(`Attempting to delete setting with id: ${id}`);
    try {
      await this.client.settings.delete({
        where: { id },
      });
      logger.debug(`Successfully deleted setting with id: ${id}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error deleting setting with id ${id}: ${error.message}`);
        throw new Error(
          `Error deleting setting with id ${id}: \n${error.message}`,
        );
      }
      throw error;
    }
  }

  private timeStringToDate(time: string): Date {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

}

function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;

  if (!timeRegex.test(time)) {
    return false;
  }

  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}