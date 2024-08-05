import { Session } from 'meteor/session'

const XLSX = require('xlsx');

import Sortable from 'sortablejs'

import { Simulations } from '/imports/api/simulations/simulations.js';
import { Findings } from '/imports/api/findings/findings.js';

import { Util } from '/imports/lib/util.js'

import './all-findings.html'
import '/imports/ui/stylesheets/all-findings/all-findings.less'

let _sortableFindings, _sortableFs = [], _sortableFIDs = [];

let 
	_findingsOrderOldDict = [],
	_findingsOrderNewDict = [];

Template.AllFindings.onCreated(allFindingsOnCreated => {
	_sortableFs = [];
	_sortableFIDs = [];

	_findingsOrderOldDict = [];
	_findingsOrderNewDict = [];

	Session.set('Findings.dragToReorder', false);
	Session.set("Findings.order.changed", false);
	Session.set("Findings.findingsOrderUpdatedAt", null);
	// Session.set("Findings.order.to.save", null);
	// Session.set("Findings.order.old", _findingsOrderOldDict);
	// Session.set("Findings.order.new", _findingsOrderNewDict);
})

Template.AllFindings.onRendered(allFindingsOnRendered => {
	$('.ui.accordion.simulations').accordion({
		exclusive: false,
    close: true,
    selector: {
      trigger: '.title.trigger'
    } 		
	});

  let _findings_list = document.getElementById('findings_list');

  _sortableFindings = new Sortable(_findings_list, {
  	// sort: true,
    handle: '.finding-order',
    // draggable: '.finding-item',
    animation: 150,
    ghostClass: "findings-sortable-ghost",
    chosenClass: "findings-sortable-chosen",
    dragClass: "findings-sortable-drag",
    onEnd: function (e) {

    	let
    		_oldIndex = e.oldIndex, // element's old index within parent
    		_newIndex = e.newIndex; // element's new index within parent

      if(Session.get("Findings.dragToReorder")) {

      	if(_oldIndex !== _newIndex) { //-- only when there's a change in findings' order

      		Session.set("AllFindings.list", []);
      		// Session.set("Findings.order.to.save", null);
      		Session.set("Findings.order.changed", true);

	        let fObjs = []
	        
	        // let _findings_list = document.getElementById('findings_list');

	        $(_findings_list).children('.finding-item').each(function(idx, el) {
	        // $('.finding-item').each(function(idx, el) {	        	
	          let 
	          	fid = $(this).data('fid'),
	          	finding = $("#finding_"+fid).text();
	          // console.log(this)
	          
	          // console.log(idx, fid)

	          let fObj = {
	            id: fid,
	            _order: idx,
	            order: idx+1,
	            finding: finding
	          }

	          fObjs.push(fObj)

	          $("#forder_"+fid).text(idx+1);
	          $(this).children(".finding-order").text(idx+1);
	          // $(this).text(idx+1);
	          // console.log(fObj)

	          // if(idx === _newIndex) {
	          // 	_findingsOrderUpdatedDict['f_'+_newIndex] = {
	          // 		old: 
	          // 	}
	          // }
	        })

	        $("#findings_list").empty();
	        // console.log(fObjs)

	        Session.set("Findings.order.to.save", fObjs);
	        Session.set("AllFindings.list", fObjs);
      	}
      } else {
        Util.alert({mode: 'info', msg: 'Please turn on the Drag option to change the order of Findings.'});       
      }      
    },
   	// onUpdate: function(e) {
   	// 	console.log("onUpdate => ", e)
   	// },
   	// onChange: function(e) {
   	// 	console.log("onChange => ", e.oldIndex)
   	// 	console.log("onChange => ", e.newIndex)
   	// },   	
  })


	setTimeout(() => {
		Util.loading(false);
	}, 500);

  Tracker.autorun(() => {
    _sortableFindings.option('sort', Session.get("Findings.dragToReorder"))

// console.log(Session.get("Findings.simulation.id"));

    // if(Session.get("Findings.simulation.id")) {
    // 	console.log(Session.get("Findings.simulation.id"));
    // 	// console.log(Session.get("AllFindings.list"));   		
   	// 	Template.AllFindings.__helpers.get("FindingsList").call();
    // // 	Meteor.subscribe("active_findings_w_sid_ordered", parseInt(Session.get("Findings.simulations.id")))
    // }
   });

  if(Session.get("Findings.simulation.id")) {
  	// console.log(Session.get("Findings.simulation.id"));
  	// console.log(Session.get("AllFindings.list"));   		
 		// Template.AllFindings.__helpers.get("getFindingsBySid").call();
 		Template.AllFindings.__helpers.get("FindingsList").call();
  // 	Meteor.subscribe("active_findings_w_sid_ordered", parseInt(Session.get("Findings.simulations.id")))
  }

})

