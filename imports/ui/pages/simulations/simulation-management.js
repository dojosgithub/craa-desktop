import { Session } from 'meteor/session'

const XLSX = require('xlsx');

// import '/imports/lib/template-helpers.js'
import { Util } from '/imports/lib/util.js'

import './simulation-management.html'
import '/imports/ui/stylesheets/simulations/simulation-management.less'

// import '/imports/ui/pages/simulations/document-management.js'

let _simulationManagementTabs = {
  first: 'DocumentManagement',
  second: 'Protocols',
  third: 'Findings',
  fourth: 'SimulationPreferences',
  fifth: 'EDCManagement'
}

Template.SimulationManagement.onCreated(simulationManagement => { 
  // Session.set("SimulationManagement.tab", {first: "DocumentManagement"})
  // $('.attached.tab.first').addClass('loading')
  Session.set("SimulationManagement.tab", {fourth: "SimulationPreferences"})
  $('.attached.tab.fourth').addClass('loading')  
})

Template.SimulationManagement.onRendered(function simManagementOnRendered() {

  // if(Session.get("Simulations.id")) {
    $('.simulation-management-menu .item').tab({
    //   cache: true,
    //   auto: true,
      // alwaysRefresh: true,
    // apiSettings: {
    //   loadingDuration : 300,
    //   mockResponse    : function(settings) {
    //     // var response = {
    //     //   first  : 'AJAX Tab One',
    //     //   second : 'AJAX Tab Two',
    //     //   third  : 'AJAX Tab Three'
    //     // };
    //       let path = settings.urlData.tab
    //       let tab = {
    //         first: null,
    //         second: null,
    //         third: null,
    //       }
    //       tab[path] = _simulationManagementTabs[path]

    //       Session.set("SimulationManagement.tab", tab)  
    //       Session.set("SimulationManagement.tab.current", path) 

    //     // return response[settings.urlData.tab];
    //     return Session.set("SimulationManagement.tab", tab)
    //   }
    // },      
      onLoad: function(path, params, history) {
        // console.log(path,  $('.attached.tab.'+path).hasClass('loading'))
        // console.log($('.simulation-management-menu .item.'+path).hasClass('active'))
        // if(!$('.attached.tab.'+path).hasClass('active')) {
          // $('.attached.tab.'+path).addClass('loading')
          // console.log(Session.get("Simulations.id"),Session.get("Simulations.name"))
        if(Session.get("Simulations.id") && Session.get("Simulations.name")) {

          let tab = {
            first: null,
            second: null,
            third: null,
            fourth: null,
            fifth: null
          }
          tab[path] = _simulationManagementTabs[path]

          Session.set("SimulationManagement.tab", tab)  
          Session.set("SimulationManagement.tab.current", path)  

          // let msg = path === 'first' ? 'docmgmt' : (path === 'second' ? 'protocols' : 'findings')
          let msg = ''
          if(path === 'first') {
            Session.set("DocumentManagement.docOrder", null);            
            msg = 'docmgmt'
          }
          else if(path === 'second') {
            msg = 'protocols'
          }
          else if(path === 'third') {
            msg = 'findings'
          }
          else if(path === 'fourth') {
            msg = 'preferences'
          }          
          else {
            msg = 'edc'
          } 

          Util.log(Meteor.user(), msg, "simmgmt")

        } else {
          Util.alert({mode: 'error'})

          FlowRouter.go('/'+___aR+'/simulations')
        }          
          
      },
      // onVisible() {
      //   console.log('a')
      //   _resetSimulationManagementTab()
      // }
    })

//     let sideBar = `
//       <div class="ui top sidebar segment scale down hidden simulation-settings-sidebar" id="simulation_settings_sidebar">
//         <div class="ui center aligned grid">
//           <div class="one column row simulation-settings-header">
//             <div class="sixteen wide column">
//               <h4 class="ui header">Simulation Settings: <span id="simulation_settings_sim_name"></span></h4> 
//             </div>
//           </div>
//           <div class="three column divided row simulation-settings-main">
//             <div class="column">
//               <!--<div class="ui toggle checkbox" id="rppCheckboxContainer">
//                 <input type="checkbox" name="rescue_pills_prescribed" id="rescue_pills_prescribed">
//                 <label>Calculate prescribed pills for rescue medication</label>-->
              
// <div class="onoffswitch" id="rppCheckboxContainer">
//     <input type="checkbox" name="rescue_pills_prescribed" class="onoffswitch-checkbox" id="rescue_pills_prescribed">
//     <label class="onoffswitch-label" for="rescue_pills_prescribed"></label>               
//               </div>              
//               <!--<div class="rpp-label">Calculate prescribed pills for rescue medication</div>-->
//             </div>
//             <div class="column">
              
//             </div>
//             <div class="column">
              
//             </div>
//           </div>
//         </div>
//       </div>
//     `

    // let sideBar = `
    //   <div class="ui wide left sidebar scale down segment hidden simulation-settings-sidebar" id="simulation_settings_sidebar">
    //     <div class="ui center aligned grid">
    //       <div class="one column row simulation-settings-header">
    //         <div class="sixteen wide column">
    //           <h4 class="ui header"><span id="simulation_settings_sim_name"></span></h4> 
    //         </div>
    //       </div>
    //       <div class="one column row simulation-settings-main">
    //         <div class="one wide column rpp-checkbox-column">
              
    //           <div class="onoffswitch" id="rppCheckboxContainer">
    //             <input type="checkbox" name="rescue_pills_prescribed" class="onoffswitch-checkbox" 
    //             id="rescue_pills_prescribed">
    //             <label class="onoffswitch-label" for="rescue_pills_prescribed"></label>               
    //           </div>                            
    //         </div>
    //         <div class="fourteen wide column rpp-label-column">Calculate prescribed pills for rescue medication</div>
    //       </div>
    //     </div>
    //   </div>
    // `

    // $('#__blaze-root').addClass('pusher')
    // $('body').append(sideBar)

    $('#simulation_settings_sim_name').html(Session.get("Simulations.name"))
    
// console.log("Sim Mgmt => ", Session.get("Simulations.rpp"))
    // $('#rescue_pills_prescribed').bind('change', function(e) {
    //   if(Session.get("Simulations.id")) {
    //     let simulation_id = parseInt(Session.get("Simulations.id"))
    //     // console.log(simulation_id)

    //     let rescuePillsPrescribed = $(e.currentTarget).is(':checked')

    //     let simObj = {
    //       id: simulation_id,
    //       rescue_pills_prescribed: rescuePillsPrescribed ? 1 : 0
    //     }

    //     Meteor.call("Simulations.update.rescuePillsPrescribed", simObj, (err, res) => {
    //       if(err) {
    //         Util.alert({mode: 'error', msg: err})
    //       } else {
    //         if(res && res.data.affectedRows === 1) {
    //           Util.alert()
    //           Session.set("Simulations.rpp", simObj.rescue_pills_prescribed)
    //         }            
    //       }
    //     })

    //   } else {
    //     Util.alert({mode: 'error'})
    //   }      
    // })

//     Tracker.autorun(() => {
//       let rpp = parseInt(Session.get("Simulations.rpp"))

//       let rppCheckbox

//       if(rpp === 1) {
//         // $('#rescue_pills_prescribed').prop('checked', true)
//         $('#rescue_pills_prescribed').attr('checked', 'checked')
// //       rppCheckbox = `
// // <input type="checkbox" name="rescue_pills_prescribed" id="rescue_pills_prescribed" checked>
// //                 <label for="rescue_pills_prescribed">Calculate prescribed pills for rescue medication</label>
// //       `
//         $('#rppCheckboxContainer').attr('data-tooltip', 'Currently ON')
//       } else {
//         $('#rescue_pills_prescribed').removeAttr('checked')
//         $('#rppCheckboxContainer').attr('data-tooltip', 'Currently OFF')
// //       rppCheckbox = `
// // <input type="checkbox" name="rescue_pills_prescribed" id="rescue_pills_prescribed">
// //                 <label for="rescue_pills_prescribed">Calculate prescribed pills for rescue medication</label>
// //       `

//         // $('#rescue_pills_prescribed').prop('checked', false)
//       }

//       // $('#rppCheckboxContainer').html(rppCheckbox)
//       $('#rppCheckboxContainer').attr('data-position', 'top center')
//     })
  
    $('.btn-document-options').dropdown({
      action: (text, value) => {
        Util.loader({done: true})
      }
    })

  Util.loading(false)
})

