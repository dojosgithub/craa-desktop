import { Session } from 'meteor/session'

import '/imports/lib/template-helpers.js'
import { Util } from '/imports/lib/util.js'

import { Simulations } from '/imports/api/simulations/simulations.js'

import './simulations.html'
import '/imports/ui/stylesheets/simulations/simulations.less'

// import '/client/lib/semantic-ui/semantic.less';

// import '/imports/lib/sortable.js'

Template.Simulations.onCreated(function simulationsOnCreated() {  
  Session.set("Simulations.rpp", null)
  Session.set("Documents.list", null)

  // let users = Meteor.users.find().fetch()
  // console.log(users)
  
})

Template.Simulations.onRendered(function simulationsOnRendered() {  

  $('.form-add-simulation')
  .form({
    inline: true,
    fields: {
      name: {
        identifier: 'new_simulation_name',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a simulation name'
          }
        ]
      },
      label: {
        identifier: 'new_simulation_label',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a simulation label'
          }
        ]
      }
    },
    onSuccess: function(data) {
      // console.log(data) //- Nothing...
      Template.Simulations.__helpers.get('addNewSimulation').call()
      return false //-- This'd avoid submitting the form w/o invoking loginWithPassword
    }
  })

  // $('#simulation_settings_sidebar').remove()  
  Util.loading(false)
})

Template.Simulations.helpers({
  Simulations() {
    return Simulations.find({}, {
      sort: {name: 1}
    })
  },
  addNewSimulation() {
    let 
      $form = $('.form-add-simulation'),
      name = $form.form('get value', 'new_simulation_name'),
      label = $form.form('get value', 'new_simulation_label')

    if(name && label) {

      if(confirm("Are you sure to add this simulation?")) {

        let simObj = {
          name: name,
          label: label
        }

        Meteor.call("Simulations.insert", simObj, (err, res) => {
          if(err) {
            Util.alert({mode: 'error'})
          } else {
            if(res) {
              if(res.success) {
                Util.alert({mode: 'info', msg: 'Successfully added.'})
              } else {
                Util.alert({mode: 'error', data: res.data.code || res.data})                
              }
            }                         
          }
        })
      } 
    }    
  },
  saveSimulation(simObj) {
    // console.log(simObj)
  }
})

Template.Simulations.events({

  'click .btn-save-simulation'(e, tpl) {
    e.preventDefault()

    // if(confirm("Are you sure to update this simulation?"))
    Util.loader({elem: $(e.currentTarget)})

    let 
      sid = $(e.currentTarget).parent().data('sid'),
      name = $('.input-simulation-name.'+sid).val(),
      label = $('.input-simulation-label.'+sid).val()

    if(name && label) {
      let simObj = {
        id: sid,
        name: name,
        label: label
      }

      Meteor.call('Simulations.update', simObj, (err, res) => {
        if(err) {

          Util.alert({mode: 'error', msg: 'Something went wrong. Please try again.', data: err})

        } else {
          if(res && res.data) {
            // if(res.data.changedRows > 0) {
            if(res.data === 1) {
              
              Util.alert({msg: 'Successfully saved.'})
            } 
            // else if(res.data.changedRows === 0)  {

            //   Util.alert({mode: 'warning', msg: 'Nothing to update.'})

            // }           
          }        
        }
        
        Util.loader({
          elem: $(e.currentTarget), 
          done: true
        })

      })

    } else {
      Util.alert({mode: 'error', msg: 'Name and Label cannot be null.'})
      Util.loader({
        elem: $(e.currentTarget), 
        done: true
      })      
    }

    Util.log(Meteor.user(), sid+"/save", "sims")

  },
  'click .btn-delete-simulation'(e, tpl) {
    e.preventDefault()

    let sid = $(e.currentTarget).parent().data('sid')

    if(sid) {
      if(confirm("Are you sure to archive this simulation?")) {
        Meteor.call("Simulations.remove", sid, (err, res) => {
          if(err) {
            Util.alert({mode: 'error'})
          } else {
            if(res) {              
              Util.alert({msg: 'Successfully archived.'})

              // all_simulations.change()
            }
          }
        })
      }
    }

    Util.log(Meteor.user(), sid+"/delete", "sims")
  },
  'click .btn-manage-simulation'(e, tpl) {
    e.preventDefault()
      
    // Util.loader($(e.currentTarget))
      
    let 
      sid = $(e.currentTarget).parent().data('sid'),
      rpp = $(e.currentTarget).parent().data('rpp')

    if(sid) {

      let simName = $('.input-simulation-name.'+sid).val()

      Session.set("Simulations.name", simName)
      Session.set("Simulations.rpp", rpp)

      Util.go('simulation/'+sid, 'App.simulation')

    }
  },
  'change .input-simulation-group'(e, tpl) {
    e.preventDefault();    

    let 
      _id = this._id,
      _sid = this.id,
      _group = $('.input-simulation-group.'+_sid).val();

    if(_id) {
      let _sObj = {
        _id: _id,
        group: parseInt(_group) || null
      }

      Meteor.call("Simulations.group.update", _sObj, (err, res) => {
        if(err) {
          Util.alert({mode: 'error'})
        } else {
          if(res) {              
            Util.alert({msg: 'Successfully saved.'})
          }
        }        
      });

    } else {
      Util.alert({mode: 'error'})
    }
  }    
})
