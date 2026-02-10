import { EventEmitter } from "node:events";

export const NOTIFICATION_TIME_CHANGED = "notificationTimeChanged";

export const scheduleEvents = new EventEmitter();
