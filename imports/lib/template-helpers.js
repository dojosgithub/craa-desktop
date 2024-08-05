import { Session } from 'meteor/session'

Template.registerHelper('equals', function (a, b) {
  return a === b;
}); 

Template.registerHelper('eq', function (a, b) {
  return a === b;
}); 

Template.registerHelper('eqInt', function (a, b) {
  return parseInt(a) === parseInt(b);
}); 

Template.registerHelper('equalsAny', function (a, b) {
  return a == b;
}); 

Template.registerHelper('ne', function (a, b) {
  return a !== b;
}); 

Template.registerHelper('not', function (a) {
  return !a;
}); 

Template.registerHelper('undef', function (a) {
  return (typeof a === 'undefined');
}); 

Template.registerHelper('neAny', function (a, b) {
  return a != b;
}); 

Template.registerHelper('or', function (a, b) {
  return a || b;
});

Template.registerHelper('orr', function (a, b, c) {
  return a || b || c;
});

Template.registerHelper('orAnother', (a, b) => {
  return a || b;
});

Template.registerHelper('and', function (a, b) {
  return a && b;
});

Template.registerHelper('_parseInt', function (i) {
  return parseInt(i);
}); 

Template.registerHelper('gt', function (a, b) {
  return parseInt(a) > parseInt(b);
}); 

Template.registerHelper('lt', function (a, b) {
  return parseInt(a) < parseInt(b);
}); 

Template.registerHelper('gte', function (a, b, float) {
    if(float) {
        return (parseFloat(a) >= parseFloat(b));
    } else {
        return (parseInt(a) >= parseInt(b));
    }  
});

Template.registerHelper('lte', function (a, b) {
  return parseInt(a) <= parseInt(b);
}); 

Template.registerHelper('length', function(array) {
    return (array) ? array.length : 0;
});

Template.registerHelper('curtail', function(string, length) {
    // tail = (tail !== '') ? tail : " ...";
    // console.log("curtail", string, length, tail, string.substr(0, length));
    if(string !== '') {
        if(string.length > 35) {
            return string.substr(0, length) + " ...";
        } else {
            return string;
        }
    }
});

Template.registerHelper('lowercase', function(input) {
    return input.toLowerCase() || '';
});

Template.registerHelper('nr2br', function(str) {
    // var nstr = str.replace(/(?:\r\n|\r|\n)/g, '<br />');
    // var nstr = str.replace(/(?:\\r\\n|\\r|\\n)/g, '<br />');
    // var nstr = str.replace(/(?:\\r\\n|\\r|\\n)/g, '<br />');
    var nstr = str.replace(/(?:\r\n|\r|\n)/g, '<br />');
    // var nstr = str.replace(new RegExp('\r?\n','g'), '<br>');
    // var nstr = str.split("\\n").join("<br />");    
    return nstr;
});
// Template.registerHelper('lte', function (a, b) {
//   return (a =< b);
// }); 

Template.registerHelper('session',function(data) {
    return Session.get(data);
});

Template.registerHelper('getMNIDSession', function(id) {
    var sessionKey = 'aMNID['+id+']';
    return Session.get(sessionKey);
});

Template.registerHelper('inArray',function(array, needle) {

    if(array && needle) {
        // console.log("inArray => ", array, needle, array.includes(needle))
        return array.includes(needle)
    }   
    // return (typeof array !== 'undefined' && array.indexOf(needle) !== -1) ? true : false;    
});

Template.registerHelper('entry', function (index) {
    // if(index) {
        return parseInt(index)+1;
    // }
});

Template.registerHelper('status', function (status) {
    if(status) {
        switch(parseInt(status)) {
            case 1:
              return 'Active.'
              break;
            case 2:
              return 'Inactive'
              break;
            case 4:
                return 'Deleted'
                break;              
            default:
                return 'Active.'
          }
    }
  });

Template.registerHelper('sum', function (a, b) {
  return (parseInt(a) + parseInt(b));
});

Template.registerHelper('subtract', function (a, b) {
  return a - b;
});

Template.registerHelper('sumEntry', function (a, b) {
  return (parseInt(a)*10 + parseInt(b));
});

Template.registerHelper('secondsToHMS', function(time) {
  var m = ~~(time / 60);
  var s = time % 60;

  var h = ~~(time / 3600);
  m = ~~((time % 3600) / 60);
  s = time % 60;

  var t = "";

  t += (h < 10 ? "0" : "") + h + ":";
  t += (m < 10 ? "0" : "") + m + ":";
  t += (s < 10 ? "0" : "") + s;

  return t;        
});

Template.registerHelper('dueDate', function(date, days) {

    var dueDate = addDays(date, days);

    if(typeof dueDate !== 'undefined') {
        return (dueDate.getMonth()+1) + "-" + dueDate.getDate() + "-" + dueDate.getFullYear();
    }
});

Template.registerHelper('bDueDate', function(date, days) {   
    var dueDate = date;
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
});

