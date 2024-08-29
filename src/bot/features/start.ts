import { Composer } from 'grammy';
import { Context } from '../context.js';
import start from '../services/start.js';

const composer = new Composer<Context>();

const feature = composer.chatType("private")

feature.command('start', start)

export { composer as startFeature }
