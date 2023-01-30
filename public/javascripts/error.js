

/*
Virheiden luokitukset

Rakenne samanlainen kuin HTTP:ssä, eli koodin on muotoa ABB.
A - ylätason tunniste
BB - tarkentava koodi

A-luokat:
1 - Kirjautumisongelmat 
1000 - Et ole kirjautunut
1001 - Kirjautumispalveluun ei saatu yhteyttä
1002 - Väärä käyttäjätunnus tai salasana
1003 - Ei oikeuksia.
1010 - Luotava tili on jo olemassa


2 - SQL-ongelmat
2000 - Tuloksia ei löytynyt


3 - Liikenneongelmat
3000 - Väärät parametrit
3001 - Operaatio ei mahdollinen
3002 - Rajapintaa ei ole vielä toteutettu
3004 - Joku meni vikaan

*/

const CODE = {
    notSignedIn: 1000,
    noConnection: 1001,
    wrongCredentials: 1002,
    noPermission: 1003,
    accountAlreadyExists: 1010,
    noResults: 2000,
    wrongParameters: 3000,
    operationNotPossible: 3001,
    unfinishedAPI: 3002,
    somethingWentWrong: 3004
}


module.exports = {

    code: CODE,

    createError: function(res, errorid) {
        var e = new Object;
        e.success = false;
        e.error = new Object();
        e.error.tunnus = errorid;

        var status = 418;

        switch (errorid) {
            case CODE.notSignedIn:
                e.error.virheilmoitus = "Et ole kirjautunut.";
                status = 403
                break;
            case CODE.noConnection:
                e.error.virheilmoitus = "Kirjautumispalveluun ei saatu yhteyttä.";
                status = 503
                break;
            case CODE.wrongCredentials:
                e.error.virheilmoitus = "Väärä käyttäjätunnus tai salasana."
                status = 403
                break;
            case CODE.noPermission:
                e.error.virheilmoitus = "Ei tarvittavia oikeuksia.";
                status = 403
                break;
            case CODE.accountAlreadyExists:
                e.error.virheilmoitus = "Luotava tili on jo olemassa."
                status = 500
                break;
            case CODE.noResults:
                e.error.virheilmoitus = "Tuloksia ei löytynyt.";
                status = 204
                break;
            case CODE.wrongParameters:
                e.error.virheilmoitus = "Virheelliset parametrit.";
                status = 400
                break;
            case CODE.operationNotPossible:
                e.error.virheilmoitus = "Operaatiota ei voida suorittaa.";
                status = 400;
                break;
            case CODE.unfinishedAPI:
                e.error.virheilmoitus = "Rajapintaa ei ole vielä toteutettu.";
                status = 405;
                break;
            default:
                e.error.tunnus = CODE.somethingWentWrong;
                e.error.virheilmoitus = "Joku meni vikaan."
                e.error.originaali = errorid;
                status = 500
                break;
        }


        res.status(status).send(e)
    }
};