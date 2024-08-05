import { Session } from 'meteor/session'

import { CountryCodes } from '/imports/api/country-codes/country-codes.js'

import { Util } from '/imports/lib/util.js'

import './regions-quintiles.html'
import '/imports/ui/stylesheets/regions/regions-quintiles.less'

let _selfRegionsQuintiles

Template.RegionsQuintiles.onCreated(function regionsQuintilesOnCreated() {

  _selfRegionsQuintiles = this
  _selfRegionsQuintiles.regionsChecked = []

  Session.set("CountryCodes.regions.Quintiles.checked", null)
})

Template.RegionsQuintiles.helpers({
  Countries() {
    let countries = CountryCodes.find().fetch()

    let regionsChecked = Session.get("CountryCodes.regions.Quintiles.checked")

    if(countries && countries.length > 0) {
      
      let 
        _countries = [], 
        __countries = [],
        regions = []

      countries.forEach((c) => {
        if(c.quintiles_region) {

          // if(regionsChecked) {
          //   if(regionsChecked.includes(c.quintiles_region)) {
          //     _countries.push(c)
          //   }
          // } else {
            _countries.push(c)
          // }

          regions.push(c.quintiles_region)
          
        } else {
          __countries.push(c)
        }
      })

      let _regions = $.unique(regions).sort()

      Session.set("CountryCodes.regions.Quintiles.legend", _regions)

      if(!Session.get("CountryCodes.regions.Quintiles.checked")) {
        Session.set("CountryCodes.regions.Quintiles.checked", _regions)
      }

      // return _countries.concat(__countries)
      
      return {done: _countries, yet: __countries}
    }
  },
  Regions() {
    return Session.get("CountryCodes.regions.Quintiles.legend")
  },
  RegionsChecked() {
    // if(Session.get("CountryCodes.regions.Quintiles.checked")) {
      
    //   Template.RegionsQuintiles.__helpers.get("Countries")

      return Session.get("CountryCodes.regions.Quintiles.checked")
    // }
  }
})

