import { Session } from 'meteor/session'

import Sortable from 'sortablejs'

import '/imports/lib/template-helpers.js'
import { Util } from '/imports/lib/util.js'

import { DocumentFolders } from '/imports/api/document-folders/document-folders.js'
import { Documents } from '/imports/api/documents/documents.js'
import { DocumentFiles } from '/imports/api/document-files/document-files.js'

import './document-management.html'
import '/imports/ui/stylesheets/simulations/document-management.less'

let _selfDocumentManagement
let sortableF, sortableDs = [], sortableD_Ids = []

Template.DocumentManagement.onCreated(docManagementCreated => {  

  _selfDocumentManagement = this
  _selfDocumentManagement.documents = []
  _selfDocumentManagement.files = []

  Session.set('Documents.dragToReorder', false)
  Session.set('Documents.count', null)

  // Session.set('Documents.numbers', null)
  sortableDs = [], sortableD_Ids = []
 
})

Template.DocumentManagement.onRendered(docManagementRendered => {
  // $('.menu .item').tab()  
// console.log("Doc Mgmt => ", Session.get("Simulations.rpp"))
  $('.ui.accordion').accordion({
    exclusive: false,
    close: true,
    selector: {
      trigger: '.title .trigger'
    }    
  })

  let 
    elFolder = document.getElementById('doc_folder_list')
    // sortableF, sortableDs = [], sortableD_Ids = []

  sortableF = new Sortable(elFolder, {
    draggable: '.doc-folder-item',     
    onEnd: function (e) {

      if(Session.get("Documents.dragToReorder")) {
        e.oldIndex;  // element's old index within parent
        e.newIndex;  // element's new index within parent

        let dfObjs = []

        // $('#ul_admin_quiz_questions').children('li.li-admin-quiz-question').each(function(idx, el) { //-- not working
        $(elFolder).children('.doc-folder-item').each(function(idx, el) {
          let dfid = $(this).data('dfid')

          let dfObj = {
            id: dfid,
            order: idx
          }

          dfObjs.push(dfObj)
          // console.log(dfObj)
        })

        Meteor.call("DocumentFolders.orders.update", dfObjs, (err, res) => {
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
      } else {
        Util.alert({mode: 'info', msg: 'Please turn Drag option on to change the order of Documents/Folders.'})
            
       $('.btn-document-options .setting')
        .transition('set looping')
        .transition('bounce', '2000ms')

        setTimeout(()=>{
         $('.btn-document-options .setting')
          .transition('remove looping')                
        }, 6000)        
      }      
    }    
  })

  $('.shape').shape();
  $('.ui.sticky').sticky({
    // offset       : 50,
    // bottomOffset : 250,    
    // context: '#document_management_grid'
    context: '.document-list-container'
    // context: '.document-management-forms-container'
  })

  // $('.document-file-upload-progress').progress()

  $('#new_folder_form')
  .form({
    inline: true,
    fields: {
      name: {
        identifier: 'name',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a folder name'
          }
        ]
      }
    },
    onSuccess: function(data) {
      // console.log(data) //- Nothing...
      Util.loader($('.btn-new-folder'))
      Template.DocumentManagement.__helpers.get('submitNewFolder').call()
      return false //-- This'd avoid submitting the form w/o invoking loginWithPassword
    }
  })

  $('#edit_folder_form')
  .form({
    inline: true,
    fields: {
      name: {
        identifier: 'name',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a folder name'
          }
        ]
      }
    },
    onSuccess: function(data) {
      Util.loader($('.btn-edit-folder'))
      Template.DocumentManagement.__helpers.get('submitEditFolder').call()
      return false //-- This'd avoid submitting the form w/o invoking loginWithPassword
    }
  }) 

  $('#new_document_form')
  .form({
    inline: true,
    fields: {
      name: {
        identifier: 'name',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a document name'
          }
        ]
      }      
    },
    onSuccess: function(data) {
      Util.loader($('.btn-new-document'))      
      Template.DocumentManagement.__helpers.get('submitNewDocument').call()
      return false //-- This'd avoid submitting the form w/o invoking loginWithPassword
    }
  })

  $('#edit_document_form')
  .form({
    inline: true,
    fields: {
      name: {
        identifier: 'name',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a document name'
          }
        ]
      }
    },
    onSuccess: function(data) {
      Util.loader($('.btn-edit-document'))
      Template.DocumentManagement.__helpers.get('submitEditDocument').call()
      return false //-- This'd avoid submitting the form w/o invoking loginWithPassword
    }
  })

  Util.loader({elem: $('.active.item'), done: true})

  Tracker.autorun(() => {
    // if(Session.get("Documents.dragToReorder")) {
    //   sortableF.option('sort', true)
    //   // sortableD.option('sort', true)
    // } else {
    //   sortableF.option('sort', false)
    //   // sortableD.option('sort', false)
    //   console.log('false')
    // }

    sortableF.option('sort', Session.get("Documents.dragToReorder"))

    if(sortableD_Ids && sortableD_Ids.length > 0) {
      sortableD_Ids.forEach((s) => {
        sortableDs[s].option('sort', Session.get("Documents.dragToReorder"))
      })
    }

    if(Session.get("Documents.dragToReorder")) {
      
      let docFolders = DocumentFolders.find({
        simulation_id: Session.get('Simulations.id')
      })  

      if(docFolders && docFolders.fetch() && docFolders.fetch().length > 0) {
        docFolders.fetch().forEach((df) => {
          let _strFolderId = df.id.toString()
          initDocumentSortable(_strFolderId)
        })
      }    
    }

  })

})

