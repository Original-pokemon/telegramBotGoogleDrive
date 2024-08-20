import dotenv from 'dotenv';

import googleRepository from './google-drive/index.js';
import createBot from './bot/index.js';
import initBase from './postgres-node/init-base.mjs';
import sendQuery from './postgres-node/send-query.mjs';
import GroupRepository from './bot/repositories/group.repositoy.mjs';

dotenv.config();

// const userRepository = new UsersRepository(sendQuery);
// const questionRepository = new QuestionRepository(sendQuery);
const groupRepository = new GroupRepository(sendQuery);

await initBase(groupRepository);

await googleRepository.init()

await createBot(googleRepository);
