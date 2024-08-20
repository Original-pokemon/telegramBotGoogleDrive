import { Context as DefaultContext } from 'grammy'

export function createContextConstructor(
  {
    logger,
    config,
  },
) {
  return class extends DefaultContext {
    logger
    config


    constructor(update, api, me) {
      super(update, api, me)

      this.logger = logger.child({
        update_id: this.update.update_id,
      })
      this.config = config
    }
  }
}