Template.DocumentManagement.helpers({
  DocumentFolders() {
    return DocumentFolders.find({
      simulation_id: Session.get('Simulations.id')
    }, {
      sort: {
        folder_order: 1
      }
    })
  },
  Documents() {  
    let docs = Documents.find({
      folder_id: this.id
    }, {
      sort: {
        document_order: 1
      }
    })

    if(docs.fetch()) {

      let activeDocs = Documents.find({
        folder_id: this.id,
        status: 1
      })
      let _strFolderId = this.id.toString()

      _selfDocumentManagement.documents[_strFolderId] = activeDocs.fetch().length
      Session.set('DocumentFolders.documents.count', _selfDocumentManagement.documents)

      if(docs.fetch().length > 0) {
        Session.set('Documents.count', docs.fetch().length)
      }

      if(Session.get("dragToReorder")) {        
        initDocumentSortable(_strFolderId)
      }
    }
// console.log(Session.get('Documents.count'))
    return docs
  },
  DocumentFiles() {  
    let files = DocumentFiles.find({
      document_id: this.id
    })

    if(files.fetch()) {

      let activeFiles = DocumentFiles.find({
        document_id: this.id,
        status: 1
      })
      let _strDocId = this.id.toString()

      _selfDocumentManagement.files[_strDocId] = activeFiles.fetch().length
      Session.set('Documents.files.count', _selfDocumentManagement.files)
    }

    return files
  },
  rpp() {
    return Session.get("Simulations.rpp")
  },
  submitNewFolder() {
    let 
      $form = $('#new_folder_form'),
      name = $form.form('get value', 'name')      

    if(Session.get('Simulations.id') && name) {
      
      let numFolders = $('.doc-folder-item').length

      let dfObj = {
        name: name,
        simulation_id: parseInt(Session.get('Simulations.id')),
        order: numFolders+1 || 1
      }
      Meteor.call("DocumentFolders.insert", dfObj, (err, res) => {
        if(err) {
          Util.alert({mode: 'error'})
        } else {
          Util.alert()
        } 
        Util.loader({done: true}) 
      })  
    } else {
      Util.loader({done: true})
    }
  },
  submitEditFolder() {
    let 
      $form = $('#edit_folder_form'),
      name = $form.form('get value', 'name')      

    if(Session.get('Simulations.id') && name) {      

      let dfObj = {
        id: Session.get("DocumentManagement.Folder.id"),
        name: name,
      }
      Meteor.call("DocumentFolders.update.name", dfObj, (err, res) => {
        if(err) {
          Util.alert({mode: 'error'})
        } else {
          if(res) {
            // if(res.data.changedRows === 1) {
            if(res.data === 1) {
              Util.alert()              
            }
            // else if(res.data.changedRows === 0) {
            //   Util.alert({mode: 'warning', msg: 'Nothing to update'})
            // }
          } else {
            Util.alert({mode: 'error'})
          }
        }
        Util.loader({done: true}) 
      })  
    } else {
      Util.alert({mode: 'error'})
      Util.loader({done: true})
    }
  },
  submitNewDocument() {
    let 
      $form = $('#new_document_form'),
      name = $form.form('get value', 'name')      

    if(Session.get('Simulations.id')
      && Session.get('DocumentManagement.Folder.id') && name) {
      
      let
        simulationId = Session.get('Simulations.id'),
        dfId = Session.get('DocumentManagement.Folder.id'),
        numDocuments = $('#doc_group_'+dfId).find('.doc-item').length

      let medicationType = $('.rdo-medication-type:checked').val()

      // console.log(medicationType)
      let dObj = {
        has_pills: 0,
        medication_type: 0,
        folder_id: parseInt(dfId),
        name: name,
        simulation_id: parseInt(simulationId),
        document_order: numDocuments+1 || 1,
        pills: 0,
        pills_taken: 0,
        pills_prescribed: 0
      }

      if(medicationType) {
        let 
          medType = parseInt(medicationType),
          pills = $('#new_pills_to_show').val(),
          pillsTaken = $('#new_pills_taken').val(),
          pillsPrescribed = $('#new_pills_prescribed').val()

        dObj.medication_type = medType      
        dObj.has_pills = 1      
        dObj.pills = parseInt(pills)      
        dObj.pills_taken = parseInt(pillsTaken)      

        let rpp = Session.get("Simulations.rpp")

        if(medType === 1 || rpp === 1) {
          dObj.pills_prescribed = parseInt(pillsPrescribed)
        }
      }

      // console.log(dObj)
      Meteor.call("Documents.insert", dObj, (err, res) => {
        if(err) {
          Util.alert({mode: 'error'})
        } else {
          Util.alert();

          //-- reset DocumentFolderColors
          Session.set("DocumentFolderColors.colorPickerLoaded", null);
        }
        Util.loader({done: true})  
      })  
    } else {
      Util.alert({mode: 'error'})
      Util.loader({done: true})
    }
  },
  submitEditDocument() {
    let 
      $form = $('#edit_document_form'),
      name = $form.form('get value', 'name')      

    if(Session.get('Simulations.id')
      && Session.get('Documents.id') && name) {
      
      let
        simulationId = Session.get('Simulations.id'),
        dId = Session.get('Documents.id')        

      let dObj = {
        id: dId,        
        name: name
      }
      
      Meteor.call("Documents.update", dObj, (err, res) => {
        if(err) {
          Util.alert({mode: 'error'})
        } else {
          Util.alert()

          // $('#_doc_name_'+dId).html(name)

          //-- reset DocumentFolderColors
          Session.set("DocumentFolderColors.colorPickerLoaded", null);
        }
        Util.loader({done: true})
      })  
    } else {
      Util.alert({mode: 'error'})
      Util.loader({done: true})
    }
  },
  DocumentFileBeingUploaded(){
    if(Session.get('DocumentFiles.file.info')) {
      let file = S3.collection.find()

      if(file && file.fetch() && file.fetch().length > 0) {
        let _percent_uploaded = file.fetch()[0].percent_uploaded

        $('.document-file-upload-progress').progress('increment', _percent_uploaded)
      }

      return file.fetch()[0]
    }
  },
//   initDocumentSortable(folderId) {
//     console.log("a ", folderId)  
//     if(folderId) {

//       console.log(folderId)

//       let
//         myel = document.getElementById('doc_group_'+folderId);  
      
//       sortableD_Ids.push(folderId)
  
//       sortableDs[folderId] = new Sortable(myel, {   
//         sort: Session.get("Documents.dragToReorder"),
//         onEnd: function (e) {

//           if(Session.get("Documents.dragToReorder")) {
//             e.oldIndex;  // element's old index within parent
//             e.newIndex;  // element's new index within parent

//             let dObjs = []
//             $(myel).children('.doc-item').each(function(idx, el) {
//               let did = $(this).data('did')

//               let dObj = {
//                 id: did,
//                 order: idx
//               }

//               dObjs.push(dObj)
//             })

//             Meteor.call("Documents.orders.update", dObjs, (err, res) => {
//               if(err) {
//                 Util.alert('error')
//               } else {
//                 // console.log(res, res.data)

//                 if(res) {
//                   if(res.data === 'fail') {
//                     Util.alert({mode: 'error'})
//                   } else {
//                     Util.alert()
//                   }
//                 }

//               }
//             })
//           } else {
//             Util.alert({mode: 'info', msg: 'Please turn on Drag option to change the order of Documents/Folders.'})
          
//              $('.btn-document-options .setting')
//               .transition('set looping')
//               .transition('bounce', '2000ms')

//               setTimeout(()=>{
//                $('.btn-document-options .setting')
//                 .transition('remove looping')                
//               }, 6000)
//           }
//         },    
//       })
//     }
//   },  
//   initDocumentFolderSortable(folderId) {
// // console.log(Session.get("Documents.list") )    
//     if(Session.get("Documents.list") && Session.get("Documents.list").length > 0) {

//       // sortableDs = [], sortableD_Ids = []

//       let elDoc = document.getElementsByClassName('doc-group');
//       // console.log(elDoc.length);
//       [].forEach.call(elDoc, (el) => {

//         let 
//           id = el.id,
//           stringId = id.toString()

//         let myel = document.getElementById(id);  
        
//         sortableD_Ids.push(stringId)
//     // console.log(id, myel, sortableD_Ids)
//         sortableDs[stringId] = new Sortable(myel, {   
//           sort: Session.get("Documents.dragToReorder"),
//           onEnd: function (e) {

//             if(Session.get("Documents.dragToReorder")) {
//               e.oldIndex;  // element's old index within parent
//               e.newIndex;  // element's new index within parent

//               let dObjs = []
//               $(myel).children('.doc-item').each(function(idx, el) {
//                 let did = $(this).data('did')

//                 let dObj = {
//                   id: did,
//                   order: idx
//                 }

//                 dObjs.push(dObj)
//               })

//               Meteor.call("Documents.orders.update", dObjs, (err, res) => {
//                 if(err) {
//                   Util.alert('error')
//                 } else {
//                   // console.log(res, res.data)

//                   if(res) {
//                     if(res.data === 'fail') {
//                       Util.alert({mode: 'error'})
//                     } else {
//                       Util.alert()
//                     }
//                   }

//                 }
//               })
//             } else {
//               Util.alert({mode: 'info', msg: 'Please turn on Drag option to change the order of Documents/Folders.'})
            
//                $('.btn-document-options .setting')
//                 .transition('set looping')
//                 .transition('bounce', '2000ms')

//                 setTimeout(()=>{
//                  $('.btn-document-options .setting')
//                   .transition('remove looping')                
//                 }, 6000)
//             }
//           },    
//         })

//       })

//       // Session.set("Documents.numbers", Session.get("Documents.list").length)
//     }
//   }
})

