// import { WebApp } from 'meteor/webapp'

Meteor.startup(() => {
  
  // liveDb = new LiveMysql(Meteor.settings.mysql);

  // closeAndExit = function() {
  //   liveDb.end();
  //   process.exit();
  // };

  // // Close connections on hot code push
  // process.on('SIGTERM', closeAndExit);
  // // Close connections on exit (ctrl + c)
  // process.on('SIGINT', closeAndExit);

// WebApp.rawConnectHandlers.use(function(req, res, next) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   return next();
// });

  smtp = {
    //--  Signature Version 2 (expires on 03/27/2021)
    // username: 'AKIAIISDBEKJBKAD2ITA',
    // password: 'AjxG13bLoS2V1llpFVcDFx/7BuISOYgW/R5461KoO09U',
    //- Signature Version 4
    username: 'AKIATT3YAI4A3KQEWZX5',
    password: 'BC5xjs27J1sFATfrIQ6PQ3naPySJb4euAt6+hlpKxrD3',    
    // server:   'tls://email-smtp.us-east-1.amazonaws.com',
    server:   'email-smtp.us-east-1.amazonaws.com',
    port: 465
  } 

 let email_from = "CRA Assessments <admin@craassessments.com>";
  // let email_from = "DK Test <david.qwk@gmail.com>";

  process.env.MAIL_URL = 'smtps://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
    
  process.env.HTTP_FORWARDED_COUNT = 1; //-- To get the correct ip address, otherwise it'll be 172.17.0.3
    
  Accounts.urls.verifyEmail = function(token){
    return Meteor.absoluteUrl("_verify/" + token + '/rlarbDhKs/' + Date.now());
  };

  let notiVerification = EmailTemplates.findOne({
    key: 'email-verification',
    status: 2
  }, {
    sort: {modifiedAt: -1}
  });

  Accounts.emailTemplates.from = (notiVerification && notiVerification.email_from) ? notiVerification.email_from : email_from;
  Accounts.emailTemplates.siteName = "CRA Assessments";

  var emailVerificationSubject = (notiVerification && notiVerification.email_subject) ? notiVerification.email_subject : "Confirm Your Email Address for CRAAssessments.com";
  
  Accounts.emailTemplates.verifyEmail.subject = function(user) {
    return emailVerificationSubject;
  };

  Accounts.emailTemplates.verifyEmail.html = function(user, url) {
      var emailVerificationText = (notiVerification && notiVerification.email_body) || "Dear " + user.profile.fullname + ',\r\n\r\n' + 'Thank you for registering. \r\n\r\n Please click on the following link to verify your email address:'  + '\r\n\r\n' + '${verification_link}';
      var obj = {
        firstname: user.profile.firstname,
        lastname: user.profile.lastname,
        fullname: user.profile.fullname,
        username: user.username        
      };

      var nUrl = '';
      // var nUrl = url.replace(/http:\/\/.*?\./, 'app');
      var arrUrl1 = url.split("//");
      var arrUrl2 = arrUrl1[1].split("/");
      // var arrUrl = arrUrl1[1].split('.');
      var arrUrl = arrUrl2[0].split('.');
      var nodeName = arrUrl[0];
      // if(myAbsUrl.indexOf('3200') !== -1 && (nodeName === 'app' || nodeName === 'app1' || nodeName === 'app2' || nodeName === 'app3' || nodeName === "admin" || nodeName === "demo")) {
      
      nUrl = 'https://app.craassessments.com/' + arrUrl2[1] + '/' + arrUrl2[2] + '/' + arrUrl2[3] + '/' + arrUrl2[4];         
    
      var verificationText = emailVerificationText.replace(/(\{)(.+?)(\})/g, function(match, $1, $2, offset, emailVerificationText) {
        return ($2 === 'verification_link') ? nUrl : obj[$2];
      });      
      // console.log("verificationText", user, verificationText);  

      // return emailVerificationText;
      return verificationText;
  };

  Accounts.config({
    sendVerificationEmail: true
  });

});
