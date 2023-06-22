
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');

const JSZip = require('jszip');
const { json } = require("express/lib/response");


module.exports = {

  createZipFromAttachmentList: function(userJson, attachmentList) {
    const zip = new JSZip();
    let buff = Buffer.from(JSON.stringify(userJson), "utf-8")
    console.log("gdpr-zip: Kaiken datan json bufferoitu.")
    zip.file('data.json', buff);
    console.log("gdpr-zip: Kaiken datan json lisätty zippiin.");

    for (attachment of attachmentList) {
      let filePath = process.env.ATTACHMENT_DIRECTORY + attachment.tiedosto;
      let data = fs.readFileSync(filePath);
      console.log("gdpr-zip: Liitetiedosto lisätty zippiin.");
      zip.file(attachment.nimi, data);
    }

    return new Promise(function(resolve, reject) {
      const zipPath = process.env.GDPR_DUMP_DIRECTORY + crypto.randomUUID();
      console.log("gdpr-zip: Zip tullaan luomaan tiedostoon: " + zipPath);

      return zip
      .generateNodeStream({type:'nodebuffer',streamFiles:true})
      .pipe(fs.createWriteStream(zipPath))
      .on('finish', function () {
          resolve(zipPath);
      })
      .on('error', function() {
        reject('Zip epäonnistui.');
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