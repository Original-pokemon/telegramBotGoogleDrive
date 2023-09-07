import { InlineKeyboard, Keyboard } from 'grammy';
import _ from 'lodash';

import { REMINDER_MSG_TEXT, UserGroup } from '../const.mjs';

function adminPanel() {
  return async (context) => {
    try {
      await context.reply('Управляйте пользователями', {
        reply_markup: new Keyboard()
          .text('Показать всех пользователей')
          .text('Найти пользователя')
          .row()
          .text('Настроить время оповещения')
          .text('Настроить вопросы')
          .row()
          .text('Сделать рассылку')
          .resized(),
      });
    } catch (error) {
      console.error(`adming.service > adminPanel${error}`);
    }
  };
}

function newsletterPanel() {
  return async (context) => {
    const text = 'Отправьте текcт';
    context.session.scene = 'enter_letter_text';

    try {
      context.reply(text);
    } catch (error) {
      console.error(`adming.service > newsletterPanel${error}`);
    }
  };
}

function sendNewsletterForAll(UsersRepository, botInstance) {
  return async (context) => {
    context.session.scene = '';
    const messageText = context.msg.text;
    try {
      const users = await UsersRepository.getAllAzs();

      const promises = users.map(async (user) => {
        const id = user.Id;
        await botInstance.api.sendMessage(id, messageText);
      });

      await Promise.all(promises);
    } catch (error) {
      console.error(`adming.service > sendNewsletterForAll${error}`);
    }
  };
}

function userSearch() {
  return async (context) => {
    try {
      context.reply(`Введите ID пользователя`, {});
      context.session.scene = 'enter_id';
    } catch (error) {
      console.error(`admin.service > userSearch${error}`);
    }
  };
}

function getAllUsers(usersRepository) {
  return async (context) => {
    try {
      const users = await usersRepository.getAllUsers();
      const sortUsers = _.sortBy(users, ['Name']);

      const markup = new InlineKeyboard();

      _.each(sortUsers, (user) =>
        markup.text(user.Name, `userId_${user.Id}`).row()
      );

      await context.reply('Все пользователи', {
        reply_markup: markup,
      });
    } catch (error) {
      console.error(`admin.service > getAllUsers${error}`);
    }
  };
}

function userProfile(usersRepository) {
  return async (context) => {
    const calbackId = context.update.callback_query?.data.split('_')[1];
    const id = calbackId || context.msg.text;
    context.session.scene = '';

    try {
      const user = await usersRepository.getUser(id);

      const markup = new InlineKeyboard();

      markup
        .text(
          user.Group === UserGroup.Admin
            ? 'Разжаловать'
            : 'Повысить до администратора',
          `promote_${user.Id}`
        )
        .row()
        .text(
          user.Group === UserGroup.WaitConfirm
            ? 'Выдать доступ'
            : 'Ограничить доступ',
          `wait_${user.Id}`
        );

      if (
        user.Group === UserGroup.Azs ||
        user.Group === UserGroup.WaitConfirm
      ) {
        const groupText =
          user.Group === UserGroup.Azs
            ? 'Изменить роль на АЗС с магазином'
            : 'Изменить роль на АЗС без магазина(киоск)';

        markup
          .row()
          .text(groupText, `updateGroup_${user.Id}`)
          .row()
          .text('Отправить напоминание', `sendReminder_${user.Id}`);
      }

      await context.reply(
        `Информация о пользователе:
Дата регистрации: ${new Date(user.createdDate).toLocaleDateString()}
ID: ${user.Id}
Никнейм: ${user.Name}
Роль: ${user.Group}
Личная папка: ${user.UserFolder}`,
        {
          reply_markup: markup,
        }
      );

      return true;
    } catch (error) {
      const errorArray = error.message.split(':');

      if (errorArray[0] === `Ошибка в получении пользователя`) {
        await context.reply('Данный пользователь не найден!');
        return true;
      }

      console.error(`admin.service > userProfile${error}`);
      return false;
    }
  };
}

function userPromote(usersRepository) {
  return async (context) => {
    try {
      const id = context.update.callback_query?.data.split('_')[1];
      const user = await usersRepository.getUser(id);

      if (!context.session.isAdmin || !context.session.isTopAdmin)
        return await context.editMessageText('Вы не администратор!');

      if (user.Group === UserGroup.Admin) {
        await usersRepository.updateUser(id, user.Name, UserGroup.WaitConfirm);
        return await context.editMessageText('Пользователь успешно понижен!');
      }
      if (user.Group !== UserGroup.Admin) {
        await usersRepository.updateUser(id, user.Name, UserGroup.Admin);
        return await context.editMessageText('Пользователь успешно повышен!');
      }

      return true;
    } catch (error) {
      console.error(`admin.service > userPromote${error}`);
      return false;
    }
  };
}

