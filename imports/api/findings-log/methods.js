import { Promise } from 'meteor/promise'

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { FindingsLog } from './findings-log.js';

Meteor.methods({
	'FindingsLog.insert'(obj) {
		check(obj, {

		})
		// this.unblock();

		
	}
 });
