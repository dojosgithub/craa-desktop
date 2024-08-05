import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { DocumentFiles } from './document-files.js'

// const all_document_files = new MysqlSubscription('all_document_files')

Meteor.methods({
  /*==============================*
   *   Document Files methods     *
   *==============================*/   
  'DocumentFiles.upload'(fileObj) {

    check(fileObj, {
      folder_id: Number,
      document_id: Number,
      simulation_id: Number,
      fileName: String,
      modified: String,
      size: Number,
      siSize: String
    })

    let lastId = DocumentFiles.find({}, {
      sort: {id: -1},
      limit: 1
    }).fetch()

    let output = Meteor.wrapAsync((lastId, callback) => {

      if(lastId) {

        let 
          now = new Date,
          newId = parseInt(lastId)+1

        let _dfObj = {
          id: newId,
          folder_id: fileObj.folder_id,
          document_id: fileObj.document_id,
          simulation_id: fileObj.simulation_id,
          name: fileObj.fileName,
          size: fileObj.size,
          siSize: fileObj.siSize,
          status: 1,           
          created: now,
          modified: now         
        }

        DocumentFiles.insert(_dfObj, (err, res) => {
          if(err) {
            _outputData = {success: false, data: err}
          } else {
            _outputData = {success: true, data: res}
          }
          callback(null, _outputData)
        })

        // let
        //   _id = liveDb.db.escape(newId),
        //   _name = liveDb.db.escape(fileObj.fileName),
        //   _document_id = liveDb.db.escape(fileObj.document_id),
        //   _folder_id = liveDb.db.escape(fileObj.folder_id),
        //   _simulation_id = liveDb.db.escape(fileObj.simulation_id),
        //   _created = liveDb.db.escape(now),
        //   _size = liveDb.db.escape(fileObj.size),
        //   _outputData = {}

        // let query = `
        //   INSERT INTO craa_document_files (id, name, document_id, folder_id, simulation_id, size, created, modified) 
        //   VALUES (${_id}, ${_name}, ${_document_id}, ${_folder_id}, ${_simulation_id}, ${_size}, ${_created}, ${_created})
        // `

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
  'DocumentFiles.update.status'(fileObj) {
    check(fileObj, {
      id: Number,
      status: Number
    })    

    // this.unblock()

    // let
    //   _id = liveDb.db.escape(fileObj.id),
    //   _status = liveDb.db.escape(fileObj.status),
    //   _outputData = {}

    let output = Meteor.wrapAsync((args, callback) => {

      DocumentFiles.update({
        id: fileObj.id
      }, {
        $set: {
          status: fileObj.status,
          modified: new Date
        }
      }, (err, res) => {
        if(err) {
          _outputData = {success: false, data: err}
        } else {
          _outputData = {success: true, data: res}
        }
        callback(null, _outputData)
      })

      // let query = `
      //   UPDATE craa_document_files 
      //   SET status = ${_status} 
      //   WHERE id = ${_id}
      // `      
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
  
    })

    let result = output('dk')

    if(result) {
      return result
    }
  },
  'DocumentFiles.download'(fileObj) {
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

    // let s3Path = "media"
    // let filename =s3Path+fileObj.file

    let buffer = undefined;

    let filePath = fileObj.s3Path+fileObj.fileName

    let output = Meteor.wrapAsync((args, callback) => {

      client.get(filePath)
        .on('response', function(s3res) {

    // console.log(s3Res.statusCode);
    // console.log(s3Res.headers);
    // s3Res.setEncoding('utf8');
    // s3Res.on('data', function(chunk){
    //   console.log(chunk);
    // });

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
            tmpPath = os.tmpdir() + '/' + fileObj.fileName,
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
  // 'ETL.DocumentFiles.transfer'() {
   
    // this.unblock()

  //   let 
  //     i = 0, 
  //     _outputData = {},
  //     now = new Date
    
  //   all_document_files.reactive()

  //   // console.log(all_behaviors.length)

  //   let output = Meteor.wrapAsync((args, callback) => {

  //     all_document_files.forEach((d) => {
        
  //       i++
        
  //       DocumentFiles.upsert({
  //         id: d.id
  //       }, {
  //         $set: {
  //           name: d.name,            
  //           simulation_id: d.simulation_id,
  //           document_id: d.document_id,                     
  //           folder_id: d.folder_id,
  //           size: d.size,                    
  //           status: d.status,            
  //           created: d.created,
  //           modified: d.modified           
  //         }
  //       }, (err, res) => {          
  //         if(err) {
  //           _outputData = {success: false, data: err}
  //         } else {
  //           _outputData = {success: true, data: res}
  //         }          
  //       })

  //       if(i === all_document_files.length) {
  //         callback(null, _outputData)
  //       } 

  //     })
  
  //   })

  //   let result = output('dk')

  //   if(result) {
  //     return result
  //   }
  // },
})