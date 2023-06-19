var express = require('express');
var router = express.Router();
var fileUpload = require('express-fileupload');
var fs = require('fs');
const errorFactory = require('../public/javascripts/error.js')
const access = require('../public/javascripts/access management/access.js');
const filessystem = require('../public/javascripts/filessystem.js');

router.use(fileUpload({
  limits: { fileSize: 100 * 1024 * 1024 },
  defParamCharset: 'utf8'
}));

router.post('/kurssi/:courseid/tiketti/:ticketid/kommentti/:commentid/liite', function(req, res, next) {
  access.writeComment(req, req.params.courseid, req.params.ticketid, req.params.commentid)
  .then((handle) => {
    return handle.methods.addAttachment(req.params.commentid, 
                                        req.files.tiedosto.data, 
                                        req.files.tiedosto.name,
                                        req.files.tiedosto.size);
  })
  .then(() => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })

});

router.get('/kurssi/:courseid/tiketti/:ticketid/kommentti/:commentid/liite/:attachmentid/tiedosto', function(req, res, next) {
  access.readTicket(req, req.params.courseid, req.params.ticketid)
  .then((handle) => {
    return handle.methods.getAttachment(req.params.commentid, req.params.attachmentid);
  })
  .then((attachmentData) => {
    res.download(attachmentData.polku, attachmentData.nimi);
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  });
});

router.delete('/kurssi/:courseid/tiketti/:ticketid/kommentti/:commentid/liite/:attachmentid', function(req, res, next) {
  access.writeComment(req, req.params.courseid, req.params.ticketid, req.params.commentid)
  .then((handle) => {
    return handle.methods.deleteAttachment(req.params.commentid, req.params.attachmentid);
  });
});

router.get('/minun/gdpr/kaikki/zip', function(req, res, next) {
  let userDataJson;
  return access.authenticatedUser(req)
  .then((userId) => {
    return access.writeProfile(req, userId);
  })
  .then((handle) => {
    return handle.methods.exportAllUserData(handle.userid)
    .then((userData) => {
      userDataJson = userData;
      return handle;
    });
  })
  .then((handle) => {
    return handle.methods.getAllUserAttachments(handle.userid);
  })
  .then((attachmentList) => {
    return filessystem.createZipFromAttachmentList(userDataJson, attachmentList);
  })
  .then((zipPath) => {
    res.download(zipPath, 'liitteet.zip');
  })
  .catch((error) => {
    errorFactory.createError(req, res, error);
  })
});



module.exports = router;