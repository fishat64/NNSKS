# NNSKS
## Installation for development
[Install Meteor](https://www.meteor.com/install)
````
curl https://install.meteor.com/ | sh
````
Install gpg2
````
sudo apt-get install gnupg2
````

Clone Repository
````
git clone https://github.com/fishat64/NNSKS.git
cd NNSKS
````
Edit settings-default.json to your needs...
````
{
	"privkey": ["-----BEGIN PGP PRIVATE KEY BLOCK-----\n" ,
		"\n" ,
		"-----END PGP PRIVATE KEY BLOCK-----\n"],
	"pubkey": ["-----BEGIN PGP PUBLIC KEY BLOCK-----\n" ,
		"\n" ,
		"-----END PGP PUBLIC KEY BLOCK-----\n"],
	"passphrase": "paaaasssphrase",
	"mailuri" :"smtps://username:password@mail.example.tld:465",
	"debug": false,
	"public": {
		"NNSKSURI": "http://localhost:3000/",
		"dataprotectionpolicy": "http://localhost:3000",
		"home": "http://localhost:3000/"
	}
}
````
Run!
````
meteor run --settings settings-default.json
````
Visit
[http://localhost:3000/](http://localhost:3000/) in your Webbrowser

## Deplpoyment

See [https://guide.meteor.com/deployment.html](https://guide.meteor.com/deployment.html)

See also [https://toerder.eu/blogs/informatik/20181219-gnupg-keyserver-mit-spezialfunktionen-nnsks-new-non-synchron/](https://toerder.eu/blogs/informatik/20181219-gnupg-keyserver-mit-spezialfunktionen-nnsks-new-non-synchron/) [GERMAN]

## Images
![HOME.png](https://toerder.eu/download/B20181220T000000008.png)
![SEARCH.png](https://toerder.eu/download/B20181220T000000009.png)
