# LTI-tokenin dokumentaatio
Tässä tiedostossa listataan Moodlen lähettämä LTI 1.3 tokenin tiivistetty toiminnallisuus sitä mukaa kun se selviää.
Virallinen dokumentaatio löytyy osoitteesta https://www.imsglobal.org/spec/lti/v1p3/


# Rakenne
Token muodostuu useammasta pienemmästä oliosta, ja yleistiedosta:
- [Yleistiedot](#yleistiedot)
- [userInfo](#userinfo)
- [platformInfo](#platforminfo)
- [platformContext](#platformcontext)
  - [context](#platformcontext--context)
  - [resource](#platformcontext--resource)
  - [custom](#platformcontext--custom)
  - [endPoint](#platformcontext--endpoint)
  - [namesRoles](#platformcontext--namesroles)
  - [lis](#platformcontext--lis)
  - [launchPresentation](#platformcontext--launchpresentation)


## Yleistiedot
### id
Todennäköisesti tokenin tai kommunikaation id. Ei voida käyttää minkään tunnistamiseen.
### iss
issuer(?). Sisältää linkin Moodlen etusivulle.
### platformId
???
### clientId
Tällä voidaan tunnistaa asennettu Moodle-instanssi.
### deploymentId
???
### user
Tämä on sama kuin [platformContext/user](#user-1). Vaikuttaa olevan uniikki kirjautuneen käyttäjän tunniste.
### createdAt
### updatedAt




## userInfo
Kirjautuneen käyttäjän tiedot. Melko itseään kuvaavia nimiä.
### given_name
### family_name
### name
Sisältää given_name ja family_name kentät kirjoitettuna yhteen. Mahdollisesti tekee muutankin lokalisointitaikuutta Moodlen päässä. Tätä kannattanee käyttää.
### email




## platformInfo
Yleistä kuvausta LTI-työkalun alustasta. Eli tässä tapauksessa Moodlesta.
### product_family_code
### version
### guid
### name
### description





## platformContext

### id
Sama kuin yleinen [id](#id). Eli todennäköisesti yhteyden tai tokenin id. 
### contextId
Linkkimuotoinen id kurssiin. Ei ole kuitenkaan oikea linkki kurssille. Vielä jää nähtäväksi, onko tämä luotettavampi kuin [platformContext/context/id](#id-2).
### path
### user
### roles
### targetLinkUri
### messageType
### version
### deepLinkingSettings
### createdAt
### updatedAt


## platformContext / context

### id
Moodlen sisällä käyttämä kurssi-id. Ulkopuolisesti nähtävissä myös Moodlen linkeissä.
### label
Kurssin lyhenne
### title
Kurssin pitkä otsikko
### type
Taulukko määriteltyjä kuvauksia kontekstista.


## platformContext / resource
### title
### description
### id


## platformContext / custom
### context_memberships_url


## platformContext / endPoint
### scope"
### lineitems


## platformContext / namesRoles
### context_memberships_url
### service_versions


## platformContext / lis
### person_sourcedid
### course_section_sourcedid


## platformContext / launchPresentation
### locale
Käyttää standardeja locale-lyhenteitä. Tämä tieto tulee Moodlen kielivalinnan mukaan.
### document_target
### return_url





# Malli-token.
Alla on mallitoken, lähetetty paikallisesti ajetusta Moodle-instanssista.
```
{
	"token": 
	{
		"id":20,
		"iss":"http://localhost:8888/moodle401",
		"platformId":"71cb490f7dde8fb318c333043ab294b5",
		"clientId":"qdtuLvTvHcDrKgv",
		"deploymentId":"1",
		"user":"4",
		"userInfo":
			{
				"given_name":"Aku",
				"family_name":"Ankka",
				"name":"Aku Ankka",
				"email":"jonimatiasrajala@gmail.com"
			},
		"platformInfo":
		{
			"product_family_code":"moodle",
			"version":"2022112800",
			"guid":"98ba24396331ac58839f48a45f1ab39b",
			"name":"Moodle 4.1",
			"description":"Moodle 4.1"
		},
		"createdAt":"2022-12-19T14:19:14.031Z",
		"updatedAt":"2022-12-19T14:19:14.031Z",
		"platformContext":
		{
			"id":20,
			"contextId":"http%3A%2F%2Flocalhost%3A8888%2Fmoodle401qdtuLvTvHcDrKgv14_1",
			"path":"/",
			"user":"4",
			"roles":
			["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
			"targetLinkUri":"http://localhost:3000/lti",
			"context":
			{
				"id":"4",
				"label":"TST",
				"title":"Testikurssi",
				"type":["CourseSection"]
			},
			"resource":
			{
				"title":"DVV UKK",
				"description":"",
				"id":"1"
			},
			"custom":
			{
				"context_memberships_url":"http://localhost:8888/moodle401/mod/lti/services.php/CourseSection/4/bindings/1/memberships"},
			"endpoint":
			{
				"scope":
				[
					"https://purl.imsglobal.org/spec/lti-ags/scope/lineitem",
					"https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly",
					"https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly",
					"https://purl.imsglobal.org/spec/lti-ags/scope/score"
				],
				"lineitems":"http://localhost:8888/moodle401/mod/lti/services.php/4/lineitems?type_id=1"
			},
			"namesRoles":
			{
				"context_memberships_url":"http://localhost:8888/moodle401/mod/lti/services.php/CourseSection/4/bindings/1/memberships",
				"service_versions":
				[
					"1.0",
					"2.0"
				]
			},
			"lis":
			{
				"person_sourcedid":"",
				"course_section_sourcedid":"123"
			},
			"launchPresentation":
			{
				"locale":"fi",
				"document_target":"iframe",
				"return_url":"http://localhost:8888/moodle401/mod/lti/return.php?course=4&launch_container=3&instanceid=1&sesskey=YLWIKqbeec"
			},
			"messageType":"LtiResourceLinkRequest",
			"version":"1.3.0",
			"deepLinkingSettings":null,
			"createdAt":"2022-12-19T14:19:14.034Z",
			"updatedAt":"2022-12-19T14:19:14.034Z"
		}
	}
```