Template.AllFindings.helpers({
	Simulations() {
		let _sims = Simulations.find().fetch();

		if(_sims && _sims.length > 0) {

			let _psCount = 0,
					_prehireSims = _sims.filter((ps) => {
				if(ps.name.includes("Prehire")) {
					_psCount++;
					return ps;
				}
			});

			let _bsCount = 0,
					_baselineSims = _sims.filter((bs) => {
				if(bs.name.includes("Baseline")) {
					_bsCount++;
					return bs;
				}
			});

			let _fsCount = 0,
					_followupSims = _sims.filter((fs) => {
				if(fs.name.includes("Follow")) {
					_fsCount++;
					return fs;
				}
			});

			_baselineSims.sort((a, b) => {
				return a.name.localeCompare(b.name);
			})

			_followupSims.sort((a, b) => {
				return a.name.localeCompare(b.name);
			})

			Session.set("AllFindings.simulations.prehire.count", _psCount);
			Session.set("AllFindings.simulations.baseline.count", _bsCount);
			Session.set("AllFindings.simulations.followup.count", _fsCount);

			return {
				prehire: {
					count: _psCount,
					sims: _prehireSims
				},
				baseline: {
					count: _bsCount, 
					sims: _baselineSims
				},
				followup: {
					count: _fsCount, 
					sims: _followupSims
				}
			}
		}

		Util.loading(false);
	},
	PrehireCount() {
		if(Session.get("AllFindings.simulations.prehire.count")) {
			return Session.get("AllFindings.simulations.prehire.count");
		}
	},
	BaselineCount() {
		if(Session.get("AllFindings.simulations.baseline.count")) {
			return Session.get("AllFindings.simulations.baseline.count");
		}
	},
	FollowupCount() {
		if(Session.get("AllFindings.simulations.followup.count")) {
			return Session.get("AllFindings.simulations.followup.count");
		}
	},
	FindingsList() {		
		// if(Session.get("AllFindings.list")) {
		// 	return Session.get("AllFindings.list")
		// }
// 		let _findings = Findings.find({
// 			simulation_id: Session.get("Findings.simulations.id")
// 		}, {
// 			sort: {
// 				order: 1
// 			}
// 		}).fetch();
// console.log(_findings)
// 		if(_findings && _findings.length > 0) {
// 			return _findings;
// 		} else {

		//-- for some reason, the dom needs to be created everytime 
		//-- Findings list is updated...
		if(Session.get("AllFindings.list")) {
			let _findings = Session.get("AllFindings.list");
// console.log(_findings)
			if(_findings && _findings.length > 0) {
				_findings.map((f) => {
					let _order = f.order === 999 ? '*': f.order;
	let _html = `
	<div class="finding-item" data-fid="${f.id}">
		<span class="ui order teal label finding-order">${_order}</span>
		<span class="ui id label">${f.id}</span>
		<span class="finding" id="finding_${f.id}">${f.finding}</span>					
	</div>	
	`;

				$("#findings_list").append(_html);
				})
			}
		}
		// console.log(Session.get("AllFindings.list"));
			return Session.get("AllFindings.list")
		// }
	},
  findingsDragToReorder() {
    return Session.get("Findings.dragToReorder");
  },
  findingsOrderChanged() {
  	return Session.get("Findings.order.changed");
  },
  getFindingsBySid() {
  	if(Session.get("Findings.simulation.id")) {

  		let _sid = Session.get("Findings.simulation.id");

			Meteor.call("Findings.by.sid", {sid: parseInt(_sid)}, (err, res) => {
				if(err) {
		    	Util.alert({mode: 'error'});
		    	Util.loader({done: true});
				} else {
					// console.log(res)
					if(res && res.success && res.data) {
						Session.set("AllFindings.list", res.data);//-- update Findings list of the template

						_findingsOrderOldDict = [];
						_findingsOrderNewDict = [];					

						// if(res.data.length > 0) {
						// 	res.data.map((f) => {
						// 		if(f.id) {
						// 			let _fObj = {
						// 				id: f.id,
						// 				order: f.order,
						// 				finding: f.finding
						// 			}

						// 			_findingsOrderOldDict['f_'+f.id] = f;
						// 		}
						// 	})
						// }					

					}
					Util.loader({done: true})
				}
			})
		}  	
  },
  getInitialFindingsBySid() {
  	if(Session.get("Findings.simulation.id")) {

  		let _sid = Session.get("Findings.simulation.id");

			Meteor.call("Findings.by.sid.initial", {sid: parseInt(_sid)}, (err, res) => {
				if(err) {
		    	Util.alert({mode: 'error'});
		    	Util.loader({done: true});
				} else {
					// console.log(res)
					if(res && res.success && res.data) {
						Session.set("AllFindings.list", res.data);//-- update Findings list of the template

						_findingsOrderOldDict = [];
						_findingsOrderNewDict = [];					

						// if(res.data.length > 0) {
						// 	res.data.map((f) => {
						// 		if(f.id) {
						// 			let _fObj = {
						// 				id: f.id,
						// 				order: f.order,
						// 				finding: f.finding
						// 			}

						// 			_findingsOrderOldDict['f_'+f.id] = f;
						// 		}
						// 	})
						// }					

					}
					Util.loader({done: true})
				}
			})
		}  	
  },  
  getOrderedFindingsBySid() {
  	if(Session.get("Findings.simulation.id")) {

  		let _sid = Session.get("Findings.simulation.id");
  		// Session.set("AllFindings.list", null);

			Meteor.call("Findings.by.sid.ordered", {sid: parseInt(_sid)}, (err, res) => {
				if(err) {
		    	Util.alert({mode: 'error'});
		    	Util.loader({done: true});
				} else {
					// console.log(res)
					// if(res && res.success && res.data) {
					if(res) {
						// Session.set("AllFindings.list", res.data);//-- update Findings list of the template

						_findingsOrderOldDict = [];
						_findingsOrderNewDict = [];					

						// if(res.data.length > 0) {
						// 	res.data.map((f) => {
						// 		if(f.id) {
						// 			let _fObj = {
						// 				id: f.id,
						// 				order: f.order,
						// 				finding: f.finding
						// 			}

						// 			_findingsOrderOldDict['f_'+f.id] = f;
						// 		}
						// 	})
						// }

		        let fObjs = []
		        
		        let _findings_list = document.getElementById('findings_list');

		        $(_findings_list).children('.finding-item').each(function(idx, el) {
		        // $('.finding-item').each(function(idx, el) {	        	
		          let 
		          	fid = $(this).data('fid'),
		          	finding = $("#finding_"+fid).text();
		          // console.log(this)
		          
		          // console.log(idx, fid)

		          let fObj = {
		            id: fid,
		            _order: idx,
		            order: idx+1,
		            finding: finding
		          }

		          fObjs.push(fObj);
		          // console.log(fObj)

		          // if(idx === _newIndex) {
		          // 	_findingsOrderUpdatedDict['f_'+_newIndex] = {
		          // 		old: 
		          // 	}
		          // }
		        })

		        // console.log(fObjs);
		        // Session.set("AllFindings.list", res.data);//-- update Findings list of the template
		        // Session.set("AllFindings.list", res);//-- update Findings list of the template

					}
					Util.loader({done: true})
				}
			})
		}  	
  },  
  findingsOrderLastUpdated() {
  	if(Session.get("Findings.findingsOrderUpdatedAt")) {
  		return Session.get("Findings.findingsOrderUpdatedAt");
  	} else {
  		return null;
  	}
  } 			
});

