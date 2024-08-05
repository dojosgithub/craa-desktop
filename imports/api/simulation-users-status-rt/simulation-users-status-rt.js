import { Mongo } from 'meteor/mongo';

//-- Simulation Users Status collection for Realtime stats
export const SimulationUsersStatusRT = new Mongo.Collection('simulation_users_status_rt');

