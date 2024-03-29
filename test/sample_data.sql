-- Tässä tiedostossa on testitietokantaa varten ajettavat insert komennot, jotta testatessa tietokannassa on jotain tietoa jo aluksi.
-- Varmista, että ajat taulujen luontikoodin ennen tätä. Se löytyy tiedostosta SQL-alustus.
-- Helppo tapa testata, että dvvukk_user käyttäjällä on edes jotain oikeuksia on suorittaa tämä skripti käyttäen kyseistä käyttäjää:
-- $ psql -U "dvvukk_user" -h "127.0.0.1" -d "dvvukk"


-- Kayttajat

INSERT INTO core.profiili (nimi, sposti) VALUES ('Esko Seppä', 'esko.seppa@example.com');
INSERT INTO core.profiili (nimi, sposti) VALUES ('Marianna Laaksonen', 'marianna.laaksonen@example.com');
INSERT INTO core.profiili (nimi, sposti) VALUES ('Piia Rinne', 'piia.rinne@example.com');
INSERT INTO core.profiili (nimi, sposti) VALUES ('Pentti Lähde', 'pentti.lahde@example.com');
INSERT INTO core.profiili (nimi, sposti) VALUES ('SUPER-opiskelija', 'superopiskelija@example.com');
INSERT INTO core.profiili (nimi, sposti) VALUES ('SUPER-opettaja', 'superopettaja@example.com');

-- Profiiliasetukset
INSERT INTO core.profiiliasetukset values (1, true, true, true, true);
INSERT INTO core.profiiliasetukset values (2, true, true, true, true);
INSERT INTO core.profiiliasetukset values (3, true, true, true, true);
INSERT INTO core.profiiliasetukset values (4, true, true, true, true);
INSERT INTO core.profiiliasetukset values (5, true, true, true, true);
INSERT INTO core.profiiliasetukset values (6, true, true, true, true);

-- Loginit
INSERT INTO core.login (ktunnus, salasana, salt, profiili) VALUES ('TestiOpiskelija', '7b954fb52eefbbe94dcf9eb54ddea92627b9664193786d4940b3b26392b0dc7a', '800c986867e4342d', 1);
INSERT INTO core.login (ktunnus, salasana, salt, profiili) VALUES ('TestiOpettaja', '43fe8b6b04441a5fdeeffaf5093f787fe47f5920fcbba9485725bc7767c36384', '8e55389264b6f702', 2);
INSERT INTO core.login (ktunnus, salasana, salt, profiili) VALUES ('TestiRinne', '895bcac2115d55129ed91bfd397a2baf24e07eaf81165f590b680b1265505805', 'f8b54814eaedfa05', 3);
INSERT INTO core.login (ktunnus, salasana, salt, profiili) VALUES ('TestiLähde', '1293ed7ab03173099b156329ca424c3e54abd110d386fcf9437a90780549a9f9', '7054a0ecce8c247e', 4);
INSERT INTO core.login (ktunnus, salasana, salt, profiili) VALUES ('SuperOpiskelija', '1293ed7ab03173099b156329ca424c3e54abd110d386fcf9437a90780549a9f9', '7054a0ecce8c247e', 5);
INSERT INTO core.login (ktunnus, salasana, salt, profiili) VALUES ('SuperOpettaja', '1293ed7ab03173099b156329ca424c3e54abd110d386fcf9437a90780549a9f9', '7054a0ecce8c247e', 6);


-- Kurssit

INSERT INTO core.kurssi (nimi, ulkotunnus) VALUES ('Ohjelmointimatematiikan perusteet', '');
INSERT INTO core.kurssi (nimi, ulkotunnus) VALUES ('Testikurssi 1', 'TKET');
INSERT INTO core.kurssi (nimi, ulkotunnus) VALUES ('Testikurssi 2', 'TKET');
INSERT INTO core.kurssi (nimi, ulkotunnus) VALUES ('Testikurssi 3', 'TKET');
INSERT INTO core.kurssi (nimi, ulkotunnus) VALUES ('Testikurssi 4', 'TKET');
INSERT INTO core.kurssi (nimi, ulkotunnus) VALUES ('Testikurssi 5', 'TKET');


-- Kurssin osallistujat

INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) VALUES (1, 1, 'opiskelija');
INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) VALUES (1, 2, 'opettaja');
INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) VALUES (1, 3, 'opiskelija');
INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) VALUES (1, 4, 'opettaja');
INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) VALUES (6, 4, 'opettaja');
-- Super opiskelija
INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) VALUES (1, 5, 'opiskelija');
INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) VALUES (2, 5, 'opiskelija');
INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) VALUES (3, 5, 'opiskelija');
INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) VALUES (4, 5, 'opiskelija');
INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) VALUES (5, 5, 'opiskelija');
INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) VALUES (6, 5, 'opiskelija');
-- Super opettaja
INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) VALUES (1, 6, 'opettaja');
INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) VALUES (2, 6, 'opettaja');
INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) VALUES (3, 6, 'opettaja');
INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) VALUES (4, 6, 'opettaja');
INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) VALUES (5, 6, 'opettaja');
INSERT INTO core.kurssinosallistujat (kurssi, profiili, asema) VALUES (6, 6, 'opettaja');


-- Tikettipohja

INSERT INTO core.tikettipohja (kurssi, kuvaus) VALUES (1, 'Tällä työkalulla voi käydä kysymässä opettajalta neuvoa, ja antaa opettajalle kaiken tarvittavan. Jotta opettaja voi auttaa sinua parhaiten, muista kertoa viestissä kehitysympäristösi, käyttöjärjestelmäsi ja tarkka kuvaus ongelmasta. Jos ongelma liittyy koodiin, niin laita liitetiedostoksi kaikki kooditiedostosi, tai laita linkki GitHubiin.');
INSERT INTO core.tikettipohja (kurssi, kuvaus) VALUES (2, 'Tällä työkalulla voi käydä kysymässä opettajalta neuvoa, ja antaa opettajalle kaiken tarvittavan. Jotta opettaja voi auttaa sinua parhaiten, muista kertoa viestissä kehitysympäristösi, käyttöjärjestelmäsi ja tarkka kuvaus ongelmasta. Jos ongelma liittyy koodiin, niin laita liitetiedostoksi kaikki kooditiedostosi, tai laita linkki GitHubiin.');
INSERT INTO core.tikettipohja (kurssi, kuvaus) VALUES (3, 'Tällä työkalulla voi käydä kysymässä opettajalta neuvoa, ja antaa opettajalle kaiken tarvittavan. Jotta opettaja voi auttaa sinua parhaiten, muista kertoa viestissä kehitysympäristösi, käyttöjärjestelmäsi ja tarkka kuvaus ongelmasta. Jos ongelma liittyy koodiin, niin laita liitetiedostoksi kaikki kooditiedostosi, tai laita linkki GitHubiin.');
INSERT INTO core.tikettipohja (kurssi, kuvaus) VALUES (4, 'Tällä työkalulla voi käydä kysymässä opettajalta neuvoa, ja antaa opettajalle kaiken tarvittavan. Jotta opettaja voi auttaa sinua parhaiten, muista kertoa viestissä kehitysympäristösi, käyttöjärjestelmäsi ja tarkka kuvaus ongelmasta. Jos ongelma liittyy koodiin, niin laita liitetiedostoksi kaikki kooditiedostosi, tai laita linkki GitHubiin.');
INSERT INTO core.tikettipohja (kurssi, kuvaus) VALUES (5, 'Tällä työkalulla voi käydä kysymässä opettajalta neuvoa, ja antaa opettajalle kaiken tarvittavan. Jotta opettaja voi auttaa sinua parhaiten, muista kertoa viestissä kehitysympäristösi, käyttöjärjestelmäsi ja tarkka kuvaus ongelmasta. Jos ongelma liittyy koodiin, niin laita liitetiedostoksi kaikki kooditiedostosi, tai laita linkki GitHubiin.');
INSERT INTO core.tikettipohja (kurssi, kuvaus) VALUES (6, 'Tällä työkalulla voi käydä kysymässä opettajalta neuvoa, ja antaa opettajalle kaiken tarvittavan. Jotta opettaja voi auttaa sinua parhaiten, muista kertoa viestissä kehitysympäristösi, käyttöjärjestelmäsi ja tarkka kuvaus ongelmasta. Jos ongelma liittyy koodiin, niin laita liitetiedostoksi kaikki kooditiedostosi, tai laita linkki GitHubiin.');


-- Kenttapohja

