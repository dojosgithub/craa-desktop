import { Mongo } from 'meteor/mongo';

export const CountryCodes = new Mongo.Collection('country_codes');

CountryCodes.allow({
  insert: function() { return true; },
  update: function() { return true; },
  remove: function () { return true; }
});

// CountryCodes.after.update(function(id, doc) {
//   if(this.transform()) {
//     var cc = this.transform();

//     var obj = {
//       countryId: cc._id,
//       countryCode: cc.ISO3166_1_Alpha_2,
//       prahsRegion: cc.prahs_region,
//       quintilesRegion: cc.quintiles_region
//     };

//     // if(cc.prahs_region.id !== '' && cc.prahs_region.id !== null) {
//       Meteor.call("UsersDemographic.hook.CountryCodes.update", obj, function(err, res) {
//         if(err) {}
//         else {}
//       }); 
//     // }

//     // if(cc.prahs_region.id === '' || cc.prahs_region.id === null) {
//     //   Meteor.call("deleteRegionFromUsersDemographicHook", obj, function(err, res) {
//     //     if(err) {}
//     //     else {}
//     //   }); 
//     // }    
//   }
// });