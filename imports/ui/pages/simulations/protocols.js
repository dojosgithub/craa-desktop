// if(Meteor.isServer) {
//   var log = require('electron-log');  
// }

import { Session } from 'meteor/session'

import Sortable from 'sortablejs'

import { Util } from '/imports/lib/util.js'

import { Protocols } from '/imports/api/protocols/protocols.js'

import './protocols.html'
import '/imports/ui/stylesheets/simulations/protocols.less'


let _selfProtocols

Template.Protocols.onCreated(protocolsOnCreated => {

  _selfProtocols = this
  _selfProtocols.files = []

})

Template.Protocols.onRendered(protocolsOnRendered => {

  Util.loader({elem: $('.active.item'), done: true}) 

  let elFolder = document.getElementById('tbody_protocol_list');
  let sortableF = new Sortable(elFolder, {
    draggable: '.tr-protocol',     
    onEnd: function (e) {
      e.oldIndex;  // element's old index within parent
      e.newIndex;  // element's new index within parent

      let pObjs = []

      $(elFolder).children('.tr-protocol').each(function(idx, el) {
        let pid = $(this).data('pid')

        let pObj = {
          id: pid,
          order: idx
        }

        pObjs.push(pObj)
        // console.log(dfObj)
      })

      Meteor.call("Protocols.orders.update", pObjs, (err, res) => {
        if(err) {
          Util.alert('error')
        } else {
          // console.log(res, res.data)

          if(res) {
            if(res.data === 'fail') {
              Util.alert({mode: 'error'})
            } else {
              Util.alert()
            }
          }

        }
      })      
    }    
  })

  $('#new_protocol_form')
  .form({
    inline: true,
    fields: {
      name: {
        identifier: 'protocol_name',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a protocol document name'
          }
        ]
      },
      file: {
        identifier: 'protocol_file',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please select a document file'
          }
        ]
      }      
    },
    onSuccess: function(data) {
      // console.log(data) //- Nothing...
      Util.loader($('.btn-new-protocol'))
      Template.Protocols.__helpers.get('addNewProtocolDocument').call()
      return false //-- This'd avoid submitting the form w/o invoking loginWithPassword
    }
  })

  // $('.protocol-file-upload-progress').progress()
})

Template.Protocols.helpers({
  Protocols() {

    return Protocols.find({
      simulation_id: Session.get('Simulations.id')
    }, {
      sort: {
        protocol_order: 1
      }
    })
  },
  addNewProtocolDocument() {
    let 
      name = $('#new_protocol_form').form('get value', 'protocol_name'),
      files = $("#protocol_file")[0].files,
      order = $('.tr-protocol').length +1

    // let 
    //   _fileName = files[0].name,    
    //   _fileExt = _fileName.split('.').pop(),
    //   _file = _fileName.substring(0, _fileName.lastIndexOf('.')),
    //   _timestamp = Math.floor(Date.now() / 1000)
    
    // let _newFileName = _file+'-'+_timestamp+'.'+_fileExt

    // files[0]['upload_name'] = _newFileName

    if(name && files && Session.get('Protocols.file.info')) {
      let infoObj = Session.get('Protocols.file.info');

      files[0]['upload_name'] = infoObj.fileName

      S3.upload({
          files:files,          
          path:"documents",
          unique_name: false,
          acl: 'private',          
        }, (err, res) => {
          if(err) {
            Util.alert({mode: 'error', msg: err})
            // log.error(err)
          } else {
            // console.log(res)
            if(res && res.percent_uploaded === 100) {

              let infoObj = Session.get('Protocols.file.info');

              infoObj['order'] = order                
              infoObj['fileName'] = infoObj.fileName                

              Meteor.call("Protocols.insert", infoObj, (err, res) => {
                if(err) {
                  Util.alert({mode: 'error'})
                  resetProtocolForm()                  
                } else {
                  // console.log("Protocols.insert => ", res)
                  if(res && res.success) {
                    Util.alert({msg: 'Successfully uploaded'})
                    // all_protocols.change(Session.get('Simulations.id'))
                    resetProtocolFile()
                  } 
                  // else {
                  //   Util.alert({mode: 'error', msg: res.data.code})                    
                  // }
                }
                Util.loader({done: true})               
              })
                        
            }
          }
      }) 
    } else {
      Util.alert({mode: 'error', msg: "Insufficient data to proceed. Please go back to 'Simulations' and try again."})
      Util.loader({done: true}) 
    }     
  },
  ProtocolDocumentFileBeingUploaded(){
    if(Session.get('Protocols.file.info')) {
      let file = S3.collection.find()

      if(file && file.fetch() && file.fetch().length > 0) {

        let _percent_uploaded = file.fetch()[0].percent_uploaded

        $('.protocol-file-upload-progress').progress('increment', _percent_uploaded)
      }

      return file.fetch()[0]
    }
  }   
})

