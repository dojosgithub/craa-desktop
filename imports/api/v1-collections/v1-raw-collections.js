import { Mongo } from 'meteor/mongo';

import { Util } from '/imports/lib/util.js'

//-- 29 v1 MySQL tables roughly imported to v2 MongoDB
//-- some collections might show flat, iterative rows (e.g. scorings) 
//-- due to the original serialized-data...
export const V1AbbreviationsRaw = new Mongo.Collection('v1_abbreviations_raw');
export const V1AdjudicationsRaw = new Mongo.Collection('v1_adjudications_raw');
export const V1AssesseesRaw = new Mongo.Collection('v1_assessees_raw');
export const V1AssessmentCategoriesRaw = new Mongo.Collection('v1_assessment_categories_raw');
export const V1AssessmentsRaw = new Mongo.Collection('v1_assessments_raw');
export const V1AssignedAssessmentsRaw = new Mongo.Collection('v1_assigned_assessments_raw');
export const V1CfrsRaw = new Mongo.Collection('v1_cfrs_raw');
export const V1CommentsRaw = new Mongo.Collection('v1_comments_raw');
export const V1CompanyMonthsRaw = new Mongo.Collection('v1_company_months_raw');
export const V1CountriesRaw = new Mongo.Collection('v1_countries_raw');
export const V1DegreesRaw = new Mongo.Collection('v1_degrees_raw');
export const V1DocumentsRaw = new Mongo.Collection('v1_documents_raw');
export const V1EapaPoliciesRaw = new Mongo.Collection('v1_eapa_policies_raw');
export const V1GroupsRaw = new Mongo.Collection('v1_groups_raw');
export const V1IchGcpsRaw = new Mongo.Collection('v1_ich_gcps_raw');
export const V1LanguagesRaw = new Mongo.Collection('v1_languages_raw');
export const V1MedicalDictionariesRaw = new Mongo.Collection('v1_medical_dictionaries_raw');
export const V1MessagesRaw = new Mongo.Collection('v1_messages_raw');
export const V1ModulesRaw = new Mongo.Collection('v1_modules_raw');
export const V1MonthsRaw = new Mongo.Collection('v1_months_raw');
export const V1NotificationsRaw = new Mongo.Collection('v1_notifications_raw');
export const V1OptionsRaw = new Mongo.Collection('v1_options_raw');
export const V1PagesRaw = new Mongo.Collection('v1_pages_raw');
export const V1ProtocolsRaw = new Mongo.Collection('v1_protocols_raw');
export const V1ScoringsRaw = new Mongo.Collection('v1_scorings_raw');
export const V1SubadminsRaw = new Mongo.Collection('v1_subdmins_raw');
export const V1UsersRaw = new Mongo.Collection('v1_users_raw');
export const V1UserAnswersRaw = new Mongo.Collection('v1_user_answers_raw');
export const V1ValidationQuestionssRaw = new Mongo.Collection('v1_validation_questions_raw');

// export const V1InVentivUsersTemp = new Mongo.Collection('v1_inventive_users_temp');
// 
// export const V1UsersTemp = new Mongo.Collection('v1_users_temp');
// export const V1UsersSummaryTemp = new Mongo.Collection('v1_users_summary_temp');
// export const V1UsersDemographicTemp = new Mongo.Collection('v1_users_demographic_temp');
// export const V1AssessmentsTemp = new Mongo.Collection('v1_assessments_temp');
// export const V1SimUsersSummaryTemp = new Mongo.Collection('v1_sim_users_summary_temp');
