



module.exports = {

    /**
     * Yhdistää kaksi taulukkoa siten, että ensimmäisen taulukon solun olion arvo korvataan toisen taulukon solun oliolla.
     * Yhdistysehtona ensimmäisen taulukon solun olion arvon täytyy mätsätä jonkin toisen taulukon solun olion arvon kanssa.
     * Jos toisesta taulusta ei löydy oliota, joka vastaisi ensimmäisen taulun arvoon, ensimmäinen taulu pitää muotonsa.
     * 
     * O(n^2)
     * 
     * Eli esim:
     * ensimmäinen taulu [{nimi: "asd", viite: 2}, {nimi: "fgh", viite: 3}, {nimi: "jkl", viite: 1}]
     * toinen taulu [{otsikko: "qwe", id: 2}, {otsikko: "rty", id:3}, {otsikko: "uio", id: 4}]
     * replacedKey = "viite"
     * comparedKey = "id"
     * TULOS:
     * [{nimi: "asd", viite: {otsikko: "qwe", id: 2}}, {nimi: "fgh", viite: {otsikko: "rty", id: 3}}, {nimi: "jkl", viite: 1}]
     * 
     * @param {*} firstArray Tämä palautetaan sellaisenaan, mutta attribuutit 'replacedKey' voi olla muuttunut.
     * @param {*} secondArray Tämän taulukon soluja voidaan asettaan ensimmäisen taulukon soluissa oleviin olioihin.
     * @param {*} replacedKey 
     * @param {*} comparedKey Jos toisessa taulukossa olevan olion arvo tämän nimisessä attribuutissa mätsää ensimmäisessä taulukossa olevan olion replacedKey attribuutissa olevaan arvoon, tämä koko olio laitetaan ensimmäisen taulun olion osaksi.
     */
    arrayUnionWithKeys: function(firstArray, secondArray, replacedKey, comparedKey) {
        let retArray = [...firstArray];
        retArray.forEach(firstElement => {
            var value = firstElement[replacedKey]
            var secondElement = secondArray.find(e => e[comparedKey] === value);
            if (secondElement != undefined) {
                firstElement[replacedKey] = secondElement;
            }
        });
        return retArray;
    },

    /**
     * Yhdistää kaksi taulukkoa uudeksi taulukoksi siten, että ensimmäisen taulukon olioihin lisätään toisen taulukon olio
     * avaimella newKey, jos ensimmäisen taulukon olion matchingKey on sama kuin toisen taulukon olion comparedKey.
     * 
     * Jos paria ei löydy, ensimmäisen taulukon olio pidetään sellaisenaan.
     * Jos useampi pari löytyy, toisen taulukon ensimmäinen osuma sijoitetaan osaksi oliota.
     * 
     * Eli esim:
     * ensimmäinen taulu [{nimi: "asd", viite: 2}, {nimi: "fgh", viite: 3}, {nimi: "jkl", viite: 1}]
     * toinen taulu [{otsikko: "qwe", id: 2}, {otsikko: "rty", id:3}, {otsikko: "uio", id: 4}]
     * matchingKey = "viite"
     * comparedKey = "id"
     * newKey = "uusi"
     * TULOS:
     * [{nimi: "asd", viite: 2, uusi: {otsikko: "qwe", id: 2}},
     *  {nimi: "fgh", viite: 3, uusi: {otsikko: "rty", id: 3}},
     *  {nimi: "jkl", viite: 1}
     * ]
     * 
     * @param {*} firstArray Ensimmäinen taulukko, jonka kaikki arvot palautetaan sellaisenaan, tai muokattuina
     * @param {*} secondArray Toinen taulukko, josta otetaan arvoja ensimmäiseen taulukkoon.
     * @param {*} matchingKey Ensimmäisen taulukon olion avain, jolle etsitään yhteensopivaa paria toisesta taulukosta.
     * @param {*} comparedKey Toisen taulukon olion avain, jota verrataan ensimmäisen taulun olioiden avaimiin.
     * @param {*} newKey Uusi avain, johon toisen taulukon olio liitetään.
     * @returns 
     */
    
    arrayUnionByAddingToObjects: function(firstArray, secondArray, matchingKey, comparedKey, newKey) {
        let retArray = [...firstArray];
        retArray.forEach(firstElement => {
            var value = firstElement[matchingKey]
            var secondElement = secondArray.find(e => e[comparedKey] === value);
            if (secondElement != undefined) {
                firstElement[newKey] = secondElement;
            }
        });
        return retArray;
    },


    /**
     * Yhdistää kaksi taulukkoa uudeksi taulukoksi siten, että ensimmäisen taulukon olioihin lisätään toisen taulukon olion
     * arvo avaimesta extractedKey avaimeen newKey, jos ensimmäisen taulukon olion matchingKey on sama kuin toisen taulukon 
     * olion comparedKey.
     * 
     * Jos paria ei löydy, ensimmäisen taulukon olio pidetään sellaisenaan.
     * Jos useampi pari löytyy, toisen taulukon ensimmäinen osuma sijoitetaan osaksi oliota.
     * 
     * Eli esim:
     * ensimmäinen taulu [{nimi: "asd", viite: 2}, {nimi: "fgh", viite: 3}, {nimi: "jkl", viite: 1}]
     * toinen taulu [{otsikko: "qwe", id: 2}, {otsikko: "rty", id:3}, {otsikko: "uio", id: 4}]
     * matchingKey = "viite"
     * comparedKey = "id"
     * newKey = "uusi"
     * extractedKey = "otsikko"
     * TULOS:
     * [{nimi: "asd", viite: 2, uusi: "qwe"},
     *  {nimi: "fgh", viite: 3, uusi: "rty"},
     *  {nimi: "jkl", viite: 1}
     * ]
     * 
     * @param {*} firstArray Ensimmäinen taulukko, jonka kaikki arvot palautetaan sellaisenaan, tai muokattuina
     * @param {*} secondArray Toinen taulukko, josta otetaan arvoja ensimmäiseen taulukkoon.
     * @param {*} matchingKey Ensimmäisen taulukon olion avain, jolle etsitään yhteensopivaa paria toisesta taulukosta.
     * @param {*} comparedKey Toisen taulukon olion avain, jota verrataan ensimmäisen taulun olioiden avaimiin.
     * @param {*} newKey Uusi avain, johon toisen taulukon olio liitetään.
     * @returns 
     */
    arrayUnionByAddingPartsOfObjects: function(firstArray, secondArray, matchingKey, comparedKey, newKey, extractedKey) {
        let retArray = [...firstArray];
        retArray.forEach(firstElement => {
            var value = firstElement[matchingKey]
            var secondElement = secondArray.find(e => e[comparedKey] === value);
            if (secondElement != undefined) {
                var secondValue = secondElement[extractedKey]
                if (secondValue != undefined) {
                    firstElement[newKey] = secondValue;
                }
            }
        });
        return retArray;
    },


    /**
     * Palauttaa uuden taulukon, jossa on pelkästään annetun taulukon (array) annetut attribuutit (key).
     * Eli esim: 
     * array = [{nimi: "asd", viite: 2}, {nimi: "fgh", viite: 3}, {nimi: "jkl", viite: 1}]
     * key = "viite"
     * TULOS
     * [2, 3, 1]
     * @param {*} array 
     * @param {*} key 
     */
    extractAttributes: function(array, key) {
        let retArray = [];
        array.forEach(element => {
            retArray.push(element[key]);
        });
        return retArray;
    },


    /**
     * Palauttaa uuden taulukon, jossa on on kaikki ensimmäisen taulukon oliot, mutta niihin on lisätty attribuutti newKey,
     * johon tallennetaan toisesta taulukosta löytyvä arvo. Toisesta taulukosta valittu arvo valikoituu, jos ensimmäisen
     * taulukon arvon seekKey on sama kuin toisen taulukon arvon comparedKey.
     * Eli esim:
     * ensimmäinen taulu [{nimi: "asd", viite: 2}, {nimi: "fgh", viite: 3}, {nimi: "jkl", viite: 1}]
     * toinen taulu [{otsikko: "qwe", id: 2}, {otsikko: "rty", id:3}, {otsikko: "uio", id: 4}]
     * newKey = "uusi"
     * seekKey = "viite"
     * comparedKey = "id"
     * TULOS:
     * [{nimi: "asd", viite: 2, uusi: {otsikko: "qwe", id: 2}},
     *  {nimi: "fgh", viite: 3, uusi: {otsikko: "rty", id: 3}},
     *  {nimi: "jkl", viite: 1}]
     * 
     * @param {*} firstArray
     * @param {*} secondArray 
     * @param {*} newKey 
     * @param {*} seekKey 
     * @param {*} comparedKey 
     */
    addObjectWithKeys: function(firstArray, secondArray, newKey, seekKey, comparedKey) {
        let retArray = [...firstArray];
        retArray.forEach(firstElement => {
            var value = firstElement[seekKey];
            var secondElement = secondArray.find(e => e[comparedKey] === value);
            if (secondElement != undefined) {
                firstElement[newKey] = secondElement['tila'];
            }
        });
        return retArray;
    }

}