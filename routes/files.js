var express = require('express');
var router = express.Router();
var fileUpload = require('express-fileupload');
var fs = require('fs');
const errorFactory = require('../public/javascripts/error.js')
const access = require('../public/javascripts/access management/access.js');

router.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));


router.post('/tiketti/:ticketid/liite', function(req, res, next) {

  //TODO: Oikeuksienhallinta
  access.readTicket(req, req.params.ticketid)
  .then((handle) => {
    return handle.methods.addAttachment(req.params.ticketid, req.files.tiedosto.data, req.files.tiedosto.name);
  })
  .then(() => {
    res.send({ success: true });
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  })
});

router.get('/tiketti/:ticketid/liite/:attachmentid/lataa', function(req, res, next) {
  access.readTicket(req, req.params.ticketid)
  .then((handle) => {
    return handle.methods.getAttachment(req.params.ticketid, req.params.attachmentid);
  })
  .then((attachmentData) => {
    res.download(attachmentData.polku, attachmentData.nimi);
  })
  .catch((error) => {
    errorFactory.createError(res, error);
  });
});



module.exports = router;