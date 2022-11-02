# UKK-tiketit-backend

Tämä on Digivertaisverkkohanketta varten toteutetun opetuskäyttöön tarkoitetun tikettijärjestelmän rajapinta. Rajapinta mahdollistaa LTI-integraation, kirjautumisen MySQL-tietokantaan ja käsittelemään käyttöliittymän lähettämät pyynnöt.


# REST-rajapinnan määritelmä

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
 

## Kurssien rajapinta 
Kaikki tämän rajapinnan kutsut vaativat sisäänkirjautumisen, ja jos lähetetty session-id ei ole oikein, niin silloin näistä tulee vastauksena 
```
{
  success: false
  error: ”no authorization”
  login-url: $URL
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


### /api/kurssit/
#### GET
##### Lähetä:
```
-header-
{
  session-id: $UUId
}
```

##### Vasstaus: 
```
[{
  nimi: $string
}]
```


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


### /api/kurssi/:kurssi-id/omat/
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
  id: $string
  otsikko: $string
  aikaleima: $string
  aloittaja: $int
}]  
```
*Rajapinta ei lupaa mitään lähetettyjen taulukoiden järjestyksestä.*

Tila voidaan toteuttaa myöhemmin.

*Tila* on numeerinen tunnus viestin tilalle: 
- 0 virhetila 
- 1 lähetty 
- 2 luettu 
- 3 lisätietoa pyydetty 
- 4 kommentoitu 
- 5 ratkaistu 
- 6 arkistoitu 


### /api/kurssi/:kurssi-id/ukk/
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
  id: $string
  otsikko: $string
  pvm: $string
  tyyppi: $string
  tehtava: $string
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
Tulevaisuudessa lisäksi voi pitää lähettää:
```
{
  harjoitukset: [$string]
  lisäkentät:
  [{
    nimi: $string
    esitäytetty: $bool
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


### /api/kurssi/:kurssi-id/oikeudet/
#### GET
##### Lähetä:
```
-header-
{
  session-id: $UUID
}
```
#### Vastaus:
```
-body-
{
  oikeudet: $string
}
```
oikeudet-kentän arvoina voi olla:
- opettaja
- opiskelija
- admin


### /api/kurssi/:kurssi-id/uusitiketti/
Tällä rajapinnalla luodaan uusi tiketti lähettämällä tiketin tiedot palvelimelle. 

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
    id: $string
    teksti: $strings
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
{
   session-id: $UUID
}
```

##### Vastaus:
```
[{
  id: $string
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
  aloittaja: $int (viite tili-tauluun)
  tila: $string
}
```
**TODO:** Liiteet? 


### /api/tiketti/:tiketti-id/kentat/
#### GET
##### Lähetä:
```
{
   session-id: $UUID 
} 
```

### /api/tiketti/:tiketti-id/uusikommentti

##### Vastaus:
```
[{
  nimi: $string 
  arvo: $string 
}] 
```
*Rajapinta ei lupaa mitään lähetettyjen taulukoiden järjestyksestä.*


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
  kirjoittaja-id: $string 
  aikaleima: $string 
  tila: $int 
  teksti: $string 
}] 
```
Edellä *tila* vastaa sitä tilaa, mihin viestin *tila* muuttui, kun viesti kirjoitettiin.

# Virhetilat
## Error-olio
### Muoto
virhetilojen sattuessa tietokanta lähettää viestin, jossa on success=false ja error=$error-olio. Error olio on seuraavanlainen json-objecti:
```
{
  tunnus: $int
  virheilmoitus: $string
}
```

tunnus on numeraalinen kuvaus tavatusta ongelmasta, ja virheilmoitus on ihmisymmärrettävä ja helpommin luettava teksti samasta asiasta. Virheilmoitus on aina sama per tunnus.

### Tunnukset

Rakenne samanlainen kuin HTTP:ssä, eli koodin on muotoa ABB.
A - ylätason tunniste
BB - tarkentava koodi

#### A-luokat:
##### 1 - Kirjautumisongelmat
``` 
100 - Et ole kirjautunut
101 - Kirjautumispalveluun ei saatu yhteyttä
102 - Väärä käyttäjätunnus tai salasana
```


##### 2 - SQL-ongelmat
```
200 - Ei löytynyt.
```


##### 3 - Liikenneongelmat
```
300 - Väärät parametrit
304 - Joku meni vikaan
```
