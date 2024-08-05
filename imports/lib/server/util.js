if(Meteor.isServer) {

export const Util = {
  // call(...args) {
  revisionCall(category, method, revisionObj, ...args) {
    
    return Meteor.call(method, revisionObj)
  },
  dateHMS2(date) {
    if(date) {
        return (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear() + ' ' +
            ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + 
            ("0" + date.getSeconds()).slice(-2);
    }
  },
  tzOffset() {
    var offset = new Date().getTimezoneOffset();
    offset = ((offset < 0 ? '+' : '-')
          + this.tzPad(parseInt(Math.abs(offset / 60)), 2)
          + this.tzPad(Math.abs(offset % 60), 2));
    return offset;    
  },
  tzPad: function(number, length) {
    var str = '' + number;
    while (str.length < length) {
      str = '0' + str;
    }

    return str;
  },
  tzOffsetDate(date) {
    let offsetDate = date.setTime(date.getTime() + 36000 * parseInt(this.tzOffset()));
    
    return new Date(offsetDate * 1000)
  },
  trainingModuleLabels() {

      let _trainingModuleLabels = [
          '', //- 0
          'The Informed Consent Process', //-- 1
          '', //-- 2
          'Protocol Review', //-- 3
          'IRB/IEC Submission and Approval', //-- 4
          'Source Documentation, CRF, Source-to-CRF Review', //-- 5
          'Source Documentation, CRF, Source-to-CRF Review', //-- 6
          'Potential Fraud, Scientific Misconduct and Delegation of Authority', //-- 7
          'Delegation of Authority', //-- 8
          'Delegation of Authority and Training', //-- 9
          'Source Documentation/Source to EDC/EDC', //-- 10
          'Potential Fraud/Scientific Misconduct' //-- 11
      ]

      return _trainingModuleLabels
  },        
  getTrainingModules(objDomain, cid, trainingModules) {
      let 
          rDomains = [],
          assign = false,
          trMods = trainingModules        
      
      //-- Quintiles: below 60, Pharm-Olam: 50 and below
      let threshold = cid === 'NygCQPeRCx2zhdxov' ? 51 : 60

      Object.keys(objDomain).forEach(function(d) {
          var domain_id = objDomain[d].id,
              identified = objDomain[d].identified,
              domain_name = objDomain[d].name,
              percent_identified = objDomain[d].percent_identified,
              total = objDomain[d].total,
              not_identified = objDomain[d].not_identified;                    

          // var aObj = [d, percent_identified, identified, not_identified, total];
          // aDomain.push(aObj);

          // var objOld = {
          //     category_id: domain_id,
          //     identified: identified,
          //     name: domain_name,
          //     percent: percent_identified+'%',
          //     total: total,
          //     unidentified: not_identified
          // };

          // data2Export.categoryScore.push(objOld);

          let 
              _percent = parseInt(percent_identified),
              rObj = [domain_id, _percent, identified, total, false, trMods[domain_id]]

          //-- 1 ICF Process
          if(domain_id === 1) {
              rDomains[0] = rObj //-- robj = [1, percent, num_identified, num_total, true|false, TR_MODULE_NAME]
          }

          //-- 3 Protocol Requirement
          else if(domain_id === 3) {
              rDomains[1] = rObj //-- robj = [3, percent, num_identified, num_total, true|false, TR_MODULE_NAME]
          }

          //-- 4 IRB Submission/Approval
          else if(domain_id === 4) {
              rDomains[2] = rObj //-- robj = [4, percent, num_identified, num_total, true|false, TR_MODULE_NAME]
          }

          //-- 5 Source Documentation, 6 Source to EDC/EDC
          else if(domain_id === 5 || domain_id === 6) {
              if(rDomains[3] && rDomains[3][0] !== '') {
                  let 
                      _identified = identified + rDomains[3][2],
                      _total = total + rDomains[3][3];
                  
                  let rPercent = Math.round(_identified/_total*100)

                  rDomains[3][1] = rPercent
              } else {
                  rDomains[3] = rObj  //-- robj = [5|6, percent, num_identified, num_total, true|false, TR_MODULE_NAME]
              }                    
          }

          //-- 7 Potential Fraud, 8 Delegation of Authority, 11 Potential Fraud/Scientific Misconduct
          else if(domain_id === 7 || domain_id === 8 || domain_id === 11) {
              if(rDomains[4] && rDomains[4][0] !== '') {
                  let 
                      _identified = identified + rDomains[4][2],
                      _total = total + rDomains[4][3];
                  
                  let rPercent = Math.round(_identified/_total*100)

                  rDomains[4][1] = rPercent
              } else {
                  rDomains[4] = rObj //-- robj = [7|8|11, percent, num_identified, num_total, true|false, TR_MODULE_NAME] 
              }                                       
          } 
          //-- Domains not used
          //-- 2 IRB Reporting (no training module)
          //-- 9 Delegation of Authority and Training, for sim 23, 24 that were only for Bayer
          //-- 10 Source Documentation/Source to EDC/EDC, for sim 31 (Gaout) that was only for DCRI        

      }); 

      let 
          _domains = [],
          _moduleIds = []

      let _trModuleIds = [
          null,
          'Qt8ZvpFDjpgsukvxx', //-- 1 The Informed Consent Process
          null, //-- 2 IRB Reporting (no training module)
          'HJShtX3mcichFEhjc', //-- 3 Protocol Review 
          'x6YTXCxZpiGNjZWpg', //-- 4 IRB/IEC Submission and Approval
          'GtNsWGrWYpsWFS7Kf', //-- 5, 6 Source Documentation, CRF, Source-to-CRF Review
          'GtNsWGrWYpsWFS7Kf', //-- 6
          'DPhkauJm23Zi3ntQr', //-- 7, 8, 11 Potential Fraud, Scientific Misconduct and Delegation of Authority              
          'DPhkauJm23Zi3ntQr', //-- 8
          null, //-- 9 Delegation of Authority and Training, for sim 23, 24 that were only for Bayer
          null, //-- 10 Source Documentation/Source to EDC/EDC, for sim 31 (Gaout) that was only for DCRI        
          'DPhkauJm23Zi3ntQr', //-- 7, 8, 11 Potential Fraud, Scientific Misconduct and Delegation of Authority              
      ]

      if(rDomains && rDomains.length > 0) { //-- Check if training is needed

          rDomains.forEach((r) => {
              // if(r[1] && r[1] < threshold) { //-- issue! when r[1] is 0, it's considered as 'undefined' 
              //--and nothing happens, so, don't go with this condition

              if(r[1] >= 0 && r[1] < threshold) { //-- r[1] is percent, so, it should be r[1] >= 0 to go through the process
                  assign = true
                  let _modId = r[0] //-- r[0] is the domain_id, which works as the index of _trModuleIds array

                  _domains.push(_modId)
                  if(_trModuleIds[_modId]) {
                      _moduleIds.push(_trModuleIds[_modId])
                  }

                  r[4] = true
              }
          })

          _domains.unique()
          _moduleIds.unique()
      }

      // console.log(rDomains)

      return {
          scores: rDomains, //-- format:rObj: [domain_id, _percent, identified, total, true|false, TR_MODULE_NAME]
          assign: assign,
          domains: _domains,
          modules: _moduleIds,
          numModules: _moduleIds.length,
          createdAt: new Date
      }
  },
  findingsDiff(source, target) {
    if(source && target) {
      // console.log(source, target)
      source = [...new Set(source)];
      target = [...new Set(target)];
      let diff =  source.filter(f => !target.includes(f)).concat(target.filter(f => !source.includes(f)))

      return diff
    }
  },  
  findingsDiff0(source, target) {
    if(source && target) {
      // console.log(source, target)
      let diff =  source.filter(f => !target.includes(f)).concat(target.filter(f => !source.includes(f)))

      return diff
    }
  },
  diffDates(date1, date2) {
    // get total seconds between the times
    let delta = Math.abs(date2 - date1) / 1000;

    // calculate (and subtract) whole days
    let days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // calculate (and subtract) whole hours
    let hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    // calculate (and subtract) whole minutes
    let minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    // what's left is seconds
    // let seconds = delta % 60; 
    let seconds = Math.round(delta % 60); 

    days = days < 10 ? '0'+days : days
    hours = hours < 10 ? '0'+hours : hours
    minutes = minutes < 10 ? '0'+minutes : minutes
    seconds = seconds < 10 ? '0'+seconds : seconds

    return days + ':' + hours + ':' + minutes + ':' + seconds
   },
  diffDatesRawMS(date1, date2) {
    // get total seconds between the times
    let delta = Math.abs(date2 - date1) / 1000;

    // calculate (and subtract) whole days
    let days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // // calculate (and subtract) whole hours
    let hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    // calculate (and subtract) whole minutes
    let minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    // what's left is seconds
    // let seconds = delta % 60; 
    let seconds = Math.round(delta % 60); 

    return {d: days, h: hours, m: minutes, s: seconds}
   }, 
  diffDatesRawS(date1, date2) {
    let 
      dif = new Date(date1).getTime() - new Date(date2).getTime(),
      difSecs = dif / 1000

    return Math.abs(difSecs)
   },     
  diffDates2(date1, date2) {
    // get total seconds between the times
    let delta = Math.abs(date2 - date1) / 1000;

    // calculate (and subtract) whole days
    let days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // calculate (and subtract) whole hours
    let hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    // calculate (and subtract) whole minutes
    let minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    // what's left is seconds
    let seconds = delta % 60; 
// console.log(date1, date2)
    hours += days *24

    return hours + ' ' + minutes + ' ' + seconds
   },     
   diffHMS(hms1, hms2) {
    var t1 = moment('05:34:01', "hh:mm:ss");
    var t2 = moment('20:44:44', "hh:mm:ss");
    var t3 = moment(t2.diff(t1)).format("hh:mm:ss");      
   },
  secondsToHMS(time) {
    if(time) {
      let 
        m = ~~(time / 60),
        s = time % 60,
        h = ~~(time / 3600);

      m = ~~((time % 3600) / 60);
      s = time % 60;

      let t = "";

      t += (h < 10 ? "0" : "") + h + ":";
      t += (m < 10 ? "0" : "") + m + ":";
      t += (s < 10 ? "0" : "") + s;

      return t;
    }        
  },  
  hms2seconds(hms) {
    if(hms) {
      var aT = hms.split(':'),            
          rawT = (parseInt(aT[0])*3600)+(parseInt(aT[1])*60)+parseInt(aT[2]);             

      return parseInt(rawT);  
    }    
  },
  hms2Time(hms) {
      var aT = hms.split(':'),            
          rawT = (parseInt(aT[0])*3600)+(parseInt(aT[1])*60)+parseInt(aT[2]);             

      return parseInt(rawT);      
  },
  timeSpent(t1, t2) {

    if(t1 && t2) {

      var t1 = (t1 instanceof Array) ? t1[0] : t1;
      var t2 = (t2 instanceof Array) ? t2[0] : t2;
    
      var aT1 = t1.split(':'),
            aT2 = t2.split(':'),
            rawT1 = (parseInt(aT1[0])*3600)+(parseInt(aT1[1])*60)+parseInt(aT1[2]),
            rawT2 = (parseInt(aT2[0])*3600)+(parseInt(aT2[1])*60)+parseInt(aT2[2]);

        var spentT = (rawT1 < rawT2) ? (rawT2 - rawT1) : (rawT1 - rawT2);           

        return spentT;
      }    
    },    
    timeSpentHMS(t1, t2) {

      if(t1 && t2) {

        var t1 = (t1 instanceof Array) ? t1[0] : t1;
        var t2 = (t2 instanceof Array) ? t2[0] : t2;

        var aT1 = t1.split(':'),
            aT2 = t2.split(':'),
            rawT1 = (parseInt(aT1[0])*3600)+(parseInt(aT1[1])*60)+parseInt(aT1[2]),
            rawT2 = (parseInt(aT2[0])*3600)+(parseInt(aT2[1])*60)+parseInt(aT2[2]);

        var spentT = (rawT1 < rawT2) ? (rawT2 - rawT1) : (rawT1 - rawT2);           

        return this.secondsToHMS(spentT);   
      }  
    },
    uniqueObject(array, key) {
      if(array && array.length > 0) {
        let _array = []

        array.filter(function(x){
          let i = _array.findIndex(y => y[key] == x[key]);
          if(i <= -1){
                _array.push(x);
          }
          return null
        })

        return _array
      }   
    }            
}

}
