/**
 * Common start-up logic block (server-side)
 */

// import fs from 'fs'

import { Meteor } from 'meteor/meteor';

// import { Logger }     from 'meteor/ostrio:logger';
// import { LoggerFile } from 'meteor/ostrio:loggerfile';

WebApp.rawConnectHandlers.use(function(req, res, next) {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, max-age=10000');
  res.setHeader('Cache-Control', 'no-cache; no-store; must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  // res.setHeader('Pragma', 'no-cache');
  next();
});

// if(process.env.NODE_ENV === "production") {
    // WebAppInternals.setBundledJsCssPrefix("https://d31jxypeda1vvh.cloudfront.net"); //-- ?this way, console warning 'integrity' issue is resolved
// }

// BrowserPolicy.content.allowOriginForAll("https://www.google-analytics.com")
// BrowserPolicy.content.allowOriginForAll("https://fonts.googleapis.com") //-- not working
// BrowserPolicy.content.allowDataUrlForAll() //-- for tge image logo in Dashboard

// const log = new Logger();
// Initialize and enable LoggerFile with default settings:
// (new LoggerFile(log)).enable();

Meteor.startup(function() {
    
    // console.log("Server::Meteor.log.file.path", Meteor.log.file.path);

    let _CDN_URL = CDN.get_cdn_url()

    BrowserPolicy.content.allowOriginForAll("https://www.google-analytics.com")
    BrowserPolicy.content.allowOriginForAll("https://www.google.com")
    BrowserPolicy.content.allowOriginForAll("https://www.gstatic.com") 
    BrowserPolicy.content.allowOriginForAll("https://stats.g.doubleclick.net")
    BrowserPolicy.content.allowOriginForAll("https://fonts.googleapis.com")
    BrowserPolicy.content.allowOriginForAll("https://fonts.gstatic.com")
    BrowserPolicy.content.allowOriginForAll("https://videos.sproutvideo.com")
    BrowserPolicy.content.allowOriginForAll("https://c.sproutvideo.com")
    BrowserPolicy.content.allowOriginForAll("https://www.screencast.com")
    BrowserPolicy.content.allowOriginForAll("https://api.tiles.mapbox.com/")
    BrowserPolicy.content.allowOriginForAll("https://rawgit.com/")
    BrowserPolicy.content.allowOriginForAll("https://www.fbi.gov/")
    // BrowserPolicy.content.allowOriginForAll("http://unpkg.com/timelines-chart")
    // BrowserPolicy.content.allowOriginForAll("https://code.jquery.com/")
    BrowserPolicy.content.allowOriginForAll("https://ipapi.co") //-- Meteor 1.8+ seems to need this(?)

    BrowserPolicy.content.allowOriginForAll("https://craa-scr-upload.s3.amazonaws.com/")
    BrowserPolicy.content.allowOriginForAll("https://cdn.plyr.io/")

    BrowserPolicy.content.allowFontDataUrl() //-- this is needed for the libs used inside Dashboard (eg. data:application/x-font-ttf)

    //-- this is critical to avoid 'unsafe-inline' issue, and, invoke 
    //-- converting meteor_runtime_config from inline to a 'src' based 
    //-- one (see, /imports/startup/server/index.js)
    // BrowserPolicy.content.disallowInlineScripts();
    // BrowserPolicy.content.disallowEval(); //-- handsontable breaks
    
    //-- on the other hand, this doesn't seem necessary when nginx site conf 
    //-- doesn't have 'unsafe-inline', so, commentize this, but need to take
    //-- care of all jquery.show/hide() cases to make console warnings disappear
    // BrowserPolicy.content.disallowInlineStyles();

    // if(process.env.NODE_ENV === "development") {        
        // BrowserPolicy.content.allowDataUrlForAll() //-- for the image logo or font?
        // BrowserPolicy.content.allowFontDataUrlForAll() //-- for the image logo or font?
    // } 

    if(_CDN_URL) {
        BrowserPolicy.content.allowOriginForAll(_CDN_URL)    
    }    

// var meteorRoot = fs.realpathSync( process.cwd() + '/../' );
// var publicPath = meteorRoot + '/web.browser/app/';

// console.log(publicPath) 
//-- /built_app/programs/web.browser/app/
   
// WebApp.rawConnectHandlers.use(function(req, res, next) {
//   // res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:3200");
//   return next();
// });

// WebApp.rawConnectHandlers.use(function(req, res, next) {
//   // res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   return next();
// });

    // if(Meteor.userId()) {

        // var fs = Npm.require('fs');
        // var path = Npm.require('path');

        // var mime = {
        //   lookup: (function() {

        //     var mimeTypes = {
        //       ".html":  "text/html",
        //       ".js":    "application/javascript",
        //       ".json":  "application/json",
        //       ".png":   "image/png",
        //       ".gif":   "image/gif",
        //       ".jpg":   "image/jpg",
        //       ".wav":   "audio/wav",
        //       ".mp3":   "audio/mp3",
        //       ".xlsx":  "application/vnd.ms-excel",
        //       ".pdf":  "application/pdf"
        //     };

        //     return function(name) {
        //       var type = mimeTypes[path.extname(name)];
        //       return type || "text/html";
        //     };
        //   }()),
        // };

        // WebApp.connectHandlers.use(function(req, res, next) {
        //     var re = /^\/exports\/(.*)$/.exec(req.url);
        //     if (re !== null) {   // Only handle URLs that start with /uploads_url_prefix/*
        //         var filePath = process.env.PWD + '/.assets/exports/' + re[1];
        //         var data = fs.readFileSync(filePath);
        //         var mimeType = mime.lookup(filePath);
        //         res.writeHead(200, {
        //                 // 'Content-Type': 'audio/mp3'
        //                 'Content-Type': mimeType
        //             });
        //         res.write(data);
        //         res.end();
        //     } else {  // Other urls will have default behaviors
        //         next();
        //     }
        // });

//   smtp = {
//     username: 'AKIAIISDBEKJBKAD2ITA',
//     password: 'AjxG13bLoS2V1llpFVcDFx/7BuISOYgW/R5461KoO09U',
//     // server:   'tls://email-smtp.us-east-1.amazonaws.com',
//     server:   'email-smtp.us-east-1.amazonaws.com',
//     port: 465
//   } 

//   process.env.MAIL_URL = 'smtps://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
        
  // This is critical to get the real ip headers (X-Real-IP, X-Forwarded-For) in nginx properly.
  // It should be 2: Meteor itself has one proxy behind, another from nginx (upstream).
  // process.env.HTTP_FORWARDED_COUNT = 1; // With mupx, 1, without mupx 2; with Nginx 2, otherwise 1
  process.env.HTTP_FORWARDED_COUNT = 1; // With mupx, 1, without mupx 2; with Nginx 2, otherwise 1 (<- if it's 1, Amazon IP will be recorded)
           
    // }
    // Accounts.onCreateUser(function(options, user) {
    //     if(!user.profile) {
    //         user.profile = {};
    //     }

    //     // console.log("Startup", options, user);

    //     user.profile.firstname = options.firstname;
    //     user.profile.lastname = options.lastname;

    //     return user;
    // });


    // console.log("process.env", process.env);

    // console.log(Meteor.settings.mysql);
    // var liveDb = new LiveMysql();

    // Meteor.Cluster.init();
    // Meteor.Cluster.sync(Log); 

    // liveDb = new LiveMysql(Meteor.settings.mysql);

    // closeAndExit = function() {
    //   liveDb.end();
    //   process.exit();
    // };

    // // Close connections on hot code push
    // process.on('SIGTERM', closeAndExit);
    // // Close connections on exit (ctrl + c)
    // process.on('SIGINT', closeAndExit);

    myAbsUrl = Meteor.absoluteUrl(); // Used in the local logger && user connection part.
    // myAbsUrl = "http://app2.craassessments.com"; // For testing purpose.

    // myAbsUrl = "http://demo.craassessments.com:3200";

    // console.log(myAbsUrl.indexOf('3200'));
    // console.log(process.env.PORT);

    // reCAPTCHA.config({
    //     privatekey: '6Lf1qRwTAAAAAKy_63CTkvJ8njnJXH0ivYk8u8Y3'
    // });

// const log = new Logger();
// (new LoggerFile(log)).enable({
//   enable: true,
//   filter: ['ERROR', 'FATAL', 'WARN', 'DEBUG', 'INFO', 'TRACE', '*'], // Filters: 'ERROR', 'FATAL', 'WARN', 'DEBUG', 'INFO', 'TRACE', '*'
//   client: true, // Set to `false` to avoid Client to Server logs transfer
//   server: true  // Allow logging on server
// });


});
    

Accounts.validateLoginAttempt(function(attemptInfo) {

    if (attemptInfo.type == 'resume') return true;

    // when auto login is blocked wuth email verification
    // if (attemptInfo.methodName == 'createUser' || attemptInfo.methodName == 'verifyEmail') return false;

    // when auto login after verifying email is allowed
    if (attemptInfo.methodName == 'createUser') return false;

    return true;
});

// Login token expiration days.
Accounts.config({
    loginExpirationInDays: 1 // one day.
});


    