INSERT INTO core.kenttapohja (otsikko, tyyppi, esitaytettava, pakollinen, ohje, valinnat) VALUES ('Tehtävä', 1, TRUE, TRUE, '', '');
INSERT INTO core.kenttapohja (otsikko, tyyppi, esitaytettava, pakollinen, ohje, valinnat) VALUES ('Ongelman tyyppi', 1, FALSE, TRUE, '', 'Kotitehtävä;Määräajat;Yleinen');
INSERT INTO core.kenttapohja (otsikko, tyyppi, esitaytettava, pakollinen, ohje, valinnat) VALUES ('Tehtävä', 1, FALSE, TRUE, '', '');
INSERT INTO core.kenttapohja (otsikko, tyyppi, esitaytettava, pakollinen, ohje, valinnat) VALUES ('Ongelman tyyppi', 1, FALSE, TRUE, '', 'Kotitehtävä;Määräajat;Yleinen');
INSERT INTO core.kenttapohja (otsikko, tyyppi, esitaytettava, pakollinen, ohje, valinnat) VALUES ('Tehtävä', 1, FALSE, TRUE, '', '');
INSERT INTO core.kenttapohja (otsikko, tyyppi, esitaytettava, pakollinen, ohje, valinnat) VALUES ('Ongelman tyyppi', 1, FALSE, TRUE, '', 'Kotitehtävä;Määräajat;Yleinen');
INSERT INTO core.kenttapohja (otsikko, tyyppi, esitaytettava, pakollinen, ohje, valinnat) VALUES ('Tehtävä', 1, FALSE, TRUE, '', '');
INSERT INTO core.kenttapohja (otsikko, tyyppi, esitaytettava, pakollinen, ohje, valinnat) VALUES ('Ongelman tyyppi', 1, FALSE, TRUE, '', 'Kotitehtävä;Määräajat;Yleinen');
INSERT INTO core.kenttapohja (otsikko, tyyppi, esitaytettava, pakollinen, ohje, valinnat) VALUES ('Tehtävä', 1, FALSE, TRUE, '', '');
INSERT INTO core.kenttapohja (otsikko, tyyppi, esitaytettava, pakollinen, ohje, valinnat) VALUES ('Ongelman tyyppi', 1, FALSE, TRUE, '', 'Kotitehtävä;Määräajat;Yleinen');
INSERT INTO core.kenttapohja (otsikko, tyyppi, esitaytettava, pakollinen, ohje, valinnat) VALUES ('Tehtävä', 1, FALSE, TRUE, '', '');
INSERT INTO core.kenttapohja (otsikko, tyyppi, esitaytettava, pakollinen, ohje, valinnat) VALUES ('Ongelman tyyppi', 1, FALSE, TRUE, '', 'Kotitehtävä;Määräajat;Yleinen');


-- Tikettipohjan kentät

INSERT INTO core.tikettipohjankentat (tikettipohja, kentta) VALUES (1, 1);
INSERT INTO core.tikettipohjankentat (tikettipohja, kentta) VALUES (1, 2);
INSERT INTO core.tikettipohjankentat (tikettipohja, kentta) VALUES (2, 3);
INSERT INTO core.tikettipohjankentat (tikettipohja, kentta) VALUES (2, 4);
INSERT INTO core.tikettipohjankentat (tikettipohja, kentta) VALUES (3, 5);
INSERT INTO core.tikettipohjankentat (tikettipohja, kentta) VALUES (3, 6);
INSERT INTO core.tikettipohjankentat (tikettipohja, kentta) VALUES (4, 7);
INSERT INTO core.tikettipohjankentat (tikettipohja, kentta) VALUES (4, 8);
INSERT INTO core.tikettipohjankentat (tikettipohja, kentta) VALUES (5, 9);
INSERT INTO core.tikettipohjankentat (tikettipohja, kentta) VALUES (5, 10);
INSERT INTO core.tikettipohjankentat (tikettipohja, kentta) VALUES (6, 11);
INSERT INTO core.tikettipohjankentat (tikettipohja, kentta) VALUES (6, 12);


-- Tiketti

