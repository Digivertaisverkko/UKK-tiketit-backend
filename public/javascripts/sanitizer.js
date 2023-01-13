

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
        return module.exports.objectHasRequiredParameters(request.body, keyList);
    },

    arrayObjectsHaveRequiredParameters: function(array, keyList) {
        return new Promise(function(resolve, reject) {
            for (index in array) {
                let element = array[index];
                let passedObject = checkObjectForRequiredParameters(element, keyList);
                if (passedObject == null) {
                    reject(3000);
                }
            }
            resolve(array);
        });
    },

    objectHasRequiredParameters: function(object, keyList) {
        return new Promise(function(resolve, reject) {
            let passedObject = checkObjectForRequiredParameters(object, keyList);
            if (passedObject != null) {
                resolve(passedObject);
            } else {
                reject(3000);
            }
        });
    },



    /*
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
    */
}




    /**
     * Tarkistaa onko annetulla oliolla kaikki vaaditut attribuutit. Palauttaa uuden olion, jolle on kopioitu
     * kaikki vaaditut attribuutit, jos kaikki löytyi. Muuten null.
     * 
     * @param {*} object Olio, jonka attribuutit tarkastetaan.
     * @param {*} keyList Taulukko stringejä, joita etsitään objectin attribuuttien nimistä.
     * @returns Kopio objectista, jolla on vain keyListin listaamat attribuutit. 
     * Palauttaa null, jos kaikkia attribuutteja ei löytynyt.
     */
function checkObjectForRequiredParameters(object, keyList) {
    let newobject = new Object();
    for (const key of keyList) {
        let value = object[key];
        if (value == null || value == undefined) {
            return null;
        } else {
            newobject[key] = value;
        }
    }
    return newobject;
  }