import { Session } from 'meteor/session'

import '/imports/lib/template-helpers.js'
import { Util } from '/imports/lib/util.js'

import { EDCProtocols } from '/imports/api/edc-protocols/edc-protocols.js'
import { EDCSites } from '/imports/api/edc-sites/edc-sites.js'
import { EDCSubjects } from '/imports/api/edc-subjects/edc-subjects.js'

import './edc-management.html'
import '/imports/ui/stylesheets/simulations/edc-management.less'

Template.EDCManagement.onCreated(function() {

})

Template.EDCManagement.onRendered(function() {
	$('.ui.accordion').accordion({
		exclusive: false,
    close: true,
    // selector: {
    //   trigger: '.title .trigger'
    // },
    // onOpening: (item) => {
    //   console.log(this)
    //   console.log(item)
    //   console.log($(this).find('.title').attr('id'))
    // } 		
	});

  $('.form-add-protocol')
  .form({
    inline: true,
    fields: {
      name: {
        identifier: 'new_protocol_name',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a protocol name'
          }
        ]
      },
      label: {
        identifier: 'new_protocol_label',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a protocol label'
          }
        ]
      }
    },
    onSuccess: function(data) {
      // console.log(data) //- Nothing...
      Template.EDCManagement.__helpers.get('addNewProtocol').call()
      return false //-- This'd avoid submitting the form w/o invoking loginWithPassword
    }
  })
  $('.form-add-site').form('reset');

  $('.form-add-site')
  .form({
    inline: true,
    fields: {
      name: {
        identifier: 'new_site_name',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a site name'
          }
        ]
      },
      label: {
        identifier: 'new_site_label',        
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a site label'
          }
        ]
      }
    },
    onSuccess: function(data) {
      // console.log(data) //- Nothing...
      Template.EDCManagement.__helpers.get('addNewSite').call()
      return false //-- This'd avoid submitting the form w/o invoking loginWithPassword
    }
  });

  $('.form-add-subject')
  .form({
    inline: true,
    fields: {
      name: {
        identifier: 'new_subject_name',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a subject name'
          }
        ]
      },
      label: {
        identifier: 'new_subject_label',        
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a subject label'
          }
        ]
      }
    },
    onFailure(formErrors, fields) {
      // console.log(formErrors)
      // console.log(fields)
      // this.form('reset')
      return false;
    },
    onSuccess(data) {      
      Template.EDCManagement.__helpers.get('addNewSubject').call();
      return false //-- This'd avoid submitting the form w/o invoking loginWithPassword
    }
  });


})