INSERT INTO core.tiketti (kurssi, otsikko, aikaleima, aloittaja, ukk) VALUES (1, 'Kotitehtävä ei käänny', NOW() - interval '12 days', 1, FALSE);
INSERT INTO core.tiketti (kurssi, otsikko, aikaleima, aloittaja, ukk) VALUES (1, 'Miten char* ja char eroaa toisistaan?', NOW() - interval '7 days', 1, FALSE);
INSERT INTO core.tiketti (kurssi, otsikko, aikaleima, aloittaja, ukk) VALUES (1, '”Index out of bounds”?', NOW() - interval '6 days', 3, FALSE);
INSERT INTO core.tiketti (kurssi, otsikko, aikaleima, aloittaja, ukk) VALUES (1, 'Ohjelma tulostaa numeroita kirjainten sijasta!', NOW() - interval '5 days', 1, FALSE);
INSERT INTO core.tiketti (kurssi, otsikko, aikaleima, aloittaja, ukk) VALUES (1, 'Tehtävänannossa ollut linkki ei vie mihinkään', NOW() - interval '4 days', 1, FALSE);
INSERT INTO core.tiketti (kurssi, otsikko, aikaleima, aloittaja, ukk) VALUES (1, '”} Expected”?', NOW() - interval '3 days', 3, FALSE);
INSERT INTO core.tiketti (kurssi, otsikko, aikaleima, aloittaja, ukk) VALUES (1, 'UKK kysymys', NOW() - interval '3 days', 1, TRUE);
INSERT INTO core.tiketti (kurssi, otsikko, aikaleima, aloittaja, ukk) VALUES (2, 'Toisen kurssin tiketti', NOW() - interval '10 days', 1, FALSE);
INSERT INTO core.tiketti (kurssi, otsikko, aikaleima, aloittaja, ukk) VALUES (1, 'Arkistoitu tikettikysymys', NOW() - interval '2 days', 1, FALSE);
INSERT INTO core.tiketti (kurssi, otsikko, aikaleima, aloittaja, ukk) VALUES (1, 'UKK 1', NOW() - interval '2 days', 1, TRUE);
INSERT INTO core.tiketti (kurssi, otsikko, aikaleima, aloittaja, ukk) VALUES (1, 'Usein kysytty kysymys 2', NOW() - interval '12 hours', 1, TRUE);
-- Tyhjien kurssien kysymykset
INSERT INTO core.tiketti (kurssi, otsikko, aikaleima, aloittaja, ukk) VALUES (6, 'Kysymys kurssilla, jolla ei ole osallistujia', NOW() - interval '2 days', 4, FALSE);
INSERT INTO core.tiketti (kurssi, otsikko, aikaleima, aloittaja, ukk) VALUES (6, 'UKK-kysymys kurssilla, jolla ei ole osallistujia', NOW() - interval '2 days', 1, TRUE);
-- Tiketti kurssilla, jolla sen luoja ei "enää" osallistu
INSERT INTO core.tiketti (kurssi, otsikko, aikaleima, aloittaja, ukk) VALUES (2, 'Potkitun opiskelijan kysymys', NOW() - interval '2 days', 1, FALSE);
INSERT INTO core.tiketti (kurssi, otsikko, aikaleima, aloittaja, ukk) VALUES (2, 'Potkitun opettajan kysymys', NOW() - interval '2 days', 2, FALSE);

INSERT INTO core.tiketti (kurssi, otsikko, aikaleima, aloittaja, ukk) VALUES (3, 'Vanhentuneen kurssin kysymys', NOW() - interval '1 month', 3, FALSE);



-- Tiketin kentat

INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (1, 1, '1');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (1, 2, '1');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (1, 3, '2');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (1, 4, '2');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (1, 5, '3');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (1, 6, '4');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (1, 7, '2');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (2, 1, 'Ongelma');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (2, 2, 'Epäselvä tehtävänanto');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (2, 3, 'Ongelma');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (2, 4, 'Kurssin suoritus');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (2, 5, 'Epäselvä tehtävänanto');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (2, 6, 'Ongelma');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (2, 7, 'Aikataulu');

INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (1, 12, 'Vastaus 1');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (2, 12, 'Vastaus 2');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (1, 13, 'UKK-vastaus 1');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (2, 13, 'UKK-vastaus 2');

INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (3, 14, 'O1-T3');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (4, 14, 'Epäreiluus');

INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (3, 15, 'O1-T3');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (4, 15, 'Miksi minä olen täällä?');

INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (3, 16, 'O1-T3');
INSERT INTO core.tiketinkentat (kentta, tiketti, arvo) VALUES (4, 16, 'Miksi minä olen täällä?');



-- Tiketin tila

INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (1, 1, NOW() - interval '12 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (1, 2, NOW() - interval '10 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (1, 3, NOW() - interval '9 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (1, 1, NOW() - interval '6 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (1, 1, NOW() - interval '5 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (1, 2, NOW() - interval '4 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (1, 5, NOW() - interval '4 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (1, 6, NOW() - interval '2 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (2, 1, NOW() - interval '7 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (2, 2, NOW() - interval '5 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (2, 4, NOW() - interval '3 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (2, 6, NOW() - interval '2 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (3, 1, NOW() - interval '6 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (3, 2, NOW() - interval '1 day');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (3, 3, NOW());
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (4, 1, NOW() - interval '5 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (4, 2, NOW() - interval '2 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (4, 4, NOW() - interval '1 day');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (5, 1, NOW() - interval '4 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (5, 2, NOW() - interval '4 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (5, 5, NOW() - interval '1 day');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (6, 1, NOW() - interval '3 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (6, 2, NOW() - interval '2 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (6, 3, NOW() - interval '1 day');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (7, 1, NOW() - interval '10 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (8, 1, NOW() - interval '10 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (9, 1, NOW() - interval '2 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (9, 2, NOW() - interval '2 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (9, 4, NOW() - interval '1 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (9, 6, NOW() - interval '1 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (10, 1, NOW() - interval '2 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (10, 2, NOW() - interval '2 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (10, 4, NOW() - interval '1 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (10, 6, NOW() - interval '1 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (11, 1, NOW() - interval '2 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (11, 2, NOW() - interval '2 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (11, 4, NOW() - interval '1 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (11, 6, NOW() - interval '1 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (12, 1, NOW() - interval '1 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (13, 1, NOW() - interval '1 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (14, 1, NOW() - interval '5 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (15, 1, NOW() - interval '5 days');
INSERT INTO core.tiketintila (tiketti, tila, aikaleima) VALUES (16, 1, NOW() - interval '5 days');


-- Kommentit

INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (2, 1, 1, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '12 days');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (2, 1, 2, '<p>Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis. Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbirutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a  nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut iddiam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '9 days');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (2, 1, 1, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris.</p>', NOW() - interval '6 days');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (2, 1, 1, '<p>Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris.</p>', NOW() - interval '5 days');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (2, 1, 2, '<p>Pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed.</p>', NOW() - interval '4 days');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (2, 2, 1, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '7 days');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (2, 3, 3, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '6 days');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (2, 4, 1, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '5 days');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (2, 5, 1, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '4 days');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (2, 6, 3, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '3 days');

INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (2, 9, 3, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '3 days');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (2, 9, 3, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '3 days');

INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (1, 7, 3, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '3 days');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (1, 7, 3, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '3 days');

INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (1, 10, 3, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '3 days');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (1, 10, 3, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '3 days');

INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (1, 11, 3, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '12 hours');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (1, 11, 3, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '12 hours');

INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (1, 12, 1, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '3 days');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (1, 12, 2, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '3 days');

INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (1, 13, 4, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '3 days');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (1, 13, 4, '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sodales convallis purus. Etiam dui eros, vestibulum tincidunt lacus sed, pharetra luctus Leo. Sed nisl mauris, sodales cursus nisi a, mollis varius metus. Pellentesque enim mi, rhoncus eu tellus vitae, gravida porttitor ligula. Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis aliquet molestie est, a blandit mauris. Phasellus cursus libero molestie tincidunt mattis. Curabitur eu fermentum metus, suscipit commodo urna. Nulla facilisi. Nam nec efficitur odio, in consectetur felis.<br>Praesent eu ultricies nisl. Phasellus quis nisi eu orci facilisis fermentum et ut ipsum. Integer vitae posuere dolor. Vivamus nec mauris non neque pharetra eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur ac consequat est, ut aliquet massa. Morbi rutrum mi sit amet nibh suscipit, ut vulputate quam sollicitudin. Aenean a nibh at sapien porttitor eleifend. Maecenas id justo nec arcu lobortis pretium ut id diam. Mauris maximus auctor mauris. In varius dictum arcu, non eleifend arcu fermentum vel. Proin malesuada elit eros, nec laoreet nisl bibendum at.</p>', NOW() - interval '3 days');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (1, 14, 1, '<p>Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin.</p>', NOW() - interval '5 days');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (1, 15, 2, '<p>Pellentesque efficitur vitae lectus pellentesque convallis. Sed et ultricies libero, in vulputate ipsum. Etiam aliquam dignissim sollicitudin.</p>', NOW() - interval '5 days');
INSERT INTO core.kommentti (tila, tiketti, lahettaja, viesti, aikaleima) VALUES (1, 16, 1, '<p>Tämä kysymys on olemassa vain vanhentuneella kurssilla, ja siten kenentään ei pitäisi kiinnittää siihen mitään huomiota.</p>', NOW() - interval '1 month');


-- Liitteet

INSERT INTO core.liite (kommentti, tiedosto, nimi, koko) VALUES (20, '000bbce1-d377-4e46-868f-17a51f60f23a', 'Testiliite.png', 19000);
INSERT INTO core.liite (kommentti, tiedosto, nimi, koko) VALUES (12, '111ccdf2-d377-4e46-868f-17a51f60f23a', 'Testiliite.png', 19000);