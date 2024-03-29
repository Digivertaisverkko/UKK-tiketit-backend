
const CODE = require('./errorcodes.js');

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


module.exports = {

    code: CODE,

    createError: function(req, res, errorid) {
        var e = new Object;
        e.success = false;
        e.error = new Object();
        e.error.tunnus = errorid;

        var status = 418;

        switch (errorid) {
            case CODE.notSignedIn:
                console.warn('[ACCESS] Kirjautumaton käyttäjä yrittää koskea resurssiin, johon sillä ei ole oikeuksia. ' + req.ip);
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
                console.warn('[ACCESS] Kirjautunut käyttäjä yrittää päästä käsiksi resurssiin, johon sillä ei ole oikeuksia. ' + req.ip);
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
                console.error('Tunnistamaton virhe 500:');
                console.dir(errorid);
                status = 500
                break;
        }

        res.status(status).send(e)
    }
};