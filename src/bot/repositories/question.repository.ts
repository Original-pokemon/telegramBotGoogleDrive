import logger from "#root/logger.js";
import { Question } from "@prisma/client";
import Repository from "./repository.js";

export default class QuestionRepository extends Repository {
  async getQuestion(id: number) {
    logger.trace(`Attempting to find question with id: ${id}`);
    try {
      const question = await this.client.question.findUnique({
        where: { id },
        include: {
          group: true, // Включаем связанные группы
        },
      });
      if (question) {
        logger.debug(`Question found with id: ${id}`);
      } else {
        logger.debug(`Question not found with id: ${id}`);
      }
      return question;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error finding question with id ${id}: ${error.message}`);
        throw new Error(
          `Error finding question with id ${id}: \n${error.message}`,
        );
      }
      throw error;
    }
  }

  async getQuestions(azsType: string): Promise<Question[]> {
    logger.trace(
      `Attempting to retrieve all questions for AZS type: ${azsType}`,
    );
    try {
      const questions = await this.client.question.findMany({
        where: {
          group: {
            some: {
              id: azsType,
            },
          },
        },
        orderBy: {
          id: "asc",
        },
      });
      logger.debug(
        `Successfully retrieved ${questions.length} questions for AZS type: ${azsType}`,
      );
      return questions;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(
          `Error retrieving questions for AZS type ${azsType}: ${error.message}`,
        );
        throw new Error(
          `Error retrieving questions for AZS type ${azsType}: \n${error.message}`,
        );
      }
      throw error;
    }
  }

  async getAllQuestions(): Promise<Question[]> {
    logger.trace(`Attempting to retrieve all questions`);
    try {
      const questions = await this.client.question.findMany({
        include: {
          group: true, // Включаем связанные группы
        },
      });
      logger.debug(`Successfully retrieved ${questions.length} questions`);
      return questions;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error retrieving all questions: ${error.message}`);
        throw new Error(`Error retrieving all questions: \n${error.message}`);
      }
      throw error;
    }
  }

  async deleteQuestion(id: number): Promise<void> {
    logger.trace(`Attempting to delete question with id: ${id}`);
    try {
      await this.client.question.delete({
        where: { id },
      });
      logger.debug(`Successfully deleted question with id: ${id}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error deleting question with id ${id}: ${error.message}`);
        throw new Error(
          `Error deleting question with id ${id}: \n${error.message}`,
        );
      }
      throw error;
    }
  }

  async addQuestion({
    name,
    require,
    text,
    groupIds,
  }: Omit<Question, "id"> & { groupIds: string[] }): Promise<Question> {
    logger.trace(`Attempting to add question with name: ${name}`);
    try {
      const newQuestion = await this.client.question.create({
        data: {
          name,
          text,
          require,
          group: {
            connect: groupIds.map((id) => ({ id })), // Связываем вопрос с группами
          },
        },
      });
      logger.debug(`Successfully added question with name: ${name}`);
      return newQuestion;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(
          `Error adding question with name ${name}: ${error.message}`,
        );
        throw new Error(
          `Error adding question with name ${name}: \n${error.message}`,
        );
      }
      throw error;
    }
  }

  async updateQuestion({
    id,
    name,
    require,
    text,
    groupIds,
  }: Question & { groupIds: string[] }): Promise<Question> {
    logger.trace(`Attempting to update question with id: ${id}`);
    try {
      const updatedQuestion = await this.client.question.update({
        where: { id },
        data: {
          name,
          text,
          require,
          group: {
            set: groupIds.map((groupId) => ({ id: groupId })),
          },
        },
      });
      logger.debug(`Successfully updated question with id: ${id}`);
      return updatedQuestion;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error updating question with id ${id}: ${error.message}`);
        throw new Error(
          `Error updating question with id ${id}: \n${error.message}`,
        );
      }
      throw error;
    }
  }
}
