import { Mongo } from 'meteor/mongo';

export const Logs = new Mongo.Collection('logs');

export const TimerLog = new Mongo.Collection('timer_log');
export const TempTimerLog = new Mongo.Collection('temp_timer_log');
