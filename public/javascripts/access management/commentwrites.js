const TicketReads = require("./ticketreads");
const crypto = require('crypto');
const fs = require('fs');
const sql = require('../../../routes/sql.js');



class CommentWrites extends TicketReads {

  addAttachment(commentid, filedata, originalFilename, filesize) {
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
      return sql.tickets.addAttachmentToComment(commentid, fileid, originalFilename, filesize);
    });
  }

  deleteAttachment(commentId, attachmentId) {
    let filePath = process.env.ATTACHMENT_DIRECTORY + attachmentId;
    fs.promises.unlink(filePath)
    .then(() => {
      return sql.tickets.removeAttachmentFromComment(attachmentId, commentId);
    });
  }


  deleteComment(commentid) {
    return sql.tickets.deleteComment(commentid);
  }


  updateCommentText(commentid, content, newState) {
    return sql.tickets.updateComment(commentid, content, newState);
  }

}


module.exports = CommentWrites;