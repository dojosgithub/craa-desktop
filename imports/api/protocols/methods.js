import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { s3Config } from '/imports/startup/server/s3-config.js'

import { Protocols } from './protocols.js'

const os = Npm.require('os')
const fs = Npm.require('fs')

// const all_protocols = new MysqlSubscription('all_protocols')

Meteor.methods({
  /*==============================*
   *   Protocols methods          *
   *==============================*/  
  'Protocols.orders.update'(pObj) {
    check(pObj[0], {
      id: Number,
      order: Number
    })    

    // this.unblock()

    let 
      i = 0, 
      data = {},
      now = new Date

    let output = Meteor.wrapAsync((args, callback) => {
// console.log(i, docObj.length)
      pObj.forEach((p) => {
        // console.log(d)
        i++
        
        let order = p.order +1

        Protocols.update({
          id: p.id
        }, {
          $set: {        
            protocol_order: order,
            modified: now
          }
        }, (err, res) => {
          if(err) {
            data = {data: 'fail'}
          } else {
            data = {data: res}
          }
        })

        // let query = `
        //   UPDATE craa_protocols 
        //   SET protocol_order = ${liveDb.db.escape(order)}, modified = ${liveDb.db.escape(now)} 
        //   WHERE id = ${liveDb.db.escape(p.id)}
        // `      
        // liveDb.db.query(
        //   query,
        //   (err, res) => {
        //     if(err) {
        //       data = {data: 'fail'}
        //     } else {
        //       data = {data: res}
        //     }
        //   }
        // )

        if(i === pObj.length) {
          callback(null, data)
        }        

      })
  
    })

    let result = output('dk')

    if(result) {
      return result
    }
  }, 
  'Protocols.insert'(pObj) {
    check(pObj, {
      simulation_id: Number,
      name: String,
      fileName: String,
      order: Number,
      modified: String,
      size: Number,
      siSize: String
    })

    let lastId = Protocols.find({}, {
      sort: {id: -1},
      limit: 1
    }).fetch()

    let output = Meteor.wrapAsync((lastId, callback) => {

      if(lastId) {
        let 
          now = new Date,
          newId = parseInt(lastId)+1

        let _pObj = {
          id: newId,
          simulation_id: pObj.simulation_id,
          protocol_name: pObj.name,
          file_name: pObj.fileName,
          protocol_order: pObj.order,          
          size: pObj.size,
          siSize: pObj.siSize,
          status: 1,
          created: now,
          modified: now        
        }

        Protocols.insert(_pObj, (err, res) => {
          if(err) {
            _outputData = {success: false, data: err}
          } else {
            _outputData = {success: true, data: res}
          }
          callback(null, _outputData)
        })

        // let 
        //   _id = liveDb.db.escape(newId),
        //   _name = liveDb.db.escape(pObj.name),
        //   _fileName = liveDb.db.escape(pObj.fileName),
        //   _simulation_id = liveDb.db.escape(pObj.simulation_id),
        //   _order = liveDb.db.escape(pObj.order),
        //   _created = liveDb.db.escape(now),
        //   _size = liveDb.db.escape(pObj.size),
        //   _outputData = {}

        // let query = `
        //   INSERT INTO craa_protocols (id, protocol_name, file_name, simulation_id, protocol_order, size, created, modified) 
        //   VALUES (${_id}, ${_name}, ${_fileName}, ${_simulation_id}, ${_order}, ${_size}, ${_created}, ${_created})
        // `

        // // let query = `
        // //   INSERT INTO craa_protocols (protocol_name, file_name, simulation_id, protocol_order, size, created, modified) 
        // //   VALUES (?, ?, ?, ?, ?, ?, ?)
        // // ` 

        // liveDb.db.query(  
        //   query,
        //   (err, res) => {
        //     if(err) {
        //       _outputData = {success: false, data: err}
        //     } else {
        //       _outputData = {success: true, data: res}
        //     }
        //     callback(null, _outputData)
        //   }
        // )

      }

    })

    let result = output(lastId[0].id)

    if(result) {            
      return result
    }
  },
  'Protocols.update'(pObj) {
    check(pObj, {
      id: Number,
      name: String
    })    

    // this.unblock()

    let 
      now = new Date,
      _resultOutput = {}

    let output = Meteor.wrapAsync((args, callback) => {

      Protocols.update({
        id: pObj.id
      }, {
        $set: {
          protocol_name: pObj.name,
          modified: now
        }
      }, (err, res) => {
        if(err) {
          _resultOutput = {success: false, data: err}
        } else {
          _resultOutput = {success: true, data: res}
        }
        callback(null, _resultOutput)
      })

      // let query = `
      //   UPDATE craa_protocols 
      //   SET protocol_name = ${liveDb.db.escape(pObj.name)} 
      //   WHERE id = ${liveDb.db.escape(pObj.id)}
      // `      
      // liveDb.db.query(
      //   query,
      //   (err, res) => {
      //     if(err) {
      //       _resultOutput = {success: false, data: err}
      //     } else {
      //       _resultOutput = {success: true, data: res}
      //     }
      //     callback(null, _resultOutput)
      //   }
      // )      
  
    })

    let result = output('dk')

    if(result) {
      return result
    }
  },
  'Protocols.update.status'(pObj) {
    check(pObj, {
      id: Number,
      status: Number
    })    

    // this.unblock()

    let 
      now = new Date,
      _resultOutput = {}

    let output = Meteor.wrapAsync((pObj, callback) => {

      Protocols.update({
        id: pObj.id
      }, {
        $set: {
          status: pObj.status,
          modified: now
        }
      }, (err, res) => {
        if(err) {
          _resultOutput = {success: false, data: err}
        } else {
          _resultOutput = {success: true, data: res}
        }
        callback(null, _resultOutput)
      })

      // let query = `
      //   UPDATE craa_protocols 
      //   SET status = ${liveDb.db.escape(pObj.status)} 
      //   WHERE id = ${liveDb.db.escape(pObj.id)}
      // `      
      // liveDb.db.query(
      //   query,
      //   (err, res) => {
      //     if(err) {
      //       _resultOutput = {success: false, data: err}
      //     } else {
      //       _resultOutput = {success: true, data: res}
      //     }
      //     callback(null, _resultOutput)
      //   }
      // )      
  
    })

    let result = output(pObj)

    if(result) {
      return result
    }
  },
  'Protocols.download'(fileObj) {
    check(fileObj, {
      s3Path: String,
      fileName: String,
      id: Number
    })
    
    // this.unblock()

    let Knox = Npm.require('knox')

    let client = Knox.createClient({
      key: s3Config.accessKeyId,
      secret: s3Config.secretAccessKey,
      bucket: s3Config.bucket
    })

    let buffer = undefined;

    let filePath = fileObj.s3Path+fileObj.fileName

    let output = Meteor.wrapAsync((args, callback) => {

      client.get(filePath)
        .on('response', function(s3res) {

        s3res.setEncoding('binary');

        s3res.on('data', function(chunk){
          buffer += chunk;
        });

        s3res.on('end', function() {
          let _buffer = new Buffer(buffer, 'binary');
          var fileLength = _buffer.length;
          // console.log(fileUrl, fileLength)
          // res.attachment(fileName);
          // res.append('Set-Cookie', 'fileDownload=true; path=/');
          // res.append('Content-Length', fileLength);
          // res.status(s3res.statusCode).send(buffer);
          // fs.write(_buffer)
  // console.log(os.tmpdir())
          // let tmpPath = '/Users/david/documents/test.pdf'
          // let tmpPath = '/tmp/' + fileObj.fileName
          let 
            // tmpPath = os.tmpdir() + '/' + fileObj.fileName,
            // tmpPath = '/Users/david/documents/'+fileObj.fileName,
            tmpPath = '/tmp_/'+fileObj.fileName,
            _outputData = {}
          
          fs.open(tmpPath, 'w', function(err, fd) {
              if (err) {
                  throw 'error opening file: ' + err;
              }

              fs.write(fd, _buffer, 0, _buffer.length, null, function(err) {
                  // if (err) throw 'error writing file: ' + err;
                  if(err) {
                    _outputData = {success: false, data: err}
                    callback(null, _outputData)
                  } else {
                    fs.close(fd, function() {                      
                      _outputData = {success: true, data: tmpPath}
                      callback(null, _outputData)
                    })                    
                  }                  
              });
          });

        });

  // if (s3Res.headers['content-type']) {
  //   res.type( s3Res.headers['content-type'] );
  // }
  // res.attachment(fileName);

  // s3Res.setEncoding('binary');
  // s3Res.on('data', function(data){
  //   res.write(data, 'binary');
  // });

  // s3Res.on('end', function() {
  //   res.send();
  // });

      }).end();

    })

    let result = output('dk')

    if(result) {
      return result
    }

  },
  'ETL.Protocols.transfer'() {
   
    // this.unblock()

    let 
      i = 0, 
      _outputData = {},
      now = new Date
    
    all_protocols.reactive()

    // console.log(all_behaviors.length)

    let output = Meteor.wrapAsync((args, callback) => {

      all_protocols.forEach((p) => {
        
        i++
        
        Protocols.upsert({
          id: p.id
        }, {
          $set: {
            protocol_name: p.protocol_name,            
            file_name: p.file_name,            
            simulation_id: p.simulation_id,                              
            protocol_order: p.protocol_order,
            size: p.size,
            status: p.status,            
            created: p.created,
            modified: p.modified           
          }
        }, (err, res) => {          
          if(err) {
            _outputData = {success: false, data: err}
          } else {
            _outputData = {success: true, data: res}
          }          
        })

        if(i === all_protocols.length) {
          callback(null, _outputData)
        } 

      })
  
    })

    let result = output('dk')

    if(result) {
      return result
    }
  },      
})