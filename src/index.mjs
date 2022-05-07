let db;

function setDb(database) {
	if (typeof database !== "object") throw "Invalid database provided to setDb function";
	db = database;
}

function set(key, val) {

	db.serialize(() => {
		db.run(`
			CREATE TABLE IF NOT EXISTS key_value_pairs(
				key		TEXT	NOT NULL	PRIMARY KEY,
				val		TEXT	NOT NULL,
				type	TEXT	NOT NULL
			);
		`);
		db.get("SELECT * FROM key_value_pairs WHERE key = ?", key, (err, row) => {
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
					INSERT INTO key_value_pairs (key, val, type)
					VALUES(?, ?, ?);
				`, key, valStr, type);
			} else {
				db.run(`
					UPDATE key_value_pairs
					SET val = ?, type = ?
					WHERE key = ?;
				`, valStr, type, key);
			}
		});
	});
}

function get(key) {
	const promise = new Promise((resolve, reject) => {
		db.serialize(() => {
			db.run(`
			CREATE TABLE IF NOT EXISTS key_value_pairs(
				key		TEXT	NOT NULL	PRIMARY KEY,
				val		TEXT	NOT NULL,
				type	TEXT	NOT NULL
			);
		`);
			db.get("SELECT * FROM key_value_pairs WHERE key = ?", key, (err, row) => {
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

function rm(key) {
	db.run(`
		DELETE FROM key_value_pairs
		WHERE key = ?;
	`, key);
}

export default {
	setDb,
	set,
	get,
	rm
}
