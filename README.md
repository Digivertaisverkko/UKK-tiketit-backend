# UKK-tiketit-backend

Tämä on Digivertaisverkkohanketta varten toteutetun opetuskäyttöön tarkoitetun tikettijärjestelmän rajapinta. Rajapinta mahdollistaa LTI-integraation, kirjautumisen MySQL-tietokantaan ja käsittelemään käyttöliittymän lähettämät pyynnöt.

## Sisällysluettelo
- [Backendin ajaminen](#backendin-ajaminen)
- [Rajapinnan määritelmä](#rest-rajapinnan-määritelmä)
    - [Sisäänkirjautimisrajapinta](#sisäänkirjautumisen-rajapinta)
    - [Kurssirajapinta](#kurssien-rajapinta)
    - [Tikettirajapinta](#tikettien-rajapinta)
- [Lähetetyt erikoisarvot](#erikoisarvot)
- [Virhetilat](#virhetilat)


# Backendin ajaminen

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
PGSSLMODE=[vaaditaan tuotantokäytössä, Azuressa arvo 'require']
```

- Aja komento ```npm install```

- Aja komento ```node app.js```


# REST-rajapinnan määritelmä

Alla on listattu kaikki backendin tukemat REST-rajapinnan osoitteet, sekä niihin lähetettävä HTTP-komento, lähetettävät parametrit ja palautetun vastauksen muoto. Osoitteet on pyritty lajittelemaan loogisesti ja samanlaiset komennot vieretysten.

*Rajapinta ei lupaa mitään lähetettyjen taulukoiden järjestyksestä.*


## Sisäänkirjautumisen rajapinta 

### /api/login/ 
#### POST 
##### Lähetä:
```  
{  
  login-type: $string
  code-challenge: $string
} 
```
##### Vastaus:  
```
{ 
  login-url: $URL (sisältää generoidun login-id)
}
```

### /api/authtoken/ 
#### GET
##### Lähetä:  
```
{
  login-type: $string
  code-verifier: $string
  login-code $string
}
```
##### Vastaus:
```
{
  success: $bool
  error: $error-olio
  session-id: $uuid
}
```


### /api/luotili/ 
#### POST 
##### Lähetä: 
```
{
  ktunnus: $string
  salasana: $string
  sposti: $string
}
```
##### Vastaus: 
```
{
  success: $bool
  error: $error-olio
} 
```


### /api/omalogin/ 
#### POST 
##### Lähetä: 
```
{
  ktunnus: $string
  salasana: $string
  login-id: $string
} 
```
##### Vastaus: 
```
{
  success: $bool
  login-code: $string
}
```


### /api/kirjaudu-ulos/
#### POST
##### Lähetä:
```
{
  session-id: $UUID
}
```
##### Vastaus: 
```
{
  success: $bool
}
```
<br><br><br>

## Kurssien rajapinta 
Kaikki tämän rajapinnan kutsut vaativat sisäänkirjautumisen, ja jos lähetetty session-id ei ole oikein, niin silloin näistä tulee vastauksena 
```
{
  success: false
  error: ”no authorization”
  login-url: $URL
}
```


### /api/kurssit/
#### GET
##### Lähetä:
```
-header-
{
  session-id: $UUID
}
```
##### Vasstaus: 
```
[{
  nimi: $string
  id: $int
}]
```


### /api/kurssi/omatkurssit/
#### GET
##### Lähetä:
```
- header -
{
  session-id: $UUID
}
```
##### Vastaus:
```
[{
  kurssi: $int (viittaa kurssin id:hen)
  asema: $string
}]
```
(ks. [Kurssilainen-olio](kurssilainen-olion) aseman arvot)



### /api/kurssi/:kurssi-id/
#### GET
##### Lähetä:
```
{
  session-id: $UUID
}
``` 
##### Vastaus: 
```
{
  nimi: $string
}
```

### /api/kurssi/:kurssi-id/kaikki/ ja
### /api/kurssi/:kurssi-id/omat/
Näillä rajapinnoilla saadaan kurssille osoitetut tiketit. 
* /omat lähettää kaikki kirjautuneen käyttäjän luomat tiketit. 
* /kaikki lähettää kirjautuneen käyttäjän luomat tiketit, jos hän on kurssilla opiskelijana. Jos on kirjautunut opettajana, niin palautetaan kaikki kurssin tiketit.
#### GET
##### Lähetä:
```
{
  session-id: $UUID
}
```
##### Vastaus:
```
[{
  id: $int
  otsikko: $string
  aikaleima: $string
  aloittaja: $kurssilainen-olio
}]
```

*Rajapinta ei lupaa mitään lähetettyjen taulukoiden järjestyksestä.*
[Kurssilainen-olio](#kurssilainen-olio)



### /api/kurssi/:kurssi-id/ukk/
Tällä rajapinnalla haetaan kurssin kaikki tiketit, jotka opettaja on merkinnyt UKK-tiketeiksi. Tällä on myös POST-muoto, jolla voidaan lisätä UKK-tikettejä kantaan.
#### GET
##### Lähetä:
```
{
   session-id: $UUID
} 
```
##### Vastaus:
```
[{
  id: $int
  otsikko: $string
  aikaleima: $string
  tyyppi: $string
}]  
```
*Rajapinta ei lupaa mitään lähetettyjen taulukoiden järjestyksestä.*


#### POST
##### Lähetä:
```
-header- 
{
  session-id: $UUID
}
-body-
{
  otsikko: $string
  viesti: $string
  kentat: 
  [{
    id: $int
    arvo: $string
  }]
  vastaus: $string
} 
```
##### Vastaus:
```
{
  success: $bool
  error: $error-olio
} 
```

 
### /api/luokurssi/
#### POST
##### Lähetä:
```
-header-
{
   session-id: $UUID
}
-body-
{
  nimi: $string
  ohjeteksti: $string
}
```
Tulevaisuudessa lisäksi pitää lähettää:
```
{
  harjoitukset: [$string]
  lisakentat:
  [{
    nimi: $string
    esitaytetty: $bool
    pakollinen: $bool
  }]
}
```
##### Vastaus:
```
{
  success: $bool
  error: $error-olio
}
```



### /api/kurssi/:kurssi-id/liity/
Tällä saadaan liitettyä käyttäjä kurssille. Uusi käyttäjä oletuksena laitetaan opiskelijaksi. *Tämä rajapinta tullaan poistamaan tulevaisuudessa.*
#### POST
##### Lähetä
```
- header -
{
  session-id: $UUID
}
```
##### Vastaus:
```
- body - 
{
  success: true
}
```


### /api/kurssi/:kurssi-id/kutsu/
Tällä rajapinnalla saadaan opiskelijoita ja opettajia liitettyä kurssille. **Vaatii opettajan oikeudet kurssille**, jotta opiskelijoita voi kutsua.
Jos kutsuttu sähköpostiosoite on jo tietokannassa olevalla käyttäjällä, niin kyseinen käyttäjä lisätään kurssille. Jos käyttäjää ei ole vielä kannassa, käyttäjälle lähetetään sähköpostia, ja ko. käyttäjä lisätään kurssille kun tämä luo tilin. (Toteutus kesken.)
#### POST
##### Lähetä
```
- header -
{
  session-id: $UUID
}
```
```
- body -
{
  sposti: $string
  opettaja: $bool
}
```
##### Vastaus:
```
- body - 
{
  success: true
}
```


### /api/kurssi/:kurssi-id/oikeudet
Tällä rajapinnalla voi hakea omat oikeudet kurssille.
#### GET
##### Lähetä:
```
-header-
{
  session-id: $UUID
}
```
#### Vastaus:
Vastauksena tulee [kurssilainen-olio](#kurssilainen-olio)

<br><br><br>

## Tikettien rajapinta

Tiketit muodostuvat tietokannassa useammasta osasesta. Iso osa rajapinnoista yrittää yhdistää nämä osat yhteen, mutta joissain tapauksissa on hyödyllistä tiedostaa kaikki osat, ja miten ne liittyvät toisiinsa.
- Tikettipohja
    - Kuvaus siitä, millainen tiketti kurssilla on.
- Kenttäpohja
    - Tiketissä on otsikon ja viestin lisäksi muita täytettäviä kenttiä, joita käyttäjiä voidaan vaatia täyttämään. Kenttäpohja määrittää mitä kenttiä tiketipohjassa on.
- Tiketti
    - Viittaus lähettyyn tikettiin itseensä. Sisältää viittauksen tikettipohjaan, ja kaikki tiketin sisältö viittaa itse tähän.
- Tiketin kentät
    - Lähettyjen tiketin lisäkenttien arvot.
- [Tiketin tila](#tiketin-tila)
    - Tiketillä voi olla useampia eri tiloja sen perusteella, kuka on sen lukenut ja kuka siihen on kommentoinut.
- Kommentit
    - Tiketeissä on kommentointimahdollisuus, ja tästä löytyy kaikki tiketin kommentit. Myös tiketin alkuperäinen viesti menee kommentiksi.

### /api/kurssi/:kurssi-id/uusitiketti/
Tällä rajapinnalla luodaan uusi tiketti lähettämällä tiketin tiedot palvelimelle. 

#### POST
##### Lähetä:
```
-header-
{
  session-id: $UUID
}
```
```
-body- 
{
  otsikko: $string
  viesti: $string
  kentat: 
  [{
    id: $int
    arvo: $string
  }]
}
```
##### Vastaus:
```
-body-
{
  success: true
}
```

**TODO:** Miten liitteet? 

#### GET 
Tämä rajapinnan **GET** vastaa täysin samaa toiminnallisuutta kuin **GET** osoitteeseen */api/kurssi/:kurssi-id/uusitiketti/kentat/*. 



### /api/kurssi/:kurssi-id/uusitiketti/kentat/
Tällä rajapinnalla saa selville kaikki tiketin lisätiedot, joita pitää käyttäjältä kysyä, ja jotka pitää lähettää takaisin palvelimelle kun kysymystä luodaan. (Tämä ei sisällä sellaisia kenttiä, kuin otsikko, liitteet tai tiketin teksti. 

#### GET
##### Lähetä:
```
- header -
{
   session-id: $UUID
}
```
##### Vastaus:
```
- body - 
[{
  id: $int
  otsikko: $string
  pakollinen: $bool
  esitäytettävä: $string
}]
```
*Rajapinta ei lupaa mitään lähetettyjen taulukoiden järjestyksestä.*



### /api/tiketti/:tiketti-id/
#### GET 
##### Lähetä:  
```
{
   session-id: $UUID 
}
```
##### Vastaus:
```
{
  otsikko: $string
  aikaleima: $string
  aloittaja: $kurssilainen-olio
  tila: $string
  kurssi: $int
}
```
[Kurssilainen-olio](#kurssilainen-olio)<br>
[Tila](#tiketin-tila)<br>
**TODO:** Liiteet? 



### /api/tiketti/:tiketti-id/kentat/
#### GET
##### Lähetä:
```
{
   session-id: $UUID 
} 
```
##### Vastaus:
```
[{
  nimi: $string 
  arvo: $string 
}] 
```
*Rajapinta ei lupaa mitään lähetettyjen taulukoiden järjestyksestä.*



### /api/tiketti/:tiketti-id/uusikommentti
#### POST
##### Lähetä:
```
- header -
{
  session-id: $UUDI
}
- body -
{
  viesti: $string
  tila: $int (valinnainen)
}
```
##### Vastaus:
```
- body -
{
  success: true
}
```
[*tila*-muuttuja](#tiketin-tila) on tarpeellinen vain opettajan laittamissa viesteissä, ja muissa se ei edes tee mitään. Jos tilaa ei määritellä, niin oletetaan sen olevan **4** (kommentti). 


### /api/tiketti/:tiketti-id/kommentit/
#### GET
##### Lähetä:
```
{ 
  session-id: $UUID 
}
```
##### Vastaus:
```
[{
  lahettaja: $kurssilainen-olio
  aikaleima: $string 
  tila: $int 
  viesti: $string 
}] 
```
Edellä [*tila*](#tiketin-tila) vastaa sitä tilaa, mihin viestin *tila* muuttui, kun viesti kirjoitettiin.<br>
[Kurssilainen-olio](#kurssilainen-olio)


<br><br><br>

# Erikoisarvot
## Kurssilainen-olio
Jotkut rajapinnat lähettävät olion, kun vastaus sisältää käyttäjän tietoja. Kaikki palauttavat samanlaisen.
### Muoto
```
{
  id: $int (viite profiili-tauluun)
  nimi: $string
  sposti: $string
  asema: $string
}
```

*asema*-kentän arvoina voi olla:
- opettaja
- opiskelija
- admin

<br><br><br>

## Tiketin tila
Kaikilla tiketeillä on *tila*, joka esitetään numeerisena arvona välillä 1-6. Kaikki muut ovat virhetiloja, mutta rajapinta palauttaa *tilaksi* 0, jos sen hakemisessa esiintyy jotain häikkää.

*Tilan* mahdolliset arvot: 
- 0 virhetila 
- 1 lähetty 
- 2 luettu 
- 3 lisätietoa pyydetty 
- 4 kommentoitu 
- 5 ratkaistu 
- 6 arkistoitu 


# Virhetilat
## Error-olio
### Muoto
Virhetilojen sattuessa tietokanta lähettää viestin, jossa on success=false ja error=$error-olio. Error olio on seuraavanlainen json-objecti:
```
{
  tunnus: $int
  virheilmoitus: $string
  (originaali: $string)
}
```

*tunnus* on numeraalinen kuvaus tavatusta ongelmasta, ja *virheilmoitus* on ihmisymmärrettävä ja helpommin luettava teksti samasta asiasta. *Virheilmoitus* on aina sama jokaiselle *tunnukselle*.

*originaali* sisällytettään viestiin vain, kun tunnuksena on **3004**. Se sisältää alkuperäisen virheilmoituksen, jonka joku käytetty kirjasto lähetti, ja jota ei saatu kiinni ennen pyyntöön vastausta. Jossain harvoissa tapauksissa originaalin sisältö voi olla myös **3004**, jos rajapinta on itse halunnut lähettää virheen tunnuksella **3004**.

### Tunnukset

Rakenne samantapainen kuin HTTP:ssä, eli koodin on muotoa ABBB.
A - ylätason tunniste
BBB - tarkentava koodi

#### A-luokat:
##### 1 - Kirjautumisongelmat
``` 
1000 - Et ole kirjautunut
1001 - Kirjautumispalveluun ei saatu yhteyttä
1002 - Väärä käyttäjätunnus tai salasana
1003 - Ei oikeuksia
1010 - Luotava tili on jo olemassa
```


##### 2 - SQL-ongelmat
```
2000 - Ei löytynyt.
```


##### 3 - Liikenneongelmat
```
3000 - Väärät parametrit
3004 - Joku meni vikaan
```
