# UKK-tiketit-backend

Tämä on Digivertaisverkkohanketta varten toteutetun opetuskäyttöön tarkoitetun tikettijärjestelmän rajapinta. Rajapinta mahdollistaa LTI-integraation, kirjautumisen MySQL-tietokantaan ja käsittelemään käyttöliittymän lähettämät pyynnöt.


# REST-rajapinnan määriltemä

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
  code-verifier: $string
  login-code $string
}
```

##### Vastaus:  
```
{
  success: $bool
  error: $string
  session-id: $uuid
}
```


### /api/luotili/ 
#### POST 
##### Lähetä: 
```
{
  tili: $string
  salasana: $string
}
```

##### Vastaus: 
```
{
  success: $bool
  error: $string
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
Kaikki tämän rajapinnan kutsut vaativat sisäänkirjautumisen, ja jos lähetetty auth-token ei ole oikein, niin silloin näistä tulee vastauksena 
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


### /api/kurssit
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


### /api/kurssi/:kurssi-id
#### GET
##### Lähetä:
```
{
  auth-token: $UUID
}
``` 

##### Vastaus: 
```
{
  kurssi-nimi: $string
}
```


### /api/kurssi/:kurssi-id/omat
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
  tila: $int
  tehtävä: $string
}]  
```
*Rajapinta ei lupaa mitään lähetettyjen taulukoiden järjestyksestä.*

Tila on numeerinen tunnus viestin tilalle: 
  0 - virhetila 
  1 – lähetty 
  2 – luettu 
  3 – lisätietoa pyydetty 
  4 – kommentoitu 
  5 – ratkaistu 
  6 - arkistoitu 


### /api/kurssi/:kurssi-id/ukk
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
 

#### POST //TODO
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
  error: $string
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
  kurssi-nimi: $string
  ohje-teksti: $string
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
  error: $string
}
```


### /api/kurssi/:kurssi-id/uusitiketti
Tällä rajapinnalla luodaan uusi tiketti lähettämällä tiketin tiedot palvelimelle. 

#### POST
##### Lähetä:
```
-header-
{
  session-id: $UUID
{
-body- 
}
  otsikko: $string 
  kentät: 
  [{
    id: $string
    teksti: $strings
  }]
}
```
*Rajapinta ei lupaa mitään lähetettyjen taulukoiden järjestyksestä.* 
TODO: Miten liitteet? 


#### GET 
Tämä rajapinnan **GET** vastaa täysin samaa toiminnallisuutta kuin **GET** osoitteeseen */api/luoviesti/kentät/:kurssi-id *. 


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
  esitäytetty-vastaus: $string
}]
```
*Rajapinta ei lupaa mitään lähetettyjen taulukoiden järjestyksestä.*


### /api/tiketti/:tiketti-id
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
  viesti: $string
  aloittaja-id: $int (viite tili-tauluun)
  tila: $string
}
```
TODO: Liiteet? 


### /api/tiketti/:tiketti-id/kentat
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


### /api/tiketti/:tiketti-id/kommentit
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
  pvm: $string 
  tila: $int 
  teksti: $string 
}] 
```
Edellä *tila* vastaa sitä tilaa, mihin viestin *tila* muuttui, kun viesti kirjoitettiin. 