Template.RegionsQuintiles.events({
  'click .btn-save-country-region'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget).parent())

    let 
      countryId = $(e.currentTarget).parent().data('cid'),
      code = $(e.currentTarget).parent().data('code'),
      origin = $(e.currentTarget).parent().data('origin') || '',
      region = $('#_input_quintiles_region_'+countryId).val(),
      yet = $(e.currentTarget).parent().data('new');

    let _cObj = {
      _id: countryId,
      code: code,
      region: region
    }

    if(countryId) {
      let result = null

      if(region === '') {
        if(yet) { //-- To check if this is from the existing Country-Region list, or, a new one
          Util.alert({mode: 'warning', msg: "Nothing to save."})
          Util.loader({done: true})
        } else {
          let txt = 'WARNING!!\n\nAre you sure to remove "' + origin + '"?\n\nThis will also remove all existing (user region) data.'

          if(confirm(txt)) {
            // result = CountryCodes.update(countryId, {
            //   $unset: {
            //     quintiles_region: 1
            //   }
            // })
            Meteor.call("CountryCodes.regions.Quintiles.remove", _cObj, (err, res) => {
              if(err) {
                Util.alert({mode: 'error', msg: err})
              } else {
                if(res && res.success) {
                  Util.alert()
                } else {
                  Util.alert({mode: 'error'})
                }
              }

              Util.loader({done: true})              
            })
          }
        }
      } else {
        // console.log(origin, region, origin === region)
        if(origin === region) { //-- Not working right after being updated
          Util.alert({mode: 'warning', msg: 'Nothing to save.'})
          Util.loader({done: true})
        } else {
          let
            _case = yet ? ' add "'+region+'"' : ' change "'+origin +'" to "'+region+'"',
            txt = 'WARNING!\n\nAre you sure to ' + _case + '?\n\nThis will also update all existing (user region) data accordingly.'
          
          if(confirm(txt)) {

            Meteor.call("CountryCodes.regions.Quintiles.save", _cObj, (err, res) => {
              if(err) {
                Util.alert({mode: 'error', msg: err})
              } else {
                if(res && res.success) {

                  Util.alert()

                  let regionsChecked = Session.get("CountryCodes.regions.Quintiles.checked")

                  if(!regionsChecked.includes(region.trim())) {
                    regionsChecked.push(region.trim())
                    Session.set("CountryCodes.regions.Quintiles.checked", regionsChecked)
                  }

                } else {
                  Util.alert({mode: 'error'})
                }
              }

              Util.loader({done: true})
            })

          } else {
            Util.loader({done: true})
          }//-- if(confirm(txt))

        } //-- if(origin === region)

      } //-- if(region === '')      

    } else { //-- if(countryId)
      Util.alert({mode: 'warning', msg: 'Nothing to save.'})
      Util.loader({done: true})
    }

    Util.log(Meteor.user(), countryId+"/save", "regions")
  },  
  'click .chb-region'(e, tpl) {
    e.preventDefault()

    let 
      isChecked = $(e.currentTarget).is(':checked'),
      region = $(e.currentTarget).val(),
      regionsChecked = Session.get("CountryCodes.regions.Quintiles.checked");
    // console.log(e.target.checked, isChecked, region)

    if(isChecked) {
      regionsChecked.push(region)      
    } else {
      regionsChecked.splice( $.inArray(region, regionsChecked), 1 );
    }
    Session.set("CountryCodes.regions.Quintiles.checked", regionsChecked)

    // if(isChecked) {
    //   $(e.currentTarget).attr('checked', 'checked')
    //   $('.country-item').data('region', region).show()      
    // } else {      
    //   $(e.currentTarget).prop('checked', false)
    //   $('.country-item').data('region', region).hide()      
    // }

    // let regionChecked = []
    // $('.chbk-region').each((i) => {
    //   if($(this).is(':checked')) {
    //     regionChecked.push($(this).val())
    //   }
    // })

    // Session.set("CountryCodes.regions.Quintiles.checked", regionChecked)
  },
  'click .btn-update-quintiles-region-name'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    let 
      input = $(e.currentTarget).siblings('.input-quintiles-region'),
      origin = $(input).data('ori'),
      newRegion = $(input).val();    

    // console.log(origin, newRegion)

    if(newRegion !== '') {
      if(origin === newRegion.trim()) {
        Util.alert({mode: 'warning', msg: "Nothing to update."})
        Util.loader({done: true})
        return;
      } else {
        let txt = 'WARNING!\n\nAre you sure to change "' + origin + '" to "' + newRegion + '"?\n\nThis will also update all existing (user region) data accordingly.'
        if(confirm(txt)) {
          let obj = {
            origin: origin,
            newRegion: newRegion.trim()
          }

          let regionsChecked = Session.get("CountryCodes.regions.Quintiles.checked")

          Meteor.call("CountryCodes.regions.Quintiles.update", obj, (err, res) => {
            if(err) {
              Util.alert({mode: 'error', msg: err})
            } else {
              if(res.success) {
                Util.alert()

                let regionsChecked = Session.get("CountryCodes.regions.Quintiles.checked")

                if(!regionsChecked.includes(newRegion.trim())) {
                  regionsChecked.push(newRegion.trim())
                  Session.set("CountryCodes.regions.Quintiles.checked", regionsChecked)
                }
                
              } else {
                Util.alert({mode: 'error', msg: res.data})
              }
            }

            Util.loader({done: true})
          })
        }
      }
    }
  },
  "click .btn-delete-quintiles-region"(e, tpl) {
    e.preventDefault()

    let region = $(e.currentTarget).parent().data('region')

    if(region) {
      Util.loader($(e.currentTarget))

      let txt = 'WARNING!!\n\nAre you sure to remove "' + region + '"?\n\nThis will also remove all existing (user region) data.'

      if(confirm(txt)) {
        // result = CountryCodes.update(countryId, {
        //   $unset: {
        //     quintiles_region: 1
        //   }
        // })
        Meteor.call("CountryCodes.regions.Quintiles.delete", region.trim(), (err, res) => {
          if(err) {
            Util.alert({mode: 'error', msg: err})
          } else {
            if(res && res.success) {
              Util.alert()
            } else {
              Util.alert({mode: 'error'})
            }
          }

          Util.loader({done: true})
        })
      } else {
        Util.loader({done: true})
      }
    } else {
      Util.alert({mode: 'error'})
      Util.loader({done: true})
    } //-- if(region)    
  }
})

Template.RegionsQuintiles.onDestroyed(()=> {
  Session.set("CountryCodes.regions.Quintiles.checked", null)
})
