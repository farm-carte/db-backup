// © Copyright 2017 Rick Delhommer - All Rights Reserved.

(function () {
  'use strict';

  function MongoDriveBackup(mongoWrapper, driveWrapper) {
    this.backupDb = backupDb;

    function backupDb(dbOptions, driveOptions, onSuccessCallback, onErrorCallback) {
      // Dump the DB
      mongoWrapper.getMongoDump(db.Options.host, db.Options.port, db.Options.db, db.Options.username, db.Options.password, true, (dumpOutput) => {
        // Upload the archived dump
        driveWrapper.uploadFile(dumpOutput, 'application/gzip', (file) => {
          // Share the archived dump with the actual user (can't get impersonation to work)
          driveWrapper.shareFile(file.id, 'writer', driveOptions.userToShareWith, () => {
            var rmDumpProcess = _childProcess.spawn(`rm ${dumpOutput}`, args);
            rmDumpProcess.stdout.on('data', function(data) {
              console.log(`stdout: ${data}`);
            });
      
            var err = '';
            rmDumpProcess.stderr.on('data', function(data) {
              err += data;
            });
      
            rmDumpProcess.on('close', (code) => {
              if (err !== '') {
                return onErrorCallback(new Error(err));
              }
              return onSuccessCallback();
            });
          }, (shareErr) => {
            onErrorCallback(shareErr);
          });
        }, (uploadErr) => {
          onErrorCallback(uploadErr);
        });
      }, (dumpErr) => {
        onErrorCallback(dumpErr);
      });
    }
  }

  MongoDriveBackup.createDefault = createDefault;

  function create(googleAuthClient) {
    var MongoWrapper = require('./mongo-wrapper');
    var GoogleDriveWrapper = require('./google-drive-wrapper');
    var childProcess = require('child_process');
    var path = require('path');
    var fs = require('fs');
    var google = require('googleapis');

    var mongoWrapper = new MongoWrapper(childProcess, path);
    var googleDriveWrapper = new GoogleDriveWrapper(fs, google, googleAuthClient);

    return new MongoDriveBackup(mongoWrapper, googleDriveWrapper);
  }

  module.exports = MongoDriveBackup;
}());
