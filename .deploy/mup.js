  module.exports = {
  servers: {
    one: {
      host: '52.206.166.158',
      username: 'ubuntu',
      // "pem": "/Users/david/.ssh/craa_admin_desktop_v22.pem",
      pem: 'E:\\.ssh\\craa_admin_desktop_v22.pem',
      opts: {
        // port: 22
      }
    },
  },
  // setupMongo: false,
  meteor: {
    name: 'craa-admin-desktop-server',
    path: '../',
    servers: {
      one: {},
    },
    port: 3000,
    buildOptions: {
      // skip building mobile apps, but still build the web.cordova architecture
      serverOnly: true,
      debug: true,
      cleanAfterBuild: true, // default
      // buildLocation: '/my/build/folder', // defaults to /tmp/<uuid>
      // set serverOnly: false if want to build mobile apps when deploying
      server: 'https://lsgyq68kcl6cmeyscgxe.craassessments.com', // your app url for mobile app access (optional)
       // adds --allow-incompatible-updates arg to build command (optional)
      allowIncompatibleUpdates: true,
    },    
    env: {
      // port: 3200,
      ROOT_URL: 'https://lsgyq68kcl6cmeyscgxe.craassessments.com',
      CDN_URL: "https://dpsyze4hdgntg.cloudfront.net",
      MONGO_URL: "mongodb+srv://CRAADBUser:1IN76KjEVnmlthPB@craaclusterv2.dsxea.mongodb.net/craa_v21_db?retryWrites=true&w=majority",
      MONGO_OPLOG_URL: "mongodb+srv://CRAADBOpLogUser:MVwLMRwWmNFU10cS@craaclusterv2-dsxea.mongodb.net/local"
      // "MOBILE_DDP_URL": "https://lsgyq68kcl6cmeyscgxe.craassessments.com:443",
      // "MOBILE_ROOT_URL": "https://lsgyq68kcl6cmeyscgxe.craassessments.com:443",
      // "DDP_DEFAULT_CONNECTION_URL" : "https://lsgyq68kcl6cmeyscgxe.craassessments.com:443",
      // "CLUSTER_WORKERS_COUNT": "auto"      
    },
    docker: {
      image: 'abernix/meteord:node-12-base', //-- use this image for Meteor 1.10+
    },   
    deployCheckWaitTime: 120,
    enableUploadProgressBar: true
  },
  proxy: {
    domains: 'lsgyq68kcl6cmeyscgxe.craassessments.com',
    ssl: {      
      // crt: '/Users/david/Dev/ssl/2017_2/craassessments.chained.crt',
      // key: '/Users/david/Dev/ssl/2017_2/craassessments.key',
      // crt: '/Users/david/Dev_admin/keys/fullchain.cer',
      // key: '/Users/david/Dev_admin/keys/craassessments.com.key',      
      // letsEncryptEmail: 'david.kim@craassessments.com',
      // crt: '/Users/david/Dev_core/Dev_app/keys/fullchain.cer',
      // key: '/Users/david/Dev_core/Dev_app/keys/craassessments.com.key',      
      crt: 'E:\\Dev_core\\Dev_app\\keys\\fullchain.cer',
      key: 'E:\\Dev_core\\Dev_app\\keys\\craassessments.com.key',       
      forceSSL: true
    }
  }  
  // mongo: {
  //   oplog: true,
  //   port: 27017,
  //   servers: {
  //     one: {},
  //   },
  // },
};
