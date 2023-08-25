CREATE SCHEMA IF NOT EXISTS core;

CREATE TABLE IF NOT EXISTS core.kurssi (
id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
nimi VARCHAR(255) DEFAULT NULL,
ulkotunnus VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS core.tikettipohja (
id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
kurssi INT NOT NULL,
kuvaus TEXT,
FOREIGN KEY (kurssi) REFERENCES core.kurssi(id)
);

CREATE TABLE IF NOT EXISTS core.kenttapohja (
id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
otsikko VARCHAR(255) NOT NULL,
tyyppi INT NOT NULL,
esitaytettava BOOL NOT NULL,
pakollinen BOOL NOT NULL,
ohje VARCHAR(255),
valinnat TEXT
);

CREATE TABLE IF NOT EXISTS core.tikettipohjankentat (
tikettipohja INT NOT NULL,
kentta INT NOT NULL,
FOREIGN KEY (tikettipohja) REFERENCES core.tikettipohja(id),
FOREIGN KEY (kentta) REFERENCES core.kenttapohja(id),
PRIMARY KEY (tikettipohja, kentta)
);

CREATE TABLE IF NOT EXISTS core.profiili (
id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
nimi VARCHAR(255) NOT NULL,
sposti VARCHAR(255),
ulkotunnus VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS core.tiketti (
id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
kurssi INT NOT NULL,
otsikko VARCHAR(256) NOT NULL,
aikaleima TIMESTAMPTZ NOT NULL,
aloittaja INT NOT NULL,
ukk BOOL NOT NULL,
FOREIGN KEY (kurssi) REFERENCES core.kurssi(id)
);

CREATE TABLE IF NOT EXISTS core.tiketinkentat (
tiketti INT NOT NULL,
kentta INT NOT NULL,
arvo VARCHAR(255) NOT NULL,
FOREIGN KEY (tiketti) REFERENCES core.tiketti(id),
FOREIGN KEY (kentta) REFERENCES core.kenttapohja(id),
PRIMARY KEY (tiketti, kentta)
);

CREATE TABLE IF NOT EXISTS core.kommentti (
id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
tiketti INT NOT NULL,
lahettaja INT NOT NULL,
viesti TEXT NOT NULL,
aikaleima TIMESTAMPTZ NOT NULL,
muokattu TIMESTAMPTZ,
tila INT NOT NULL,
FOREIGN KEY (tiketti) REFERENCES core.tiketti(id),
FOREIGN KEY (lahettaja) REFERENCES core.profiili(id)
);

CREATE TABLE IF NOT EXISTS core.esitaytetytvastaukset (
kentta INT NOT NULL,
profiili INT NOT NULL,
arvo VARCHAR(255) NOT NULL,
FOREIGN KEY (kentta) REFERENCES core.kenttapohja(id),
FOREIGN KEY (profiili) REFERENCES core.profiili(id),
PRIMARY KEY (kentta, profiili)
);

CREATE TABLE IF NOT EXISTS core.kurssinosallistujat (
kurssi INT NOT NULL,
profiili INT NOT NULL,
asema VARCHAR(32) NOT NULL,
FOREIGN KEY (kurssi) REFERENCES core.kurssi(id),
FOREIGN KEY (profiili) REFERENCES core.profiili(id),
PRIMARY KEY (kurssi, profiili)
);

CREATE TABLE IF NOT EXISTS core.tiketintila (
id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
tiketti INT NOT NULL,
tila INT NOT NULL,
aikaleima TIMESTAMPTZ NOT NULL,
FOREIGN KEY (tiketti) REFERENCES core.tiketti(id)
);

CREATE TABLE IF NOT EXISTS core.login (
ktunnus VARCHAR(64) NOT NULL,
salasana VARCHAR(256),
salt VARCHAR(16),
profiili INT NOT NULL UNIQUE,
FOREIGN KEY (profiili) REFERENCES core.profiili(id),
PRIMARY KEY(ktunnus)
);

CREATE TABLE IF NOT EXISTS core.sessio (
sessionid VARCHAR(36) NOT NULL,
vanhenee TIMESTAMPTZ,
profiili INT NOT NULL,
FOREIGN KEY (profiili) REFERENCES core.profiili(id),
PRIMARY KEY(sessionid)
);

CREATE TABLE IF NOT EXISTS core.loginyritys (
loginid VARCHAR(36) NOT NULL,
codechallenge VARCHAR(64),
fronttunnus VARCHAR(36) UNIQUE NOT NULL,
profiili INT,
FOREIGN KEY (profiili) REFERENCES core.profiili(id),
PRIMARY KEY (loginid)
);

CREATE TABLE IF NOT EXISTS core.lti_login (
clientid VARCHAR(256) NOT NULL,
userid VARCHAR(256) NOT NULL,
profiili INT NOT NULL UNIQUE,
FOREIGN KEY (profiili) REFERENCES core.profiili(id),
PRIMARY KEY (clientid, userid)
);

CREATE TABLE IF NOT EXISTS core.lti_kurssi (
clientid VARCHAR(256) NOT NULL,
contextid VARCHAR(256) NOT NULL,
kurssi INT NOT NULL UNIQUE,
FOREIGN KEY (kurssi) REFERENCES core.kurssi(id),
PRIMARY KEY (clientid, contextid)
);

CREATE TABLE IF NOT EXISTS core.liite (
kommentti INT NOT NULL,
tiedosto VARCHAR(36) NOT NULL,
nimi VARCHAR(256) NOT NULL,
koko INT NOT NULL,
PRIMARY KEY (kommentti, tiedosto),
FOREIGN KEY (kommentti) REFERENCES core.kommentti(id)
);

CREATE TABLE IF NOT EXISTS core.lti_tilipyynto (
id VARCHAR(98) NOT NULL,
lti_versio VARCHAR(5) NOT NULL,
olemassa_oleva_profiili INT,
token TEXT NOT NULL,
PRIMARY KEY (id),
FOREIGN KEY (olemassa_oleva_profiili) REFERENCES core.profiili(id)
);

CREATE TABLE IF NOT EXISTS core.keksisalaisuus (
salaisuus VARCHAR(36) NOT NULL,
vanhenee TIMESTAMPTZ NOT NULL,
PRIMARY KEY (salaisuus)
);

CREATE TABLE IF NOT EXISTS core.profiiliasetukset (
profiili INT NOT NULL,
sposti_ilmoitus BOOL NOT NULL,
sposti_kooste BOOL NOT NULL,
sposti_palaute BOOL NOT NULL,
gdpr_lupa BOOL NOT NULL,
PRIMARY KEY (profiili),
FOREIGN KEY (profiili) REFERENCES core.profiili(id)
);

CREATE TABLE IF NOT EXISTS core.kurssikutsu (
id VARCHAR(36) NOT NULL,
kurssi INT NOT NULL,
sposti VARCHAR(255) NOT NULL,
vanhenee TIMESTAMPTZ NOT NULL,
rooli VARCHAR(255) NOT NULL,
PRIMARY KEY (id),
FOREIGN KEY (kurssi) REFERENCES core.kurssi(id)
);

CREATE TABLE IF NOT EXISTS core.lti_client (
key VARCHAR(36) NOT NULL,
secret VARCHAR(36) NOT NULL,
PRIMARY KEY (key)
);

CREATE TABLE IF NOT EXISTS core.session (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE core.session DROP CONSTRAINT IF EXISTS "session_pkey";
ALTER TABLE core.session ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON core.session ("expire");

INSERT INTO core.profiili (id, nimi, sposti) OVERRIDING SYSTEM VALUE
SELECT 0, 'POISTETTU', ''
WHERE NOT EXISTS ( SELECT id FROM core.profiili WHERE id = 0 );
