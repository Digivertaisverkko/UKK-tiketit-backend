

module.exports = {

    hasRequiredHeaders: function(request, keyList) {
        return new Promise(function(resolve, reject) {
            let object = new Object();
            for (const key of keyList) {
                let value = request.header(key);
                if (value == null || value == undefined) {
                    return reject(300);
                } else {
                    object[key] = value;
                }
            }
            return resolve(object);
        });
    },

    hasRequiredParameters: function(request, keyList) {
        return new Promise(function(resolve, reject) {
            let object = new Object();
            for (const key of keyList) {
                let value = request.body[key];
                if (value == null || value == undefined) {
                    return reject(300);
                } else {
                    object[key] = value;
                }
            }
            return resolve(object);
        });
    }
  
  }