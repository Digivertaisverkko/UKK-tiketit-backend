

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
3004 - Joku meni vikaan


*/


module.exports = {

    createError: function(errorid) {
        var e = new Object;
        e.success = false;
        e.error = new Object();
        e.error.tunnus = errorid;

        switch (errorid) {
            case 1000:
                e.error.virheilmoitus = "Et ole kirjautunut.";
                break;
            case 1001:
                e.error.virheilmoitus = "Kirjautumispalveluun ei saatu yhteyttä.";
                break;
            case 1002:
                e.error.virheilmoitus = "Väärä käyttäjätunnus tai salasana."
                break;
            case 1003:
                e.error.virheilmoitus = "Ei tarvittavia oikeuksia.";
                break;
            case 1010:
                e.error.virheilmoitus = "Luotava tili on jo olemassa."
                break;
            case 2000:
                e.error.virheilmoitus = "Tuloksia ei löytynyt.";
                break;
            case 3000:
                e.error.virheilmoitus = "Virheelliset parametrit.";
                break;
            default:
                e.error.tunnus = 3004;
                e.error.virheilmoitus = "Joku meni vikaan."
                e.error.originaali = errorid;
                break;
        }


        return e;
    }
};