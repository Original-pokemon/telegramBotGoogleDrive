import { User } from "@prisma/client";
import Repository from "./repository.js";
import { UserGroup } from "../../const.js";
import logger from "#root/logger.js";

export default class UsersRepository extends Repository {
  async getUser(id: number): Promise<User | null> {
    logger.trace(`Attempting to find user with id: ${id}`);
    try {
      const user = await this.client.user.findUnique({
        where: { id },
      });
      if (user) {
        logger.debug(`User found with id: ${id}`);
      } else {
        logger.debug(`User not found with id: ${id}`);
      }
      return user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error finding user with id ${id}: ${error.message}`);
        throw new Error(`Error finding user with id ${id}: \n${error.message}`);
      }
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    logger.trace(`Attempting to retrieve all users`);
    try {
      const users = await this.client.user.findMany();

      logger.debug(`Successfully retrieved ${users.length} users`);
      return users;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error retrieving all users: ${error.message}`);
        throw new Error(`Error retrieving all users: \n${error.message}`);
      }
      throw error;
    }
  }

  async getAllAzs(): Promise<User[]> {
    logger.trace(`Attempting to retrieve all AZS users`);
    try {
      const users = await this.client.user.findMany({
        where: {
          group_id: {
            notIn: [UserGroup.Admin, UserGroup.WaitConfirm],
          }
        },
      });

      logger.debug(`Successfully retrieved ${users.length} AZS users`);
      return users;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error retrieving AZS users: ${error.message}`);
        throw new Error(`Error retrieving AZS users: \n${error.message}`);
      }
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    logger.trace(`Attempting to delete user with id: ${id}`);
    try {
      await this.client.user.delete({
        where: { id },
      });

      logger.debug(`Successfully deleted user with id: ${id}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error deleting user with id ${id}: ${error.message}`);
        throw new Error(`Error deleting user with id ${id}: \n${error.message}`);
      }
      throw error;
    }
  }

  async addUser({ id, group_id, name, user_folder }: Omit<User, "created_date">): Promise<User> {
    logger.trace(`Attempting to add user with id: ${id}, name: ${name}, group: ${group_id}`);
    try {
      const newUser = await this.client.user.create({
        data: {
          id,
          name,
          group_id,
          user_folder
        },
      });
      logger.debug(`Successfully added user with id: ${id}`);
      return newUser;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error adding user with id ${id}: ${error.message}`);
        throw new Error(`Error adding user with id ${id}: \n${error.message}`);
      }
      throw error;
    }
  }

  async updateUser({ id, group_id, name, user_folder }: Omit<User, "created_date">): Promise<User> {
    logger.trace(`Attempting to update user with id: ${id}`);
    try {
      const updatedUser = await this.client.user.update({
        where: { id },
        data: {
          name,
          group_id,
          user_folder,
        },
      });
      logger.debug(`Successfully updated user with id: ${id}`);
      return updatedUser;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error updating user with id ${id}: ${error.message}`);
        throw new Error(`Error updating user with id ${id}: \n${error.message}`);
      }
      throw error;
    }
  }
}
