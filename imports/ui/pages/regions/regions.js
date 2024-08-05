import { Session } from 'meteor/session'

import { Util } from '/imports/lib/util.js'

import './regions.html'
import '/imports/ui/stylesheets/regions/regions.less'


let _selfRegions

Template.Regions.onCreated(function regionsOnCreated() {
  
  _selfRegions = this  

  _selfRegions.tabs = {
    first: 'RegionsPRAHS',
    second: "RegionsQuintiles"
  }

  Session.set("Regions.tab", _selfRegions.tabs)

  Session.set("Regions.tab", {first: "RegionsPRAHS"})
  Session.set("Regions.tab.name", 'PRAHS') //-- by default

  $('.attached.tab.first').addClass('loading')    

  Util.loading(false)
})

Template.Regions.onRendered(function regionsOnRendered() {
  $('.regions-menu .item').tab({
    onLoad: function(path, params, history) {

      let tab = {
        first: null,
        second: null
      }

      tab[path] = _selfRegions.tabs[path]

      Session.set("Regions.tab", tab)  

      let 
        msg = '', 
        name = 'PRAHS';

      if(path === 'first') {
        msg = 'prahs'
        name = 'PRAHS'
      }
      else if(path === 'second') {
        msg = 'quintiles'
        name = 'Quintiles'
      } 

      Session.set("Regions.tab.name", name)

      Util.log(Meteor.user(), msg, "regions")

    }
  })

})

Template.Regions.helpers({
  RegionsPRAHS() {
    if( Session.get("Regions.tab").first) {

      import '/imports/ui/pages/regions/regions-prahs.js'

      return Session.get("Regions.tab").first
    }    
  },
  RegionsQuintiles() {
    if( Session.get("Regions.tab").second) {

      import '/imports/ui/pages/regions/regions-quintiles.js'

      return Session.get("Regions.tab").second
    }    
  }  
})

Template.Regions.events({
  'click .regions-menu .item'(e, tpl) {
    e.preventDefault()
      Util.loader($(e.currentTarget))
      setTimeout(()=>{Util.loader({done: true})}, 500) 
  },  
})

Template.Regions.onDestroyed(() => {
  Session.set("Regions.tab.name", null)
})


