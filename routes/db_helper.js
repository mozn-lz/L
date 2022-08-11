const mysql = require('mysql2');

// create the connection to database
const conn = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	port: process.env.DB_PORT,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	connectTimeout: 30000
});

conn.connect((err) => {
	(err) ?
	console.log('db FAILED TO CONNECT ' + err):
	console.log('Database Connected');
});

let db_create = (table, new_data, cb) => {
		console.log( `___ - CREATE ${table} - ___\n`);
		let sql = 'INSERT INTO ' + table + ' SET ?';
		conn.query(sql, new_data, (err, res_arr) => {
			if (err) throw err;
			cb(err, res_arr);
		});
	}
let db_read = (table, find_data, cb) => {
	console.log( `___ - READ ${table} - ___\n`);
	(find_data === '') ? find_data = 1: 0;
	let sql = 'SELECT * FROM ' + table + ' WHERE ?';
	conn.query(sql, find_data, (err, res_arr) => {
		// console.log(conn.query(sql, find_data));
		if (err) throw err;
		cb(err, res_arr);
	});
}
let db_search = (table, value) => {
	console.log( `___ - READ ${table} - ___`);
	console.log(`query:       \n TB${table}\n val ${value}, \n`);
	(value === '') ? value = 1: 0;

	let sql = 'SELECT * FROM ' + table + ' WHERE name LIKE LOWER(?) OR surname LIKE LOWER(?) OR email LIKE LOWER(?)  OR cell_1 LIKE LOWER(?) OR cell_2 LIKE LOWER(?)';
	return new Promise ((res, rej) => {
		conn.query(sql, [value,value,value,value,value], (err, res_arr) => {
			console.log('--------------------------------------------------');
			console.log(sql);
			console.log('* *		db_search		* *\n\tRes: ', res_arr, '\n\tRej: ', err);
			err ? rej(err): res(res_arr);
		});
	});
}
let db_update = (table, find_data, update_data, cb) => {
	(find_data == '') ? find_data == 1: 0;
	let quiry_data = [update_data, find_data];
	console.log( `___ - UPDATE ${table} - ___\n`);
	let sql = 'UPDATE ' + table + ' SET ? WHERE ?';
	conn.query(sql, quiry_data, (err, result) => {
		// console.log(conn.query(sql, quiry_data));
		if (err) throw err;
		cb(err, result);
	});
}
let db_delete = (table, find_data, cb) => {
	console.log( `___ - DELETE ${table} - ___\n`);
	let sql = 'DELETE FROM ' + table + ' WHERE ?';
	conn.query(sql, find_data, (err, res_arr) => {
		// console.log(conn.query(sql, find_data));
		if (err) throw err;
		cb(err, res_arr);
	});
}

let db_advanced_read = (table, find_data, orderBy, sort , start, limit) => {
	// console.log(`\n\n\n___ - db_advanced_read ${table} - ___\n`, find_data);
	const data = [find_data, Number(start), limit]; 
	let sql = '';

	sql = `SELECT * FROM ${table} WHERE ? ORDER BY ${orderBy} ${sort} LIMIT ?, ?`;
	return new Promise((resolve, reject) => {
		conn.query(sql, data, (err, res_arr) => {
			// console.log(conn.query(sql, data));
			if (err) throw err;
			(res_arr) ? resolve(res_arr):reject(null);
		});
	});
}

module.exports = {
	db_create, 
	db_read, 
	db_search, 
	db_update, 
	db_delete, 
	db_advanced_read
};