Template.registerHelper("daysRemaining", function(date, days) {
    var todate = new Date(Date.now());
    
    var daysRemaining = days-days_between(todate, date);

    return daysRemaining;
});

Template.registerHelper("bDaysRemaining", function(date, days) {

    var todate = new Date(Date.now());

    var gap = calcBusinessDays(date, todate);

    return days - gap;
});

Template.registerHelper('dateFormat', function(thisDate) {
    // return monthNames[thisDate.getMonth()] + " " + thisDate.getDate() + ", " + thisDate.getFullYear();
    if(typeof thisDate !== 'undefined') {
        return (thisDate.getMonth()+1) + "-" + thisDate.getDate() + "-" + thisDate.getFullYear();
    }
});

Template.registerHelper('dateFormatHMS', function(thisDate) {
    // return monthNames[thisDate.getMonth()] + " " + thisDate.getDate() + ", " + thisDate.getFullYear();
    // if(typeof thisDate !== 'undefined') {
    if(thisDate) {
        return (thisDate.getMonth()+1) + "-" + thisDate.getDate() + "-" + thisDate.getFullYear() + ' ' +
            ("0" + thisDate.getHours()).slice(-2) + ":" + ("0" + thisDate.getMinutes()).slice(-2) + ":" + 
            ("0" + thisDate.getSeconds()).slice(-2);
    }
});

Template.registerHelper('dateFormatHMS2', function(thisDate) {
    // return monthNames[thisDate.getMonth()] + " " + thisDate.getDate() + ", " + thisDate.getFullYear();
    if(typeof thisDate !== 'undefined') {
        return ("0" + thisDate.getHours()).slice(-2) + ":" + ("0" + thisDate.getMinutes()).slice(-2) + ":" + 
            ("0" + thisDate.getSeconds()).slice(-2);
    }
});

Template.registerHelper("dateFormatN", function(thisDate) {
    if(thisDate) {
        var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return  thisDate.getDate() + "-" + (month[thisDate.getMonth()]) + "-" + thisDate.getFullYear();     
    }
});

Template.registerHelper("dateFormatNHMS", function(thisDate) {
    if(thisDate) {
        var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return  thisDate.getDate() + "-" + (month[thisDate.getMonth()]) + "-" + thisDate.getFullYear() + ' ' +
            ("0" + thisDate.getHours()).slice(-2) + ":" + ("0" + thisDate.getMinutes()).slice(-2) + ":" + 
            ("0" + thisDate.getSeconds()).slice(-2);     
    }
});

Template.registerHelper('getMySimulationDuration', function(simulation, my_simulations) {
    
    if(simulation && my_simulations) {
        var duration;
        var my_simulation_duration = my_simulations.filter(function(my_simulation) {
            return simulation.id === parseInt(my_simulation.simulation);
        });

        if(my_simulation_duration.length === 0) {
            var hour = (simulation.time_hour < 10) ? '0'+simulation.time_hour: simulation.time_hour;
            var minute = (simulation.time_minute < 10) ? '0'+simulation.time_minute: simulation.time_minute;

            duration = hour +':'+ minute +':00';
        } else {
            duration = my_simulation_duration[0].duration;
        }

        // console.log("registerHeloer getMySimulationDuration", (simulation.time_hour < 10), simulation, my_simulations, my_simulation_duration.length, my_simulation_duration);

        return duration;
    }
});

Template.registerHelper('minLoop', function(i) {
    console.log(i);
    if(i>2) {
        return false;
    }
})

Template.registerHelper('email_verified', function(v) {
    return (v[0].verified) ? true : false;
});

Template.registerHelper('mnid', function(m) {
    return m+1;
});

Template.registerHelper('selectedIf', function(val1, val2) {
    return (val1===val2) ? 'selected': '';
});

Template.registerHelper('checked', function (a, b) {
  return a === b ? 'checked' : ''
})

Template.registerHelper('subBUKey', function(cid, buid) {
    return cid+buid;
});

Template.registerHelper('subSimKey', function(cid, buid, sid) {
    return cid+buid+sid;
});

Template.registerHelper('eqDDIds', function(target, cid, sid) {
    return target === cid +'_'+sid;
});

Template.registerHelper('eqDDIds2', function(target, cid, bu_id, sid) {
    return target === cid +'_'+bu_id+'_'+sid;
});

Template.registerHelper('countDocs', function(array, key) {
    if(array) {
        let strKey = key.toString()

        return array[strKey]
    }
});

 Template.registerHelper('findingOrder', function (order, index) {
  // if(order && (order > 0 && order < 999)) {
  //   return order;
  // } else {
    return index+1;
  // }
}); 

 Template.registerHelper('findingOrderByIndex', function (index, order) {
    if(order === 999) {
        return '*';
    } else {
        return order;
    }    
}); 

 Template.registerHelper('status', function (status) {
    let _status = parseInt(status);

    return _status === 1 ? 'Active' : 'Inactive';
});

