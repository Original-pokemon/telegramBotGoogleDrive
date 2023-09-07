import { Group } from '../const.mjs';
import createSchema from './set-schema.mjs';
import createTable from './set-table.mjs';

export default async function initBase(groupRepository) {
  try {
    await createSchema();
    await createTable();
    await groupRepository.addGroup(Group.Admin);
    await groupRepository.addGroup(Group.WaitConfirm);
    await groupRepository.addGroup(Group.AzsWithStore);
    await groupRepository.addGroup(Group.Azs);
    return true;
  } catch (error) {
    console.error(`initBase: ${error}`);
    return false;
  }
}
