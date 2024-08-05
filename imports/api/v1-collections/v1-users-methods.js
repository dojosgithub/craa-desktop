import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Promise } from 'meteor/promise'

var moment = require('moment');

import { Util } from '/imports/lib/server/util.js'

import { CountryCodes } from '/imports/api/country-codes/country-codes.js';

import { V1UsersRaw } from './v1-raw-collections.js';

import { V1InVentivUsersTemp, V1UsersTemp, 
          V1UsersSummaryTemp, V1UsersDemographicTemp, V1AssessmentsTemp,
          V1SimUsersSummaryTemp } from './v12-temp-collections.js';

const EUCountries = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","GB"];

Meteor.methods({
  "ETL.V1UsersRaw.integrate"() {
    // this.unblock()

    let _countryCodes = CountryCodes.find({}, {
      fields: {
        name: 1,
        official_name_en: 1,
        ISO3166_1_Alpha_2: 1
      }
    }).fetch()

    let _countryDict = [];

    if(_countryCodes && _countryCodes.length > 0) {
      _countryCodes.forEach((c) => {

        _countryDict[c.official_name_en] = {
          name: c.name,
          code: c.ISO3166_1_Alpha_2
        }
        _countryDict[c.name] = {
          name: c.name,
          code: c.ISO3166_1_Alpha_2
        }

      })
    }

    let 
      _removeTempDB = false,
      _processTempDB = true,
      _addToTempDB = true,
      _addToUsersTempDB = true;

    let _clientsData = {
      inVentiv: {
        _id: 'EGHYDswSwfjXktdjP',
        name: 'inVentiv',
        bus: {
          NA: {
            _id: 'EGHYDswSwfjXktdjP-1470499457014',
            name: 'NA'
          },
          EMEA: {
            _id: 'EGHYDswSwfjXktdjP-1470499533711',
            name: 'EMEA'
          },
          APAC: {
            _id: 'EGHYDswSwfjXktdjP-1470499621682',
            name: 'APAC'
          },
          LATAM: {
            _id: 'EGHYDswSwfjXktdjP-1470499637282',
            name: 'LATAM'
          }
        }
      }
    };

    //-- module_id to v2 simulation_id
    // let _modDataDict = [];
    //-- ? mod: 33,34,35 is for v1-cat 30, but, no v2 version of it?... 
    //-- ,so, this is not clear 
    // _modDataDict['m33'] = 9 //-- mod: 33,34,35, v1-cat: 30 <=> v2 sim 9 ?
    // _modDataDict['m42'] = 9 //-- mod: 42,43,44, v1-cat: 35 <=> v2 sim 9

    //-- assessment_category_id to v2 simulation_id
    let _asmtCatSimDataDict = [];
    _asmtCatSimDataDict['c30'] = {
      v1Simulation: {
        id: 30,
        name: 'US Baseline 2015'
      },
      v2Simulation: {
        id: 9,
        name: "Baseline-OA-NA--1",
        // bu_id: "EGHYDswSwfjXktdjP-1470499457014",
        // bu_name: "NA"
      }
    };

    //-- ? v1-31 (EAPA Baseline 2015), not clear, can be v2-10 (Baseline-OA-EAPA--1)
    //-- or, v2-30 (Baseline-OA-Global--1)...
    //-- interestingly, v1 user Vasily Borisov (2934) took both v1-31 (EAPA) 
    //-- and v1-35 (NA)...
    _asmtCatSimDataDict['c31'] = { //-- this can be only for Vasily Borisov - 2934...
      v1Simulation: {
        id: 31,
        name: 'EAPA Baseline 2015'
      },
      v2Simulation: {
        id: 10,
        name: "Baseline-OA-EAPA--1",
        // bu_id: "EGHYDswSwfjXktdjP-1470499533711",
        // bu_name: "EMEA"
      }
    };

    _asmtCatSimDataDict['c35'] = {
      v1Simulation: {
        id: 35,
        name: 'NA OA Baseline 2016'
      },
      v2Simulation: {
        id: 9,
        name: "Baseline-OA-NA--1",
        // bu_id: "EGHYDswSwfjXktdjP-1470499457014",
        // bu_name: "NA"
      }
    };

    _asmtCatSimDataDict['c36'] = { 
      v1Simulation: {
        id: 36,
        name: 'EAPA Baseline 2016'
      },
      v2Simulation: {
        id: 10,
        name: "Baseline-OA-EAPA--1"
      }
    };


    let output = Meteor.wrapAsync((args, callback) => {

      // V1UsersTemp.remove({});

      if(_removeTempDB) {
        // V1UsersTemp.remove({});
        V1UsersSummaryTemp.remove({});
        V1UsersDemographicTemp.remove({});
        V1AssessmentsTemp.remove({});
        V1SimUsersSummaryTemp.remove({});
      }

      // let 
        // rawUsers = V1UsersRaw.rawCollection(),
        // aggregateQueryUsers = Meteor.wrapAsync(rawUsers.aggregate, rawUsers);

      let pipelineUsers = 
      [
        {
          $match: {
            group_id: 6,
            assigned_module: { $ne: null },
            // company_name: { $ne: 'Demo' }
            company_name: { $regex: 'inVentiv' }
          }
        },
        {
          $lookup: {
            from: "v1_inventiv_users_temp",
            // localField: "username.toLowerCase()",
            // foreignField: "UserID.toLowerCase()",
            // localField: "email",
            // foreignField: "Email",
            localField: "username",
            foreignField: "UserID",
            as: "inv"          
          }
        },
        {
          $unwind: "$inv"
        },
        {
          $sort: {'Simulation Completed': -1}
        },
        // {
        //   $unwind: {
        //     path: '$inv',
        //     preserveNullAndEmptyArrays: true
        //   }          
        // },
        // {
        //   $group: {
        //     _id: "$inv.UserID"
        //   }
        // },        
        // {
        //   $match: {
        //     "inv.BU": 'NA'
        //   }
        // },
        {
          $lookup: {
            from: "v1_assessments_raw",
            localField: "id",
            foreignField: "user_id",
            as: "asmt"          
          }
        },
        {
          $unwind: "$asmt"
        },        
        // {
        //   $unwind: {
        //     path: '$asmt',
        //     preserveNullAndEmptyArrays: true
        //   }          
        // },
        {
          $group: {
            // _id: "$id",
            _id: {              
              username: "$inv.UserID",
              asmtUserId: "$asmt.user_id",
              // asmtCatId: "$asmt.assessment_category_id",
            },
            assessments: {
              $push: "$asmt"
            },
            userData: {
              $push: "$inv"
            },
            v1UserId: { $first: "$id" },
            fname: { $first: "$fname" },
            lname: { $first: "$lname" },
            email: { $first: "$email" },
            username: { $first: "$username" },
            company: { $first: "$company_name" },
            modules: { $first: "$assigned_module" },
            createdAt: { $first: "$created" },
            lastLogin: { $first: "$last_login" },
            startedAt: { $first: "$start_date" },
            endedAt: { $first: "$end_date" },
            bu: { $first: "$inv.BU" },
            userGroup: { $first: "$inv.Group" },
            country: { $first: "$inv.Country" },
            title: { $first: "$inv.Job Title" },
            reportDue: { $first: "$inv.Report Due" },
            reportSent: { $first: "$inv.Report Sent" }          
          }
        },
        {
          $project: {
            // _id: 0,
            // v1UserId: "$id",
            // v1UserId: "$_id.asmtUserId",
            asmtCatId: "$asmtCatId",
            v1UserId: "$v1UserId",
            fname: "$fname",
            lname: "$lname",
            email: "$email",
            username: "$username",
            company: "$company",
            modules: "$modules",
            createdAt: "$createdAt",
            lastLogin: "$lastLogin",
            startedAt: "$startedAt",
            endedAt: "$endedAt",
            bu: "$bu",
            userGroup: "$userGroup",
            country: "$country",
            title: "$title",
            reportDue: "$reportDue",
            reportSent: "$reportSent",            
            assessments: "$assessments",
            userData: "$userData"
            // assessments: {
            //   $push: {
            //     asmtId: "$asmt.id",
            //     modId: "$asmt.module_id",
            //     asmtCatId: "$asmt.assessment_category_id",
            //     allocatedTime: "$asmt.allocated_time",
            //     pauseTime: "$asmt.pause_time",
            //     status: "$asmt.status",
            //     scoringStatus: "$asmt.scoring_status",
            //     created: "$asmt.created",
            //     modified: "$asmt.modified"
            //   }
            // },
            // assessments: [ "$asmt.module_id","$asmt.pause_time","$asmt.created" ]
          }
        },
        {
          $sort: { "v1UserId": 1 }
        }       
      ];

      // let _users = aggregateQueryUsers(pipelineUsers)
      let _users = Promise.await(V1UsersRaw.rawCollection().aggregate(pipelineUsers).toArray());

      // callback(null, {success: true, data: _users})

    // })

      // let result = output('dk');

      let 
        _usersDict = [],
        _userInitialDict = [];

      if(_users && _users.length > 0) {

        _users.forEach((u, i) => {

          // _userInitialDict[u.username] = 'v1' + i;
          _userInitialDict[u.username] = 'v1' + u.v1UserId;

          let
            _v2ClientId = _clientsData[u.company]._id,
            _v2ClientName = _clientsData[u.company].name,
            _v2BUId = _clientsData[u.company].bus[u.bu]._id,
            _v2BUName = _clientsData[u.company].bus[u.bu].name;

          let 
            _v2Sims = [],
            _v2Sids = [],
            _v2SimDict = [];

          if(u.assessments && u.assessments.length > 0) {
            u.assessments.forEach((a) => {
              let 
                _sKey = 'c' + a.assessment_category_id,
                _v2SimObj = _asmtCatSimDataDict[_sKey].v2Simulation;

              if(!_v2SimDict[_sKey]) {
                let _simObj = {
                  id: _v2SimObj.id,
                  name: _v2SimObj.name,
                  checked: true,
                  duration: '24:00:00',
                  client_id: _v2ClientId,
                  bu_id: _v2BUId,
                  userGroup: u.userGroup,
                  startedAt: new Date(u.startedAt) || null,
                  submittedAt: new Date(u.endedAt) || null,
                  publishedAt: new Date(u.reportSent) || null
                }

                _v2Sims.push(_simObj);
                _v2Sids.push(_v2SimObj.id);

                _v2SimDict[_sKey] = 'done';
              }
            })
          }

          let _uObj = {
            createdAt: new Date(u.createdAt),
            username: u.username,
            emails: [ { address: u.email, verified: true }],
            services: { 
              password: { bcrypt: "$2a$10$WIrlWxYXEEHN4in.YcUBf.GBcQ9.Q84thioJ6tf1Um.4cBAHB31/e" },
              email: {
                // verificationTokens: [],
                verifiedAt: new Date(u.createdAt),
                activatedAt: new Date(u.createdAt)
              }
            },
            profile: {
              id: u.v1UserId, 
              firstname: u.fname,
              lastname: u.lname,
              fullname: u.fname + ' ' + u.lname,
              role: '6',
              status: 2,
              v1: true,
              initial: _userInitialDict[u.username],
              verifiedAt: new Date(u.createdAt),
              activatedAt: new Date(u.createdAt),
              lastLogin: new Date(u.lastLogin),
              clients: [
                {
                  // _id: _clientsData.inVentiv._id,                  
                  // name: _clientsData.inVentiv.name,
                  _id: _v2ClientId,
                  name: _v2ClientName,
                  status: 1,
                  bus: [
                    {
                      _id: _v2BUId,
                      name: _v2BUName,
                      isBUChecked: true,
                      status: 1,
                      simulations: _v2Sims
                      // simulations: [
                      //   {
                      //     id: 9,
                      //     name: 'Baseline-OA-NA--1',
                      //     checked: true,
                      //     duration: '24:00:00',
                      //     client_id: _clientsData.inVentiv._id,
                      //     bu_id: _clientsData.inVentiv.bus.NA._id,
                      //     userGroup: u.userGroup,
                      //     startedAt: new Date(u.startedAt) || null,
                      //     submittedAt: new Date(u.endedAt) || null,
                      //     publishedAt: new Date(u.reportSent) || null
                      //   }
                      // ]
                    }
                  ]
                }
              ],
              // tempTag: _v2BUId //-- tag to filter this record later
              tempTag: '1011135602' //-- tag to filter this record later
            }
          } //-- let _uObj = {

          // console.log(_uObj)
          // console.log(i, _users.length)

          // let _nUID = V1UsersTemp.upsert(_uObj, {
          //   multi: true
          // });

          let _nUID = null;

          // if(_addToTempDB && _addToUsersTempDB) {
          if(_addToUsersTempDB) {
// 
            _nUID = V1UsersTemp.upsert({
              username: u.username
            }, 
            // {
              // $setOnInsert: {
              //   // 'profile.tempTag': '10112018_131039'
              //   'tempTag': '10112018_131039'
              // }
            // },
            {
              $set: _uObj
            });

            // _nUID = V1UsersTemp.update({
            //   username: u.username
            // }, 
            // {
            //   $setOnInsert: {
            //     'tempTag': '10112018_131039'
            //   }
            // },
            // {
            //   $set: _uObj
            // }, {
            //   upsert: true
            // });

          }

          // console.log(_nUID, u.username);
          // console.log(_nUID, u.username);

          if(_nUID && _nUID.insertedId && _processTempDB) {
          // if(_nUID && _processTempDB) {

            // let _countryCode = null;
            // if(u.country === 'Canada') {
            //   _countryCode = 'CA';
            // }

            let _countryObj = {name: null, code: null};

            if(_countryDict[u.country]) {
              _countryObj.name = _countryDict[u.country].name;
              _countryObj.code = _countryDict[u.country].code;
            }
          
            // u['countryCode'] = _countryCode

            //-- V1UsersSummaryTemp obj
            let _usObj = {
              userId: _nUID.insertedId,
              accountCreatedAt: new Date(u.createdAt),
              createdAt: new Date(u.createdAt),
              username: u.username,
              // client: 'inVentiv-NA<br>',
              client: _v2ClientName+'-'+_v2BUName+'<br>',
              lastname: u.lname,
              firstname: u.fname,
              fullname: u.fname + ' ' + u.lname,
              email: u.email,
              initial: _userInitialDict[u.username],
              roleKey: '6',
              roleName: 'simUser',
              status: 'Inactive',
              buIds: [_v2BUId],
              sIds: [_v2Sids],
              country: u.country,
              code: u.countryCode,
              // clientIdNum: 
              regionName: u.userGroup.toString(),
              v1: true
            }

            if(_addToTempDB) {
              V1UsersSummaryTemp.upsert({
                userId: _nUID.insertedId
              }, {
                $set: _usObj
              })
            }

            let _udObj = {
              uid: _nUID.insertedId,              
              createdAt: new Date(u.createdAt),
              country: {
                // code: u.countryCode,
                // name: u.country
                code: _countryObj.code,
                name: _countryDict.name                
              },
              // eu: EUCountries.includes(u.countryCode),
              eu: EUCountries.includes(_countryObj.code),
              v1: true
            }

            if(_addToTempDB) {
              V1UsersDemographicTemp.upsert({
                uid: _nUID.insertedId
              }, {
                $set: _udObj
              })
            }

            if(!_usersDict[u.username]) {
              _usersDict[u.username] = {};

              if(u.assessments && u.assessments.length > 0) {
                
                let 
                  _asmtData = [],
                  _asmtCatDict = [];

                u.assessments.forEach((a, i) => {
                  let 
                    _asmtCatId = a.assessment_category_id,
                    _catKey = 'c' + _asmtCatId;

                  if(!_asmtCatDict[_catKey]) {
                    _asmtCatDict[_catKey] = [];

                    _asmtCatDict[_catKey]['createdAt'] = new Date(a.created);

                    _asmtCatDict[_catKey]['durationRaw'] = Util.hms2seconds(a.allocated_time);
                    _asmtCatDict[_catKey]['duration'] = a.allocated_time;

                    _asmtCatDict[_catKey]['pauseTimeRaw'] = Util.hms2seconds(a.pause_time);
                    _asmtCatDict[_catKey]['pauseTime'] = a.pause_time;

                    let _timeSpent = _asmtCatDict[_catKey]['durationRaw'] - _asmtCatDict[_catKey]['pauseTimeRaw'];

                    let 
                      _createdArr = a.created.split(' '),
                      _createdDate = _createdArr[0],
                      _createdTime = _createdArr[1],
                      _createdTimeSeconds = Util.hms2seconds(_createdTime),
                      _createdTimeDiff = _createdTimeSeconds - _timeSpent;

                    // let _nDateTime = new Date(new Date(a.created).getTime() / 1000 - _timeSpent)
                    let _nDateTime = new moment(new Date(a.created)).unix()

//                     if(a.user_id === 2923) {
// // let _nT = new Date(a.created).getTime() / 1000 - _timeSpent;
// // var t = new Date(1970, 0, 1); // Epoch
// //     t.setSeconds(_nT);
// //                       console.log(_asmtCatId, new Date(a.created), _timeSpent, _nDateTime, t)
// let _now = new Date();
// let _nowTime = new moment(_now).unix()
//                       console.log(_nDateTime, _nowTime, _nDateTime - _timeSpent, new moment.unix(_nDateTime - _timeSpent))
//                     }

                    //-- v1 doesn't have 'startedAt' date data, let's measure it roughly with the creation date of 
                    //-- the 1st assessment data and sim time to complete (from duration and pause_time data) here
                    //-- per assessment_category (= simulation in v2)
                    // _asmtCatDict[_catKey]['startedAt'] = new moment.unix(_nDateTime - _timeSpent);
                    _asmtCatDict[_catKey]['startedAt'] = (new moment.unix(_nDateTime - _timeSpent)).toDate();
                    
                    _asmtCatDict[_catKey]['submittedAt'] = new Date(a.created);

                  } else {

                    //-- keep overwriting these until it gets the last one as v2 doesn't have a module system 
                    //-- and thus, should have all modules data in one...

                    _asmtCatDict[_catKey]['durationRaw'] += Util.hms2seconds(a.allocated_time);
                    _asmtCatDict[_catKey]['duration'] = Util.secondsToHMS(_asmtCatDict[_catKey]['durationRaw']);

                    _asmtCatDict[_catKey]['pauseTimeRaw'] += Util.hms2seconds(a.pause_time);
                    _asmtCatDict[_catKey]['pauseTime'] = Util.secondsToHMS(_asmtCatDict[_catKey]['pauseTimeRaw']);

                    _asmtCatDict[_catKey]['submittedAt'] = new Date(a.created);

                    _asmtCatDict[_catKey]['modifiedAt'] = new Date(a.modified);
                  }

                  //-- V1AssessmentsTemp obj
                  let _asmtTempObj = {
                    assessee_id: _nUID.insertedId,
                    // client_id: _clientsData.inVentiv._id,
                    client_id: _v2ClientId,
                    // bu_id: _clientsData.inVentiv.bus.NA._id,
                    bu_id: _v2BUId,
                    v1_simulation: _asmtCatSimDataDict[_catKey].v1Simulation,
                    simulation: _asmtCatSimDataDict[_catKey].v2Simulation,
                    // createdAt: new Date(u.endedAt),
                    createdAt: _asmtCatDict[_catKey]['createdAt'],
                    modifiedAt: _asmtCatDict[_catKey]['modifiedAt'],
                    startedAt: _asmtCatDict[_catKey]['startedAt'],
                    submittedAt: _asmtCatDict[_catKey]['submittedAt'],
                    duration:  _asmtCatDict[_catKey]['duration'],
                    timer: _asmtCatDict[_catKey]['pauseTime'],
                    pauseTimeRaw: _asmtCatDict[_catKey]['pauseTimeRaw'],
                    status: a.status,
                    assessor1: {
                      scored: true,
                      scoredAt: new Date(a.modified)
                    },
                    assessor2: {
                      scored: true,
                      scoredAt: new Date(a.modified)
                    },
                    adjudicator: {
                      scored: true,
                      scoredAt: new Date(a.modified)
                    },
                    v1UserId: a.user_id,
                    v1: true                            
                  };

// if(a.user_id === 2923) {
//   console.log((_catKey, _asmtObj))
// }
                  _asmtData[_catKey] = _asmtTempObj;

                }) //-- u.assessments.forEach((a, i) => {

                Object.keys(_asmtData).forEach((key) => {

                  let 
                    _asmtDataObj = _asmtData[key],
                    _asmtRes = null;

// console.log(_asmtDataObj)

// if(_asmtDataObj.v1UserId === 2923) {
//   console.log((_asmtDataObj))
// }
                  if(_addToTempDB) {
                  
                    // V1AssessmentsTemp.upsert({
                    //   assessee_id: _nUID.insertedId,
                    //   client_id: _asmtDataObj.client_id,
                    //   bu_id: _asmtDataObj.bu_id,
                    //   simulation_id: _asmtDataObj.simulation.id
                    // }, {
                    //   $set: _asmtDataObj
                    // });

                    _asmtRes = V1AssessmentsTemp.findAndModify(
                    {
                      "query": {
                            assessee_id: _nUID.insertedId,
                            client_id: _asmtDataObj.client_id,
                            bu_id: _asmtDataObj.bu_id,
                            simulation_id: _asmtDataObj.simulation.id.toString()
                      },
                      update: {
                        $set: _asmtDataObj
                      },
                      upsert: true,
                      new: true
                    });

                  }

                  let _susObj = {
                    userId: _nUID.insertedId,
                    // clientId: _clientsData.inVentiv._id,
                    clientId: _v2ClientId,
                    // buId: _clientsData.inVentiv.bus.NA._id,
                    buId: _v2BUId,
                    simulationId: parseInt(_asmtDataObj.simulation.id),
                    accountCreatedAt: new Date(u.createdAt),
                    createdAt: new Date(u.createdAt),
                    // oStartedAt: '',
                    username: u.username,
                    clientName: 'inVentiv',
                    buName: 'NA',
                    simulationName: _asmtDataObj.simulation.name,
                    checked: true,
                    lastname: u.lname,
                    firstname: u.fname,
                    fullname: u.fname + ' ' + u.lname,
                    email: u.email,
                    initial: _userInitialDict[u.username],
                    roleKey: '6',
                    roleName : 'simUser', 
                    userGroup : u.userGroup, 
                    emailVerifiedAt : new Date(u.createdAt), 
                    lastLogin : new Date(u.lastLogin), 
                    // managerId : , 
                    // managerName : , 
                    duration : _asmtDataObj.duration, 
                    pauseTime: _asmtDataObj.timer,
                    pauseTimeRaw: _asmtDataObj.pauseTimeRaw, 
                    startedAt : _asmtDataObj.startedAt, 
                    oStartedAt : _asmtDataObj.startedAt, 
                    // reopenedAt : , 
                    submittedAt : _asmtDataObj.submittedAt, 
                    publishedAt : new Date(u.reportSent), 
                    // exportedAt : , 
                    // retractedAt : , 
                    simStatus : 'Completed', 
                    resultStage : 'Published', 
                    scorer1Id : '5gxb6JXzsjqFjzQ6X', 
                    scorer2Id : 'g2kNYB8NqWCMGQfCy', 
                    adjudicatorId : 'ijJLem9JDoewsua5o', 
                    scorer1Name : 'Olesia Cherneta', 
                    scorer2Name : 'Akshay Shah', 
                    adjudicatorName : 'Gerald DeWolfe', 
                    scorer1Status : 'Scored', 
                    scorer2Status : 'Scored', 
                    // adjudicatorStatus : , 
                    status : 'Inactive', 
                    // dumped : , 
                    // modifiedAt : ISODate(2018-05-31T10:22:55.275-0500), 
                    // country : u.country, 
                    // code : u.countryCode,
                    country : _countryObj.name, 
                    code : _countryObj.code,                    
                    // clientIdNum : , 
                    // distributedAt: new Date(u.reportSent, 
                    online : false,
                    v1: true,
                    v1UserId: u.v1UserId,
                    v1Sim: _asmtDataObj.v1_simulation,
                    // v1UserId: 
                    assessmentId: _asmtRes._id                    
                  }
    
// if(_asmtDataObj.v1UserId === 2923) {
//   console.log((_susObj))
// }

                  if(_addToTempDB) {
                    V1SimUsersSummaryTemp.upsert({
                      userId: _nUID.insertedId,
                      clientId: _asmtDataObj.client_id,
                      buId: _asmtDataObj.bu_id,
                      simulationId: parseInt(_asmtDataObj.simulation.id)
                    }, {
                      $set: _susObj
                    });
                  }


                  if(i === 100) { //-- randomly picked sampel user
                    // console.log(i, _users.length)

                    console.log("usObj => ", _usObj)
                    console.log("demogObj => ", _udObj)
                    console.log("asmtObj => ", _asmtDataObj)
                    console.log("susObj => ", _susObj)

                  }

                }) //-- Object.keys(_asmtData).forEach((key) => {
// 
//                 if(i === 100) { //-- randomly picked sampel user
//                   // console.log(i, _users.length)
// 
//                   console.log("usObj => ", _usObj)
//                   console.log("demogObj => ", _udObj)
//                   console.log("asmtObj => ", _asmtDataObj)
//                   console.log("susObj => ", _susObj)
// 
//                 }

              } //-- if(u.assessments && u.assessments.length > 0) {

            } //-- if(!_usersDict[u.username]) {
            



//             let _asmtObj = {
//               assessee_id: _nUID.insertedId,
//               client_id: _clientsData.inVentiv._id,
//               bu_id: _clientsData.inVentiv.bus.NA._id,
//               simulation_id: '9',
//               createdAt: new Date(u.endedAt),
//               duration: '24:00:00',
//               timer:
//               status: 
//               assessor1: {
//                 scored: true,
//                 scoredAt: 
//               },
//               assessor2: {
//                 scored: true,
//                 scoredAt: 
//               },
//               adjudicator: {
//                 scored: true,
//                 scoredAt: 
//               }                            
//             };
// 
//             V1AssessmentsTemp.upsert({
//               assessee_id: _nUID.insertedId
//             }, {
//               $set: _asmtObj
//             })

          } //-- if(_nUID.insertedId) {

          if(i === _users.length -1) {
            // console.log(i, _users.length)
            callback(null, {success: true, data: _users})
          }
        
        }) //-- result.data.forEach((u) => {
        
      } //-- if(result && result.data && result.data.length > 0) {

    }) //-- let output = Meteor.wrapAsync((args, callback) => {

    let result = output('dk');

    if(result) {
      return result
    }
  },
})
