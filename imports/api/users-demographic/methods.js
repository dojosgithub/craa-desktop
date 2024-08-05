import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

const XLSX = require('xlsx');

import { CountryCodes } from '/imports/api/country-codes/country-codes.js';
import { UsersDemographic } from '/imports/api/users-demographic/users-demographic.js';


Meteor.methods({
  "UsersDemographic.hook.CountryCodes.update"(obj) {
    check(obj, {
      countryId: String,
      countryCode: String,
      prahsRegion: Match.Maybe(Object),
      quintilesRegions: Match.Maybe(String)
    })

    //-- Hold on for now b/c needs ClientID to update UsersDemographic more accurately?
  },
  "ETL.UsersDemographic.Quintiles.update"() {
    let regions = CountryCodes.find({
      'quintiles_region': {$ne: null}
    }, {
      fields: {
        name: 1,
        ISO3166_1_Alpha_2: 1,
        quintiles_region: 1
      }
    }).fetch()

    // console.log(regions)

    if(regions && regions.length > 0) {
      let 
        clientId = 'Z4aoaSWLtxRvyv4oz',
        _regions = [],
        _cCodes = []

      regions.forEach((r) => {
        if(r.quintiles_region && r.quintiles_region !== '') {
          _regions[r.ISO3166_1_Alpha_2] = r.quintiles_region
          _cCodes.push(r.ISO3166_1_Alpha_2)
        }
      })

      let myCCodes = _cCodes.filter(function(item, pos) {
          return _cCodes.indexOf(item) == pos;
      })

      if(myCCodes.length > 0) {

        myCCodes.forEach((_r) => {

          UsersDemographic.update({
            client_id: clientId,
            'country.code': _r            
          }, {
            $set: {
              quintiles_region: _regions[_r]
            }
          }, {
            multi: true
          })
        })
      }

    }
  }
})
