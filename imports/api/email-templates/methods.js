import { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js'

Meteor.methods({
  "ResultDistributionNotification"() {
    // this.unblock()

    if(process.env.NODE_ENV === "production") {

      let output = Meteor.wrapAsync((args, callback) => {

        let _noti = EmailTemplates.findOne({
            key: 'assessee-distribute-notification',
            status: 2
        });

        if(_noti) { //-- having a published Email template for this should be the key condition to activate this

          //-- This logic is for sending Result Dist Noti to sim users at 7 am(EST = 11 AM (UTC)) every day 
          let 
            today = new Date(),
            weekend = today.getDay() === 6 || today.getDay() === 0,
            monday = today.getDay() === 1          

          if(!weekend) { //-- to send noti out only on weekdays

            let retroStartDays = monday ? 9 : 7 //-- so, on Mondays, it should cover two more days, Saturday and Sunday
            // let retroStartDays = monday ? 19 : 7 //-- just for test purpose

            let 
              lastWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - retroStartDays),
              lastWeekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
              // lastWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
              // lastWeekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),              
              start = new Date(lastWeekStart.setHours(00,0,0,0)), //-- 11 AM (UTC) will be 7 AM (EST), 6 AM (CST) 
              end = new Date(lastWeekEnd.setHours(23,59,59,999))

            // console.log(start, end)

            let _sus = SimUsersSummary.find({
              buId: { $in: ['Z4aoaSWLtxRvyv4oz-1500472855226', 'Z4aoaSWLtxRvyv4oz-1485966888472'] }, //-- Quintiles-NA and Q-AA
              distributedAt: { $gte: start, $lte: end },
              // distNotifiedAt: { $exists: false } //-- this cond can be tricky when 'distributed' is reverted
            }).fetch()
// console.log(_sus)
            let result = [], i = 0;
            if(_sus && _sus.length > 0) {
              
              _sus.forEach((s) => {

                let _objTPTag = {
                    email: s.email,
                    fullname: s.fullname              
                    // SimulationName: 
                };

                let _bodyText = _noti.email_body.replace(/(\{)(.+?)(\})/g, function(match, $1, $2, offset, body) {
                    if($2) {
                        // return ($2 === 'RecipientFullname') ? url : s[$2];
                      return _objTPTag[$2];
                    }
                });

                let _emailObj = {
                    from: _noti.email_from,
                    to: _objTPTag.email,                    
                    subject: _noti.email_subject,
                    html: _bodyText
                };

                  // Email.send({
                  //   to: "david.qwk@gmail.com",
                  //   from: "dqw.kim@gmail.com",                    
                  //   // replyTo: from,
                  //   subject: "Result/TR Noti",
                  //   html: "Noti log"
                  // });
                // console.log(_emailObj)

                if(process.env.NODE_ENV === "production") {
                  Email.send(_emailObj);
                }

                if(s.training && s.training.assign) {

                  let _notiTraining = EmailTemplates.findOne({
                      key: 'assessee-training-notification',
                      status: 2
                  });

                  if(_notiTraining) {

                    let _bodyTextTraining = _notiTraining.email_body.replace(/(\{)(.+?)(\})/g, function(match, $1, $2, offset, body) {
                        if($2) {
                            // return ($2 === 'RecipientFullname') ? url : obj[$2];
                            return _objTPTag[$2];
                        }
                    });

                    let _emailObjTraining = {
                      from: _notiTraining.email_from,
                      to: _objTPTag.email,                      
                      subject: _notiTraining.email_subject,
                      html: _bodyText
                    };

                    if(process.env.NODE_ENV === "production") {
                      Email.send(_emailObjTraining);
                    }

                  }

                } //-- if(s.training && s.training.assign)

                SimUsersSummary.update(s._id, {
                  $set: {
                    distNotifiedAt: new Date
                  }
                })

                result.push({name: s.fullname, email: s.email})

                i++

                if(i === _sus.length) {
                  callback(null, {data: result})
                }

              }) //-- _sus.forEach((s)


              if(process.env.NODE_ENV === "production") {
                  Email.send({
                    to: "david.kim@craassessments.com",
                    from: "admin@craassessments.com",
                    // replyTo: from,
                    subject: "Result/TR Noti",
                    html: "Noti log: " + _sus.length + ' cases'
                  });
              } else {
                  // Email.send({
                  //   to: "david.qwk@gmail.com",
                  //   from: "dqw.kim@gmail.com",                    
                  //   // replyTo: from,
                  //   subject: "Result/TR Noti",
                  //   html: "Noti log: " + _sus.length + ' cases'
                  // });                
              }              

            } //--  if(_sus && _sus.length > 0)
            else {
              callback(null, {data: []})
            }
            return result

          } //-- if(!weekend)
          else {
            callback(null, {data: []})
          }
        } //-- if(_noti)
        else {
          callback(null, {data: []})
        }
      }) //-- let output

      let result = output('dk')

      if(result) {
        return result
      }

    } //-- if(process.env.NODE_ENV === "production") {
  }
})
