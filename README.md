Easily get and set key-value pairs in a sqlite3 database!

<b><u>This package is only compatible with the ECMAScript standard of JavaScript.</b></u>

```js
import sqlite3 from "sqlite3";
import keyValPairs from "key-value-pairs";

const db = new sqlite3.Database("./db.sqlite3");

// pass in the sqlite3 database
keyValPairs.setDb(db);

// set the value of "score" to 10
keyValPairs.set("score", 10);

// get the value of "score"
keyValPairs.get("score")
	.then((score) => {
		console.log("Score is " + score);
	});

// remove "score"
keyValPairs.rm("score");
```

Have any issues, questions or suggestions? [Join my Discord server](https://discord.com/invite/dcAwVFj2Pf) or [open a Github issue](https://github.com/James-Bennett-295/npm-youtube-notifs/issues/new).
