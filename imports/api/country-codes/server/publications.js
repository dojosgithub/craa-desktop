import { check } from 'meteor/check';

import { CountryCodes } from '../country-codes.js';

Meteor.publish('all_active_countries_quintiles', function() {
  return CountryCodes.find({
    name: {$ne: null}
  }, {
    sort: {
      name: 1,
      quintiles_region: 1
    },
    fields: {
      name: 1,
      ISO3166_1_Alpha_2: 1,
      prahs_region: 1,
      quintiles_region: 1
    }
  })
})

