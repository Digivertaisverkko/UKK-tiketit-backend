var express = require('express');
var router = express.Router();
var fileUpload = require('express-fileupload');
var fs = require('fs');
const crypto = require('crypto');

router.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));


router.post('/liite', function(req, res, next) {

  //TODO: Oikeuksienhallinta
  let filename = crypto.randomUUID();
  let filePath = process.env.ATTACHMENT_DIRECTORY + filename;
  fs.writeFile(filePath, req.files.tiedosto.data, function(err) {
    if (err) {
      Promise.reject(err);
    } else {
      res.send({ success: true, 'liite-id': filename});
    }
  });
});



module.exports = router;