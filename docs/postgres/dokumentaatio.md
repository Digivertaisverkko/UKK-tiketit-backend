# Postgres asetukset

## Mikä tämä kansio on?
Tästä kansiosta löytyy dokumentaatio backendin käyttämästä tietokannasta ja sen asetuksista. Tiedostosta löytyy myös listattuna komennot, jotka ajamalla tietokannan saa backendin vaatimaan toimintakuntoon.\
Kaikissa tässä kansiossa olevissa tiedostoissa ei ole listattu tietokannassa käytettyjä käyttäjätunnuksia ja salasanoja, vaan ne on korvattu hakasulkeilla rajattuja käyttäjärooleja (esim. [peruskäyttäjä], [admin] tai [salasana])
## Kansion tiedostot
### [dokumentaatio.md](dokumentaatio.md)
Tämä tiedosto. Sisältää yleiskielisen selityksen tietokannan asetuksista ja vaatimuksista.
### [dvvukk_init_db.txt](dvvukk_init_db.txt)
Sisältää komennot tietokannan, sen skeemojen ja käyttäjien alustamiseksi.
### [dvvukk_create_tables.txt](dvvukk_create_tables.txt)
Sisältää komennot tietokannan taulujen luomikseksi.
### [dvvukk_drop_tables.txt](dvvukk_drop_tables.txt)
Sisältää komennot tietokannan taulujen tuhoamiseksi. Tarkoitettu testauksen aikana luodun datan poistamiseen. Ei ole aina ajantasalla.


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
Peruskäyttäjä, jona backend kirjautuu sisälle. Tällä käyttäjällä on INSERT, DELETE ja luku-oikeudet core-schemaan. Tiedostoissa esitetään muodossta [peruskäyttäjä].
### **LTI-käyttäjä**
Käyttäjä, jota ltijs-kirjasto käyttää. Tällä käyttäjällä on täydet oikeudet public-schemaan. Tiedostoissa esitetään muodossa [LTI-käyttäjä].


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

Aluksi lisätään uudet käyttäjät tietokantajärjestelmään. UKK-tiketit-backend käyttää peruskäyttäjää tietokantaoperaatioiden suorittamisessa ja LTI-käyttäjää LTI-integraatioon liittyviin tietokantaoperaatioiden suorittamiseen. Muuta salasana joksikin muuksi ja paremmanksi!

```postgres=# CREATE USER "[peruskäyttäjä]" WITH PASSWORD '[salasana]';```\
```postgres=# CREATE USER "[lti-käyttäjä]" WITH PASSWORD '[salasana]';```

Jokaisen komennon jälkeen viestiksi pitäisi tulla "CREATE ROLE". Kyseinen viesti on geneerinen ja kertoo ainoastaan suoritetun operaation lyhykäisyydessään. Jos jotain menee vikaan, niin silloin tulee erillinen virheviesti. Tässä ohjeessa ei huomioida kyseisiä saatuja viestejä.

Seuraavaksi luodaan uusi tietokanta:

```postgres=# CREATE DATABASE "dvvukk";```

Ja yhdistetään luotuun tietokantaan käyttäjällä postgres:

```postgres=# \c dvvukk postgres```

Nyt komentokehoitteen pitäisi näyttää seuraavalta:

```dvvukk=#```

Seuraavaksi luodaan ja konfiguroidaan vaaditut skeemat.

Aluksi poistetaan ja luodaan 'public' skeema. Miksi? Tähän on KAKSI syytä:
1) 'public' skeema on oletuksena avoin KAIKILLE tietokantajärjestelmän käyttäjille. Kyseinen skeema on muutenkin jäänne menneisyydestä ja sen vuoksi siihen on muilla käyttäjillä liikaa oikeuksia. Sen vuoksi se on syytä vähintäänkin konfiguroida uusiksi.
2) Helpoin tapa "nollata" skeeman oikeudet perustasolle on poistaa se ja luoda uusiksi.\
```dvvukk=# DROP SCHEMA public;```\
```dvvukk=# CREATE SCHEMA public;```

Luodaan lisäksi core skeema:\
```dvvukk=# CREATE SCHEMA core;```

Asetetaan käyttäjille oikea search_path, jotta kyseiset käyttäjät käyttävät oikeaa skeemaa automaattisesti:\
```dvvukk=# ALTER ROLE [peruskäyttäjä] SET search_path TO core;```\
```dvvukk=# ALTER ROLE [LTI-käyttäjä] SET search_path TO public;```

Seuraavaksi asetetaan käyttäjille oikeat oikeudet. Ensin LTI-käyttäjä käyttäjälle KAIKKI oikeudet 'public' skeemaan. Syynä tälle on se, että ltijs-sequelize vaatii kattavat oikeudet.\
```dvvukk=# GRANT ALL PRIVILEGES ON SCHEMA public TO [LTI-käyttäjä];```\
```dvvukk=# ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO [LTI-käyttäjä];```

Ja vielä rajatut oikeudet 'core' skeemaan käyttäjälle [peruskäyttäjä]:\
```dvvukk=# GRANT USAGE ON SCHEMA core TO [peruskäyttäjä];```\
```dvvukk=# ALTER DEFAULT PRIVILEGES IN SCHEMA core GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO [Peruskäyttäjä];```

Seuraavaksi luodaan taulut 'core' skeemaan käyttäen Teamsissa olevaa 'dvvukk_create_tables.txt' skriptiä. Kyseinen skripti ajetaan superuserina (esimerkiksi postgres -käyttäjä). Varmista ennen skriptin ajoa, että olet yhdistänyt oikeaan tietokantaan!

Tämän jälkeen voit ajaa dvvukk_sample_data.txt skriptin. Jälleen skriptin sisällön voi ajaa joko superuserina, mutta myös peruskäyttäjänä. Ajamalla skriptin peruskäyttäjänä varmistat samalla sen, että kyseisellä käyttäjällä on riittävät oikeudet sekä että konfiguraatiosi on toimiva.

HUOM! Jos yhdistät tietokantaan peruskäyttäjänä, niin sinun täytyy yhdistää tietokantaan verkon yli! PostgreSQL:ään voi yhdistää paikallisesti AINOASTAAN käyttämällä paikallista käyttäjätunnusta. Eli esimerkiksi näin voit yhdistää paikalliseen PostgreSQL tietokantapalvelimeen verkon yli:\
```$ psql -U "[peruskäyttäjä]" -h "127.0.0.1" -d "dvvukk"```

Skriptissä "dvvukk_drop_tables.txt" -tiedostossa on komennot, joilla voit poistaa taulut. Se ei välttämättä ole ajan tasalla ja sen vuoksi kehitysvaiheessa onkin ihan kätevää poistaa tietokanta ja ajaa skriptit tämän ohjeen yläosassa annetussa järjestyksessä.