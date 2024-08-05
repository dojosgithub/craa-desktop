import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { DocumentFolderColors } from './document-folder-colors.js'

Meteor.methods({
  /*==============================*
   *   Document Folder methods    *
   *==============================*/
  'DocumentFolderColors.upsert'(obj) {
    check(obj, {
      fid: Match.Optional(Match.OneOf(undefined, null, Number)),
      did: Match.Optional(Match.OneOf(undefined, null, Number)),
      name: Match.Optional(Match.OneOf(undefined, null, String)),      
      color: Match.Optional(Match.OneOf(undefined, null, String)),
      type: Match.Optional(Match.OneOf(undefined, null, String)),
      dids: Match.Optional(Match.OneOf(undefined, null, String, Number))
    })

    // this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {

      let _outputData = {};

      DocumentFolderColors.upsert({
        name: obj.name,
        type: obj.type
      }, {
        $set: {
          name: obj.name,
          type: obj.type,
          fid: obj.fid,
          did: obj.did,
          color: obj.color,
          dids: obj.dids,
          dateAt: new Date
        }
      }, (err, res) => {
        if(err) {
          _outputData = {success: false, data: err}
        } else {
          _outputData = {success: true, data: res}
        }

        callback(null, _outputData)  
      });

    });

    let result = output('dk')

    if(result) {
      return result
    }    
  }
})
