



module.exports = {

    /**
     * Yhdistää kaksi taulukkoa siten, että ensimmäisen taulukon solun olion arvon toisen taulukon solun oliolla.
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
            if (secondElement != undefined) {
                firstElement[replacedKey] = secondElement;
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
    }

}