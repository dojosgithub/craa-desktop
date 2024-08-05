import { Mongo } from 'meteor/mongo';

let configVar = {  
  production: {
    // coreDBURL: "mongodb://craa21DBAdmin:bT*6#bHh2B@app1.craassessments.com:3201/craa_v21_db",
    // trDBURL: 'mongodb://craaTR17DBAdmin:tbR*7#bHh1B@training.craassessments.com:27017/craa-v2-tr',
    // trDBURL: 'mongodb://craaTR17DBAdmin:tbR*7#bHh1B@34.206.143.130:3201/craa-v2-tr',
    // trDBURL: 'mongodb://CRAATrainingDBUser:mQ5z80Mk9YgCPxuR@craatrainingcluster-shard-00-00-mnnwl.mongodb.net:27017,craatrainingcluster-shard-00-01-mnnwl.mongodb.net:27017,craatrainingcluster-shard-00-02-mnnwl.mongodb.net:27017/craa-v2-tr?ssl=true&replicaSet=CRAATrainingCluster-shard-0&authSource=admin'
    // trDBURL: 'mongodb://CRAADBUser:1IN76KjEVnmlthPB@craaclusterv2-shard-00-00-dsxea.mongodb.net:27017,craaclusterv2-shard-00-01-dsxea.mongodb.net:27017,craaclusterv2-shard-00-02-dsxea.mongodb.net:27017/craa-v2-tr?ssl=true&replicaSet=CRAAClusterV2-shard-0&authSource=admin'
    oTRDBURL: 'mongodb://CRAADBUser:1IN76KjEVnmlthPB@craaclusterv2-shard-00-00-dsxea.mongodb.net:27017,craaclusterv2-shard-00-01-dsxea.mongodb.net:27017,craaclusterv2-shard-00-02-dsxea.mongodb.net:27017/craa-v2-tr?ssl=true&replicaSet=CRAAClusterV2-shard-0&authSource=admin',
    trDBURL: "mongodb+srv://CRAADBUser:1IN76KjEVnmlthPB@craaclusterv2.dsxea.mongodb.net/craa_v21_db?retryWrites=true&w=majority",
    // apiURL: function() { return "https://apiv1.craassessments.com/" + configVar.apiVersion; }
  },
  development: {
    // trDBURL: "mongodb://localhost:27017/craa-v2-tr",
    // AYAZ: Commented below two lines and added two new for testing
    // oTRDBURL: "mongodb://localhost:27017/craa-v2-tr",
    // trDBURL: "mongodb://localhost:27017/craa_v21_db",
    oTRDBURL: 'mongodb://CRAADBUser:1IN76KjEVnmlthPB@craaclusterv2-shard-00-00-dsxea.mongodb.net:27017,craaclusterv2-shard-00-01-dsxea.mongodb.net:27017,craaclusterv2-shard-00-02-dsxea.mongodb.net:27017/craa-v2-tr?ssl=true&replicaSet=CRAAClusterV2-shard-0&authSource=admin',
    trDBURL: "mongodb+srv://CRAADBUser:1IN76KjEVnmlthPB@craaclusterv2.dsxea.mongodb.net/craa_v21_db?retryWrites=true&w=majority",
    // apiURL: function() { return "http://localhost:3900/" + configVar.apiVersion; }
  }
}

let _extTRDBURL = configVar[process.env.NODE_ENV].trDBURL;
export const ExtTRDB = new MongoInternals.RemoteCollectionDriver(_extTRDBURL);

let _extOTRDBURL = configVar[process.env.NODE_ENV].oTRDBURL;
export const ExtOTRDB = new MongoInternals.RemoteCollectionDriver(_extOTRDBURL);
