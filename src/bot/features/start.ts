import { Composer } from "grammy";
import { Context } from "../context.js";
import start from "../services/start.js";
import { logHandle } from "../helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command("start", logHandle("start-command"), start);

export { composer as startFeature };
