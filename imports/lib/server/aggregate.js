if(Meteor.isServer) {
  
  wrapAsync = (Meteor.wrapAsync)? Meteor.wrapAsync : Meteor._wrapAsync;
  Mongo.Collection.prototype.aggregate = function(pipelines, options) {
    var coll;
    if (this.rawCollection) {
      // >= Meteor 1.0.4
      coll = this.rawCollection();
    } else {
    // < Meteor 1.0.4
      coll = this._getCollection();
    }
    return Meteor.wrapAsync(coll.aggregate.bind(coll))(pipelines, options);
  }  

ReactiveAggregate = function (sub, collection, pipeline, options) {
  var defaultOptions = {
    observeSelector: {},
    observeOptions: {},
    clientCollection: collection._name
  };
  options = _.extend(defaultOptions, options);

  var initializing = true;
  sub._ids = {};
  sub._iteration = 1;

  function update() {
    if (initializing) return;
    // add and update documents on the client
    collection.aggregate(pipeline).forEach(function (doc) {
      if (!sub._ids[doc._id]) {
        sub.added(options.clientCollection, doc._id, doc);
      } else {
        sub.changed(options.clientCollection, doc._id, doc);
      }
      sub._ids[doc._id] = sub._iteration;
    });
    // remove documents not in the result anymore
    _.forEach(sub._ids, function (v, k) {
      if (v != sub._iteration) {
        delete sub._ids[k];
        sub.removed(options.clientCollection, k);
      }
    });
    sub._iteration++;
  }

  // track any changes on the collection used for the aggregation
  var query = collection.find(options.observeSelector, options.observeOptions);
  var handle = query.observeChanges({
    added: update,
    changed: update,
    removed: update,
    error: function (err) {
      throw err;
    }
  });
  // observeChanges() will immediately fire an "added" event for each document in the query
  // these are skipped using the initializing flag
  initializing = false;
  // send an initial result set to the client
  update();
  // mark the subscription as ready
  sub.ready();

  // stop observing the cursor when the client unsubscribes
  sub.onStop(function () {
    handle.stop();
  });
};

}