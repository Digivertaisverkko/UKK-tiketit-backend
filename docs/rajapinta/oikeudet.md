# Oikeuksienhallinta
Tietokannan eri elementteihin vaaditaan eri oikeuksia. Oikeudet yleensä määrittyy kurssikohtaisesti sen mukaan, onko kirjautunut käyttäjä kurssilla opettaja vai opiskelijana. Joissakin tapauksissa (kuten mm. tikettien muokkaamisessa) oikeuksiin vaikuttaa se, kuka on elementin alkuperäinen luoja.
Toimintoja on kahta sorttia:
- lukutoimintoja
- kirjoitustoimintoja (ts. *muokkaustoimintoja*).

Rooleja on viittä erilaista: 
- Opettaja (Määräytyy kurssitilan mukaan.)
- Opiskelija (Määräytyy kurssitilan mukaan.)
- Osallistuja (Määräytyy kurssitilan mukaan.)
- Luoja (Määräytyy tarkasteltavan elementin mukaan.)
- Kaikki (Ei tarvitse edes kirjautumista.)

Elementtejä on kuutta eri mallia: 
- Kurssit
- Tiketit
- UKK-tiketti
- Kommentit
- Profiilit
- Julkiset

Alla oleva taulukko kuvaa, mitä rooli vaaditaan millekin toiminnolle, kun kohteena on jokin elementti.

|   *Elementti*   |   **Luku**   | **Kirjoitus** |
| --------------- | ------------ | ------------- |
| **Kurssi**      | Osallistuja  | Opettaja |
| **Tiketti**     | Opettaja/Luoja | Luoja |
| **UKK-tiketti** | Kaikki       | Opettaja |
| **Kommentti**   | ks. Tikettiluku | Luoja |
| **Profiili**    | Luoja        | Luoja |
| **Julkiset**    | Kaikki       | Opettaja |