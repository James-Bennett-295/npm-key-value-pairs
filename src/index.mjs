let database;

const tablePattern = /^[a-zA-Z0-9_]+$/;

function setDb(db) {
	if (typeof db !== "object") throw "Invalid database provided to setDb function";
	database = db;
}

function set(key, val, table, db) {

	if (typeof table === "undefined") table = "key_value_pairs";
	if (typeof db === "undefined") db = database;

	if (!tablePattern.test(table)) throw "Invalid table name provided";

	db.serialize(() => {
		db.run(`
			CREATE TABLE IF NOT EXISTS ${table}(
				key		TEXT	NOT NULL	PRIMARY KEY,
				val		TEXT	NOT NULL,
				type	TEXT	NOT NULL
			);
		`);
		db.get(`SELECT * FROM ${table} WHERE key = ?`, key, (err, row) => {
			if (err) throw err;
			let valStr;
			const type = typeof val === "number" ? (val % 1 === 0 ? "int" : "float") : typeof val;
			switch (type) {
				case "object":
					valStr = JSON.stringify(val);
					break;
				default:
					valStr = val.toString();
			}
			if (typeof row === "undefined") {
				db.run(`
					INSERT INTO ${table} (key, val, type)
					VALUES(?, ?, ?);
				`, key, valStr, type);
			} else {
				db.run(`
					UPDATE ${table}
					SET val = ?, type = ?
					WHERE key = ?;
				`, valStr, type, key);
			}
		});
	});
}

function get(key, table, db) {
	const promise = new Promise((resolve, reject) => {

		if (typeof table === "undefined") table = "key_value_pairs";
		if (typeof db === "undefined") db = database;

		if (!tablePattern.test(table)) throw "Invalid table name provided";

		db.serialize(() => {
			db.run(`
			CREATE TABLE IF NOT EXISTS ${table}(
				key		TEXT	NOT NULL	PRIMARY KEY,
				val		TEXT	NOT NULL,
				type	TEXT	NOT NULL
			);
		`);
			db.get(`SELECT * FROM ${table} WHERE key = ?`, key, (err, row) => {
				if (err) reject(err);
				if (typeof row === "undefined") return resolve(undefined);
				switch (row.type) {
					case "string":
						return resolve(row.val);
					case "int":
						return resolve(parseInt(row.val));
					case "float":
						return resolve(parseFloat(row.val));
					case "boolean":
						return resolve(row.val === "true" ? true : false);
					case "object":
						return resolve(JSON.parse(row.val));
					case "function":
						return resolve(row.val);
				}
			});
		});
	});
	return promise;
}

function rm(key, table, db) {

	if (typeof table === "undefined") table = "key_value_pairs";
	if (typeof db === "undefined") db = database;

	if (!tablePattern.test(table)) throw "Invalid table name provided";

	db.run(`
		DELETE FROM ${table}
		WHERE key = ?;
	`, key);
}

export default {
	setDb,
	set,
	get,
	rm
}
