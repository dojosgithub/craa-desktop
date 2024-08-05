import { isPlainObject } from 'jquery';
import { check } from 'meteor/check'

import { DomainTips } from './domain-tips.js'

Meteor.methods({
    "DomainTips.get.byDomainId"(obj) {
        check(obj, {
            domainId: Number
        })
        // this.unblock();

        // console.log(obj);

        return DomainTips.find({
            domainId: obj.domainId,
            status: { $ne: 4 }
        }).fetch()
    },
    "DomainTips.get.active.byDomainId"(obj) {
        check(obj, {
            domainId: Number
        })
        // this.unblock();

        // console.log(obj);

        return DomainTips.find({
            domainId: obj.domainId,
            status: 1
        }).fetch()
    },    
    "DomainTips.add"(obj) {
        check(obj, {
            domainId: Number,
            tip: Match.Optional(Match.OneOf(undefined, null, String, Number)),
            author: String
        })
        // this.unblock();

        return DomainTips.insert({
            domainId: obj.domainId,
            content: obj.tip,
            author: obj.author,
            status: 2,
            cAt: new Date
        })
    },
    "DomainTips.status.update"(obj) {
        check(obj, {
            _id: String,
            status: Number
        })
        // this.unblock();

        return DomainTips.update(obj._id, {
            $set: {
                status: obj.status
            }
        });

    },
    "DomainTips.content.update"(obj) {
        check(obj, {
            _id: String,
            content: String,
            editor: String
        })
        // this.unblock();

        return DomainTips.update(obj._id, {
            $set: {
                content: obj.content,
                editor: obj.editor
            }
        });

    },    

});
