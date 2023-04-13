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
 | Tunnus | Virhe | HTTP-status |
 | ------ | ----- | ----------- |
 | 1000   | Et ole kirjautunut | 403 |
 | 1001   | Kirjautumispalveluun ei saatu yhteyttä | 503 |
 | 1002   | Väärä käyttäjätunnus ja salasana | 403 |
 | 1003   | Ei oikeuksia | 403 |
 | 1010   | Luotava tili on jo olemassa | 500 |


##### 2 - SQL-ongelmat
 | Tunnus | Virhe | HTTP-status |
 | ------ | ----- | ----------- |
 | 2000   | Tuloksia ei löytynyt | 204 |


##### 3 - Liikenneongelmat
 | Tunnus | Virhe | HTTP-status |
 | ------ | ----- | ----------- |
 | 3000   | Virheelliset parametrit | 400 |
 | 3001   | Operaatiota ei voi suorittaa | 409 |
 | 3002   | Rajapintaa ei ole vielä toteutettu | 405 |
 | 3004   | Joku meni vikaan | 500 |
