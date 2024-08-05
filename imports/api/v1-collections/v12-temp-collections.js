import { Mongo } from 'meteor/mongo';

import { Util } from '/imports/lib/util.js'

//-- v2 collection version of v1 tables (i.e. v1 to v2 collection)

// export const V12UsersTemp = new Mongo.Collection('v12_users_temp');

export const V1InVentivUsersTemp = new Mongo.Collection('v1_inventive_users_temp');

export const V1UsersTemp = new Mongo.Collection('v1_users_temp');
export const _v1Users = new Mongo.Collection('v1Users');

export const V1UsersSummaryTemp = new Mongo.Collection('v1_users_summary_temp');
export const V1UsersDemographicTemp = new Mongo.Collection('v1_users_demographic_temp');
export const V1AssessmentsTemp = new Mongo.Collection('v1_assessments_temp');
export const V1SimUsersSummaryTemp = new Mongo.Collection('v1_sim_users_summary_temp');

export const V1ScoringsTemp = new Mongo.Collection('v1_scorings_temp');
export const V1UsersScoreSummaryTemp = new Mongo.Collection('v1_users_score_summary_temp');

export const V1MonitoringNotesTemp = new Mongo.Collection('v1_monitoring_notes_temp');
export const V1ComplianceNotesTemp = new Mongo.Collection('v1_compliance_notes_temp');

export const V1TimerLogTemp = new Mongo.Collection('v1_timer_log_temp');
export const V1TempTimerLogTemp = new Mongo.Collection('v1_temp_timer_log_temp');

export const V1V2FindingsMap = new Mongo.Collection('v1_v2_findings_map');
export const V1V2DocumentsMap = new Mongo.Collection('v1_v2_documents_map');