Template.AllFindings.events({
	'click .btn-view-findings'(e, tpl) {
		e.preventDefault();

		let 
			_id = this._id,
			_sid = this.id,
			_sname = this.name,
			_findingsOrderUpdatedAT = this.findingsOrderUpdatedAt;

		if(_sid) {
			
			Session.set("Findings.order.to.save", null);
			Session.set("Findings.findingsOrderUpdatedAt", null);

			Util.loader($(e.currentTarget));

			$("#findings_list").empty();

			let _simLabelKey = _sname.includes("Baseline") ? 'baseline' : (_sname.includes("Followup") ? 'followup' : 'prehire')
// console.log(_simLabelKey)
			Session.set("Findings.simulations.chosen", _simLabelKey);
			Session.set("Findings.simulation.id", parseInt(_sid));
			Session.set("Findings.simulation.name", _sname);
			Session.set("Findings.findingsOrderUpdatedAt", _findingsOrderUpdatedAT);

			Session.set("Findings.dragToReorder", false);
			Session.set("Findings.order.changed", false);

			Meteor.subscribe("active_findings_w_sid_ordered", parseInt(_sid))

			if(Session.get("Findings.findingsOrderUpdatedAt")) {
				Template.AllFindings.__helpers.get("getFindingsBySid").call();
			} else {
				Template.AllFindings.__helpers.get("getInitialFindingsBySid").call();
			}
		}
	},
  'click #findings_drag_option'(e, tpl) {

    e.preventDefault()

    let dragToReorder = $(e.currentTarget).is(':checked')

    Session.set("Findings.dragToReorder", dragToReorder);

    Util.log(Meteor.user(), "dragoption", "allfindings")
  },
  'click #btn_save_findings_order'(e, tpl) {
    e.preventDefault();

    let
      _sid = Session.get("Findings.simulation.id") || null, 
      _findingsOrderToSave = Session.get("Findings.order.to.save");

    let 
    	_findings_list = document.getElementById('findings_list'),
			fObjs = [],
			_saveInitialOrder = false;

    if(!_findingsOrderToSave) {

      $(_findings_list).children('.finding-item').each(function(idx, el) {
      // $('.finding-item').each(function(idx, el) {	        	
        let 
        	fid = $(this).data('fid'),
        	finding = $("#finding_"+fid).text();
        // console.log(this)
        
        // console.log(idx, fid)

        let fObj = {
          id: fid,
          _order: idx,
          order: idx+1,
          finding: finding
        }

        fObjs.push(fObj);
      });

      _findingsOrderToSave = fObjs;
      Session.set("Findings.order.to.save", fObjs);
      _saveInitialOrder = true;
      $("#findings_list").empty();
    }

    if(_sid && _findingsOrderToSave && _findingsOrderToSave.length > 0) {
      // console.log(_findingsOrderToSave)
      Util.loader({elem: $(e.currentTarget)});

      Meteor.call("Findings.orders.update", { sid: _sid, orders: _findingsOrderToSave }, (err, res) => {
        if(err) {
          Util.alert('error')
        } else {
          // console.log(res.data)

          if(res) {
            if(res.success === true) {
            	// Session.set("AllFindings.list", null);
            	// _findingsOrderToSave.forEach((f) => {
            	// 	if(f.order !== _findingsOrderOldDict['f_'+f.id].order) {
            	// 		console.log(f.id, _findingsOrderOldDict['f_'+f.id].order, f.order)
            	// 	}
            	// })

              Util.alert();
              // console.log(_findingsOrderToSave)
              // Session.set("AllFindings.list", res.data);
              if(_saveInitialOrder) {
              	Session.set("AllFindings.list", _findingsOrderToSave);
              	// Template.AllFindings.__helpers.get("FindingsList").call();
            	}

              Session.set("Findings.order.changed", false);

              // Template.AllFindings.__helpers.get("getOrderedFindingsBySid").call();

							// let _updatedFindings = Findings.find({
							// 	simulation_id: parseInt(_sid)
							// }, {
							// 	sort: { order: 1 }
							// }).fetch();

							// console.log(_updatedFindings);
							// Session.set("AllFindings.list", _updatedFindings);
							Meteor.call("Simulations.findingsOrderUpdatedAt", {sid: parseInt(_sid)});
							Session.set("Findings.findingsOrderUpdatedAt", new Date);

							Session.set("Findings.order.updated", []);

							// _sortableFindings.sort(res.data);


            } else {
            	Util.alert({mode: 'error'})
            }
          } else {
          	Util.alert('error')
          }
        }

        Util.loader({elem: $(e.currentTarget), done: true})
      });      

    }
  },
	'click .btn-export-all-findings'(e, tpl) {
		e.preventDefault();

    Util.loader($(e.currentTarget));

    let 
    	_sid = Session.get("Findings.simulation.id") || null,
    	_sname = Session.get("Findings.simulation.name");

    if(_sid) {

	    Meteor.call("Findings.order.export", {sid: parseInt(_sid)}, (err, res) => {
	      if(err) {
	        Util.alert({mode: 'error'})
	        Util.loader({done: true}) 
	      } else {
	        if(res) {
	        	// console.log(res)

	          let wb = res.data

	          // console.log(wb);
	          /* "Browser download file" from SheetJS README */
	          let
	            wopts = { bookType:'xlsx', bookSST:false, type:'binary' },
	            wbout = XLSX.write(wb, wopts)

	          let filename = _sname+'_Findings-'+Util.dateHMS(new Date)+'.xlsx'

	          saveAs(new Blob([Util.s2ab(wbout)],{type:"application/octet-stream"}), filename);  

	            Util.loader({done: true})           
	        }
	      }
	    });

    }		
	}    	
});



