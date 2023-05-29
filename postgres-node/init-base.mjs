import createSchema from './set-schema.mjs';
import createTable from './set-table.mjs';

export default async function initBase(groupRepository) {
  try {
    await createSchema();
    await createTable();
    await groupRepository.addGroup('admin');
    await groupRepository.addGroup('waitConfirm');
    await groupRepository.addGroup('azsWithStore');
    await groupRepository.addGroup('azs');
    return true;
  } catch (error) {
    console.error(`initBase: ${error}`);
    return false;
  }
}
