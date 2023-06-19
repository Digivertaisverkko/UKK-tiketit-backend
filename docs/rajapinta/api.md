
# REST-rajapinnan määritelmä

Alla on listattu kaikki backendin tukemat REST-rajapinnan osoitteet, sekä niihin lähetettävä HTTP-komento, lähetettävät parametrit ja palautetun vastauksen muoto. Osoitteet on pyritty lajittelemaan loogisesti ja samanlaiset komennot vieretysten.

Virhetilojen sattuessa rajapinta palauttaa [virhetaulukon](/docs/rajapinta/virhe.md) mukaisen virheen.

*Rajapinta ei lupaa mitään lähetettyjen taulukoiden järjestyksestä.*

## Sisällysluettelo
- [Sisäänkirjautimisrajapinta](#sisäänkirjautumisen-rajapinta)
- [Kurssirajapinta](#kurssien-rajapinta)
- [Tikettirajapinta](#tikettien-rajapinta)
- [Erikoisarvot](#erikoisarvot)


## LTI-rajapinta
DVVUKK-backend on LTI-työkalu (tool), tai vanhaa terminologiaa käyttäen tarjoaja (provider). Työkalu tukee sekä 1.1, että 1.3 LTI-standardia. Kumpaakin standardia varten on omat rajapintansa, joihin pitää tarvittaessa ottaa yhteyttä. Näihin rajapintoihin ei ole tarkoitus ottaa yhteyttä muussa tapauksessa kuin LTI:n kautta, ja olettavan kommunikoinnin olevan LTI-standardin mukaista.

LTI:n kautta kulkevasta datasta tallennetaan palvelimelle seuraavat tiedot:
- Käyttäjän tunnus
- Käyttäjän koko nimi
- Context id (kurssin tunnistamiseksi)
- Käyttäjän roolit kurssilla

Lisäksi LTI-versiosta riippuen toinen seuraavista:
- Client id (LTI 1.3)
- LTI-kuluttujan (consumer) nettiosoite (LTI 1.1)

### /lti/register
LTI 1.3:n rekisteröimisrajapinta. Ohjaa automaattisesti joko kurssisivulle, tai gdpr-luovutussivulle, riippuen siitä, onko käyttäjä jo hyväksynyt tietojen luovutuksen.

### /lti/1p1/start
LTI 1.1:n rajapinta, johon ohjataan käyttäjän kutsut. Kirjaa LTI:n käyttäjän sisään backendiin ja ohjaa frontendissä oikealle kurssisivulle tai gdpr-tietojen luovutussivulle, riippuen siitä, onko käyttäjä jo hyväksynyt tietojen luovutuksen.


Lisäksi, jos lti:n kautta kirjautuu käyttäjä, jolla ei ole jo tiliä valmiiksi, tiliä ei voida luoda ennen kuin käyttäjä antaa luvan tietojen luovutukseen. Tämä tietojen luovutus tapahtuu siten, että yllä olevat rajapinnat ohjaavat käyttäjän sivulle, jossa on url-parametrinä annettu tunnus, joka pitää palauttaa seuraavalle rajapinnalle:

### /lti/gdpr-lupa-ok
#### POST
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Julkinen luku
##### Lähetä:
```
{
  lupa-id: $string
}
```
##### Vastaus:
```
{
  success: true
  kurssi: $int (kurssin id, jolle käyttäjä yrittää kirjautua (uudelleen ohjausta varten))
}
```

### /lti/gdpr-lupa-kielto
Poistaa välitilaan jääneen luvan. Luvat poistetaan myös ajastetusti, jos käyttäjä ei ekspiliittisesti lupaa kiellä.
Jos tili on olemassa, kun tällä vastataan, niin tili tuhotaan tietokannasta.
#### POST
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Julkinen luku
##### Lähetä:
```
{
  lupa-id: $string
}
```
##### Vastaus:
```
{
  success: true
}
```



## Sisäänkirjautumisen rajapinta 

### /api/login/
#### POST
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Julkinen luku
##### Lähetä:
```
- header -
{  
  login-type: $string
  code-challenge: $string
  kurssi: $string
} 
```
##### Vastaus:  
```
- body -
{ 
  login-id: $string
  login-url: $URL (sisältää generoidun login-id)
}
```

### /api/authtoken/ 
#### GET
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Julkinen luku
##### Lähetä:  
```
{
  login-type: $string
  code-verifier: $string
  login-code $string
}
```
##### Vastaus:
Lähettää myös http-only sessioevästeen osana vastausta.
```
{
  success: $bool
  error: $error-olio
}
```


### /api/minun/tili/ 
#### POST
**Tätä ei ole toteutettu tällä hetkellä.**
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
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Julkinen luku
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

### /api/luotili/
#### POST
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Julkinen.
Tällä rajapinnalla voi luoda tilin, jos on saanut kutsun. Liittää käyttäjän myös automaattisesti kurssille, jolta on saanut kutsun.
##### Lähetä:
´´´
{
  "ktunnus": $string
	"salasana": $string
	"sposti": $string
	"kutsu": $UUID (kutsun tunnus)
}
´´´
##### Vastaus:
```
{
  success: true
}
```

### /api/minun/
#### GET
[**Vaaditut oikeudet**](#oikeuksienhallinta) Profiilin luku
##### Vastaus: 
```
{
  nimi: $string
  sposti: $string
}
```

#### DELETE
[**Vaaditut oikeudet**](#oikeuksienhallinta) Profiilin kirjoitus
Tällä rajapinnalla tuhotaan tili, ja kaikki tiliin yhdistetty tieto.
Lähetettävissä tiedoissa pitää olla data samassa muodossa kuin tietokannassa, jotta tili poistuisi.
```
- body -
{
  id: $int (tuhottavan profiilin id)
  sposti: $string (tuhottavan profiilin sähköpostiosoite)
}
```
##### Vastaus:
```
{
  success: true
}
```

### /api/minun/asetukset/
#### GET
[**Vaaditut oikeudet**](#oikeuksienhallinta) Profiilin luku
##### Vastaus:
```
{
  sposti-ilmoitus: $bool
  sposti-kooste: $bool
  sposti-palaute: $bool
}
```

#### POST
[**Vaaditut oikeudet**](#oikeuksienhallinta) Profiilin kirjoitus
##### Lähetä:
```
{
  sposti-ilmoitus: $bool
  sposti-kooste: $bool
  sposti-palaute: $bool
}
```
##### Vastaus:
```
{
  success: true
}
```

### /api/minun/gdpr/
#### GET
[**Vaaditut oikeudet**](#oikeuksienhallinta) Profiilin kirjoitus
##### Vastaus:
```
{
  profiili: {
    nimi
    sposti
  }
  tiketit: [{
    id
    kurssi
    otsikko
    aikaleima
    aloittaja
    ukk
    omat kommentit: [{
      tiketti
      lahettaja
      viesti
      aikaleima
      liitteet: [{
        kommentti
        tiedosto
        nimi
      }]
    }]
  }]
  kommentit: [{
    tiketti
    lahettajaviesti
  }]
  kurssit: [{
    nimi
  }]
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


### /api/kirjauduulos/
#### POST
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Kurssiluku

##### Vastaus: 
```
{
  success: true
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
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Ei tarkisteta
##### Vastaus: 
```
[{
  nimi: $string
  id: $int
}]
```


### /api/minun/kurssit/
#### GET
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Profiililuku
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
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Julkinen luku
##### Vastaus: 
```
{
  nimi: $string
}
```

### /api/kurssi/:kurssi-id/tiketti/kaikki/ ja
### /api/kurssi/:kurssi-id/tiketti/omat/
Näillä rajapinnoilla saadaan kurssille osoitetut tiketit. 
* /omat lähettää kaikki kirjautuneen käyttäjän luomat tiketit. 
* /kaikki lähettää kirjautuneen käyttäjän luomat tiketit, jos hän on kurssilla opiskelijana. Jos on kirjautunut opettajana, niin palautetaan kaikki kurssin tiketit.
#### GET
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Kurssiluku
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



### /api/kurssi/:kurssi-id/tiketti/arkisto/
#### GET
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Kurssiluku
Palauttaa kaikki arkistoidut tiketit kurssilla, joihin käyttäjällä on oikeus päästä. Opettaja näkee kaikki kurssin tiketit, ja opiskelija näkee vain itse lähettämänsä.
##### Vastaus:
```
[{
  id: $int
  otsikko: $string
  aikaleima: $string
  aloittaja: {
    id: $int
    nimi: $string
    sposti: $string
    asema: $string
  }
  tila: $int
}]
```


### /api/kurssi/:kurssi-id/ukk/kaikki/
Tällä rajapinnalla haetaan kurssin kaikki tiketit, jotka opettaja on merkinnyt UKK-tiketeiksi. Tällä on myös POST-muoto, jolla voidaan lisätä UKK-tikettejä kantaan.
#### GET
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Julkinen luku
##### Vastaus:
```
[{
  id: $int
  otsikko: $string
  aikaleima: $string
  tila: $int
  kentat: [
    {
      arvo: $string
      otsikko: $string
      tyyppi: $string
      ohje: $string
    }
  ]
}]  
```
*Rajapinta ei lupaa mitään lähetettyjen taulukoiden järjestyksestä.*


#### POST
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Kurssikirjoitus
##### Lähetä:
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
  vastaus: $string
} 
```
##### Vastaus:
```
{
  success: true
  uusi: {
    tiketti: $int (luodun tiketin id)
    kommentti: $int (luodun kommentin id)
  }
} 
```

### /api/kurssi/:kurssi-id/ukk/vienti/
Tällä rajapinnalla voi hakea erillisen json-tiedoston, jossa on listattu kurssin kaikki UKK-tiketit muodossa, jossa ne voidaan helposti siirtää toiselle kurssille. Samaa rajapintaa käyttämällä voi myös antaa samaisen tiedoston toiselle kurssille, jolloin annetut UKK:t kopiodaan kurssille.
#### GET
##### Vastaus:
```
json-tiedosto, joka on muotoiltu sisältämään kaikki tarvittava UKK-data.
```

#### POST
##### Lähetä:
Tähän on tarkoitus lähettää toisesta kurssista GET-kutsulla saatu json-tiedoston sisältö.
```
[
  {
    otsikko:
    aikaleima:
    tila:
    kommentit: [{
      tiketti
      lahettaja
      viesti
      aikaleima
      tila
    }]
    kentat: [{
      arvo:
      otsikko:
      tyyppi:
      ohje:
    }]
  }
]
```
##### Vastaus:
```
{
  success: true
}
```


### /api/kurssi/:kurssi-id/tiketti/arkisto
#### POST
Tällä rajapinnalla voi arkistoida tikettejä, jos se on mahdollista. Tiketin voi arkistoida, jos sen tila on ollut joskus ratkaistu tai kommentoitu. Tämän voi tarkistaa kutsulla [/api/tiketti/:tiketti-id](#apitikettitiketti-id), joka kertoo onko tiketti *arkistoitava*.
##### Lähetä:
```
{
  tiketti: $int (arkistoitavan tiketin id)
}
```
##### Vastaus:
```
{
  success: true
}
```



### /api/kurssi/:kurssi-id/ukk/arkisto/
Tätä kutsua varten pitää olla kirjautunut tiketin kurssille opettajaksi. Tiketti arkistoidaan vain siinä tapauksessa, jos tiketti on merkitty UKK:ksi.
#### POST
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) UKK-kirjoitus
##### Lähetä:
```
{
  tiketti: $int (arkistoitavan tiketin id)
}
```
##### Vastaus:
```
- body -
{
  success: true
}
```

### /api/kurssi/:kurssi-id/ukk/:tiketti-id/
Muokkaa annettua UKK-tikettiä.
Tätä kutsua varten pitää olla kirjautunut tiketin kurssille opettajaksi, ja muokattavan tiketin pitää olla UKK, eikä se saa olla [arkistoitu](#tiketin-tila).
Tällä hetkellä arkistoi osoitetun tiketin, ja luo uuden UKK-tiketin annetuilla tiedoilla. Lopputulos on siis sama, kuin kutsuisi [/api/tiketti/:tiketti-id/arkistoiukk](#apitikettitiketti-idarkistoiukk) ja **POST** [/api/kurssi/:kurssi-id/ukk](#apikurssikurssi-idukk).
#### PUT
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) UKK-kirjoitus
##### Lähetä:
```
- body -
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
- body -
{
  success: true
}
```

 
### /api/kurssi/
#### POST
##### Lähetä:
```
- body -
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
- body - 
{
  success: $bool
  error: $error-olio
}
```



### /api/kurssi/:kurssi-id/osallistujat/
Rajapinta kurssien käyttäjille.
#### POST
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Kirjautunut sisään
Tällä saadaan liitettyä käyttäjä kurssille. Liittää kirjautuneen käyttäjän kurssille. Käyttäjä voi liittyä vain kurssille, jos tällä on voimassa oleva kutsu. Uusi käyttäjä laitetaan kurssille siinä roolissa, kun [kutsussa](#apikurssikurssi-idosallistujatkutsu) sille annettiin. 
##### Lähetä:
```
{
  kutsu: $UUID (kutsun tunnus)
}
```
##### Vastaus:
```
- body - 
{
  success: true
}
```


### /api/kurssi/:kurssi-id/osallistujat/kutsu/
Tällä rajapinnalla saadaan opiskelijoita ja opettajia liitettyä kurssille. **Vaatii opettajan oikeudet kurssille**, jotta opiskelijoita voi kutsua.
Käyttäjälle lähetetään sähköpostia, ja ko. käyttäjä lisätään kurssille kun tämä luo tilin tai hyväksyy kutsun. (ks. [POST /api/kurssi/:id/osallistujat/](#apikurssikurssi-idosallistujat) ja [/api/luotili](#apiluotili))

Lähettää sähköpostia kutsutulle käyttäjälle. Sähköpostissa on frontendin osoitteet, joihin käyttäjä ohjataan, riippuen siitä pitääkö käyttäjän luoda tili, vai riittääkö vain kutsun hyväksyntä.
#### POST
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Kurssikirjoitus
```
- body -
{
  sposti: $string
  rooli: $string (ks. [roolit](#kurssilainen-olio))
}
```
##### Vastaus:
```
- body - 
{
  success: true
  kutsu: $UUID (kutsun tunnus)
}
```

### /api/kurssi/:kurssi-id/osallistujat/kutsu/:kutsu-id
Kutsun tietojen hakemiseen.
#### GET
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Julkinen
##### Vastaus:
```
	"id": $UUID,
	"kurssi": $int,
	"sposti": $string,
	"vanhenee": $aikaleima,
	"rooli": $string
```
rooli-parametri on [kurssilainen-olion](#kurssilainen-olio) mukainen.

#### DELETE
[**Vaaditut oikeudet**](/docs/rajapinta/oikeudet.md) Kirjautunut sisään.
Palauttaa [1003](/docs/rajapinta/virhe.md), jos kurssi-id on väärin, tai jos kirjautuneen käyttäjän sähköpostiosoite ei mätsää. Tämä tarkoittaa kuitenkin sitä, että tiliä luomatta ei voi kieltäytyä kutsusta (sen voi kyllä jättää huomioitta, joka ajaa lähes saman asian).
##### Vastaus:
```
{
  success: true
}
```


### /api/kurssi/:kurssi-id/oikeudet
Tällä rajapinnalla voi hakea omat oikeudet kurssille.
#### GET
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Profiililuku
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


### /api/kurssi/:kurssi-id/tikettipohja/kentat
Tällä rajapinnalla saa haettua ja muokattua kaikkia tiketin lisätietokenttiä, joita pitää käyttäjältä kysyä, ja jotka pitää lähettää takaisin palvelimelle kun kysymystä luodaan. (Tämä ei sisällä sellaisia kenttiä, kuin otsikko, liitteet tai tiketin teksti.)

#### GET
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Kurssiluku
##### Vastaus:
```
- body - 
[{
  id: $int
  otsikko: $string
  pakollinen: $bool
  esitaytettava: $bool
  esitäyttö: $string
  valinnat: [$string]
}]
```
*Rajapinta ei lupaa mitään lähetettyjen taulukoiden järjestyksestä.*

#### PUT
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Kurssikirjoitus
Tämä **PUT** komento luo uudet kentät tikettipohjalle, ja poistaa viittaukset vanhoihin kenttiin uudesta kenttäpohjasta. Vanhalla kenttäpohjalla tehtyihin tiketteihin jää edelleen sen kenttäpohjan kentät, jonka perusteella se tiketti luotiin.
```
- body -
{
  kentat:
    [{
      otsikko: $string
      pakollinen: $bool
      esitaytettava: $bool
      ohje: $string
      valinnat: [$string]
    }]
}
```

##### Vastaus:
```
- body -
{
  success: true
}
```


### /api/kurssi/:kurssi-id/tiketti/
Tällä rajapinnalla luodaan uusi tiketti lähettämällä tiketin tiedot palvelimelle. 

#### POST
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Kurssiluku
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
  uusi: {
    tiketti: $int (luodun tiketin id)
    kommentti: $int (luodun tiketin ensimmäisen kommentin id)
  }
}
```

#### GET 
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Kurssiluku
Tämä rajapinnan **GET** vastaa täysin samaa toiminnallisuutta kuin **GET** osoitteeseen [*/api/kurssi/:kurssi-id/tiketinkentat/*](#apikurssikurssi-idtiketinkentat). 



### /api/kurssi/:kurssi-id/tiketti/:tiketti-id/
#### GET
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Tikettiluku
##### Vastaus:
```
{
  otsikko: $string
  aikaleima: $string
  aloittaja: $kurssilainen-olio
  tila: $string
  kurssi: $int
  liitteet: 
  [{
    id: $UUID
  }]
}
```
[Kurssilainen-olio](#kurssilainen-olio)<br>
[Tila](#tiketin-tila)<br>


#### PUT
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Tikettikirjoitus
```
-body- 
{
  otsikko: $string
  viesti: $string (ei pakollinen)
  kentat: 
  [{
    id: $int
    arvo: $string
  }]
}
```

##### Vastaus:
```
{
  success: true
}
```


#### DELETE
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Tikettikirjoitus
#### Vastaus:
```
{
  success: true
}
```




### /api/kurssi/:kurssi-id/tiketti/:tiketti-id/kentat/
#### GET
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Tikettiluku
##### Vastaus:
```
[{
  id: $int
  otsikko: $string 
  arvo: $string 
  tyyppi: $string
  ohje: $string
  pakollinen: $bool
  esitaytettava: $bool
  valinnat: [$string]
}] 
```
*Rajapinta ei lupaa mitään lähetettyjen taulukoiden järjestyksestä.*



### /api/kurssi/:kurssi-id/tiketti/:tiketti-id/kommentti
Kenellä vain, jolla on tiketin lukuoikeus pystyy luomaan uusia kommentteja tikettiin.
#### POST
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Tikettiluku
##### Lähetä:
```
- header -
{
  session-id: $UUDI
}
- body -
{
  viesti: $string
  tila: $int
}
```
##### Vastaus:
```
- body -
{
  success: true
  kommentti: $int (luodun kommentin id)
}
```


### /api/kurssi/:kurssi-id/tiketti/:tiketti-id/kommentti/:kommentti-id
Tällä rajapinnalla voi lueskella ja muokata yksittäistä kommenttia.
#### PUT
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Kommenttikirjoitus
Muokkaa kirjoitetun kommentin viestiä ja tilaa.
##### Lähetä:
```
- body -
{
  viesti: $string
  tila: $int (valinnainen)
}
```

##### Vastaus
```
{
  success: true
}
```

### DELETE
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Kommenttikirjoitus
Poistaa annetun kommentin, jos se on kirjautuneen käyttäjän luoma.
#### Vastaus
```
{
  success: true
}
```



### /api/kurssi/:kurssi-id/tiketti/:tiketti-id/kommentti/kaikki
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Tikettiluku
#### GET
##### Vastaus:
```
[{
  id: $int
  lahettaja: $kurssilainen-olio
  aikaleima: $string 
  tila: $int 
  viesti: $string
  liitteet: [
    {
      kommentti: $int (sama kuin id yllä)
      tiedosto: $UUID
      nimi: $string
    }
  ] 
}] 
```
Edellä [*tila*](#tiketin-tila) vastaa sitä tilaa, mikä kommentille asetettiin POSTilla.<br>
[Kurssilainen-olio](#kurssilainen-olio)


## Liitteiden rajapinta
Nämä rajapinnat eivät toimi JSON-tiedostoilla, vaan käyttävät **multipart/form-data** tiedostomuotoa.

### /api/kurssi/:kurssi-id/tiketti/:tiketti-id/kommentti/:kommentti-id/liite
#### POST
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Kommenttikirjoitus
##### Lähetä:
```
- header -
{
  Content-type: multipart/form-data
}
```
kentän nimi on tiedosto.
##### Vastaus:
```
{
  success: true
}
```

### /api/kurssi/:kurssi-id/tiketti/:tiketti-id/kommentti/:kommentti-id/liite/:liite-id
#### DELETE
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Kommenttikirjoitus
##### Vastaus:
```
{
  success: true
}
```

### /api/kurssi/:kurssi-id/tiketti/:tiketti-id/kommentti/:kommentti-id/liite/:liite-id/tiedosto
#### GET
[**Vaaditut oikeudet:**](/docs/rajapinta/oikeudet.md) Tikettiluku
##### Vastaus:
Lähettää tiedoston datan.




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

Tila määräytyy tiketille ja kommentille eri tavalla. Kommentin tila on suoraan se tila, joka sille asetetaa sitä kirjoittaessa. Tiketin tila määräytyy kommenttien, latauksien ja kirjautuneen käyttäjät mukaan, seuraten tilalogiikkakaaviota.

*Tilan* mahdolliset arvot: 
- 0 virhetila 
- 1 lähetty 
- 2 luettu 
- 3 lisätietoa pyydetty 
- 4 kommentoitu 
- 5 ratkaistu 
- 6 arkistoitu 
