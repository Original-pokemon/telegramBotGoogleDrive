import { createCallbackData } from "callback-data";
import { Schema, CallbackData } from "callback-data/dist/types.js";
import { InlineKeyboard } from "grammy";

export function chunk<T>(array: T[], size: number) {
  const result = [];
  for (let index = 0; index < array.length; index += size) {
    result.push(array.slice(index, index + size));
  }
  return result;
}

export function paginateItems<T>(items: T[], pageSize: number) {
  if (pageSize < 1) {
    throw new Error("pageSize must be at least 1");
  }

  const totalPages = Math.ceil(items.length / pageSize);
  return Array.from({ length: totalPages }, (_, index) => {
    const start = index * pageSize;
    return items.slice(start, start + pageSize);
  });
}

type PaginatedSchema = Schema & {
  pageIndex: NumberConstructor;
};

export function getPageKeyboard<S extends PaginatedSchema>(
  pageItems: { text: string; callback_data: string }[],
  pageIndex: number,
  totalPages: number,
  callbackData: ReturnType<typeof createCallbackData<S>>,
  baseData: Omit<CallbackData<S>, "pageIndex">,
) {
  const rows = chunk(pageItems, 2);

  const keyboard = new InlineKeyboard();
  // eslint-disable-next-line no-restricted-syntax
  for (const row of rows) {
    keyboard.row();

    // eslint-disable-next-line no-restricted-syntax, camelcase
    for (const { text, callback_data } of row) {
      keyboard.text(text, callback_data);
    }
  }

  keyboard.row();

  if (totalPages > 1) {
    keyboard.text(" ", " ").row();
  }
  if (pageIndex > 0) {
    keyboard.text(
      "⏮ Прев. страница",
      callbackData.pack({
        ...baseData,
        pageIndex: pageIndex - 1,
      } as CallbackData<S>),
    );
  }
  if (pageIndex < totalPages - 1) {
    keyboard.text(
      "След. страница ⏭",
      callbackData.pack({
        ...baseData,
        pageIndex: pageIndex + 1,
      } as CallbackData<S>),
    );
  }

  return keyboard;
}

/**
 * Adds a back button to the keyboard.
 * @param keyboard The keyboard to add the button to.
 * @param callbackData The callback data of the button.
 */
export function addBackButton(
  keyboard: InlineKeyboard,
  callbackData: string,
): InlineKeyboard {
  return keyboard
    .row()
    .text(" ", " ")
    .row()
    .text("↩️ В прошлое меню", callbackData);
}
