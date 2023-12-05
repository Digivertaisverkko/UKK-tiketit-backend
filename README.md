# Tukki-palvelin

Tämä on Digivertaisverkkohanketta varten toteutetun opetuskäyttöön tarkoitetun tikettijärjestelmän palvelimen toteutus. Palvelin toteuttaa sekä loppukäyttäjän verkkosivujen jakamisen, että rajapinnan, joka verkkosivut käyttävät tiedon hakemiseen. Rajapinta mahdollistaa LTI-integraation, kirjautumisen PostgreSQL-tietokantaan ja käsittelemään käyttöliittymän lähettämät pyynnöt.

## Sisällysluettelo
- [Palvelimen alustaminen](#palvelimen-ajaminen)
- [Rajapinnan määritelmä](/docs/rajapinta/api.md)
    - [Lähetetyt erikoisarvot](/docs/rajapinta/api.md#erikoisarvot)
- [Virhetilat](/docs/rajapinta/virhe.md)
- [Oikeuksienhallinta](/docs/rajapinta/oikeudet.md)


# Palvelimen alustaminen

- Lataa tai kloonaa tämä repo

- Varmista, että sinulla on postgres-tietokanta pystyssä, ja alustettu [ohjeiden](docs/postgres/dokumentaatio.md) mukaan.

- ```cp .env.example .env```

- Aseta vaadittavat ympäristömuuttujat .env tiedostoon

```
PGHOST=[PostgreSQL instanssin osoite]
PGPORT=[PostgreSQL instanssin portti]
PGDATABASE=[PostgreSQL tietokannan nimi]
PGUSER=[PostgreSQL käyttäjän käyttäjänimi]
PGPASSWORD=[PostgreSQL käyttäjän salasana]
LTI_TOOL_URL=[Backendin URL ilman viimeistä kauttaviivaa]
LTI_REDIRECT=[Frontendin URL, johon käyttäjä ohjataan, kun LTI-kirjautuminen on onnistunut]
TEMP_CLIENT_KEY=[LTI:n käyttämä oauth_consumer_key]
TEMP_CLIENT_SECRET=[LTI:n käyttämä oauth jaettu salaisuus]
LTI_CHECK_SIGNATURE=[Tarkistetaanko LTI-yhteyksissä signaturea, vai hyväksytäänkö yhteys pelkällä kuluttaja-avaimella]
COOKIE_SECRET=[Kryptografinen salaisuus, jolla allekirjoitetaan sivuston lähettämät evästeet, tarvitaan vain tietokannan alustuksessa]
ATTACHMENT_DIRECTORY=[Polku siihen kansioon, jossa liitteet säilytetään. Polku suhteessa aktiiviseen kansioon.]
GDPR_DUMP_DIRECTORY=[Polku siihen kansioon, jossa tilapäisesti säilytetään gdpr-pyynnöistä luodut .zip-tiedostot. Polku suhteessa aktiiviseen kansioon.]
FRONTEND_DIRECTORY=[Polku kansioon, jossa on käännetyt frontin tiedostot (oletuksena ./static/)]
PGSSLMODE=[vaaditaan tuotantokäytössä, Azuressa arvo 'require']
SMTP_USERNAME=[käytetyn SMTP palvelun käyttäjänimi]
SMTP_PASSWORD=[käytetyn SMTP palvelun salasana]
SEND_EMAIL_NOTIFICATIONS=[Lähettääkö palvelin ollenkaan sähköposti-ilmoituksia, tai alustaako edes node-maileria. true, jos lähettää, muuten ei. Mahdollistaa testit.]
EMAIL_FROM_=[Mistä osoitteesta sähköposti-ilmoitukset lähetetään.]
SMTP_HOST=[node-mailerin alustukseen käytettävä SMPT-palvelimen osoite]
SMTP_PORT=[node-mailerin alustukseen käytettävä SMTP-palvelimen portti]
TEST_KEEP_TABLES=[kehityskäyttöön tarkoitettu lippu. Määrittää nollaako automaattitestit testitietokannan testien jälkeen vai ei.]
```

- Aja komento ```npm ci```

- Lataa submodule, joka sisältää frontendin [lähdekoodin] (https://www.github.com/Digivertaisverkko/UKK-tiketit) 
```
git submodule init
git submodule update
```

- Käännä submodulessa oleva frontendin koodi
```
npm run build:ui
```

- Aja komento ```npm run start```

Jos tarvitset enemmän debug infoa ltijs:ltä, niin aja seuraava komento:
```DEBUG='provider:*' node app.js```

## Integroiminen Moodleen

Tämä työkalu tukee LTI 1.3:n dynaamista rekisteröintipalvelua. Kyseinen ominaisuus mahdollistaa sen, että ulkoisen työkalun integroiminen Moodleen onnistuu syöttämällä työkalun rekisteröintilinkin Moodleen. Tämä tapahtuu seuraavalla tavalla:

- Mene Moodlessa Admin käyttäjänä ```Site administration / Plugins / Activity modules / External tool / Manage tools```.
- Syötä työkalun rekisteröintilinkki ```Tool URL...``` laatikkoon. Esimerkiksi: ```http://localhost:3000/lti/register```.
- Paina ```Add LTI Advantage``` nappia ja odota, että palaat hetken päästä takaisin samaan näkymään.
- Työkalu ei aktivoidu automaattisesti Moodlessa. Eli paina ```Activate``` nappia alempana ```UKK-Tiketit``` työkalun laatikossa.
- Lisää ulkoinen työkalu haluamallesi paikalle kurssialueella ja testaa toimivuus.

## Testien ajaminen

Testit ajetaan käyttäen Mocha testiympäristöä. Testit on määritelty ```test``` kansiossa.

Testien ajamista varten luo uusi ```.env.test``` -tiedosto, johon syötetään yllä mainitut ympäristömuuttujat. Tämä mahdollistaa esimerkiksi eri tietokannan käyttämisen testien ajamiseen. Testien alussa tietokanta alustetaan ja sinne syötetään testidata. Tämän jälkeen testit ajetaan ja lopuksi kyseinen tietokanta tyhjennetään. Tämä testaa samalla myös migrations -skriptien toiminnan.

Testit ajetaan ajamalla komento ```npm run test```

