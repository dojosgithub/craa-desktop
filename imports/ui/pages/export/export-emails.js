import './export-emails.html'

const XLSX = require('xlsx');

import { Util } from '/imports/lib/util.js'

Template.ExportEmails.events({
  'click .btn-export-emails'(e, tpl) {
    e.preventDefault();

    Util.loader($(e.currentTarget));

    Meteor.call("UserEmails.export", {}, (err, res) => {
      if(err) {
        Util.alert({mode: 'error'})
        Util.loader({done: true}) 
      } else {
        if(res) {
            let wb = res.data;

            let _emailTexts = wb.join(",");
            // let ws = XLSX.utils.sheet_to_csv(wb);

            // console.log(wb);
            /* "Browser download file" from SheetJS README */
//             let
//               wopts = { bookType:'xlsx', bookSST:false, type:'binary' },
//               wbout = XLSX.write(wb, wopts)
// 
//             var ws1 = wbout.Sheets[wbout.SheetNames[0]];
// 
//             let _csv = XLSX.utils.sheet_to_csv(ws1);
// 
            let filename = 'SimulationUserEmails-'+Util.dateHMS(new Date)+'.csv'

            // saveAs(new Blob([Util.s2ab(wbout)],{type:"application/octet-stream"}), filename);  
            saveAs(new Blob([Util.s2ab(_emailTexts)],{type:"application/octet-stream"}), filename);  

            Util.loader({done: true})           
        }
      }
    })
  }
})
