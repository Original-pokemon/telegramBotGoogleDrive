import dotenv from 'dotenv';

import googleRepository from './google-drive/index.js';
import initBot from './init-bot.js';
import initBase from './postgres-node/init-base.mjs';
import sendQuery from './postgres-node/send-query.mjs';
import GroupRepository from './repositories/group.repositoy.mjs';

dotenv.config();

// const userRepository = new UsersRepository(sendQuery);
// const questionRepository = new QuestionRepository(sendQuery);
const groupRepository = new GroupRepository(sendQuery);

await initBase(groupRepository);

await googleRepository.init()

await initBot(googleRepository);
