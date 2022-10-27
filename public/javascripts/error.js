

/*
Virheiden luokitukset

Rakenne samanlainen kuin HTTP:ssä, eli koodin on muotoa ABB.
A - ylätason tunniste
BB - tarkentava koodi

A-luokat:
1 - Kirjautumisongelmat 
100 - Et ole kirjautunut
101 - Kirjautumispalveluun ei saatu yhteyttä
102 - Väärä käyttäjätunnus tai salasana



2 - SQL-ongelmat



3 - Liikenneongelmat
300 - Väärä parametrit

*/


module.exports = {

    createError: function(errorid) {
        var e = new Object;
        e.tunnus = errorid;

        switch (errorid) {
            case 100:
                e.virheilmoitus = "Et ole kirjautunut";
                break;
            case 101:
                e.virheilmoitus = "Kirjautumispalveluun ei saatu yhteyttä.";
                break;
            case 102:
                e.virheilmoitus = "Väärä käyttäjätunnus tai salasana."
                break;
            case 300:
                e.virheilmoitus = "Virheelliset parametrit.";
                break;
            default:
                e.virheilmoitus = "Joku meni vikaan."
                break;
        }


        return e;
    }
};