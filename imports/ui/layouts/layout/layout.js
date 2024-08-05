import { Session } from 'meteor/session'

import '/imports/ui/layouts/layout/header/header.js'
import '/imports/ui/layouts/layout/leftbar/leftbar.js'
import '/imports/ui/layouts/layout/rightbar/rightbar.js'
import '/imports/ui/layouts/layout/footer/footer.js'

import './layout.html'

Template.Layout.helpers({
  ReviewRequest() {
    
    if(Session.get("Templates.ReviewRequest")) {
      // import('/imports/ui/pages/common/review-request.js').then(reviewRequest => {
      //   console.log(Session.get("Templates.ReviewRequest"))
      //   return Session.get("Templates.ReviewRequest")
      // })  

      import '/imports/ui/pages/common/review-request.js'
        return Session.get("Templates.ReviewRequest")
    

    }
    
  },
  ScoringQASidebar() {
    if(Session.get("ScoringReviewAction.qa-sidebar.template")) {
      // console.log(Session.get("ScoringReviewAction.qa-sidebar.template"))
      return Session.get("ScoringReviewAction.qa-sidebar.template");
    }
  },
  ScoringQASettingsSidebar() {
    if(Session.get("QAMainAction.qaSettingsSidebar.template")) {
      return Session.get("QAMainAction.qaSettingsSidebar.template");
    }
  },
  ScoringQAViewSidebar() {
    if(Session.get("QAMainAction.qaViewSidebar.template")) {
      return Session.get("QAMainAction.qaViewSidebar.template");
    }
  }    
})
