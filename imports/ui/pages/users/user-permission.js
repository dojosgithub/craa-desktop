import Tabular from 'meteor/aldeed:tabular';

import { UsersSummary } from '/imports/api/users-summary/users-summary.js'

import './user-permission.html'
import '/imports/ui/stylesheets/users/user-permission.less'

Template.UserPermission.onCreated(() => {

})

Template.UserPermission.helpers({
  validUsers() {
    return {
      status: {$ne: 'Deleted'},
      roleKey: {$in: ['4', '5']}
    }
  }
})
