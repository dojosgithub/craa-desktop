import { check } from 'meteor/check'

const XLSX = require('xlsx');

import { Util } from '/imports/lib/server/util.js'

import { CollaborationAudit } from './collaboration-audit.js';
import { CollaborationAuditLog } from './collaboration-audit-log.js';
// import { isPlainObject } from 'jquery';

import { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js';

Meteor.methods({
  "CollaborationAudit.data.count"(params) {
    check(params, {
      percent: Match.Optional(Match.OneOf(undefined, null, Number)),
      names: Match.Optional(Match.OneOf(undefined, null, Array))
    })
    // this.unblock();

    let _percent = params.percent || 80;

      let $_match = {
        status: 1,
        percent: { $gte: _percent }
      }

      if(params.names && params.names.length > 0) {
        if(params.names.length === 1) {

          let _name = (params.names[0]).trim();

          $_match['$or'] = [
            { u1lname: { $regex: _name, $options: 'i' } },
            { u2lname: { $regex: _name, $options: 'i' } }
          ]
        }
        else if(params.names.length === 2) {
          let 
            _name1 = (params.names[0]).trim(),
            _name2 = (params.names[1]).trim();

          $_match['$or'] = [
            { u1lname: { $regex: _name1, $options: 'i' }, u2lname: { $regex: _name2, $options: 'i' } },
            { u1lname: { $regex: _name2, $options: 'i' }, u2lname: { $regex: _name1, $options: 'i' } }          
          ]
        }
      }

    return CollaborationAudit.find($_match).count();
  },
  "CollaborationAudit.export"(filters) {
    check(filters, Object)
    // this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {
            
      let _ca = CollaborationAudit.find(filters,{
        sort: {
          cAt: -1
        }
      }).fetch();

      if(_ca && _ca.length > 0) {

        let data = [["Reviewed", "Value", "Sim Name", "Client", "BU", "User1", "User2", "User1 Country", "User2 Country", "User1 SubmittedAt", "User2 SubmittedAt", "Comment", "Collaborated"]];

        _ca.forEach((c) => {
          
          let 
            _u1 = c.u1fname + ' ' + c.u2lname,
            _u2 = c.u2fname + ' ' + c.u2lname,
            _caObj = [c.reviewed, c.percent, c.simName, c.cName, c.buName, _u1, _u2, c.u1Country, c.u2Country, Util.dateHMS2(c.u1SubAt),Util.dateHMS2(c.u2SubAt), c.comment, c.collaborated];

          data.push(_caObj)

        }) //-- _ca.forEach((n) => {

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = {SheetNames: ["Collaboration Audit"], Sheets:{'Collaboration Audit':ws }};

        callback(null, {success: true, data: wb})

      } //-- if(_ca && _ca.length > 0) {

    }); 

    let result = output('dk')

    if(result) {      
      return result
    }    
  },  
  "CollaborationAudit.reviewed.update"(obj) {
    check(obj, {
      _id: String,
      reviewed: Boolean,
      cid: String,
      buid: String,
      sid: Number,
      u1Id: String,
      u2Id: String,
      author: String
    })
    // this.unblock();

    let output = Meteor.wrapAsync((obj, callback) => {

	    // let _updated = CollaborationAudit.update(new Meteor.Collection.ObjectID(obj._id), {
      let _updated = CollaborationAudit.update(obj._id, {
	    	$set: {
	    		reviewed: obj.reviewed,
	    		mAt: new Date
	    	}
	    });

	    if(_updated === 1) {
	    	
	    	obj['venue'] = "reviewed";
	    	obj['message'] = "Updated review status to " + obj.reviewed;

	    	Meteor.call("CollaborationAuditLog.insert", obj);
	    }

	    callback(null, _updated);


	    })

    let result = output(obj)

    if(result) {
      return result
    }
  },
  "CollaborationAudit.collaborated.update"(obj) {
    check(obj, {
      _id: String,
      collaborated: Boolean,
      cid: String,
      buid: String,
      sid: Number,
      u1Id: String,
      u2Id: String,
      author: String
    })
    // this.unblock();

    let output = Meteor.wrapAsync((obj, callback) => {

	    let _updated = CollaborationAudit.update(obj._id, {
	    	$set: {
	    		collaborated: obj.collaborated,
	    		mAt: new Date
	    	}
	    });

	    if(_updated === 1) {
	    	
	    	obj['venue'] = "collaborated";
	    	obj['message'] = "Updated collaboration status to " + obj.collaborated;

	    	Meteor.call("CollaborationAuditLog.insert", obj);
	    }

	    callback(null, _updated);


	    })

    let result = output(obj)

    if(result) {
      return result
    }
  },
  "CollaborationAudit.comment.update"(obj) {
    check(obj, {
      _id: String,
      cid: String,
      buid: String,
      sid: Number,
      u1Id: String,
      u2Id: String,
      author: String,
      comment: String,
      reviewed: Match.Optional(Match.OneOf(undefined, null, Boolean)),
      collaborated: Match.Optional(Match.OneOf(undefined, null, Boolean))      
    })
    // this.unblock();

    let output = Meteor.wrapAsync((obj, callback) => {

	    // let _updated = CollaborationAudit.update(new Meteor.Collection.ObjectID(obj._id), {
      let _updated = CollaborationAudit.update(obj._id, {
	    	$set: {
	    		comment: obj.comment,
	    		mAt: new Date
	    	}
	    });

	    if(_updated === 1) {
	    	
	    	obj['venue'] = "comment";
	    	obj['message'] = "Updated comment";
	    	obj['comment'] = obj.comment;

	    	Meteor.call("CollaborationAuditLog.insert", obj);
	    }

	    callback(null, _updated);


	    })

    let result = output(obj)

    if(result) {
      return result
    }
  },  
  "CollaborationAudit.comment.delete"(obj) {
    check(obj, {
      _id: String,      
      cid: String,
      buid: String,
      sid: Number,
      u1Id: String,
      u2Id: String,
      author: String,
      comment: String
    })
    // this.unblock();

    let output = Meteor.wrapAsync((obj, callback) => {

      // let _updated = CollaborationAudit.update(new Meteor.Collection.ObjectID(obj._id), {
      let _updated = CollaborationAudit.update(obj._id, {
        $unset: { comment: ""},
        $set: {          
          mAt: new Date
        }
      });

      if(_updated === 1) {
        
        obj['venue'] = "comment";
        obj['message'] = "Deleted comment";
        obj['comment'] = obj.comment;

        Meteor.call("CollaborationAuditLog.insert", obj);
      }

      callback(null, _updated);


      })

    let result = output(obj)

    if(result) {
      return result
    }
  },
  "UBA.CollaborationAudit.data"(params) {
    check(params, {
      percent: Match.Optional(Match.OneOf(undefined, null, Number)),
      names: Match.Optional(Match.OneOf(undefined, null, Array)),
      totalSizeOfData: Match.Optional(Match.OneOf(undefined, null, Number)),
      pageNavSetIndex: Match.Optional(Match.OneOf(undefined, null, Number)),
      currentPage: Match.Optional(Match.OneOf(undefined, null, Number)),
      sizePerPage: Match.Optional(Match.OneOf(undefined, null, Number)),
      numOfCasesPerPage: Match.Optional(Match.OneOf(undefined, null, Number)),
      sizeOfPageNavigation: Match.Optional(Match.OneOf(undefined, null, Number)),
      pageNavNumbers: Match.Optional(Match.OneOf(undefined, null, Array)),
      currentShowingCasesRange: Match.Optional(Match.OneOf(undefined, null, Object)),
      filterKey: Match.Optional(Match.OneOf(undefined, null, Number))
    });

    // this.unblock();

    let output = Meteor.wrapAsync((obj, callback) => {

      let 
        _percent = params.percent || 80,
        _size = params.sizePerPage || 20,
        _page = params.currentPage || 1,
        _skip = _size * (_page-1) || 0;

// console.log(_size, _page, _skip);

      let $_match = {
        // status: 2,
        percent: { $gte: _percent },
        excluded: { $ne: true }
      }

      let _filter = params.filterKey;

      if(_filter) {
        
        // console.log(_filter);

        if(_filter === 1) { //-- all
          
        }
        else if(_filter === 2) { //-- reviewed
          $_match['reviewed'] = true;
        }
        else if(_filter === 3) { //-- not-reviewed
          $_match['reviewed'] = { $ne: true };
        }        
        else if(_filter === 4) { //-- collaborated
          $_match['collaborated'] = true;
        }
        else if(_filter === 5) { //-- has-comments
          $_match['comment'] = { $exists: true };
        }
        else if(_filter === 6) { //-- excluded
          $_match['excluded'] = { $exists: true };
        }                             
      }

      if(params.names && params.names.length > 0) {
        if(params.names.length === 1) {

          let _name = (params.names[0]).trim();

          $_match['$or'] = [
            { u1lname: { $regex: _name, $options: 'i' } },
            { u2lname: { $regex: _name, $options: 'i' } }
          ]
        }
        else if(params.names.length === 2) {
          let 
            _name1 = (params.names[0]).trim(),
            _name2 = (params.names[1]).trim();

          $_match['$or'] = [
            { u1lname: { $regex: _name1, $options: 'i' }, u2lname: { $regex: _name2, $options: 'i' } },
            { u1lname: { $regex: _name2, $options: 'i' }, u2lname: { $regex: _name1, $options: 'i' } }          
          ]
        }
      }

      // console.log($_match);

      let _auditData = CollaborationAudit.find($_match,{
        skip: _skip,
        limit: _size,
        sort: {
          compTime: -1,
          u1fname: 1
        }
      }).fetch();

      callback(null, { data: {
        size: _size,
        page: _page,
        auditData: _auditData
      }});

    })

    let result = output(params);

    if(result) {
      return result
    }

  },
  "UBA.CollaborationAudit.exclude"(obj) {
    check(obj, {
      // user1Id: Match.Optional(Match.OneOf(undefined, null, String)),
      // user2Id: Match.Optional(Match.OneOf(undefined, null, String))
      // userId: String
      // key: String
      uid: String,
      sid: Number
    })
   
    return CollaborationAudit.update({
      // $or: [
      //   {u1Id: obj.userId},
      //   {u2Id: obj.userId }
      // ]
      // key: obj.key
      sid: obj.sid,
      $or: [
        {u1Id: obj.uid},
        {u2Id: obj.uid }
      ]      
    },{
      $set: {
        excluded: true
      }
    },{
      multi: true
    })
  },
  "UBA.CollaborationAudit.include"(obj) {
    check(obj, {
      // user1Id: Match.Optional(Match.OneOf(undefined, null, String)),
      // user2Id: Match.Optional(Match.OneOf(undefined, null, String))
      // userId: String
      // key: String
      uid: String,
      sid: Number
    })
   
    return CollaborationAudit.update({
      // $or: [
      //   {u1Id: obj.userId},
      //   {u2Id: obj.userId }
      // ]
      // key: obj.key
      sid: obj.sid,
      $or: [
        {u1Id: obj.uid},
        {u2Id: obj.uid }
      ]      
    },{
      $set: {
        excluded: false
      }
    },{
      multi: true
    })
  },
  "CollaborationAudit.recompute"(obj) {
    check(obj, {
      position: Number,
      userId: String,
      buId: String
    })

    // let _ca = CollaborationAudit.find({
    //   $or: [
    //     { u1Id: obj.userId },
    //     { u2Id: obj.userId }
    //   ]
    // })

    // let _sus = SimUsersSummary.find({
    //   userId: obj.userId
    // }).fetch();

    // if(_sus.length > 0) {

    //   let 
    //     _sDates = [],
    //     _eDates = [];

    //   _sus.forEach((s) => {
    //     _sDates.push(s.oStartedAt || s.startedAt || s.createdAt);
    //     _eDates.push(s.submittedAt || s.oSubmittedAt || s.lastLogin);
    //   });

    //   _sDates.sort((a,b) => {
    //     return new Date(a) - new Date(b);
    //   })
    //   _eDates.sort((a,b) => {
    //     return new Date(b) - new Date(a);
    //   })
    // }
  }  

});
