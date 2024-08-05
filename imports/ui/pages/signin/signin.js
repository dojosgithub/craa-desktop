// import {BrowserWindow} from 'electron';

import { Util } from '/imports/lib/util.js'

import './signin.html'
import '/imports/ui/stylesheets/signin/signin.less'

Template.SignIn.onRendered(function signinOnRendered() {

  $('body').css({
    backgroundImage: 'url("/img/init_bg3_4.jpg")',
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
    margin: 0,
    padding: 0
  })

  if(Meteor.isDesktop) {
    Desktop.send('desktop', 'setWindowSize', {width: 650, height: 500})
    Desktop.send('desktop', 'hideMenu')
  }

  $('#signin_form')
  .form({
    inline: true,
    fields: {
      name: {
        identifier: 'name',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter your name'
          }
        ]
      },
      username: {
        identifier: 'username',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a username'
          }
        ]
      },
      password: {
        identifier: 'password',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter a password'
          },
          {
            type   : 'minLength[8]',
            prompt : 'Your password must be at least {ruleValue} characters'
          }
        ]
      },
    },
    onSuccess: function(data) {
      // console.log(data) //- Nothing...
      Template.SignIn.__helpers.get('submitSignIn').call()
      return false //-- This'd avoid submitting the form w/o invoking loginWithPassword
    }
  })

  $('.ui.modal').modal('hide all')

  Util.loading(false) //-- In case a spinner is still loading from any previous session...
})

Template.SignIn.helpers({
  submitSignIn() {

    let 
      $form = $('#signin_form'),
      username = $form.form('get value', 'username'),
      password = $form.form('get value', 'password')

    if(username && password) {
      // console.log(username, password)
      Meteor.loginWithPassword(username, password, function(err) {
          if(err) {
              // Meteor.libMethods.boogyWoogy('.row-signin-form');
              // console.log('No ', err)
              Util.alert({mode: 'error', msg: err})

              $('#signin_form').transition('shake')              
          } else {

            Util.log(Meteor.user(), 'signed-in', 'signin')                    
            // console.log('OK')
            // alert('OK')         
            let _role =  Meteor.user() && Meteor.user().profile && Meteor.user() && Meteor.user().profile.role;

            if(_role && parseInt(_role) < 3) {
              FlowRouter.go('/'+___aR+'/home')
            } else {
              Util.alert({mode: 'error', msg: "Access Denined. This incident has been reported."});
            }
            // route('home')
          }  
      })  
    }

  },

  submitSignIn1() {

    let 
      $form = $('#signin_form'),
      username = $form.form('get value', 'username'),
      password = $form.form('get value', 'password')

    if(username && password) {

      let _obj = {
        username: username,
        password: password
      }
      Meteor.call("Users.loginWithPassword", _obj, (err, res) => {        
        if(err) {
          Util.alert({mode: 'error', msg: err})
        } else {
          if(res && res.token) {
            FlowRouter.go('/'+___aR+'/home')
          } else {
            Util.alert({mode: 'error', msg: res.reason || res.error})
            $('#signin_form').transition('shake')
          }
        }
      }); 
    }

  }  
})



Template.SignIn.events({
  'click .btn-submit-signin'(e, tpl) {
    e.preventDefault()

    let 
      $form = $('#signin_form'),
      username = $form.form('get value', 'username'),
      password = $form.form('get value', 'password')  
      
    if(username && password) {
      Template.SignIn.__helpers.get('submitSignIn').call()
    }
  }, 
})

