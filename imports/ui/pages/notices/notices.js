import { Util } from '/imports/lib/util.js'

import './notices.html'
import '/imports/ui/stylesheets/notices/notices.less'

Template.Notices.onCreated(function noticesOnCreated() {

})

Template.Notices.onRendered(function noticesOnRendered() {
  Util.loading(false)
})
