

module.exports = {

    hasRequiredHeaders: function(request, keyList) {
        return new Promise(function(resolve, reject) {
            let object = new Object();
            for (const key of keyList) {
                let value = request.header(key);
                if (value == null || value == undefined) {
                    return reject(3000);
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
                    return reject(3000);
                } else {
                    object[key] = value;
                }
            }
            return resolve(object);
        });
    },

    hasRequiredParameter: function(request, key, type, regex=RegExp("*")) {
        return new Promise(function(resolve, reject) {
            let value = request.body[key];
            if (value == null || value == undefined) {
                return reject(3000);
            } else if ((typeof value) === type) {
                //TODO: Lisää regex tarkistus stringeille.
                if (type === "string" && regex.test(value)) {
                    return resolve();
                }
            }
            return reject(3000);
        });
    }
  
  }