Template.EDCManagement.helpers({
  addNewProtocol() {
    let 
      $form = $('.form-add-protocol'),
      name = $form.form('get value', 'new_protocol_name'),
      label = $form.form('get value', 'new_protocol_label'),
      simulation_id = $form.form('get value', 'simulation_id'),
      index = parseInt($form.form('get value', 'index'));

    if(name && label && simulation_id) {

      let 
        _name = null,
        _label = null;

      if(typeof name === 'Object' && name.length > 0) {
        _name = name[index]
      }
      if(typeof label === 'Object' && label.length > 0) {
        _label = label[index]
      }

      if(confirm("Are you sure to add protocol " + _name + "?")) {

        let protoObj = {
          name: _name,
          label: _label,
          simulation_id: parseInt(simulation_id)
        }

        Meteor.call("EDCProtocols.insert", protoObj, (err, res) => {
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
  addNewSite() {
    let 
      $form = $('.form-add-site'),
      name = $form.form('get value', 'new_site_name'),
      label = $form.form('get value', 'new_site_label'),
      simulation_id = $form.form('get value', 'simulation_id'),
      protocol_id = $form.form('get value', 'protocol_id'),
      index = parseInt($form.form('get value', 'index'));

    if(name && label && simulation_id && protocol_id) {

      let 
        _name = null,
        _label = null;

      if(typeof name === 'Object' && name.length > 0) {
        _name = name[index]
      }
      if(typeof label === 'Object' && label.length > 0) {
        _label = label[index]
      }

      if(confirm("Are you sure to add site " + _name + "?")) {

        let siteObj = {
          name: _name,
          label: _label,
          simulation_id: parseInt(simulation_id),
          protocol_id: parseInt(protocol_id)
        }

        Meteor.call("EDCSites.insert", siteObj, (err, res) => {
          if(err) {
            Util.alert({mode: 'error'});
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
  addNewSubject() {
    let 
      $form = $('.form-add-subject'),
      name = $form.form('get value', 'new_subject_name'),
      label = $form.form('get value', 'new_subject_label'),
      simulation_id = $form.form('get value', 'simulation_id'),
      protocol_id = $form.form('get value', 'protocol_id'),
      site_id = $form.form('get value', 'site_id');

    if(name && label && simulation_id && protocol_id && site_id) {

      if(confirm("Are you sure to add subject " + name + "?")) {

        let subjectObj = {
          name: name,
          label: label,
          simulation_id: parseInt(simulation_id),
          protocol_id: parseInt(protocol_id),
          site_id: parseInt(site_id)
        }

        Meteor.call("EDCSubjects.insert", subjectObj, (err, res) => {
          if(err) {
            Util.alert({mode: 'error'});
          } else {
            if(res) {
              if(res.success) {
                $('.ui.add-subject.modal').modal('hide');
                Util.alert({mode: 'info', msg: 'Successfully added.'})

              } else {
                Util.alert({mode: 'error', data: res.data.code || res.data})                
              }
            }                         
          }
        });
        return false;
      } 
    }    
  },  
  simulationId() {
  	return Session.get('Simulations.id') || Session.get('EDCManagement.simulation.id');
  },
  protocolId() {
    return Session.get('EDCManagement.protocol.id');
  },
  siteId() {
    return Session.get('EDCManagement.site.id');
  },   
  EDCProtocols() {
    return EDCProtocols.find({
      simulation_id: Session.get('Simulations.id')
    })  	
  },
  EDCSites(protocol_id) {
    return EDCSites.find({
      simulation_id: Session.get('Simulations.id'),
      protocol_id: parseInt(protocol_id)
    })  	
  },
  EDCSubjects(site_id) {    
    return EDCSubjects.find({      
      site_id: parseInt(site_id)
    })    
  },  
  EDCSubjects0(site_id) {
    if(Session.get("EDCSubjects.get."+site_id)) {
      return Session.get("EDCSubjects.get."+site_id);
    }   
  },
  EDCVisits(subject_id) {
    if(Session.get("EDCVisits.get")) {
      return Session.get("EDCVisits.get");
    }
  }  
})

Template.EDCManagement.events({
	'click .protocol.title'(e, tpl) {
		e.preventDefault();
    // console.log($(e.currentTarget).attr('id'))

	},
  // 'click .site.title'(e, tpl) {
  //   e.preventDefault();
  //   // console.log($(e.currentTarget).attr('id'))
  //   // console.log($(e.currentTarget).parent('.title').attr('id'));
  //   // let siteId = parseInt($(e.currentTarget).parent('.title').attr('id'));
  //   let siteId = parseInt($(e.currentTarget).attr('id'));

  //   Meteor.call("EDCSubjects.get.bySiteId", {'site_id': siteId}, (err, res) => {
  //     if(err) {
  //       Util.alert({mode: 'error'});
  //     } else {
  //       if(res) {
  //         if(res.success) {
  //           // console.log(res)
  //           Session.set("EDCSubjects.get."+siteId, res.data)

  //         } else {
  //           Util.alert({mode: 'error', data: res.data.code || res.data})                
  //         }
  //       }                         
  //     }
  //   });

  // }
  'click .btn-add-subject'(e, tpl) {
    e.preventDefault();
    let       
      simid = $(e.currentTarget).data('simid'),
      protoid = $(e.currentTarget).data('protoid'),
      siteid = $(e.currentTarget).data('siteid'),
      _idx = $(e.currentTarget).data('idx');

    if(simid && protoid && siteid) {
      Session.set("EDCManagement.simulation.id", simid);
      Session.set("EDCManagement.protocol.id", protoid);
      Session.set("EDCManagement.site.id", siteid);

      $('.ui.add-subject.modal')
        .modal({
          closable  : true,
          className: {
            dimmer: 'add-subject-dimmer' //-- not working
          },
          // onDeny(){            
          //   return false;
          // },
          onApprove() { //-- onSubmit
            //-- (see onRendered) Form itself has the callback for this...
            return false;
          },
          onHidden() {
            $('.form-add-subject').form('reset');
          }
        })
        .modal('attach events', '.button.add-subject-cancel', 'hide')
        // .modal('attach events', '.button.add-subject.ok', 'hide')
        .modal('show');

      $('.ui.add-subject.modal').parent('.dimmer').css("background-color", "rgba(218,218,218,0.3"); 

    }     
  },
  'click .button.add-subject-cancel'(e, tpl) {
    e.preventDefault();
    console.log('aa')
    $('.ui.add-subject.modal').modal('hide');
  }    
})
