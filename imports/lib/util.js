export const Util = {
  alert(option = '') {
    let
      mode = option.mode || 'info',
      msg = option.msg,
      data = option.data || '',
      onClose = option.onClose || ''

    if(mode === 'error') {
      msg = msg || 'Something went wrong. Please try again. '
      sAlert.error('<i class="circular inverted yellow warning sign icon"></i> ERROR <hr>' + msg + data)
    }
    else if(mode === 'warning') {
      msg = msg || 'Something went wrong. Please try again. '
      sAlert.warning('<i class="circular inverted olive warning icon"></i> WARNING <hr>' + msg)      
    }
    else {
      msg = msg || 'Successfully done. '
      sAlert.info('<i class="circular inverted olive bullhorn icon"></i> INFO <hr>' + msg)
    }
  },
  loader(option) { //-- selector should be a jQuery object
    let 
      selector = option.elem || option,
      done = option.done || false,
      pos = option.pos || 'right'

    if(selector && selector.length) {

      selector.prop('disabled', false)
      selector.prop('readonly', false)
      selector.find('.inline.loader').remove()

      if(!done) {
        selector.prop('disabled', true)
        selector.prop('readonly', true)

        let loader = `<span class="ui mini active inline loader"></span>`
        
        if(pos === 'left') {
          selector.prepend(loader)
        } else {
          selector.append(loader)      
        }
      }

    } else {
       selector = $('.inline.loader')
       
      if(done) {
        selector.parent().prop('disabled', false)
        selector.parent().prop('readonly', false)        
        selector.remove()
      } else {
        alert("Loader error: invalid selector")
      }
    }
  },
  loading(opt, callback) {
    let loader = `
      <div id="craa_loader"></div>
    `

    let result

    if(opt === 0 || opt === false) {
      result = function() {
        return $('#craa_loader').remove()
      }
    } else {
      result = function() {
        return $('body').append(loader)
      }
    }

    // $('body').promise().done(() => {
    //   callback()      
    // })

    $.when( result() ).done(function() {
      if(callback) {
        // callback()
        setTimeout(callback, 100)
      }
    });    
    
  },
  route() {
    return FlowRouter.current().route.name
  },
  go(path, route) {
    let _route = route || 'App.'+path

    if(this.route() !== _route) {
      this.loading(true, () => {
        return  FlowRouter.go('/'+___aR+'/'+path)
      })      
    }
  },  
  sortBVal(array, key) {
    if(key && array && array.length > 0) {
      array.sort(function(a, b) {
          return a[key] - b[key];
      })
    } else {
      // alert("Sort error: invalid input format")
    }
  },
  dateHMS(date) {
    if(date) {
        var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return  date.getDate() + "-" + (month[date.getMonth()]) + "-" + date.getFullYear() + ' ' +
            ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + 
            ("0" + date.getSeconds()).slice(-2);     
    }
  },
  dateHMS2(date) {
    if(date) {
        return (date.getMonth()+1) + "-" + date.getDate() + "-" + date.getFullYear() + ' ' +
            ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + 
            ("0" + date.getSeconds()).slice(-2);
    }
  },
  dateFormatS(date) {
    if(date) {      
      var thisDate = date;
      if(typeof thisDate !== 'undefined') {
          return (thisDate.getMonth()+1) + "-" + thisDate.getDate() + "-" + thisDate.getFullYear();
      }
    }
  },
  bDueDate(date, days) {   
    if(date) {
      var dueDate = date, days = days || 3;
      dueDate.setDate(dueDate.getDate());
      var counter = 0;
          if(days > 0 ){
              while (counter < days) {
                  dueDate.setDate(dueDate.getDate() + 1 ); // Add a day to get the date tomorrow
                  var check = dueDate.getDay(); // turns the date into a number (0 to 6)
                      if (check == 0 || check == 6) {
                          // Do nothing it's the weekend (0=Sun & 6=Sat)
                      }
                      else{
                          counter++;  // It's a weekday so increase the counter
                      }
              }
          }
      return (dueDate.getMonth()+1) + "-" + dueDate.getDate() + "-" + dueDate.getFullYear();
    }
  },
  secondsToHMS(time) {
    if(time) {
      let 
        m = ~~(time / 60),
        s = time % 60,
        h = ~~(time / 3600);

      m = ~~((time % 3600) / 60);
      s = time % 60;

      let t = "";

      t += (h < 10 ? "0" : "") + h + ":";
      t += (m < 10 ? "0" : "") + m + ":";
      t += (s < 10 ? "0" : "") + s;

      return t;
    }        
  },  
  hms2seconds(hms) {
    if(hms) {
      var aT = hms.split(':'),            
          rawT = (parseInt(aT[0])*3600)+(parseInt(aT[1])*60)+parseInt(aT[2]);             

      return parseInt(rawT);  
    }    
  },      
  fileSize(a,b,c,d,e) {
    return (b=Math,c=b.log,d=1e3,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)+' '+(e?'KMGTPEZY'[--e]+'B':'Bytes')
  },
  s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  },
  log(user, msg, venue) {    
    let log = {
      user: user,
      message: msg,
      venue: venue
    }
    return Meteor.call('logger', log)    
  },
  findingsLog(user, msg, fid, finding) {    
    let log = {
      user: user,
      message: msg,
      fid: fid,
      finding: finding
    }
    return Meteor.call('FindingsLog.insert', log)    
  },  
  find (array, key, keyValue) {
    
    if(array && typeof array === 'object' && array.length > 0 && key) {
      return array.filter(function(obj) {
        return obj[key] === keyValue        
      })
    }
  },
  remove (array, key, keyValue) {
    
    if(array && typeof array === 'object' && array.length > 0 && key) {
      return array.filter(function(obj) {
        return obj[key] !== keyValue
      })
    }
  },
  uniqueObject(array, key) {
    if(array && array.length > 0) {
      let _array = []

      array.filter(function(x){
        let i = _array.findIndex(y => y[key] == x[key]);
        if(i <= -1){
              _array.push(x);
        }
        return null
      })

      return _array
    }   
  },
  median(array) {
    if(array && array.length > 0) {
      let mid = Math.floor(array.length / 2);

      return array.length % 2 !== 0 ? array[mid] : (array[mid - 1] + array[mid]) / 2;
    }
  }  
}


