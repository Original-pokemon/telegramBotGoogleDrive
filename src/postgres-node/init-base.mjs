import { UserGroup } from '../const.js';
import createSchema from './set-schema.mjs';
import createTable from './set-table.mjs';

export default async function initBase(groupRepository) {
  try {
    await createSchema();
    await createTable();
    await groupRepository.addGroup(UserGroup.Admin);
    await groupRepository.addGroup(UserGroup.WaitConfirm);
    await groupRepository.addGroup(UserGroup.AzsWithStore);
    await groupRepository.addGroup(UserGroup.Azs);
    await groupRepository.addGroup(UserGroup.Gpn);
    return true;
  } catch (error) {
    console.error(`initBase: ${error}`);
    return false;
  }
}
