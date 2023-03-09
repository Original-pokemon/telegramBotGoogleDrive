import { createSchema } from './setSchema.mjs'
import { createTable } from './setTable.mjs'

export async function initBase(groupRepository) {
  try {
    await createSchema()
    await createTable()
    await groupRepository.addGroup('admin')
    await groupRepository.addGroup('waitConfirm')
    await groupRepository.addGroup('azsWithStore')
    await groupRepository.addGroup('azs')
    console.log('Database was created')
    return true
  } catch (err) {
    if (err.message == 'duplicate key value violates unique constraint "Group_pkey"') {
      console.log('All database table already have')
    } else {
      console.error(`initBase: ` + err.message);
    }
  }
}