Template.SimulationManagement.helpers({ 
  DocumentManagement() {
    if(Session.get("SimulationManagement.tab").first) {
      import '/imports/ui/pages/simulations/document-management.js' 

      // _resetSimulationManagementTab()
      // $('.ui.accordion').accordion('refresh')
      // $('.ui.sticky').sticky('refresh')

      return Session.get('SimulationManagement.tab').first
    }
  },
  Protocols() {    
    if(Session.get("SimulationManagement.tab").second) {
      import '/imports/ui/pages/simulations/protocols.js'
          
      // _resetSimulationManagementTab()
          
      return Session.get("SimulationManagement.tab").second
    }
  },
  Findings() {
    if(Session.get("SimulationManagement.tab").third) {
      import '/imports/ui/pages/simulations/findings.js'
         
      // _resetSimulationManagementTab()

      return Session.get("SimulationManagement.tab").third
    }
  },
  SimulationPreferences() {
    if(Session.get("SimulationManagement.tab").fourth) {
      import '/imports/ui/pages/simulations/simulation-preferences.js'
         
      // _resetSimulationManagementTab()

      return Session.get("SimulationManagement.tab").fourth
    }
  },
  EDCManagement() {
    if(Session.get("SimulationManagement.tab").fifth) {
      import '/imports/ui/pages/simulations/edc-management.js'
         
      // _resetSimulationManagementTab()

      return Session.get("SimulationManagement.tab").fifth
    }
  },   
  dragToReorder() {
    return Session.get("Documents.dragToReorder")
  }  
})

