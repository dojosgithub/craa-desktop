import { check } from 'meteor/check';

import { DocumentFolderColors } from '../document-folder-colors.js';

Meteor.publish('document_folder_colors', () => {
  return DocumentFolderColors.find();
});
