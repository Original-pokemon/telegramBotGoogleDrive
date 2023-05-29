import dotenv from 'dotenv';

import { initGoogleDrive } from './google-drive/initGoogleDrive.mjs';
import initBot from './init-bot.js';
import initBase from './postgres-node/init-base.mjs';
import sendQuery from './postgres-node/send-query.mjs';
import GroupRepository from './repositories/group.repositoy.mjs';

dotenv.config();

// const userRepository = new UsersRepository(sendQuery);
// const questionRepository = new QuestionRepository(sendQuery);
const groupRepository = new GroupRepository(sendQuery);

await initBase(groupRepository);

const utilsGDrive = await initGoogleDrive({
  credentials: './credentials.json',
  token: './token.json',
});

await initBot(utilsGDrive);