Template.SimulationManagement.events({
  'click .simulation-management-menu .item'(e, tpl) {
    e.preventDefault()

    // if($(e.currentTarget).hasClass('active')) {
    //   _resetSimulationManagementTab()
    // }
    // let currentTab = Session.get("SimulationManagement.tab.current")

    // console.log(currentTab)
    // console.log($('.attached.tab.'+currentTab).hasClass('active'))
    // console.log($(e.currentTarget).children('span.loader').length)
    // if($(e.currentTarget).children('span.loader').length === 0) {
      Util.loader($(e.currentTarget))
    // } else {
      setTimeout(()=>{Util.loader({done: true})}, 500)
       
    // }
  },
  // 'click .active.item'(e, tpl) {
  //   e.preventDefault()
  //   Util.loader({done: true})
  // },
  // 'click .btn-config-simulation'(e, tpl) {
  //   e.preventDefault()

  //   $('.ui.sidebar.simulation-settings-sidebar')
  //   // .sidebar({
  //   //   transition: 'push',
  //   //   onHidden: function() {       
  //   //   }
  //   // })
  //   // .sidebar('setting', 'transition', 'scale down')
  //   .sidebar('toggle')

  //   Util.log(Meteor.user(), "config", "simmgmt")
  // },
  // 'change #rescue_pills_prescribed'(e, tpl) {
  //   e.preventDefault()

  //   if(Session.get("Simulations.id")) {
  //     let simulation_id = Session.get("Simulations.id")
  //     // console.log(simulation_id)

  //     let rescuePillsPrescribed = $(e.currentTarget).is(':checked')

  //     // console.log(rescuePillsPrescribed)
  //   } else {
  //     Util.alert({mode: 'error'})
  //   }
    
  // }
  'click .btn-export-document-list'(e, tpl) {
    e.preventDefault()

    if(Session.get('Simulations.id')) {
      let docObj = {
        simulation_id: Session.get('Simulations.id'),
        // document_list: Session.get("Documents.list")
      }
      Meteor.call("Documents.export", docObj, (err, res) => {
        if(err) {
          Util.alert({mode: 'error', msg: err})
        } else {
            if(res) {
              let wb = res.data

              // console.log(wb);
              /* "Browser download file" from SheetJS README */
              let
                wopts = { bookType:'xlsx', bookSST:false, type:'binary' },
                wbout = XLSX.write(wb, wopts)

              let filename = Session.get("Simulations.name")+'-Documents-'+Util.dateHMS(new Date)+'.xlsx'

              saveAs(new Blob([Util.s2ab(wbout)],{type:"application/octet-stream"}), filename);              
            }          
        }
      })
    } else {
      Util.alert({mode: 'error'})
    }

    Util.log(Meteor.user(), "docexport", "simmgmt")
  },
  'click .btn-document-options'(e, tpl) {
    e.preventDefault()
    e.stopPropagation();

    // $(e.currentTarget).find('.menu').toggle()
    Util.loader({done: true})
    $('.btn-document-options .setting')
    .transition('remove looping')      
  },
  'click #drag_option'(e, tpl) {

    e.preventDefault()

    let dragToReorder = $(e.currentTarget).is(':checked')

    Session.set("Documents.dragToReorder", dragToReorder)

    Util.log(Meteor.user(), "dragoption", "simmgmt")
  }
  // 'mouseover .btn-document-options'(e, tpl) {
  //   e.preventDefault()

  //   $(e.currentTarget).find('.menu').toggle()
  //   Util.loader({done: true})
  // }  
})

Template.SimulationManagement.onDestroyed(simMgmtOnDestroyed => {
  Session.set("Simulations.id", null)
  Session.set("Simulations.name", null)
  Session.set("Documents.list", null)
})

_resetSimulationManagementTab = function() {
  $('.simulation-management-column-container .attached.tab').removeClass('loading')
  $('.active.inline.loader').remove()
}
