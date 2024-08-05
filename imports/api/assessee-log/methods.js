import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

const XLSX = require('xlsx');

import { Util } from '/imports/lib/server/util.js'

import { Simulations } from '/imports/api/simulations/simulations.js';
import { AssesseeLog } from '/imports/api/assessee-log/assessee-log.js';
import { Documents } from '/imports/api/documents/documents.js';

import { Assessments } from '/imports/api/assessments/assessments.js';

import { ScoringBehaviors } from '/imports/api/scoring-behaviors/scoring-behaviors.js';
import { MonitoringNotes } from '/imports/api/monitoring-notes/monitoring-notes.js';

Meteor.methods({
  'AssesseeLog.export'(user) {
    check(user, {
      uid: String,
      sids: Array,
      cid: String,
      buid: String,
      client: String
    })

    let log = AssesseeLog.find({
      'assessee.assessee_id': user.uid
    }, {
      sort: {
        createdAt: 1        
      }
    }).fetch()

    if(log && log.length > 0) {

      let output = Meteor.wrapAsync((sids, callback) => {

        let documents = Documents.find({
          simulation_id: {$in: sids},
          // status: 1
        }).fetch()

        let docs = []
        if(documents && documents.length > 0) {
          documents.forEach((d) => {
            docs[d.id] = d.name
          })
        }

        let simulations = Simulations.find({
          id: {$in: sids}
        }).fetch()

        let sims = []
        if(simulations && simulations.length > 0) {
          simulations.forEach((s) => {
            sims[s.id] = s.name
          })
        }

        let data = [["User", "Client", "Simulation", "Action", "Venue",  "Note", "Vp1", "Vp2", "Time [UTC]", "IP"]]
// console.log(Util.tzOffset())
        log.forEach((l) => {

          let doc1 = '', doc2 = ''

          if(l.doc_vp1) {
            doc1 = docs[l.doc_vp1.document_id]
          }
          if(l.doc_vp2) {
            doc2 = docs[l.doc_vp2.document_id]
          }                    

          let sim = ''

          if(l.simulation) {
            sim = sims[l.simulation.id]
          }

          let myUser = l.assessee && l.assessee.fullname || ''

// let tzOffsetDate = Util.tzOffsetDate(l.createdAt)

// console.log(l.createdAt, tzOffsetDate, Util.dateHMS2(tzOffsetDate))
// console.log(l.createdAt, tzOffsetDate)

          let note = l.note ? l.note.content : ''

          let _log = [myUser, user.client, sim,l.message, l.port, note, doc1, doc2, Util.dateHMS2(l.createdAt), l.ip]

          data.push(_log)

          // return wb;            
        })

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = {SheetNames: ["Assessee Log"], Sheets:{'Assessee Log':ws }};

        callback(null, {success: true, data: wb})
      })

      let result = output(user.sids)

      if(result) {
        return result
      }       
    }
  },
  'UBA.MonitoringNotesIndividual.log'(obj) {
    check(obj, Object)
    // this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {

      let _sidString = obj.sid.toString();

// console.log(_sidString);

      let asmts = Assessments.find({
        assessee_id: { $in: obj.userIds },
        simulation_id: _sidString
      }).fetch()

      let
        aDict = [], 
        aids = [];

      asmts.forEach((a) => {
        aids.push(a._id)
        aDict[a._id] = a.assessee_id
      })

// console.log(aDict)
// console.log(asmts)
// console.log(obj)
// console.log(aids)
      let sbs = ScoringBehaviors.find({
        assessment_id: { $in: aids },
        status: 1
      }, {
        fields: {
          'assessment_id': 1,
          'simulation_id': 1,
          'behavior._id': 1,
          'behavior.id': 1,
          'behavior.behavior': 1,
          'behavior.finding': 1,
          'assessor1.identified': 1,
          'assessor2.identified': 1,
          'assessor1.mnid': 1,
          'assessor2.mnid': 1
        }
      }).fetch();

      let 
        sbsDict = [],
        _sbsFindingDict = [],
        _findingDict = [];

      sbs.forEach((s) => {
        // console.log(s);
        let assessee_id = aDict[s.assessment_id];

        if(!sbsDict[assessee_id]) {
          sbsDict[assessee_id] = []; //-- aDict[s.assessment_id] => assessee_id
        }

        let mnid = (s.assessor1 && s.assessor1.identified && s.assessor1.mnid)
          || (s.assessor2 && s.assessor2.identified && s.assessor2.mnid);

        let key = s.simulation_id + 'm' + mnid;

        sbsDict[assessee_id][key] = s.behavior.id;
         
        if(s.behavior._id) {
          _sbsFindingDict['m'+mnid] = s.behavior.finding || null;           
        }

        if(s.behavior.id) {
          // console.log(s.behavior.id, s.behavior.finding)
          _findingDict['f'+s.behavior.id] = s.behavior.finding || s.behavior.behavior || null;
        }       
      });
      
      // console.log(_sbsFindingDict);
      // console.log(_findingDict);

      let mns = MonitoringNotes.find({
        creator: { $in: obj.userIds },
        simulation_id: obj.sid.toString(),
        status: 1,
        key: {$exists: true}
      }, {
        fields: {
          simulation_id: 1,
          content: 1,
          creator: 1,
          createdAt: 1,
          modifiedAt: 1,
          key: 1,
          _id: 1,
          page: 1
        }
      }).fetch();

      let 
        mnDict = [],
        _mnDict = [],
        _mnidDict = [],
        _mnPageDict = [];

      // console.log(obj);
      // console.log(sbsDict);
      // console.log(mns);

      mns.forEach((n) => {
        
        // console.log(n.creator, sbsDict[n.creator]);

        if(sbsDict[n.creator]) {
          let key = n.simulation_id + 'm'+n.key
          mnDict[n._id] = sbsDict[n.creator][key]
          _mnDict[n.createdAt] = sbsDict[n.creator][key]
        }

        _mnidDict[n._id] = n.key;
        _mnPageDict[n._id] = n.page;

      });

      // console.log(_mnDict);

      let logs = AssesseeLog.find({
        'assessee.assessee_id': { $in: obj.userIds },
        'simulation.id': obj.sid,
        // $or: [
        //   {trigger: { $regex: '^mn' }},
        //   {trigger: 'simsub'}
        // ]        
      }, 
      {
        fields: {
          '_id': 1,
          'assessee.fullname': 1,
          'assessee.assessee_id': 1,
          'simulation.name': 1,
          'message': 1,
          'port': 1,
          'doc_vp1.document_name': 1,
          'doc_vp2.document_name': 1,
          'note._id': 1,
          'note.document.document_name': 1,          
          'note.content': 1,
          'note.page': 1,
          'note.pills_taken': 1,
          'note.pills_prescribed': 1,
          'note.pills_percent': 1,
          'note.createdAt': 1,
          'note._id': 1,
          'createdAt': 1,
          'ip': 1,
          'trigger': 1
        },
        sort: {
          createdAt: -1
        }        
      }
      // {
      //   sort: {
      //     createdAt: -1
      //   }
      // }
      ).fetch()

      let 
        allLogs = [],
        _highSimil = 0,
        _higherSimil = 0;

      logs.forEach((g) => {
        // if(g.note) {
        //   console.log(g.note._id)
        // }

        let 
          fid = null,
          _class = null,
          _note = null, 
          _finding = null,
          _simil = null;

        if(g.trigger === 'mns') {
          fid = _mnDict[g.note.createdAt]
          _class = 'note';
          // console.log(fid);
        }
        if(g.trigger === 'mneo' || g.trigger === 'mnes' || g.trigger === 'mned' || g.trigger === 'mnec') {          
          fid = mnDict[g.note._id]
          _class = 'note'
        }

        if(g.trigger === 'cns' || g.trigger === 'cneo' || g.trigger === 'cned' || g.trigger === 'cnes' || g.trigger === 'cnec') {                    
          _class = 'cnote'
        }

        _note = g.note && g.note.content || null;
        _finding = (g.note && g.note._id && _sbsFindingDict['m'+_mnidDict[g.note._id]]) || _findingDict['f'+fid] || null;

        if(fid) {
          if(_note && _finding) {

            let 
              _noteTrimmed = _note.trim(),
              _findingTrimmed = _finding.trim();

            let _rawSimil =  _noteTrimmed === _findingTrimmed ? 1 : textCosineSimilarity(_noteTrimmed, _findingTrimmed);
            _simil = _rawSimil.toFixed(3);

            if(_rawSimil >= 0.9) {
              _higherSimil++;
            }
            else if(_rawSimil >= 0.6) {
              _highSimil++;
            }

          }
        }

        let obj = {
          _id: g._id,
          name: g.assessee.fullname,
          uid: g.assessee.assessee_id,
          sname: g.simulation.name,
          msg: g.message,
          port: g.port,
          d1: g.doc_vp1 && g.doc_vp1.document_name,
          d2: g.doc_vp2 && g.doc_vp2.document_name,
          nd: g.note && g.note.document && g.note.document.document_name,
          // note: g.note && g.note.content,
          note: _note,
          page: (g.note && g.note.page) || (g.note && g.note._id && _mnPageDict[g.note._id]) ,
          noteId: g.note && g.note._id || null,
          cAt: g.createdAt,
          ip: g.ip,
          fid: fid || null,
          // fid: fid || (g.note && g.note._id && _sbsFindingIdDict[g.note._id]) || null,
          // finding: (g.note && g.note._id && _sbsFindingDict['m'+_mnidDict[g.note._id]]) || null,
          finding: _finding,
          simil: _simil,
          class: _class
          // cmsg: null
        }

        if(g.note && g.note.pills_taken) {
          let cmsg = 'Taken: ' + g.note.pills_taken
          if(g.note.pills_prescribed) {
            cmsg += ', Should be taken: ' + g.note.pills_prescribed
          }
          if(g.note.pills_percent) {
            cmsg += ', Percent: ' + g.note.pills_percent
          }

          obj.note = cmsg
        }

        allLogs.push(obj)
      })

      // callback(null, {success: true, data: logs})
      // callback(null, {success: true, data: allLogs})
      callback(null, {success: true, data: {
        logs: allLogs,
        highSimil: _highSimil,
        higherSimil: _higherSimil
      }})
    })

    let result = output('dk')

    if(result) {
      return result
    }        
  }
})


