# Postgres asetukset

## Mikä tämä kansio on?
Tästä kansiosta löytyy dokumentaatio backendin käyttämästä tietokannasta ja sen asetuksista. Tiedostosta löytyy myös listattuna komennot, jotka ajamalla tietokannan saa backendin vaatimaan toimintakuntoon.\
Kaikissa tässä kansiossa olevissa tiedostoissa ei ole listattu tietokannassa käytettyjä käyttäjätunnuksia ja salasanoja, vaan ne on korvattu hakasulkeilla rajattuja käyttäjärooleja (esim. [peruskäyttäjä], [admin] tai [salasana])
## Kansion tiedostot
### [dokumentaatio.md](dokumentaatio.md)
Tämä tiedosto. Sisältää yleiskielisen selityksen tietokannan asetuksista ja vaatimuksista.
### [dvvukk_init_db.txt](dvvukk_init_db.txt)
Sisältää komennot tietokannan ja käyttäjien alustamiseksi.


# Tietokantapalvelimen asetukset

Tämä backend tarvitsee kaverikseen postgres-tietokannan, jossa tallennettua tietoa säilytetään. Tässä dokumentaatiossa ei ole merkitty Oulun yliopistossa ja OAMKissa käytössä olevan tietokannan osoitteita, käyttäjätunnuksia tai salasanoja. Tässä dokumentaatiossa mainitaan vain kaikki elementit, jotka löytyvät tietokannasta ja joita tarvitaan tietokantaan, jotta tämä toimisi.

## Tietokannassa olevat skeemat
### **public**
Tänne menee kaikki LTI-integraation vaatimat taulut. Sen vuoksi oikeudet tähän skeemaan on rajattu siten, että ainoastaan superuserilla ja LTI-käyttäjällä on oikeudet kyseiseen skeemaan. **PARAS TAPA** tehdä kyseinen skeema-jako olisi luoda erillinen *'lti'-skeema*, mutta ongelmana on se, että käytössä oleva "ltijs-sequelize" -plugin olettaa käyttävänsä 'public' skeemaa.
### **core**
Tähän schemaan kirjataan kaikki backendin tarvitsemat tiedot. Tämä dokumentaatio käsittelee lähinnä core-schemassa olevia tauluja. Ainoastaan Backend-käyttäjällä on rajatut oikeudet tähän tauluun.


## Tietokannan käyttäjäroolit
Tietokannan käyttäjät. Näiden käyttäjien nimet voivat olla mitä vain, kunhan ne kirjataan ympäristömuuttujiin.
### **Admin**
Admin käyttäjä, jolla on admin oikeudet kaikkialle. Tämä ei ole tärkeä backendin kannalta, mutta sellainen kannattaa olla olemassa. Käytännössä tämä rooli voidaan jakaa myös pienempiin rooleihin tarvittaessa. Tiedostoissa esitetään muodossa [admin].
### **Backend-käyttäjä**
Peruskäyttäjä, jona backend kirjautuu sisälle. Tämä käyttäjä omistaa backendin tietokannan. Tiedostoissa esitetään muodossta [peruskäyttäjä].


## Esimerkkikomento Azuren tietokantapalvelimeen yhdistämiseen:
```$ psql "host=[osoite] port=[portti] user=[käyttäjätunnus] dbname=postgres password=[salasana] sslmode=require"```



# psql:n komentorivikomentoja

PostgreSQL:ssä on muutama sisäänrakennettu komento. Ne alkavat kenoviivalla '\\'. Seuraavaksi muutama hyödyllinen komento.
- ```\c [DB] [USER]``` - yhdistää tietokantaan *[DB]* käyttäjällä *[USER]*
- ```\du``` - listaa tietokantajärjestelmään luodut käyttäjät
- ```\l``` - listaa tietokantajärjestelmään luodut tietokannat
- ```\dt``` - listaa tietokantaan luodut taulut
- ```\dt [SCHEMA].*``` - listaa tietokannassa tiettyyn skeemaan *[SCHEMA]* luodut taulut
- ```\q``` - sulje yhteys PostgreSQL:ään



# Uuden tietokantapalvelimen asentaminen

Komentorivillä pitää kirjautua sisään postgres-käyttäjänimellä. Se on myös PostgreSQL:n pääkäyttäjä. Pääkäyttäjä voi olla myös jokin muu riippuen omasta konfiguraatiostasi.

```$ sudo -u postgres psql```

Seuraavaksi aukeaa PostgreSQL:n oma komentorivi. Se näyttää seuraavalta:
```postgres=#```

'postgres' kertoo tässä tapauksessa sen, että MIHIN tietokantaan olet NYT yhdistettynä. Oletuksena PostgreSQL yhdistää olemassaolevaan 'postgres' -tietokantaan. Esimerkiksi 'dvvukk' tietokantaan yhdistettynä komentokehoite näyttäisi seuraavalta:\
```dvvukk=#```\
TAI\
```dvvukk=>```

Eli kun syötät komentoja tästä ohjeesta, niin seuraa tarkasti tuota, jotta olet varmasti yhdistynyt oikeaan tietokantaan!

Aluksi lisätään uusi käyttäjä tietokantajärjestelmään. UKK-tiketit-backend käyttää peruskäyttäjää tietokantaoperaatioiden suorittamisessa. Muuta salasana joksikin muuksi ja paremmanksi!

```postgres=# CREATE USER "[peruskäyttäjä]" WITH PASSWORD '[salasana]';```

Komennon jälkeen viestiksi pitäisi tulla "CREATE ROLE". Kyseinen viesti on geneerinen ja kertoo ainoastaan suoritetun operaation lyhykäisyydessään. Jos jotain menee vikaan, niin silloin tulee erillinen virheviesti. Tässä ohjeessa ei huomioida kyseisiä saatuja viestejä.

Seuraavaksi luodaan uusi tietokanta:

```postgres=# CREATE DATABASE "dvvukk" WITH OWNER "[peruskäyttäjä]";```

Nyt tietokanta on valmis käytettäväksi backendin kanssa. Backend ajaa automaattisesti projektin juuressa olevassa ```migrations/sql``` kansiossa olevat sql skriptit Postgrator -palikalla backendin käynnistämisen ja testien ajon yhteydessä. Tietokannan skeeman päivittäminen tapahtuu näiden skriptien avulla, joten tietokannan pääkäyttäjän ei tarvitse manuaalisesti päivittää tietokantaa.

HUOM! Jos yhdistät tietokantaan peruskäyttäjänä, niin sinun täytyy yhdistää tietokantaan verkon yli! PostgreSQL:ään voi yhdistää paikallisesti AINOASTAAN käyttämällä paikallista käyttäjätunnusta. Eli esimerkiksi näin voit yhdistää paikalliseen PostgreSQL tietokantapalvelimeen verkon yli:\
```$ psql -U "[peruskäyttäjä]" -h "127.0.0.1" -d "dvvukk"```