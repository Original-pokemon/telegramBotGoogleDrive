import {
  userIdData,
  backToGroupsData,
  showUsersPageData,
} from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import {
  paginateItems,
  getPageKeyboard,
  addBackButton,
} from "#root/bot/helpers/keyboard.js";
import _ from "lodash";
import { adminPanelTexts } from "./text.js";

export async function showUsersByGroupPage(
  ctx: Context,
  group: string,
  pageIndex: number = 0,
) {
  ctx.logger.trace(
    `Show users by group page command invoked for group: ${group}, page: ${pageIndex}`,
  );

  try {
    const users = await ctx.repositories.users.getAllUsers();
    ctx.logger.debug(`Retrieved ${users.length} users from the database`);

    const filteredUsers = users.filter((user) => user.group_id === group);
    ctx.logger.debug(
      `Filtered ${filteredUsers.length} users for group: ${group}`,
    );

    const sortedUsers = _.sortBy(filteredUsers, ["name"]);
    ctx.logger.debug("Users sorted by name");

    const pageSize = 10; // Adjust as needed
    const pages = paginateItems(sortedUsers, pageSize);
    const totalPages = pages.length;

    let adjustedPageIndex = pageIndex;
    if (adjustedPageIndex >= totalPages) {
      adjustedPageIndex = totalPages - 1;
    }

    const currentPageUsers = pages[adjustedPageIndex] || [];

    const pageItems = currentPageUsers.map(({ name, id }) => ({
      text: name,
      callback_data: userIdData.pack({ id }),
    }));

    const keyboard = getPageKeyboard(
      pageItems,
      adjustedPageIndex,
      totalPages,
      showUsersPageData,
      { group },
    );

    addBackButton(keyboard, backToGroupsData.pack({}));

    ctx.logger.debug("InlineKeyboard created with paginated user data");

    const text = `${adminPanelTexts.ALL_USERS} (${group}) - Страница ${adjustedPageIndex + 1}/${totalPages}:`;

    await (ctx.callbackQuery
      ? ctx.editMessageText(text, {
          reply_markup: keyboard,
        })
      : ctx.reply(text, {
          reply_markup: keyboard,
        }));
    ctx.logger.debug("Users by group page list sent successfully");
  } catch (error) {
    ctx.logger.error(
      `Error in admin.service > showUsersByGroupPage: ${error instanceof Error ? error.message : error}`,
    );
  }
}
