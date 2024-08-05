import { Session } from 'meteor/session'

const XLSX = require('xlsx');

import  { Util } from '/imports/lib/util.js'

import { Clients } from '/imports/api/clients/clients.js'

import './datadump-uif-results.html'
import '/imports/ui/stylesheets/datadump/datadump-uif-results.less'

Template.UnidentifiedFindingsResults.onCreated(function unidentifiedFindingsResultsOnCreated() {
  Util.loading(false)
})

Template.UnidentifiedFindingsResults.onRendered(function() {
	$('.ui.accordion.uif-results').accordion({
		exclusive: false,
    close: true,
    selector: {
      trigger: '.title.trigger'
    } 		
	});

});

Template.UnidentifiedFindingsResults.helpers({
	Clients() {		
		return Clients.find()
	}
})

Template.UnidentifiedFindingsResults.events({
	'click .btn-export-unidentified-findings-results'(e, tpl) {
		e.preventDefault();

    Util.loader($(e.currentTarget));

    let
    	client_id = $(e.currentTarget).parent().data('cid'),
    	bu_id = $(e.currentTarget).parent().data('buid'),
    	simulation_id = $(e.currentTarget).parent().data('sid');
    	client_name = $(e.currentTarget).parent().data('cname');
    	bu_name = $(e.currentTarget).parent().data('buname');
    	simulation_name = $(e.currentTarget).parent().data('sname');

    let queryObj = {
    	client_id: client_id,
    	bu_id: bu_id,
    	simulation_id: parseInt(simulation_id)
    }
// console.log(queryObj)
    Meteor.call("UsersScoreSummary.UnidentifiedFindingsResults.export", queryObj, (err, res) => {
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

          let filename = client_name+'-'+bu_name+'-'+simulation_name+'-'+Util.dateHMS(new Date)+'.xlsx'

          saveAs(new Blob([Util.s2ab(wbout)],{type:"application/octet-stream"}), filename);  

            Util.loader({done: true})           
        }
      }
    })		
	}
});

