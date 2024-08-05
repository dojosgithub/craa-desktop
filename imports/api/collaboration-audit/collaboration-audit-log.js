import { Mongo } from 'meteor/mongo';

import { Util } from '/imports/lib/util.js'

export const CollaborationAuditLog = new Mongo.Collection('collaboration_audit_log');

