import {
  viewUserFoldersPageData,
  openFolderData,
  backToUserProfileData,
} from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import {
  paginateItems,
  getPageKeyboard,
  addBackButton,
} from "#root/bot/helpers/keyboard.js";

export async function viewUserFolders(
  ctx: Context,
  userId: string,
  pageIndex: number = 0,
) {
  ctx.logger.trace(
    `View user folders command invoked for user: ${userId}, page: ${pageIndex}`,
  );

  try {
    const folders =
      await ctx.repositories.photoFolders.getFoldersByUserId(userId);
    ctx.logger.debug(`Retrieved ${folders.length} folders for user: ${userId}`);

    const pageSize = 10; // Adjust as needed
    const pages = paginateItems(folders, pageSize);
    const totalPages = pages.length;

    let adjustedPageIndex = pageIndex;
    if (adjustedPageIndex >= totalPages) {
      adjustedPageIndex = totalPages - 1;
    }

    const currentPageFolders = pages[adjustedPageIndex] || [];

    const pageItems = currentPageFolders.map(
      ({ folder_id, creation_date }) => ({
        text: new Date(creation_date).toLocaleDateString(),
        callback_data: openFolderData.pack({ folderId: folder_id }),
      }),
    );

    const keyboard = getPageKeyboard(
      pageItems,
      adjustedPageIndex,
      totalPages,
      viewUserFoldersPageData,
      { userId },
    );

    addBackButton(keyboard, backToUserProfileData.pack({ userId }));

    ctx.logger.debug("InlineKeyboard created with paginated folders");

    const text = `Папки пользователя - Страница ${adjustedPageIndex + 1}/${totalPages}:`;

    await (ctx.callbackQuery
      ? ctx.editMessageText(text, {
          reply_markup: keyboard,
        })
      : ctx.reply(text, {
          reply_markup: keyboard,
        }));
    ctx.logger.debug("User folders page sent successfully");
  } catch (error) {
    ctx.logger.error(
      `Error in admin.service > viewUserFolders: ${error instanceof Error ? error.message : error}`,
    );
  }
}