function termFreqMap(str) {
  var words = str.split(' ');
  var termFreq = {};
  words.forEach(function(w) {
    termFreq[w] = (termFreq[w] || 0) + 1;
  });
  return termFreq;
}

function addKeysToDict(map, dict) {
  for (var key in map) {
    dict[key] = true;
  }
}

function termFreqMapToVector(map, dict) {
  var termFreqVector = [];
  for (var term in dict) {
    termFreqVector.push(map[term] || 0);
  }
  return termFreqVector;
}

function vecDotProduct(vecA, vecB) {
  var product = 0;
  for (var i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

function vecMagnitude(vec) {
  var sum = 0;
  for (var i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
}

function cosineSimilarity(vecA, vecB) {
  return vecDotProduct(vecA, vecB) / (vecMagnitude(vecA) * vecMagnitude(vecB));
}

function textCosineSimilarity(strA, strB) {
  // var termFreqA = termFreqMap(strA);
  // var termFreqB = termFreqMap(strB);  
  var termFreqA = termFreqMap(strA.toLowerCase());
  var termFreqB = termFreqMap(strB.toLowerCase());

  var dict = {};
  addKeysToDict(termFreqA, dict);
  addKeysToDict(termFreqB, dict);

  var termFreqVecA = termFreqMapToVector(termFreqA, dict);
  var termFreqVecB = termFreqMapToVector(termFreqB, dict);

  return cosineSimilarity(termFreqVecA, termFreqVecB);
}


