
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const sql = require('../../routes/sql.js');

const JSZip = require('jszip');
const { json } = require("express/lib/response");
const arrayTools = require("./arrayTools.js");


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
          console.log("gdpr-zip: zip-paketti luotu.");
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
  },

  removeAllUnusedAttachments: function() {
    return new Promise (function (resolve, reject) {
      sql.tickets.getAllAttachments()
      .then((attachmentList) => {
        let attachmentNames = arrayTools.extractAttributes(attachmentList, 'tiedosto');
        console.dir(attachmentNames);
        fs.readdir(process.env.ATTACHMENT_DIRECTORY, (err, files) => {
          files.forEach((file) => {
            console.log(file);
            if (attachmentNames.includes(file) == false && file.charAt(0) != '.') {
              console.log("Poistetaan liite ajastetusti: " + file);
              fs.unlink(process.env.ATTACHMENT_DIRECTORY + file, (err) => {
                if (err != null) {
                  console.error("Liitteen " + file + " poistaminen epäonnistui: " + err);
                }
              });
            }
          });
          resolve();
        })
      });
    })
  }

};