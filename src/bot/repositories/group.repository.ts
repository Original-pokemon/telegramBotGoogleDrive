import { Group } from "@prisma/client";
import logger from "#root/logger.js";
import Repository from "./repository.js";

export default class GroupRepository extends Repository {
  async getAllGroups(): Promise<Group[]> {
    logger.trace("Attempting to retrieve all groups");
    try {
      const groups = await this.client.group.findMany();
      logger.debug(`Successfully retrieved ${groups.length} groups`);
      return groups;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error retrieving all groups: ${error.message}`);
        throw new Error(`Error retrieving all groups: \n${error.message}`);
      }
      throw error;
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    logger.trace(`Attempting to delete group with id: ${groupId}`);
    try {
      await this.client.group.delete({
        where: { id: groupId },
      });
      logger.debug(`Successfully deleted group with id: ${groupId}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(
          `Error deleting group with id ${groupId}: ${error.message}`,
        );
        throw new Error(
          `Error deleting group with id ${groupId}: \n${error.message}`,
        );
      }
      throw error;
    }
  }

  async addGroup(groupId: string, description: string): Promise<Group> {
    logger.trace(`Attempting to add group with id: ${groupId}`);
    try {
      const newGroup = await this.client.group.create({
        data: {
          id: groupId,
          description,
        },
      });
      logger.debug(`Successfully added group with id: ${groupId}`);
      return newGroup;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error adding group with id ${groupId}: ${error.message}`);
        throw new Error(
          `Error adding group with id ${groupId}: \n${error.message}`,
        );
      }
      throw error;
    }
  }

  async updateGroup(oldId: string, newId: string): Promise<Group> {
    logger.trace(
      `Attempting to update group with old id: ${oldId} to new id: ${newId}`,
    );
    try {
      const updatedGroup = await this.client.group.update({
        where: { id: oldId },
        data: {
          id: newId,
        },
      });
      logger.debug(
        `Successfully updated group from id: ${oldId} to new id: ${newId}`,
      );
      return updatedGroup;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(
          `Error updating group from id ${oldId} to ${newId}: ${error.message}`,
        );
        throw new Error(
          `Error updating group from id ${oldId} to ${newId}: \n${error.message}`,
        );
      }
      throw error;
    }
  }
}
