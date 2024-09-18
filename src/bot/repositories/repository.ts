import dataBase from "#root/prisma/index.js";

export default class Repository {
  protected readonly client;

  constructor() {
    this.client = dataBase.client;
  }
}
