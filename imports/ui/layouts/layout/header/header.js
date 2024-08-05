import { Util } from '/imports/lib/util.js'

import '/imports/lib/template-helpers.js'

import './header.html'
import '/imports/ui/stylesheets/layouts/header.less'

Template.Header.onCreated(function headerOnCreated() {  

  Tracker.autorun(() => {    
    if(!Meteor.user()) {
      Util.go('signin', 'App.signin')
    }
  })
})

Template.Header.onRendered(function headerOnRendered() {
  $('.ui.header-menu-settings .ui.dropdown').dropdown();
})

Template.Header.events({
  'click .btn-view-all-simulations'(e, tpl) {
    e.preventDefault()

    $(".menu-list > .item.button").removeClass('menu-selected');
    $(e.currentTarget).addClass('menu-selected');

    Util.go('simulations')
  },
  'click .btn-view-all-findings'(e, tpl) {
    e.preventDefault()

    $(".menu-list > .item.button").removeClass('menu-selected');
    $(e.currentTarget).addClass('menu-selected');

    Util.go('all-findings')
  },
  'click .btn-view-findings-requirements'(e, tpl) {
    e.preventDefault()

    $(".menu-list > .item.button").removeClass('menu-selected');
    $(e.currentTarget).addClass('menu-selected');

    Util.go('findings-requirements')
  },
  'click .btn-view-findings-tips'(e, tpl) {
    e.preventDefault()

    $(".menu-list > .item.button").removeClass('menu-selected');
    $(e.currentTarget).addClass('menu-selected');

    Util.go('findings-tips')
  },
  'click .btn-view-findings-selected'(e, tpl) {
    e.preventDefault()

    $(".menu-list > .item.button").removeClass('menu-selected');
    $(e.currentTarget).addClass('menu-selected');

    Util.go('findings-selected')
  },
  'click .btn-view-all-requests'(e, tpl) {
    e.preventDefault()
    
    $(".menu-list > .item.button").removeClass('menu-selected');
    $(e.currentTarget).addClass('menu-selected');

    Util.go('requests')
  },
  'click .btn-view-etl'(e, tpl) {
    e.preventDefault()  
    
    $(".menu-list > .item.button").removeClass('menu-selected');
    $(e.currentTarget).addClass('menu-selected');

    Util.go('etl')        
  },
  'click .header-menu-item-signout'(e, tpl) {
    e.preventDefault()

    Meteor.logout((err) => {
      FlowRouter.go('/'+___aR+'/signin')
    })    
  },
  'click .btn-view-tools'(e, tpl) {
    e.preventDefault()

    $(".menu-list > .item.button").removeClass('menu-selected');
    $(e.currentTarget).addClass('menu-selected');

    Util.go('tools')   
  },
  'click .btn-view-exports'(e, tpl) {
    e.preventDefault()

    $(".menu-list > .item.button").removeClass('menu-selected');
    $(e.currentTarget).addClass('menu-selected');

    Util.go('export')   
  },  
  'click .btn-view-datadump'(e, tpl) {
    e.preventDefault()

    $(".menu-list > .item.button").removeClass('menu-selected');
    $(e.currentTarget).addClass('menu-selected');

    Util.go('datadump')    
  },
  'click .btn-view-regions'(e, tpl) {
    e.preventDefault()

    $(".menu-list > .item.button").removeClass('menu-selected');
    $(e.currentTarget).addClass('menu-selected');

    Util.go('regions')    
  },
  'click .btn-view-scoring'(e, tpl) {
    e.preventDefault()

    $(".menu-list > .item.button").removeClass('menu-selected');
    $(e.currentTarget).addClass('menu-selected');

    Util.go('scoring')    
  },
  'click .btn-view-training'(e, tpl) {
    e.preventDefault()

    $(".menu-list > .item.button").removeClass('menu-selected');
    $(e.currentTarget).addClass('menu-selected');

    Util.go('training')    
  },
  'click .btn-view-users'(e, tpl) {
    e.preventDefault()

    $(".menu-list > .item.button").removeClass('menu-selected');
    $(e.currentTarget).addClass('menu-selected');

    Util.go('users')
  },
  'click .btn-view-uba'(e, tpl) {
    e.preventDefault()

    $(".menu-list > .item.button").removeClass('menu-selected');
    $(e.currentTarget).addClass('menu-selected');

    Util.go('uba')
  }  
})
