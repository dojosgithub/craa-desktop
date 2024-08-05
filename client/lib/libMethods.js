Meteor.libMethods = {
  // alert(mode, msg, data='') {
  //   if(mode === 'error') {
  //     sAlert.error('<i class="circular inverted yellow warning sign icon"></i> ERROR <hr>' + msg + data)
  //   }
  //   else if(mode === 'warning') {
  //     sAlert.warning('<i class="circular inverted olive warning icon"></i> Warning <hr>' + msg)      
  //   }
  //   else {
  //     sAlert.info('<i class="circular inverted olive bullhorn icon"></i> Information <hr>' + msg)
  //   }
  // },
  dateFormatN: function(thisDate) {
    if(thisDate) {
      var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];        
      return  thisDate.getDate() + "-" + (month[thisDate.getMonth()]) + "-" + thisDate.getFullYear() + ' ' +
          ("0" + thisDate.getHours()).slice(-2) + ":" + ("0" + thisDate.getMinutes()).slice(-2) + ":" + 
          ("0" + thisDate.getSeconds()).slice(-2);    
    }
  },  
} 
