import { Session } from 'meteor/session'

import { Util } from '/imports/lib/util.js'

import './review-request.html'
import '/imports/ui/stylesheets/common/review-request.less'

let _selfReviewRequest

Template.ReviewRequest.onCreated(function reviewRequestOnCreated() {
  _selfReviewRequest = this
  // _selfReviewRequest.helpers = Template.ReviewRequest.__helpers

  Session.set('ReviewRequest.reviewers', null)
  Session.set('ReviewRequest.availableReviewers', null)  

})

Template.ReviewRequest.onRendered(function reviewRequestOnRendered() {

  Session.set('ReviewRequest.availableReviewers', Session.get("Users.craa.admins") || null)

  Tracker.autorun(() => {

    if(Session.get("ReviewRequest.availableReviewers")) {

      let availableReviewers = Session.get("ReviewRequest.availableReviewers")

      setTimeout(() => {                
          $('.ui.search.reviewers').search({
            source: Session.get("ReviewRequest.availableReviewers"),
            cache: false,
            showNoResults: false,
            fields: {
              title: 'fullname'
            },
            searchFields: ['fullname'],
            // searchFullText: true,
            onSelect(result) {              
              // _selfReviewRequest.helpers.get('selectReviewers').call(this, result)

              $('#_input_reviewers').remove()

              let 
                reviewers = Session.get('ReviewRequest.reviewers') || []         

              reviewers.push(result)

              Session.set("ReviewRequest.reviewers", reviewers);

              let _availableReviewers = availableReviewers.filter((u) => {
                return u._id !== result._id
              })           

              // console.log(_availableReviewers)

              Session.set("ReviewRequest.availableReviewers", _availableReviewers)

              // $('.ui.search.reviewers').search({
              //   source:  _availableReviewers
              // })
              // $('#_input_reviewers').val('')
              // $('#frm_search_reviewers').form('reset')
              // $('.ui.search.reviewers .results').empty()

              // // let input = document.getElementById('_input_reviewers')
              // console.log($('#_input_reviewers').val())

              // Template.ReviewRequest.__helpers.get('selectReviewers').call()              

              //-- Very rough, but, for now this seems to be the way 
              //-- to avoid adding duplocated reviewers ...
              let input = `
                <input class="prompt input-reviewers" type="text" id="_input_reviewers">
              `
              $('.ui.search.reviewers > .ui.input').append(input) //-- This seems to be the only simple way to clear the search slot...
              $('#_input_reviewers').focus()

              $('.ui.search.reviewers').search({
                source: _availableReviewers
              })

            } 
          })
      }, 1000)
    }

  })

  $('.ui.modal.review-request-modal')
    .modal({
      closable: false,
      transition: 'vertical flip',
      detachable: false,
      onApprove() {
        return false
      },
      onHidden() {
        Util.loader({done: true})
        Session.set("Templates.ReviewRequest", null)
      }
    })
    .modal('show')

})

Template.ReviewRequest.helpers({
  // selectReviewers(reviewer) {
  //   // console.log(reviewer)
  //   $('#_input_reviewers').val('')
  //   $('#frm_search_reviewers').form('reset')
  //   $('.ui.search.reviewers .results').empty()    
  // },
  Reviewers() {
    return Session.get("ReviewRequest.reviewers")
  }
})

Template.ReviewRequest.events({
  'click .btn-remove-reviewer'(e, tpl) {
  // 'click .review-request-modal'(e, tpl) {
    e.preventDefault()

    let 
      uid = $(e.currentTarget).data('uid'),
      reviewers = Session.get('ReviewRequest.reviewers'),
      availableReviewers = Session.get('ReviewRequest.availableReviewers'),
      _reviewers = Util.remove(reviewers, '_id', uid)

    Session.set('ReviewRequest.reviewers', _reviewers)

    // console.log(_reviewers)
    let reviewerToReadd = {
      _id: uid,
      fullname: $(e.currentTarget).siblings('.reviewer-name').text()
    }
    availableReviewers.push(reviewerToReadd)

    Session.set('ReviewRequest.availableReviewers', availableReviewers)

  },
  'click .btn-add-all-reviewers'(e, tpl) {
    e.preventDefault()

    let
      craaAdmins = Session.get("Users.craa.admins"),
      reviewers = craaAdmins

    Session.set("ReviewRequest.reviewers", reviewers)
    Session.set("ReviewRequest.availableReviewers", [])

  },
  'click .btn-submit-review-request'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    let 
      ignore = $('#ignore_reviewers').is(':checked'),
      reviewers = Session.get("ReviewRequest.reviewers"),
      requestObj = Session.get("ReviewRequest.object")

    // console.log(ignore, reviewers, requestObj)

    if(ignore) {
      if(requestObj) {
        Meteor.call("Revisions.insert", requestObj, (err, res) => {          
          if(err) {
            Util.alert({mode: 'error', msg: err})
          } else {            
            if(res && res.success) {
              Util.alert()
              $(e.currentTarget).closest('.ui.modal.review-request-modal').modal('hide')
            }
          }

          Util.loader({done: true})
        })
      }
    } else {

      if(reviewers && reviewers.length > 0) {

        if(requestObj) {
          let _requestObj = {
            reviewers: reviewers,
            request: requestObj
          }
  
          Meteor.call("Requests.insert", _requestObj, (err, res) => {
            if(err) {
              Util.alert({mode: 'error', msg: err})
            } else {
              // console.log(res) //-- {success: true, data: NEW_APPROVAL_ID}
              if(res && res.success) {
                Util.alert()
                $(e.currentTarget).closest('.ui.modal.review-request-modal').modal('hide')
              }
            }

            Util.loader({done: true})
          })
        } else {
          Util.alert({mode: 'error', msg: 'No request exists. Please check and try again.'})
          Util.loader({done: true})
        }
      } else {
        Util.alert({mode: 'error', msg: 'No designated reviewer exists. Please check and try again.'})
        Util.loader({done: true})
      }

    }
  },
  'change #ignore_reviewers'(e, tpl) {
    e.preventDefault()

    let ignore = $(e.currentTarget).is(':checked')

    if(ignore) {
      Session.set('ReviewRequest.reviewers', [])
      Session.set('ReviewRequest.availableReviewers', Session.get("Users.craa.admins"))

      $('.btn-add-all-reviewers').prop('disabled', true)
      $('#_input_reviewers').prop('disabled', true)      
    } else {
      $('.btn-add-all-reviewers').prop('disabled', false)
      $('#_input_reviewers').prop('disabled', false)       
    }
  }
})

Template.ReviewRequest.onDestroyed(() => {
  $('.ui.modal.review-request-modal')
    .modal('hide')
})

