// © Copyright 2017 Rick Delhommer - All Rights Reserved.

(function () {
  'use strict';

  function MongoCliWrapper(childProcess, path) {
    var _childProcess = childProcess;
    var _path = path;

    this.getMongoDump = getMongoDump;

    function getMongoDump(host, port, db, username, password, archiveOutput, onSuccessCallback, onErrorCallback) {
      var baseCmd = `mongodump --host=${host} --port=${port}`;
      if (db) {
        baseCmd += `--db=${db}`;
      }

      if (username) {
        baseCmd += `-u ${username}`;
      }

      if (password) {
        baseCmd += `-p ${password}`;
      }

      var outputLocation = 'dump';
      if (archiveOutput) {
        outputLocation = `${db}-${new Date().toISOString()}.tgz`;
        baseCmd += `; tar -zcvf ${outputLocation} dump/; rm -rf dump`;
      }

      var dumpProcess = _childProcess.spawn(cmd, args);
      dumpProcess.stdout.on('data', function(data) {
        console.log(`stdout: ${data}`);
      });

      var err = '';
      dumpProcess.stderr.on('data', function(data) {
        err += data;
      });

      dumpProcess.on('close', (code) => {
        if (err !== '') {
          return onErrorCallback(new Error(err));
        }
        return onSuccessCallback(_path.resolve(`./${outputLocation}`));
      });
    }
  }

  module.exports = MongoCliWrapper;
}());
