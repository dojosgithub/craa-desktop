import { Session } from 'meteor/session'

import  { Util } from '/imports/lib/util.js'

import './tools.html'
import '/imports/ui/stylesheets/tools/tools.less'

let _selfTools

Template.Tools.onCreated(function toolsOnCreated() {
  _selfTools = this

  _selfTools.tabs = {
    first: 'EmailManager',
    second: "DocumentFolderColors"
  }

  Session.set("Tools.tab", _selfTools.tabs)

  Util.loading(false)
})

Template.Tools.onRendered(function toolsOnRendered() {
  $('.tools-menu .item').tab()
})

Template.Tools.helpers({
  EmailManager() {
    if( Session.get("Tools.tab").first) {

      import './email-manager.js';

      return Session.get("Tools.tab").first
    }    
  },
  DocumentFolderColors() {
    if( Session.get("Tools.tab").second) {

      import './document-folder-colors.js'

      return Session.get("Tools.tab").second
    }    
  },  
})