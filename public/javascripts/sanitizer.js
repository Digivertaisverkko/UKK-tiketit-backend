

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



  /**
   * Tarkistaa täyttääkö annettu olio annetut ehdot. Voi antaa useamman ehdon, ja ehdot ovat moninaisia.
   * 
   * @param object Olio, jonka ominaisuudet tarkistetaan.
   * @param requirementsList Lista vaatimuksista, jotka oliolta tarkistetaan. Vain määritellyt attribuutit tarkistetaan.
   *  Jokainen taulukon alkio viittaa yhteen olion avaimeen.
   * @returns Promise, joka resolvaa onnistuessaan ja rejectaa jos vaatimukset ei päde.
   * 
   * Vaatimuksissa voi olla seuraavat attribuutit:
   * key      - $string   - Olion attribuutin avain.
   * keyPath  - [$string] - Olion attribuutin avain, voi käyttää, jos olio sisältää aliolioita. Jos keyPath on määritelty, niin key ei tee mitään.
   * value    - [$any]    - Taulukko hyväksytyistä arvoista. 
   * type     - $string   - Olion attribuutin tyyppi.
   * max      - $int      - Joko merkkijonon maksimipituus, tai luvun suurin sallittu koko. 
   * min      - $int      - Joko merkkijonon minimipituus, tai luvun pienin sallittu koko.
   * optional - $bool     - Haittaako, jos attribuuttia ei löydy.
   */
  test: function(object, requirementList) {
    return new Promise(function(resolve, reject) {
      if (checkObjectForRequirements(object, requirementList)) {
        resolve(true);
      } else {
        reject(3000);
      }
    });
  }
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


/**
 * Tarkistaa täyttääkö annettu olio annetut ehdot. Voi antaa useamman ehdon, ja ehdot ovat moninaisia.
 * 
 * @param object Olio, jonka ominaisuudet tarkistetaan.
 * @param requirementsList Lista vaatimuksista, jotka oliolta tarkistetaan. Vain määritellyt attribuutit tarkistetaan.
 *  Jokainen taulukon alkio viittaa yhteen olion avaimeen.
 * @returns Totuusarvon siitä, täyttääkö olio kaikki vaatimukset. True, jos kaikki täyttyy; false, jos mikä tahansa jää täyttymättä.
 * 
 * Vaatimuksissa voi olla seuraavat attribuutit:
 * key      - $string   - Olion attribuutin avain.
 * keyPath  - [$string] - Olion attribuutin avain, voi käyttää, jos olio sisältää aliolioita. Jos keyPath on määritelty, niin key ei tee mitään.
 * value    - [$any]    - Taulukko hyväksytyistä arvoista. 
 * type     - $string   - Olion attribuutin tyyppi.
 * max      - $int      - Joko merkkijonon maksimipituus, tai luvun suurin sallittu koko. 
 * min      - $int      - Joko merkkijonon minimipituus, tai luvun pienin sallittu koko.
 * optional - $bool     - Haittaako, jos attribuuttia ei löydy.
 */  
function checkObjectForRequirements(object, requirementsList) {

  for (const requirement of requirementsList) {

    if (requirement.value && Array.isArray(requirement.value) == false) {
      //Mahdollista myös taulukottoman arvon laittaminen value-attribuuttiin.
      requirement.value = [requirement.value];
    }

    var success = true;
    var found = requirement.optional ? true : false;

    findAttributes(object, requirement.key, requirement.keyPath, function(value) {
      found = true;

      //Tarkista null
      if (value == null && requirement.optional == false) {
        console.log('Hups: ' + value + ' Ongelma1: ' + JSON.stringify(requirement));
        success = false;
      }

      //Tarkista arvo
      if (requirement.value && requirement.value.includes(value) == false) {
        console.log('Hups: ' + value + ' Ongelma1.1: ' + JSON.stringify(requirement));
        success = false;
      }
      
      //Tarkista tyyppi
      if (requirement.type && typeof value !== requirement.type) {
        console.log('Hups: ' + value + ' Ongelma2: ' + JSON.stringify(requirement));
        console.log(typeof value);
        success = false;
      }

      //Tarkista koko
      if (typeof value === 'number') {
        if (requirement.max != null && value > requirement.max) {
          console.log('Hups: ' + value + ' Ongelma3: ' + JSON.stringify(requirement));
          success = false;
        } else if (requirement.min && value < requirement.min) {
          console.log('Hups: ' + value + ' Ongelma4: ' + JSON.stringify(requirement));
          success = false;
        }
      } else {
        if (requirement.max && value.length > requirement.max) {
          console.log('Hups: ' + value + ' Ongelma5: ' + JSON.stringify(requirement));
          success = false;
        } else if (requirement.min && value.length < requirement.min) {
          console.log('Hups: ' + value + ' Ongelma6: ' + JSON.stringify(requirement));
          success = false;
        }
      }
    });

    if (found && success == false) {
      return false;
    }
  }
  return true;
}


/**
 * Etsii annetun olion attribuutit, jotka löytyvät annetulla avaimella tai polulla. Kutsuu callback-funktiota löydetyillä arvoilla.
 * @param {any} object Olio, josta arvoja etsitään
 * @param {string} key Avain, jolla attribuuttia etsitään.
 * @param {[string]} keyPath Polku, josta attribuutteja etsitään. Jos tämä on määritelty, niin key ei tee mitään.
 * @param {function(any)} callback Funktio, jota kutsutaan, kun määränpää on löytynyt.
 * @returns Ei palauta mitään.
 */
function findAttributes(object, key, keyPath, callback) {
  if (keyPath == null) {
    keyPath = [key];
  }
  keyPath = [...keyPath]; //Kopioidaan taulukko, jotta ei muokata alkuperäistä.
  var attribute = object;

  while (keyPath.length > 0) {
    const currentKey = keyPath.shift();
    if (Array.isArray(attribute)) {
      for (const element of attribute) {
        findAttributes(element[currentKey], null, keyPath, callback);
      }
      return;
    } else {
      attribute = attribute[currentKey];
    }
  }

  callback(attribute);

}