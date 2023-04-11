const TicketReads = require("./ticketreads");
const crypto = require('crypto');
const fs = require('fs');
const sql = require('../../../routes/sql.js');



class CommentWrites extends TicketReads {

  addAttachment(commentid, filedata, originalFilename) {
    let fileid = crypto.randomUUID();
    let filePath = process.env.ATTACHMENT_DIRECTORY + fileid;
    return new Promise(function(resolve, reject) {
      fs.writeFile(filePath, filedata, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    })
    .then(() => {
      return sql.tickets.addAttachmentToComment(commentid, fileid, originalFilename);
    });
  }


  updateCommentText(commentid, content, newState) {
    return sql.tickets.updateComment(commentid, content, newState);
  }

}


module.exports = CommentWrites;