function userGroup(usersRepository, GroupRepository) {
  return async (context) => {
    try {
      const id = context.update.callback_query?.data.split('_')[1];
      const user = await usersRepository.getUser(id);

      if (!context.session.isAdmin && !context.session.isTopAdmin)
        return await context.editMessageText('Вы не администратор!');

      if (id === context.session.user.id)
        return await context.editMessageText(
          'Вы не можете ограничить доступ самому себе!'
        );
      if (user.Group === UserGroup.Admin && !context.session.isTopAdmin)
        return await context.editMessageText(
          'Вы не можете  ограничить доступ администратору!'
        );

      if (user.Group === UserGroup.WaitConfirm) {
        const groups = await GroupRepository.getAllGroups();
        const markup = new InlineKeyboard();
        _.each(groups, ({ Name }) => {
          if (Name !== UserGroup.Admin && Name !== UserGroup.WaitConfirm) {
            markup.text(Name, `access_${Name}_${id}`).row();
          }
        });

        await context.editMessageText('Выберите тип АЗС', {
          reply_markup: markup,
        });
      } else if (
        user.Group === UserGroup.Azs ||
        user.Group === UserGroup.AzsWithStore ||
        user.Group === UserGroup.Admin
      ) {
        await usersRepository.updateUser(id, user.Name, UserGroup.WaitConfirm);
        await context.editMessageText('Пользователю успешно ограничен доступ!');
      }
      return true;
    } catch (error) {
      console.error(`admin.service > userGroup${error}`);
      return false;
    }
  };
}

function updateGroup(usersRepository) {
  return async (context) => {
    const id = context.update.callback_query?.data.split('_')[2];
    const azsType = context.update.callback_query?.data.split('_')[1];
    const user = await usersRepository.getUser(id);

    await usersRepository.updateUser(id, user.Name, azsType);

    context.editMessageText(
      `Изменить имя пользователя ?\nТекущее имя: ${user.Name}\n\nШаблон: [azs][num]`,
      {
        reply_markup: new InlineKeyboard()
          .text('Изменить', `editName_${id}`)
          .row()
          .text('Оставить как есть и выдать доступ', `createFolder_${id}`),
      }
    );
  };
}

function requestNewUserName() {
  return async (context) => {
    const id = context.update.callback_query?.data.split('_')[1];

    try {
      context.editMessageText(`Введите новое имя пользователя`, {});
      context.session.scene = 'enter_name';
      context.session.id = id;
    } catch (error) {
      console.error(`admin.service > requestNewUserName ${error}`);
    }
  };
}

function editUserName(usersRepository) {
  return async (context) => {
    const { id } = context.session;
    const newName = context.msg.text;
    try {
      const user = await usersRepository.getUser(id);
      await usersRepository.updateUser(id, newName, user.Group);
      context.reply('Имя успешно обновлено', {
        reply_markup: new InlineKeyboard().text(
          'Выдать доступ',
          `createFolder_${id}`
        ),
      });
      context.session.scene = '';
      delete context.session.id;
    } catch (error) {
      console.error(`admin.service > editUserName ${error}`);
    }
  };
}

function createUserFolder(botInstance, Googlerepository, UsersRepository) {
  return async (context) => {
    try {
      const id = context.update.callback_query?.data.split('_')[1];
      const user = await UsersRepository.getUser(id);
      const response = await Googlerepository.makeFolder({
        folderName: user.Name,
        parentIdentifiers: { fileName: process.env.MAIN_FOLDER_NAME },
      });
      await UsersRepository.updateUser(id, user.Name, user.Group, response);
      console.log('Success created userFolder:', response);
      context.editMessageText(
        `Успешно создана папка: ${user.Name}\nid: ${response}`
      );
      botInstance.api.sendMessage(
        id,
        `Вам успешно выдали доступ\nВаше имя: ${user.Name}`
      );
    } catch (error) {
      console.error('admin.service > createFolder:', error);
    }
  };
}

function sendReminderMessageForUser(botInstance) {
  return async (context) => {
    const id = context.update.callback_query?.data.split('_')[1];
    const markup = {
      reply_markup: new InlineKeyboard()
        .text('Да', 'startCheck')
        .row()
        .text('Нет', 'postponeСheck'),
    };

    try {
      await botInstance.api.sendMessage(id, REMINDER_MSG_TEXT, markup);
      await context.editMessageText('Уведомление отправленно!');
    } catch (error) {
      console.error('Error sending reminder to user:', error);
    }
  };
}

export {
  adminPanel,
  createUserFolder,
  editUserName,
  getAllUsers,
  newsletterPanel,
  requestNewUserName,
  sendNewsletterForAll,
  sendReminderMessageForUser,
  updateGroup,
  userGroup,
  userProfile,
  userPromote,
  userSearch,
};
