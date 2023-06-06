
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');

const JSZip = require('jszip');


module.exports = {

  createZipFromAttachmentList: function(attachmentList) {
    const zip = new JSZip();
    for (attachment of attachmentList) {
      let filePath = process.env.ATTACHMENT_DIRECTORY + attachment.tiedosto;
      let data = fs.readFileSync(filePath);
      zip.file(attachment.nimi, data);
    }

    return zip.generateAsync({type: 'base64'})
    .then(function (content) {
      const zipPath = process.env.GDPR_DUMP_DIRECTORY + crypto.randomUUID();
      return new Promise(function(resolve, reject) {
        fs.writeFile(zipPath, content, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(zipPath);
          }
        });
      });
    });

  },

  removeAllGdprDumps: function() {
    return new Promise(function(resolve, reject) {
      const directory = process.env.GDPR_DUMP_DIRECTORY;

      fs.readdir(directory, (err, files) => {
        if (err) reject(err);
  
        for (const file of files) {
          fs.unlink(path.join(directory, file), (err) => {
            if (err) reject(err);
          });
        }
        resolve();
      });
    });
  }

};