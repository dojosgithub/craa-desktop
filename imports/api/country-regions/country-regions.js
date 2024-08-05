import { Mongo } from 'meteor/mongo';

export const CountryRegions = new Mongo.Collection('country_regions');

CountryRegions.allow({
  insert: function() { return true; },
  update: function() { return true; },
  remove: function () { return true; }
});
