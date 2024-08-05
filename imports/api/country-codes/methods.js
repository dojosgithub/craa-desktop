import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { CountryCodes } from './country-codes.js'
import { UsersDemographic } from '/imports/api/users-demographic/users-demographic.js'

Meteor.methods({
  "CountryCodes.regions.Quintiles.save"(obj) {
    check(obj, {
      _id: String,
      code: String,
      region: String
    })

    let output = Meteor.wrapAsync((obj, callback) => {

        let now = new Date

        CountryCodes.update({
          _id: obj._id
        }, {
          $set: {        
            quintiles_region: obj.region,
            modified: now
          }          
        }, (err, res) => {

          if(err) {
            data = {success: false, data: err}
            callback(null, data)
          } else {

            UsersDemographic.update({
              client_id: 'Z4aoaSWLtxRvyv4oz',
              'country.code': obj.code
            }, {
              $set: {
                quintiles_region: obj.region,
                modifiedAt: now
              },
              $unset: {
                prahs_region: 1
              }
            }, {
              multi: true
            }, (err, res) => {
              if(err) {                
                data = {success: false, data: err}                
              } else {
                data = {success: true, data: res}
              }
              callback(null, data)
            })            
          }

        }
      )
  
    })

    let result = output(obj)

    if(result) {
      return result
    }

  },
  "CountryCodes.regions.Quintiles.remove"(obj) {
    check(obj, {
      _id: String,
      code: String,
      region: String
    })

    let output = Meteor.wrapAsync((obj, callback) => {

        let now = new Date

        CountryCodes.update({
          _id: obj._id
        }, {
          $set: {            
            modified: now
          },
          $unset: {        
            quintiles_region: 1
          }          
        }, (err, res) => {

          if(err) {
            data = {success: false, data: err}
            callback(null, data)
          } else {

            UsersDemographic.update({
              client_id: 'Z4aoaSWLtxRvyv4oz',
              'country.code': obj.code
            }, {
              $set: {                
                modifiedAt: now
              },
              $unset: {
                prahs_region: 1,
                quintiles_region: 1
              }
            }, {
              multi: true
            }, (err, res) => {
              if(err) {                
                data = {success: false, data: err}                
              } else {
                data = {success: true, data: res}
              }
              callback(null, data)
            })            
          }

        }
      )
  
    })

    let result = output(obj)

    if(result) {
      return result
    }

  },
  "CountryCodes.regions.Quintiles.delete"(region) {
    check(region, String)

    let output = Meteor.wrapAsync((region, callback) => {

        let now = new Date

        CountryCodes.update({
          quintiles_region: region
        }, {
          $set: {            
            modified: now
          },
          $unset: {        
            quintiles_region: 1            
          }          
        }, {
          multi: true
        }, (err, res) => {

          if(err) {
            data = {success: false, data: err}
            callback(null, data)
          } else {

            UsersDemographic.update({
              quintiles_region: region              
            }, {
              $set: {                
                modifiedAt: now
              },
              $unset: {
                prahs_region: 1,
                quintiles_region: 1
              }
            }, {
              multi: true
            }, (err, res) => {
              if(err) {                
                data = {success: false, data: err}                
              } else {
                data = {success: true, data: res}
              }
              callback(null, data)
            })            
          }

        }
      )
  
    })

    let result = output(region)

    if(result) {
      return result
    }

  },  
  "CountryCodes.regions.Quintiles.update"(obj) {
    check(obj, {
      origin: String,
      newRegion: String
    })

    let output = Meteor.wrapAsync((obj, callback) => {

        let now = new Date

        CountryCodes.update({
          'quintiles_region': obj.origin.trim()
        }, {
          $set: {        
            'quintiles_region': obj.newRegion,
            modified: now
          }          
        }, {
          multi: true
        }, (err, res) => {

          if(err) {
            data = {success: false, data: err}
            callback(null, data)
          } else {

            UsersDemographic.update({
              quintiles_region: obj.origin
            }, {
              $set: {
                quintiles_region: obj.newRegion,
                modifiedAt: now
              },
              $unset: {
                prahs_region: 1
              }
            }, {
              multi: true
            }, (err, res) => {
              if(err) {                
                data = {success: false, data: err}                
              } else {
                data = {success: true, data: res}
              }
              callback(null, data)
            })            
          }

        }
      )
  
    })

    let result = output(obj)

    if(result) {
      return result
    }

  }
})