Template.DocumentManagement.events({
  /*==============================*
   *   Document Folder events     *
   *==============================*/
  'click .btn-add-folder'(e, tpl) {
    e.preventDefault()

    resetDMButtons()

    $(e.currentTarget).addClass('blue')

    $('.shape')
      .shape('set next side', '.document-folder-add-form-container')
      .shape('flip left') 

    Util.log(Meteor.user(), "addfolder", "docmgmt")      
  },
  'click .btn-edit-document-folder'(e, tpl) {
    e.preventDefault()

    resetDMButtons()

    $(e.currentTarget).addClass('blue')

    let 
      dfId = $(e.currentTarget).parent().data("dfid"),
      dfName = $("#_doc_folder_name_"+dfId).text()

    $('.shape')
      .shape('set next side', '.document-folder-edit-form-container')
      .shape('flip right')

    Session.set("DocumentManagement.Folder.id", dfId)

    $("#edit_folder_form input").val(dfName)

    Util.log(Meteor.user(), dfId+"/editfolder", "docmgmt") 
  },
  'click .btn-update-document-folder-status'(e, tpl) {
    e.preventDefault()

    resetDMButtons()

    let
      dfid = $(e.currentTarget).parent().data('dfid')
      status = $(e.currentTarget).data('status')    

    let msg = status === '0' ? 'deactivate' 
      : (status === '1' ? 'activate' : 'delete')

    if(Session.get("Simulations.id")) {
      if(confirm("Are you sure to " + msg + " this folder?")) {

        let dfObj = {
          id: dfid,
          status: parseInt(status)
        }

        Meteor.call("DocumentFolders.update.status", dfObj, (err, res) => {
          if(err) {
            Util.alert({mode:'error'})
          } else {            
            // if(res && res.data.affectedRows === 1) {
            if(res && res.data === 1) {
              Util.alert()              
            }
          }
        })
      }
    } else {
      Util.alert({mode: 'error', msg: "Something is wrong. Please go back to 'Simulations' and come back."})
    }

    Util.log(Meteor.user(), dfid+"/updatefolderstatus", "docmgmt") 
  },
  /*=======================*
   *   Document events     *
   *=======================*/
  'click .btn-add-document'(e, tpl) {
    e.preventDefault()

    resetDMButtons()

    let dfId = $(e.currentTarget).closest('.doc-folder-item').data('dfid')

    $(e.currentTarget).addClass('blue')

    $('.shape')
      .shape('set next side', '.document-add-form-container')
      .shape('flip right') 

    Session.set("DocumentManagement.Folder.id", dfId)

    $('.medication-type-fields .ui.radio.checkbox').checkbox()

    Util.log(Meteor.user(), "adddoc", "docmgmt") 
  },
  'click .btn-edit-document'(e, tpl) {
    e.preventDefault()

    resetDMButtons()

    $(e.currentTarget).addClass('blue')

    let 
      dId = $(e.currentTarget).parent().data("did"),
      dName = $("#_doc_name_"+dId).text()

// console.log(dId, dName)

    $('.shape')
      .shape('set next side', '.document-edit-form-container')
      .shape('flip right')

    Session.set("Documents.id", dId)

    $("#edit_document_form input").val(dName)

    Util.log(Meteor.user(), dId+"/editdoc", "docmgmt") 
  },
  'click .btn-update-document-status'(e, tpl) {
    e.preventDefault()

    resetDMButtons()

    let
      did = $(e.currentTarget).parent().data('did')
      status = $(e.currentTarget).data('status')    

    let msg = status === '0' ? 'deactivate' 
      : (status === '1' ? 'activate' : 'delete')

    if(did) {
      if(confirm("Are you sure to " + msg + " this document?")) {

        let dObj = {
          id: did,
          status: parseInt(status)
        }

        Meteor.call("Documents.update.status", dObj, (err, res) => {
          if(err) {
            Util.alert({mode:'error'})
          } else {            
            // if(res && res.data.affectedRows === 1) {
            if(res && res.data === 1) {
              Util.alert()              
            }
          }
        })
      }
    } else {
      Util.alert({mode: 'error', msg: "Something is wrong. Please go back to 'Simulations' and come back."})
    }

    Util.log(Meteor.user(), did+"/updatedocstatus", "docmgmt") 
  },
  'change .sel-medication-type'(e, tpl) {
    e.preventDefault()

    let 
      did = $(e.currentTarget).data('did'),
      medicationType = parseInt($(e.currentTarget).val()),
      rpp = Session.get("Simulations.rpp")

    if(medicationType === 1 || rpp === 1) {
      $('#hidden_pills_prescribed_'+did).show()
    } else {
      $('#hidden_pills_prescribed_'+did).hide()
    }

    Util.log(Meteor.user(), did+"/changeselmedtype", "docmgmt") 
  },
  'click .btn-save-medication-document'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    let did = $(e.currentTarget).data('did')

    if(did) {
      // console.log(did)

      let 
        medicationType = parseInt($('#sel_medication_type_'+did).val()),
        pillsToShow = $('#pills_to_show_'+did).val(),
        pillsTaken = $('#pills_taken_'+did).val(),
        // pillsPrescribed = medicationType === 1 ? $('#pills_prescribed_'+did).val() : 0
        pillsPrescribed = $('#pills_prescribed_'+did).val()

      // console.log(medicationType)
      // console.log(pillsToShow)
      // console.log(pillsTaken)
      // console.log(pillsPrescribed)

      let medObj = {
        documentId: parseInt(did),
        medicationType:  medicationType,
        pillsToShow:  parseInt(pillsToShow),
        pillsTaken:  parseInt(pillsTaken),
        pillsPrescribed:  parseInt(pillsPrescribed)
      }

      Meteor.call("Documents.update.medication", medObj, (err, res) => {
        if(err) {
          Util.alert({mode: 'error', msg: err})
        } else {
          // if(res && res.data.affectedRows === 1) {
          if(res && res.data === 1) {
            Util.alert()            
          }          
        }
        Util.loader({done: true})
      })

    } else {
      Util.alert({mode: 'error'})
      Util.loader({done: true})
    }

    Util.log(Meteor.user(), did+"/savemeddoc", "docmgmt") 
  },
  'change .rdo-medication-type'(e, tpl) {
    e.preventDefault()

    let 
      type = parseInt($(e.currentTarget).val()),
      rpp = Session.get("Simulations.rpp")

    if(type === 1 || rpp === 1) {
      $('#new_hidden_pills_prescribed').attr('style','display:table-row !important');
    } else {
        $('#new_hidden_pills_prescribed').attr('style','display:none !important');      
    }
    // $('.document-add-form-container .medication-fields').removeClass('hide-block').addClass('show-block') //-- not working
    $('#medication_fields').attr('style','display:block !important');

    Util.log(Meteor.user(), "changerdomedtype", "docmgmt") 
  },
  'click .btn-reset-new-document-form'(e, tpl) {
    e.preventDefault()

    $('#new_document_form').form('clear')

    // $('.document-add-form-container .medication-fields').removeClass('show-block').addClass('hide-block') //-- not working
    $('#medication_fields').attr('style','display:none !important');
    
    Util.log(Meteor.user(), "resetnewdoc", "docmgmt") 
  },
  /*============================*
   *   Document File events     *
   *============================*/
  'click .btn-add-document-file'(e, tpl) {
    e.preventDefault()

    resetDMButtons()

    let dfid = $(e.currentTarget).closest('.doc-folder-item').data('dfid')
    let did = $(e.currentTarget).closest('.doc-item').data('did')

    $(e.currentTarget).addClass('blue')

    $('.shape')
      .shape('set next side', '.document-file-add-form-container')
      .shape('flip right') 

    Session.set("Documents.id", did)
    Session.set("DocumentFolders.id", dfid)

    Util.log(Meteor.user(), "adddocfile", "docmgmt") 
  },
  'change #document_file'(e, tpl) {
    
    e.preventDefault()

    Session.set('DocumentFiles.file.info', null)

    let file = e.currentTarget.files[0]

    if(file) {
      let
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
          document_id: Session.get("Documents.id"),
          folder_id: Session.get("DocumentFolders.id"),
          simulation_id: Session.get("Simulations.id"),
          // name: name,
          fileName: _newFileName,  
          modified: date,
          size: size,
          siSize: siSize
        }      

      $('.file-info').show()
      $('.file-name').html(_newFileName) 
      $('.file-modified').html(date) 
      $('.file-size').html(siSize)

      Session.set('DocumentFiles.file.info', infoObj)
    }

    Util.log(Meteor.user(), "changedocfile", "docmgmt") 

  },
  'click .btn-upload-document-file'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    let files = $("#document_file")[0].files

    if(files && Session.get('DocumentFiles.file.info')) {
      let infoObj = Session.get('DocumentFiles.file.info')

      files[0]['upload_name'] = infoObj.fileName

      S3.upload({
          files:files,
          path:"documents",
          unique_name: false,
          acl: 'private'
        }, (err, res) => {
          if(err) {
            Util.alert({mode: 'error'})
            // console.log(err)

            Util.loader({done: true})
          } else {
            if(res && res.percent_uploaded === 100) {              

              Meteor.call("DocumentFiles.upload", infoObj, (err, res) => {
                if(err) {
                  Util.alert({mode: 'error'})
                } else {
                  Util.alert({msg: 'Successfully uploaded'})

                  $('.file-info').hide()
                  $("#document_file").val(null)
                  _selfDocumentManagement.file = null

                  Session.set('DocumentFiles.id', null)
                  Session.set('DocumentFiles.file.info', null)                  
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

    Util.log(Meteor.user(), "uploaddocfile", "docmgmt")
  },
  'click .btn-update-file-status'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    resetDMButtons()

    let
      // fid = $(e.currentTarget).parent().data('fid')
      fid = $(e.currentTarget).data('fid')
      status = $(e.currentTarget).data('status')    

    let msg = status === '0' ? 'deactivate' 
      : (status === '1' ? 'activate' : 'delete')

    if(fid) {
      if(confirm("Are you sure to " + msg + " this file?")) {

        let fObj = {
          id: fid,
          status: parseInt(status)
        }

        Meteor.call("DocumentFiles.update.status", fObj, (err, res) => {
          if(err) {
            Util.alert({mode:'error'})            
          } else {            
            // if(res && res.data.affectedRows === 1) {
            if(res && res.data === 1) {
              Util.alert()
            }
          }
          Util.loader({done: true})
        })
      }
    } else {
      Util.alert({mode: 'error', msg: "Something is wrong. Please go back to 'Simulations' and come back."})
      Util.loader({done: true})
    }

    Util.log(Meteor.user(), "updatefilestatus", "docmgmt") 
  },
  'click .btn-view-file'(e, tpl) {
    e.preventDefault()

    Util.loader({elem: $(e.currentTarget)})

    // let fid = $(e.currentTarget).parent().data('fid')
    let fid = $(e.currentTarget).data('fid')
    // const my_document_file = new MysqlSubscription('document_file_w_id', fid);
    // console.log(fid)

    Session.set("DocumentFiles.id", fid) //-- MysqlSubscription works with this when being inside autorun.

    // my_document_file.reactive()
    // my_document_file.change(fid)
    // my_document_file.reactive()

    if(fid) {

      // let file = my_document_file.filter(function(f) {
      //   return f.id === fid
      // })[0]

      let file = _selfDocumentManagement.files[fid]

      if(file) {
        // let fileUrl = 'https://s3.amazonaws.com/craav2-us-east-1-uploads/media/'+file.file
        // let fileUrl = 'media/'+file.file
        let fileObj = {
          s3Path: 'documents/',
          fileName: file.file,
          id: file.id
        }

        // Session.set('docFile', fileUrl);

        Meteor.call("DocumentFiles.download", fileObj, (err, res) => {
          if(err) {
            Util.alert({mode: 'error'})
          } else {
            // console.log(res)

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
  },
  'click .btn-save-document-order'(e, tpl) {
    e.preventDefault();

    let
      fid = this.id, 
      _docOrderList = Session.get("DocumentManagement.docOrder");
// console.log(this, _docOrderList)
    if(fid && _docOrderList && _docOrderList.length > 0) {
      // console.log(_docOrderList);
      Util.loader({elem: $(e.currentTarget)});

      let _docs = [], _nDocOrderList = [];

      _docOrderList.forEach((d) => {
        if(d.fid === fid) {
          _docs.push(d)
        } else {
          _nDocOrderList.push(d)
        }
      })
// console.log(_docs)
      if(_docs.length > 0) {

        Meteor.call("Documents.orders.update", _docs, (err, res) => {
          if(err) {
            Util.alert('error')
          } else {
            // console.log(res, res.data)

            if(res) {
              if(res.data === 'fail') {
                Util.alert({mode: 'error'})
              } else {
                Util.alert()
                Session.set("DocumentManagement.docOrder", _nDocOrderList);
                $("#btn_save_doc_order_"+fid+" > i").removeClass().addClass("save grey icon")
              }
            }
          }

          Util.loader({elem: $(e.currentTarget), done: true})
        });

      }

    }
  }
})

Template.DocumentManagement.onDestroyed(simMgmtOnDestroyed => {
  // Session.set("Simulations.id", null)
  Session.set("DocumentManagement.Folder.id", null)
  Session.set("Documents.id", null)
  Session.set('DocumentFiles.id', null)
  Session.set('DocumentFiles.file.info', null)
  Session.set('Documents.count', null)
})

function resetDMButtons() {
  // $('.form').form('clear')
  $('.button').removeClass('blue')

  resetDMFile()
}

function resetDMFile() {
  
  $('.file-info').hide()
  $("#document_file").val(null)
  _selfDocumentManagement.file = null

  Session.set('DocumentFiles.id', null)
  Session.set('DocumentFiles.file.info', null)
}

// $(document).ready(() => {
function initDocumentSortable(folderId) {
    // console.log("a ", folderId)  
  if(folderId) {

      // console.log(folderId)

    let
      myel = document.getElementById('doc_group_'+folderId);  
      
    if(myel) {
      sortableD_Ids.push(folderId)
  
      sortableDs[folderId] = new Sortable(myel, {   
        sort: Session.get("Documents.dragToReorder"),
        onEnd: function (e) {

          if(Session.get("Documents.dragToReorder")) {
            e.oldIndex;  // element's old index within parent
            e.newIndex;  // element's new index within parent

            let 
              dObjs = Session.get("DocumentManagement.docOrder") || [],
              _nDObjs = [];

            if(dObjs.length > 0) {

              dObjs.forEach((d) => {
                if(d.fid !== parseInt(folderId)) {
                  _nDObjs.push(d)
                }
              })
            }

            $(myel).children('.doc-item').each(function(idx, el) {
              let did = $(this).data('did')

              if(did) {
                let dObj = {
                  id: did,
                  order: idx,
                  fid: parseInt(folderId)
                }

                // dObjs.push(dObj)
                _nDObjs.push(dObj)
              }
            })

            Session.set("DocumentManagement.docOrder", _nDObjs);
            $("#btn_save_doc_order_"+folderId+" > i").removeClass().addClass("save blue icon")
            // Meteor.call("Documents.orders.update", dObjs, (err, res) => {
            //   if(err) {
            //     Util.alert('error')
            //   } else {
            //     // console.log(res, res.data)

            //     if(res) {
            //       if(res.data === 'fail') {
            //         Util.alert({mode: 'error'})
            //       } else {
            //         Util.alert()
            //       }
            //     }

            //   }
            // })
          } else {
            Util.alert({mode: 'info', msg: 'Please turn on the Drag option to change the order of Documents/Folders.'})
          
             $('.btn-document-options .setting')
              .transition('set looping')
              .transition('bounce', '2000ms')

              setTimeout(()=>{
               $('.btn-document-options .setting')
                .transition('remove looping')                
              }, 6000)
          }
        },    
      })
    }
  }
}

// })


