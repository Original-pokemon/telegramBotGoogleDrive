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

  async createGroup({
    id,
    description,
  }: {
    id: string;
    description: string;
  }): Promise<Group> {
    logger.trace(`Attempting to create group with id: ${id}`);
    try {
      const newGroup = await this.client.group.create({
        data: {
          id,
          description,
        },
      });
      logger.debug(`Successfully created group with id: ${id}`);
      return newGroup;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error creating group with id ${id}: ${error.message}`);
        throw new Error(
          `Error creating group with id ${id}: \n${error.message}`,
        );
      }
      throw error;
    }
  }

  async updateGroup(id: string, description: string): Promise<Group> {
    logger.trace(`Attempting to update group with id: ${id}`);
    try {
      const updatedGroup = await this.client.group.update({
        where: { id },
        data: {
          description,
        },
      });
      logger.debug(`Successfully updated group with id: ${id}`);
      return updatedGroup;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error updating group with id ${id}: ${error.message}`);
        throw new Error(
          `Error updating group with id ${id}: \n${error.message}`,
        );
      }
      throw error;
    }
  }
}
