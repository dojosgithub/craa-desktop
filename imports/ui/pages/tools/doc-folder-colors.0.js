import { Session } from 'meteor/session'

// import { jquery } from 'meteor/jquery';
// import 'jquery';

import '/imports/lib/color-picker/spectrum.css';
import '/imports/lib/color-picker/spectrum.js';


// import 'spectrum-colorpicker/spectrum.css';
// import 'spectrum-colorpicker/spectrum';

import { Util } from '/imports/lib/util.js'

import './doc-folder-colors.html'
import '/imports/ui/stylesheets/tools/doc-folder-colors.less'

// import  { DocumentFolders } from '/imports/api/document-folders/document-folders.js'

let _selfDocFolderColors;

Template.DocFolderColors.onCreated(function() {

	_selfDocFolderColors = this;

	// _selfDocFolderColors.options = {
 //    // color: tinycolor,
 //    // flat: bool,
 //    showInput: true,
 //    // showInitial: bool,
 //    allowEmpty: true,
 //    showAlpha: true,
 //    // disabled: bool,
 //    // localStorageKey: string,
 //    // showPalette: true,
 //    showPaletteOnly: true,
 //    togglePaletteOnly: true,
 //    showSelectionPalette: true,
 //    clickoutFiresChange: false, //-- color is chosen only when the 'select' button is pressed
 //    cancelText: "Cancel",
 //    chooseText: "Select",
 //    togglePaletteMoreText: "Show Color Board",
 //    togglePaletteLessText: "Hide Color Board",
 //    // containerClassName: string,
 //    // replacerClassName: string,
 //    preferredFormat: "name",
 //    // maxSelectionSize: int,
 //    // palette: [[string]],
 //    // selectionPalette: [string],
 //    change: () => {
 //    	console.log($(this).attr("id"))
 //    }
	// }	
})

Template.DocFolderColors.onRendered(function() {
	
	Template.DocFolderColors.__helpers.get("getDocumentsAndFolders").call();

	$('.ui.accordion').accordion({
		exclusive: false
		// onOpen: () => {
		// }
	});


	$(".input-folder-color-picker").spectrum({
    // color: tinycolor,
    // flat: bool,
    showInput: true,
    // showInitial: bool,
    allowEmpty: true,
    showAlpha: true,
    // disabled: bool,
    // localStorageKey: string,
    showPalette: true,
    // showPaletteOnly: true,
    // togglePaletteOnly: true,
    showSelectionPalette: true,
    clickoutFiresChange: false, //-- color is not chosen just by clicking outside of the colorpicker
    cancelText: "Cancel",
    chooseText: "Select",
    togglePaletteMoreText: "Show Color Board",
    togglePaletteLessText: "Hide Color Board",
    // containerClassName: "doc-folder-color-picker-container",
    replacerClassName: "folder-color-picker-container",
    preferredFormat: "name",
    // maxSelectionSize: int,
    // palette: [[string]],
    // selectionPalette: [string],
    // change: (color) => {
    // 	console.log(color);
    // 	console.log($(this).attr("id"));
    // }
	}).on("change.spectrum", (e, color) => {
		//-- this is from the selected color box, do nothing
	}).on("select.spectrum", (e, color) => { //-- 'select' event got added to the spectrum source code for this
		//-- this is now fired when the 'select' button is pressend
		if(color) {
			let _color = color.toHexString();
			console.log(_color);
			console.log($(e.currentTarget).attr("id"));
			console.log(e);
		}	
	});

	$(".input-doc-color-picker").spectrum({
    // color: tinycolor,
    // flat: bool,
    showInput: true,
    // showInitial: bool,
    allowEmpty: true,
    showAlpha: true,
    // disabled: bool,
    // localStorageKey: string,
    showPalette: true,
    // showPaletteOnly: true,
    // togglePaletteOnly: true,
    showSelectionPalette: true,
    clickoutFiresChange: false, //-- color is not chosen just by clicking outside of the colorpicker
    cancelText: "Cancel",
    chooseText: "Select",
    togglePaletteMoreText: "Show Color Board",
    togglePaletteLessText: "Hide Color Board",
    // containerClassName: "doc-folder-color-picker-container",
    replacerClassName: "doc-color-picker-container",
    preferredFormat: "name",
    // maxSelectionSize: int,
    // palette: [[string]],
    // selectionPalette: [string],
    // change: (color) => {
    // 	console.log(color);
    // 	console.log($(this).attr("id"));
    // }
	}).on("change.spectrum", (e, color) => {
		//-- this is from the selected color box, do nothing
	}).on("select.spectrum", (e, color) => { //-- 'select' event got added to the spectrum source code for this
		//-- this is now fired when the 'select' button is pressend
		if(color) {
			let _color = color.toHexString();
			console.log(_color);
			console.log($(e.currentTarget).attr("id"));
			console.log(e);
		}	
	});

});

Template.DocFolderColors.helpers({
	getDocumentsAndFolders() {
		Util.loading(true);

		let _folders = [];
		Meteor.call("DocumentFolders.get.allActive", {}, (err, res) => {

			if(err) {
				Util.alert({mode: 'error'});
				// console.log(err)
				Util.loading(false);
			} else {
				// console.log(res, res.data, res.data.length);
				if(res && res.data && res.data.length > 0) {
					Session.set("DocFolderColors.docFolders", res.data);
					Session.set("DocFolderColors.docFolders.0", res.data[0]);
					Session.set("DocFolderColors.docFolders.1", res.data[1]);
					Session.set("DocFolderColors.docFolders.2", res.data[2]);
					Session.set("DocFolderColors.docFoldersObj", {
						one: res.data[0],
						two: res.data[1],
						three: res.data[2]
					});
					console.log(res.data);
					// Template.DocFolderColors.__helpers.get("Folders").call();
				}

				Util.loading(false);

			}
		})

		return _folders;
	},
	Folders0() {
		if(Session.get("DocFolderColors.docFolders")) {
			let _docFolders = Session.get("DocFolderColors.docFolders");
			return _docFolders;
		}
	},
	Folders1() {},
	Folders2() {},
	Folders3() {},
	Folders() {
		if(Session.get("DocFolderColors.docFoldersObj")) {
			let _docFolders = Session.get("DocFolderColors.docFoldersObj");
			return _docFolders;
		}
	},			
});
