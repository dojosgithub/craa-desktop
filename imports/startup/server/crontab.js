SyncedCron.config({
  // Log job run details to console
  log: true,

  // Use a custom logger function (defaults to Meteor's logging package)
  logger: null,

  // Name of collection to use for synchronisation and logging
  collectionName: 'cron_log',

  // Default to using localTime
  utc: false,
  /*
    TTL in seconds for history records in collection to expire
    NOTE: Unset to remove expiry but ensure you remove the index from
    mongo by hand

    ALSO: SyncedCron can't use the `_ensureIndex` command to modify
    the TTL index. The best way to modify the default value of
    `collectionTTL` is to remove the index by hand (in the mongo shell
    run `db.cronHistory.dropIndex({startedAt: 1})`) and re-run your
    project. SyncedCron will recreate the index with the updated TTL.

    10 years below
  */
  // collectionTTL: 5449420800000
  collectionTTL: 516000
});

SyncedCron.add({
    name: "Distribution_Notification",
    schedule: function(parser) {
        return parser.cron("00 11 * * *") //-- 11am (UTC) (= 7am EST, 6am CST ) every day
        // return parser.cron("13 13 * * *"); //-- for test purpose
    },
    job: function() {
        let result = Meteor.call("ResultDistributionNotification")
        // console.log(result)
        return result && result.data || null
    }
});

SyncedCron.start();
