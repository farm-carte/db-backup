// © Copyright 2017 Rick Delhommer - All Rights Reserved.

(function () {
  'use strict';

  function GoogleDriveWrapper(fs, google, authClient) {
    var _fs = fs;
    var _authClient = authClient;
    var _drive = google.drive({ version: 'v3' });
    
    this.uploadFile = uploadFile;

    function uploadFile(filePath, mimeType, onSuccessCallback, onErrorCallback) {
      var fileSplit = filePath.split('/');
      var fileName = fileSplit[fileSplit.length - 1];

      drive.files.create({
        auth: _authClient,
        resource: {
          name: fileName,
          mimeType: mimeType,
          parents: ['root']
        },
        media: {
          mimeType: mimeType,
          body: _fs.createReadStream(filePath)
        }
      }, (err, res) => {
        if (err) return onErrorCallback(err);

        console.log('Created File on Google Drive: ' + res.id);
        return onSuccessCallback(res);
      });
    }

    function shareFileWithUser(fileId, role, userToShareWith, onSuccessCallback, onErrorCallback) {
      drive.permissions.create({
        auth: jwtClient,
        fileId: fileId,
        resource: {
          emailAddress: userToShareWith,
          role: role,
          type: 'user'
        }
      }, (err, res) => {
        if (err) return onErrorCallback(err);

        console.log('Shared file (' + fileId + ') with ' + userToShareWith);
        return onSuccessCallback(res);
      });
    }
  }

  module.exports = GoogleDriveWrapper;
}());