Template.Protocols.events({
  'click .btn-save-protocol-name'(e, tpl) {
    e.preventDefault()

    Util.loader({elem: $(e.currentTarget)})

    let 
      pid = $(e.currentTarget).parent().data('pid'),
      name = $('.input-protocol-name.'+pid).val()

    if(!pid) {
      Util.alert({mode: 'error'})
      return false
    }

    if(name) {
      let protocolObj = {
        id: pid,
        name: name
      }

      Meteor.call('Protocols.update',protocolObj, (err, res) => {
        if(err) {

          Util.alert({mode: 'error', msg: 'Something went wrong. Please try again.', data: err})

        } else {
          // console.log(res)
          if(res.success && res.data) {
            // if(res.data.changedRows > 0) {                            
            if(res.data === 1) {                            
              
              Util.alert({msg: 'Successfully saved.'})

              // all_protocols.change(Session.get("Simulations.id"))

            } 
            // else if(res.data.changedRows === 0)  {
            //   Util.alert({mode: 'warning', msg: 'Nothing to update.'})
            // }           
          } else {
            Util.alert({mode: 'error', msg: res.data.code})
          }       
        }
        
        Util.loader({
          elem: $(e.currentTarget), 
          done: true
        })

      })
    } else {
      Util.alert({mode: 'error', msg: 'Name cannot be null.'})
      Util.loader({
        elem: $(e.currentTarget), 
        done: true
      })      
    }

    Util.log(Meteor.user(), pid+"/saveproto", "docmgmt") 
  },
  'click .btn-update-protocol-status'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget)) 

    let
      // pid = $(e.currentTarget).closest('.td-action').data('pid')
      pid = $(e.currentTarget).data('pid')
      status = $(e.currentTarget).data('status')    

    let msg = status === '0' ? 'deactivate' 
      : (status === '1' ? 'activate' : 'delete')

    if(pid) {
      if(confirm("Are you sure to " + msg + " this protocol document?")) {

        let pStatusObj = {
          id: pid,
          status: parseInt(status)
        }

        Meteor.call("Protocols.update.status", pStatusObj, (err, res) => {
          if(err) {
            Util.alert({mode:'error'})
          } else {            
            // if(res && res.data.affectedRows === 1) {
            if(res && res.data === 1) {
              Util.alert()
              // all_protocols.change(Session.get("Simulations.id"))  
              // $('.simulation-management-menu .item').tab()            
            }
          }
          Util.loader({done: true}) 
        })
      }
    } else {
      Util.alert({mode: 'error', msg: "Something is wrong. Please go back to 'Simulations' and come back."})
      Util.loader({done: true}) 
    }

    Util.log(Meteor.user(), pid+"/updateprotostatus", "docmgmt") 
  },
  'change #protocol_file'(e, tpl) {
    
    e.preventDefault()

    Session.set('Protocols.file.info', null)

    let file = e.currentTarget.files[0]

    if(file) {      
      let
        name = $('#new_protocol_form').form('get value', 'protocol_name') || '',
        fileName = file.name,
        lastModifiedDate = file.lastModifiedDate,
        size = file.size

    let    
      _fileExt = fileName.split('.').pop(),
      _file = fileName.substring(0, fileName.lastIndexOf('.')),
      _timestamp = Math.floor(Date.now() / 1000)
    
    let _newFileName = _file+'-'+_timestamp+'.'+_fileExt

      let 
        siSize = Util.fileSize(size),
        date = Util.dateHMS(lastModifiedDate),
        infoObj = {
          simulation_id: Session.get("Simulations.id"),
          name: name,
          // fileName: fileName,
          fileName: _newFileName,          
          modified: date,
          size: size,
          siSize: siSize
        }      

      $('.file-info').show()
      // $('.file-name').html(fileName) 
      $('.file-name').html(_newFileName) 
      $('.file-modified').html(date) 
      $('.file-size').html(siSize)

      Session.set('Protocols.file.info', infoObj)
    }

    Util.log(Meteor.user(), "changeprotofile", "docmgmt") 
  },  
  'click .btn-reset-protocol-form'(e, tpl) {
    e.preventDefault()

    $('#new_protocol_form').form('clear')

    Util.log(Meteor.user(), "resetnewproto", "docmgmt") 
  },
  'click .btn-view-protocol-document_Inactivated'(e, tpl) {
    e.preventDefault()

    Util.loader({elem: $(e.currentTarget)})
    
    let pid = $(e.currentTarget).data('pid')

    Session.set("Protocols.id", pid)

    if(pid) {

      // let file = my_document_file.filter(function(f) {
      //   return f.id === fid
      // })[0]

      let file = _selfProtocols.files[pid]

      if(file) {

        let fileObj = {
          s3Path: 'documents/',
          fileName: file.file_name,
          id: file.id
        }

        // Session.set('docFile', fileUrl);

        Meteor.call("Protocols.download", fileObj, (err, res) => {
          console.log(err, res)
          if(err) {
            Util.alert({mode: 'error'})
          } else {  
            if(res.data && Meteor.isDesktop) {              
              Desktop.send('desktop', 'viewPDF', res.data)
            }            
          }

          Util.loader({elem: $(e.currentTarget), done: true})

        })


      // $('#doc_viewer')
      //   .modal({
      //     // inverted: true,
      //     transition: 'vertical flip',
      //     closable: false,          
      //   })        
      //   .modal('show')


        // $("#doc_viewer").show().draggable().resizable({
        //     // alsoResize: $("#iframe_scoring_doc_container"),
        //     // aspectRatio: true,
        //     // maxHeight: 140
        //     handles: "all",
        //     resize: function(event, ui) {
        //        var parentwidth = $("#doc_viewer").innerWidth();
        //        var parentheight = $("#doc_viewer").innerHeight();
        //        $("#iframe_doc_container")
        //         .css({'width':parentwidth-40, 'height':parentheight-40})
        //         .attr({'width':parentwidth-40, 'height':parentheight-40});
        //     }            
        // });

        if(Meteor.isDesktop) {
        //   let fileUrl = 'https://s3.amazonaws.com/craav2-us-east-1-uploads/media/'+file.name
          // Desktop.send('desktop', 'viewPDF', {url: fileUrl})
        }
      }
    }
    Util.log(Meteor.user(), pid+"/viewproto", "docmgmt") 
  }  
})

Template.Protocols.onDestroyed(() => {
  resetProtocolForm()
})

function resetProtocolForm() {
  _selfProtocols.files = null

  resetProtocolFile()
}

function resetProtocolFile() {
  $("#protocol_name").val(null)
  $("#protocol_file").val(null)
  $('.file-info').hide()  
  Session.set('Protocols.file.info', null)
}