//  Template.registerHelper('findingOrder', function (order, index) {
//   if(order && order > 0) {
//     return order;
//   } else {
//     return index+1;
//   }
// }); 
 
// Template.registerHelper('increaseDatadumpUFCount', function() {
//     var v = Session.get("datadumpUFCount") || 0;

//     // if(Session.get("terminateDatadumpUFCount")) {
//     // } else {
//     //     Session.set("datadumpUFCount", v+1);
//     //     console.log(Session.get("datadumpUFCount"));
//     // }

//     if(v < 13) {
//         Session.set("datadumpUFCount", v+1);
//         console.log(Session.get("datadumpUFCount"));
//     } else {
//         Session.set("datadumpUFCount", null);
//     }

// });

// Template.registerHelper('increaseDatadumpUFCount', function(bhid) {

//     console.log(bhid);

//     $("#ado_bh_counter_"+bhid).text("13");

// });

// Template.registerHelper('resetDatadumpUFCount', function() {    
//     Session.set("datadumpUFCount", null);
// });

// Template.registerHelper('deleteDatadumpUFCount', function() {    
//     Session.set("datadumpUFCount", null);
//     delete Session.keys['datadumpUFCount'];
//     Session.set("terminateDatadumpUFCount", true);
// });

// Template.registerHelper('handlePages', function(selector) {
//     //This gives us the page's dimensions at full scale
//     var viewport = page.getViewport(scale);

//     //We'll create a canvas for each page to draw it on
//     var canvas = document.createElement( "canvas" );
//     canvas.style.display = "block";
//     var context = canvas.getContext('2d');
//     canvas.height = viewport.height;
//     canvas.width = viewport.width;

//     //Draw it on the canvas
//     page.render({canvasContext: context, viewport: viewport});

//     //Add it to the web page
//     // document.body.appendChild( canvas );
//     // document.getElementById('viewport1').appendChild( canvas );
//     selector.append( canvas );

//     // Move to next page
//     currPage++;
//     if ( pdfDoc !== null && currPage <= numPages )
//     {
//         pdfDoc.getPage( currPage ).then( UI._globalHelpers('handlePages') );
//     }
// });

// Template.registerHelper('renderPage', function() {
//     pageRendering = true;
//     // Using promise to fetch the page
//     pdfDoc.getPage(num).then(function(page) {
//       var viewport = page.getViewport(scale);
//       canvas.height = viewport.height;
//       canvas.width = viewport.width;

//       // Render PDF page into canvas context
//       var renderContext = {
//         canvasContext: ctx,
//         viewport: viewport
//       };
//       var renderTask = page.render(renderContext);

//       // Wait for rendering to finish
//       renderTask.promise.then(function () {
//         pageRendering = false;
//         if (pageNumPending !== null) {
//           // New page rendering is pending
//           renderPage(pageNumPending);
//           pageNumPending = null;
//         }
//       });
//     });
// });

// Date.prototype.addDays = function(interval) {
//     this.setDate(this.getDate() + interval);
//     return this;
// };

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function days_between(date1, date2) {

    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime()
    var date2_ms = date2.getTime()

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms)

    // Convert back to days and return
    return Math.round(difference_ms/ONE_DAY)

}

function calcBusinessDays(dDate1, dDate2) { // input given as Date objects
    var iWeeks, iDateDiff, iAdjust = 0;
    if (dDate2 < dDate1) return -1; // error code if dates transposed
    var iWeekday1 = dDate1.getDay(); // day of week
    var iWeekday2 = dDate2.getDay();
    iWeekday1 = (iWeekday1 == 0) ? 7 : iWeekday1; // change Sunday from 0 to 7
    iWeekday2 = (iWeekday2 == 0) ? 7 : iWeekday2;
    if ((iWeekday1 > 5) && (iWeekday2 > 5)) iAdjust = 1; // adjustment if both days on weekend
    iWeekday1 = (iWeekday1 > 5) ? 5 : iWeekday1; // only count weekdays
    iWeekday2 = (iWeekday2 > 5) ? 5 : iWeekday2;

    // calculate differnece in weeks (1000mS * 60sec * 60min * 24hrs * 7 days = 604800000)
    iWeeks = Math.floor((dDate2.getTime() - dDate1.getTime()) / 604800000)

    if (iWeekday1 <= iWeekday2) {
      iDateDiff = (iWeeks * 5) + (iWeekday2 - iWeekday1)
    } else {
      iDateDiff = ((iWeeks + 1) * 5) - (iWeekday1 - iWeekday2)
    }

    iDateDiff -= iAdjust // take into account both days on weekend

    return (iDateDiff + 1); // add 1 because dates are inclusive
}

function dateFormat(thisDate) {
        return (thisDate.getMonth()+1) + "-" + thisDate.getDate() + "-" + thisDate.getFullYear() + ' ' +
            ("0" + thisDate.getHours()).slice(-2) + ":" + ("0" + thisDate.getMinutes()).slice(-2) + ":" + 
            ("0" + thisDate.getSeconds()).slice(-2);    
}
