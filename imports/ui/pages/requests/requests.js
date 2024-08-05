import { Session } from 'meteor/session'

import { Requests } from '/imports/api/requests/requests.js'

import './requests.html'
import '/imports/ui/stylesheets/requests/requests.less'

Template.Requests.onCreated(function requestsOnCreated() {

})

Template.Requests.onRendered(function requestsOnRendered() {

})

Template.Requests.events({
  'click .requests-menu .item'(e, tpl) {
    e.preventDefault()

    $('.requests-menu .item').removeClass('active')
    $(e.currentTarget).addClass('active')
  }
})

Template.Requests.helpers({
  RequestsAssigned() {
    let requests = Requests.find({
    
    })

    // console.log(requests.fetch())

    return requests
  },
  RequestsCreated() {
    return Requests.find({
      requester: Meteor.userId()
    })
  },  
})
