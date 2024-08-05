import { Session } from 'meteor/session'

// import { jquery } from 'meteor/jquery';
// import 'jquery';

import  { DocumentFolderColors } from '/imports/api/document-folder-colors/document-folder-colors.js';
import  { Simulations } from '/imports/api/simulations/simulations.js';

import '/imports/lib/color-picker/spectrum.css';
import '/imports/lib/color-picker/spectrum.js';


// import 'spectrum-colorpicker/spectrum.css';
// import 'spectrum-colorpicker/spectrum';

import { Util } from '/imports/lib/util.js'

import './document-folder-colors.html'
import '/imports/ui/stylesheets/tools/document-folder-colors.less'

let _selfDocumentFolderColors;

Template.DocumentFolderColors.onCreated(function() {

	_selfDocumentFolderColors = this;
})

Template.DocumentFolderColors.onRendered(function() {
	
	Template.DocumentFolderColors.__helpers.get("getDocumentsAndFolders").call();

	$('.ui.accordion').accordion({
		exclusive: false
		// onOpen: () => {
		// }
	});

	//-- Color pickers will not 
	if(!Session.get("DocumentFolderColors.colorPickerLoaded")) {
		$(".btn-initiate-colors").show();
	}

	$('.ui.search.dropdown.simulations')
	  .dropdown({
	    clearable: true,	    
    	onChange: function(value, text, $selectedItem) {
      	// console.log(value)
      	// console.log(text)
      	// console.log($selectedItem)
      	let _value = [];
      	if(value && value.length > 0) {
      		_value = value.map((v,i) => {
      			return parseInt(v)
      		})      		
      	}

      	Session.set("DocumentFolderColors.simulations", _value);
    	},
    	// onHide: function(value, text, $selectedItem) {
    	// 	$(".btn-simulations-action").show();
    	// },
    	// onShow: function(value, text, $selectedItem) {
    	// 	$(".btn-simulations-action").hide();
    	// },
    	'set selected': Session.get("DocumentFolderColors.simulations")    		    
	  });
	
	// if(Session.get("DocumentFolderColors.simulations")) {
	// 	console.log(Session.get("DocumentFolderColors.simulations"));
	// 	$('.ui.search.dropdown')
	//   	.dropdown("set selected", Session.get("DocumentFolderColors.simulations"));

	// 	$('.ui.search.dropdown').dropdown("refresh");
	// }

});

Template.DocumentFolderColors.events({
	"click .btn-initiate-colors"(e, tpl) {
		e.preventDefault();

		Util.loader($(e.currentTarget));
		Util.loading(true);
		
		setTimeout(() => { 
			Template.DocumentFolderColors.__helpers.get("initiateColorData").call();
		}, 500);

	},
	'click .btn-filter-by-simulations'(e, tpl) {
		e.preventDefault();

		//-- reset the number text of colored doc count to avoid
		//-- duplicated numbers in there...
		// $(".colored-docs-count").empty();		

		if(Session.get("DocumentFolderColors.simulations")) {
			let _simulations = Session.get("DocumentFolderColors.simulations");

			// console.log(_simulations);

			if(_simulations.length > 0) {
				//-- reset session data, this is critical to avoid any issue with 
				//-- cached data (eg. duplicated numbers with previous count, input data-fid 
				//-- with previous data/fid...)
				Session.set("DocumentFolderColors.docFoldersObj.one", null);
				Session.set("DocumentFolderColors.docFoldersObj.two", null);
				Session.set("DocumentFolderColors.docFoldersObj.three", null);

				Util.loader($(e.currentTarget));
				// Util.loading(true);

				setTimeout(() => { 
					
					Template.DocumentFolderColors.__helpers.get("getDocumentsAndFolders").call();

					$(".btn-initiate-colors").show();

					// $(".input-color-picker").spectrum('destroy');
					$(".sp-replacer").remove();

					// Template.DocumentFolderColors.__helpers.get("initiateColorData").call();

				}, 500);
			}
		}
	},
	'click .btn-show-all'(e, tpl) {
		e.preventDefault();

		//-- reset the number text of colored doc count to avoid
		//-- duplicated numbers in there...
		// $(".colored-docs-count").empty();

		// if(Session.get("DocumentFolderColors.simulations")) {
		// 	let _simulations = Session.get("DocumentFolderColors.simulations");

		// 	// console.log(_simulations);

		// 	if(_simulations.length > 0) {

				//-- reset session data, this is critical to avoid any issue with 
				//-- cached data (eg. duplicated numbers with previous count, input data-fid 
				//-- with previous data/fid...)
				Session.set("DocumentFolderColors.docFoldersObj.one", null);
				Session.set("DocumentFolderColors.docFoldersObj.two", null);
				Session.set("DocumentFolderColors.docFoldersObj.three", null);

				Session.set("DocumentFolderColors.simulations", null);

				$('.ui.search.dropdown').dropdown("clear");

				Template.DocumentFolderColors.__helpers.get("getDocumentsAndFolders").call();

				$(".btn-initiate-colors").show();

				// $(".input-color-picker").spectrum('destroy');
				$(".sp-replacer").remove();
			// }
		// }
	},	
	'click .btn-clear-simulations-dropdown'(e, tpl) {
		e.preventDefault();

		$('.ui.search.dropdown').dropdown('clear');
	}
})

Template.DocumentFolderColors.helpers({
	getDocumentsAndFolders() {
		Util.loading(true);

		let 
			_folders = [],
			_options = {},
			_simulations = Session.get("DocumentFolderColors.simulations");

		if(_simulations && _simulations.length > 0) {
			_options = { simulations: _simulations };
		}

		Meteor.call("DocumentFolders.get.allActive", _options, (err, res) => {

			if(err) {
				Util.alert({mode: 'error'});
				// console.log(err)
				Util.loading(false);
			} else {
				// console.log(res);
				if(res && res.data && res.data.length > 0) {


	// $('.ui.accordion').accordion('refresh');
					// let _colors = DocumentFolderColors.find().fetch();

					// console.log(_colors)

					// Session.set("DocumentFolderColors.docFolders", res.data);
					// Session.set("DocumentFolderColors.docFolders.0", res.data[0]);
					// Session.set("DocumentFolderColors.docFolders.1", res.data[1]);
					// Session.set("DocumentFolderColors.docFolders.2", res.data[2]);

					let _data = res.data.map((r,i) => {
						if(r && r.length > 0) {
							let _colData = r.map((c,i) => {
								if(c.docs && c.docs.length > 0) {
									c.docs.sort((a,b) => {
										return a.order - b.order
									})

									return c;
								}

								// r['docs_count'] = c.docs.length;
								// r['colored_docs_count'] = 
							})

							return _colData
						}
					})

// console.log(_data);

					// Session.set("DocumentFolderColors.docFoldersObj", {
					// 	// one: res.data[0],
					// 	// two: res.data[1],
					// 	// three: res.data[2]
					// 	one: _data[0],
					// 	two: _data[1],
					// 	three: _data[2]						
					// });

					Session.set("DocumentFolderColors.docFoldersObj.one", _data[0]);
					Session.set("DocumentFolderColors.docFoldersObj.two", _data[1]);
					Session.set("DocumentFolderColors.docFoldersObj.three", _data[2]);

					// console.log(res.data);
					// Template.DocumentFolderColors.__helpers.get("Folders").call();
				}


				Util.loader({done: true});				
				Util.loading(false);

				// Template.DocumentFolderColors.__helpers.get("Folders").call();

			}
		})

		return _folders;
	},
	// Folders0() {
	// 	if(Session.get("DocumentFolderColors.docFolders")) {
	// 		let _docFolders = Session.get("DocumentFolderColors.docFolders");
	// 		return _docFolders;
	// 	}
	// },
	Folders1() {
		if(Session.get("DocumentFolderColors.docFoldersObj.one")) {
			let _docFolders = Session.get("DocumentFolderColors.docFoldersObj.one");
			return _docFolders;
		}
	},
	Folders2() {
		if(Session.get("DocumentFolderColors.docFoldersObj.two")) {
			let _docFolders = Session.get("DocumentFolderColors.docFoldersObj.two");
			return _docFolders;
		}
	},
	Folders3() {
		if(Session.get("DocumentFolderColors.docFoldersObj.three")) {
			let _docFolders = Session.get("DocumentFolderColors.docFoldersObj.three");
			return _docFolders;
		}
	},
	// Folders() {
	// 	if(Session.get("DocumentFolderColors.docFoldersObj")) {
	// 		let _docFolders = Session.get("DocumentFolderColors.docFoldersObj");

	// 		// console.log(_docFolders);

	// 		// if(Session.get("DocumentFolderColors.simulations")) {		
	// 		// 	$('.ui.search.dropdown')
	// 		//   	.dropdown("set selected", Session.get("DocumentFolderColors.simulations"));

	// 		// 	$('.ui.search.dropdown').dropdown("refresh");
	// 		// }

	// 		return _docFolders;
	// 	}
	// },
	initiateColorData() {

		setTimeout(() => { 
			Util.loader({done: true});
			Util.loading(false);

			Session.set("DocumentFolderColors.colorPickerLoaded", true);
		}, 1000);

		let _options = {
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
	    clearText: "Clear Color Selection",
	    // containerClassName: "doc-folder-color-picker-container",
	    replacerClassName: "folder-color-picker-container",
	    preferredFormat: "name",
	    // preferredFormat: "rgb",
	    // maxSelectionSize: int,
	    // palette: [[string]],
	    // selectionPalette: [string],
	    // change: (color) => {
	    // 	console.log(color);
	    // 	console.log($(this).attr("id"));
	    // }			
		}

		// $(".input-color-picker.folder").each((i, obj) => {
// console.log(this)
// console.log($(this))
// test['f_90'] = "$ff0000";

		$(".input-color-picker.folder").spectrum(_options)
			// .on("show.spectrum", (e, color) => {
			// 	console.log(color)
			// 	console.log(this)
			// 	console.log($(this).data("name"));
			// 	return "#ff0000";
			// })
				.on("change.spectrum", (e, color) => {
					e.stopPropagation();
					e.preventDefault();					
				//-- this is from the selected color box, do nothing
			}).on("select.spectrum", (e, color) => { //-- 'select' event got added to the spectrum source code for this
				e.stopPropagation();
				e.preventDefault();
				//-- this is now fired when the 'select' button is pressend
				// if(color) {
// console.log(color)
				let 
					_id = $(e.currentTarget).attr("id"),
					// _color = color && color.toHexString() || "",
					_color = color && color.toRgbString() || "",
					_fid = _id.split('_')[1],
					_dids = $(e.currentTarget).data("dids"),
					_name = $(e.currentTarget).data("name");

				if(_fid && _name) {

					let _obj = {
						fid: parseInt(_fid),
						name: _name,
						color: _color,
						dids: _dids,
						type: 'folder'
					}

					Meteor.call("DocumentFolderColors.upsert", _obj, (err, res) => {
						if(err) {
							Util.alert({mode: 'error'});
						} else {
							
							// console.log(res);

            	Util.alert();            
						}
					})
				} else {
					Util.alert({mode: 'error', msg: 'Invalid data. Please try again.'})
				}

				// }	else {
					// Util.alert({mode: 'error', msg: 'Color should not be null'})				
				// }
			});

		// });

		_options.replacerClassName = "doc-color-picker-container";

		$(".input-color-picker.doc").spectrum(_options)
			.on("change.spectrum", (e, color) => {
			//-- this is from the selected color box, do nothing
			}).on("select.spectrum", (e, color) => { //-- 'select' event got added to the spectrum source code for this
			//-- this is now fired when the 'select' button is pressend
				// if(color) {

				e.stopPropagation();
				e.preventDefault();
				//-- this is now fired when the 'select' button is pressend
				// if(color) {

				let 
					_id = $(e.currentTarget).attr("id"),
					// _color = color && color.toHexString() || "",
					_color = color && color.toRgbString() || "",
					_did = _id.split('_')[1],
					_fid = $(e.currentTarget).data("fid"),
					_name = $(e.currentTarget).data("name");

				if(_fid && _name) {

					let _obj = {
						fid: parseInt(_fid),
						did: _did && parseInt(_did) || null,
						name: _name,
						color: _color,
						type: 'document'
					}

					Meteor.call("DocumentFolderColors.upsert", _obj, (err, res) => {
						if(err) {
							Util.alert({mode: 'error'});
						} else {
							
							// console.log(res);
								
							let 
								_fid = $(e.currentTarget).data("fid"),
								_fkey = '#count_'+_fid;

							let 
								_curCount = parseInt($(_fkey).find(".colored-docs-count").html()),
								_allCount = parseInt($(_fkey).find(".docs-count").html());

							// console.log(_fkey);
							// console.log(_curCount);
							// console.log(_allCount);
												
							if(color) {
								if(_curCount < _allCount) {
									let _newCount = _curCount +1;
									$(_fkey).find(".colored-docs-count").empty().html(_newCount);

									if(_newCount === _allCount) {
										$(_fkey).find(".colored-docs-count").addClass('green');
									}
								}								
							} else {
								if(_curCount > 0) {
									$(_fkey).find(".colored-docs-count").removeClass('green').addClass('red').empty().html(_curCount-1);									
								}
							}

            	Util.alert();            
						}
					})
				} else {
					Util.alert({mode: 'error', msg: 'Invalid data. Please try again.'})
				}

				// }	else {
				// 	// Util.alert({mode: 'error', msg: 'Color should not be null'})				
				// }
		});	
		
		$(".btn-initiate-colors").hide();
	},
	Simulations() {
		let _sims = Simulations.find().fetch();

		// console.log(_sims);

		return _sims;
	}
});

