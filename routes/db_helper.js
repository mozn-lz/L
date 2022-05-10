const mysql = require('mysql2');

let conn;

// create the connection to database
if (mysql.createConnection({host: 'localhost',user: 'root',port: 3306,password: 'admin',database: 'library_records'})) {
	conn = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		port: 3306,
		password: 'admin',
		database: 'library_records'
	});
} else {
}


let db_create = (table, new_data, cb) => {
		console.log( `___ - CREATE ${table} - ___\n`);
		let sql = 'INSERT INTO ' + table + ' SET ?';
		conn.query(sql, new_data, (err, result) => {
			if (err) throw err;
			cb(result.insertId);
		});
	}
let db_read = (table, find_data, cb) => {
		console.log( `___ - READ ${table} - ___\n`);
		(find_data === '') ? find_data = 1: 0;
		let sql = 'SELECT * FROM ' + table + ' WHERE ?';
		conn.query(sql, find_data, (err, res_arr) => {
			// console.log(conn.query(sql, find_data));
			if (err) throw err;
			cb(res_arr);
		});
	}
let db_search = (table, col, value, cb) => {
		console.log( `___ - READ ${table} - ___`);
		// console.log(`query:       \n TB${table}\n col ${col}\n val ${value}, \n`);
		(value === '') ? value = 1: 0;
		
		let sql = 'SELECT * FROM ' + table + ' WHERE '+ col +' LIKE LOWER(?)';
		conn.query(sql, value, (err, res_arr) => {
			console.log('--------------------------------------------------')
			// console.log('\n\n', conn.query(sql, value), '\n\n' );
			if (err) throw err;
			// if (res_arr)
			// 	console.log(table, res_arr);
			cb(res_arr);
		});
}
let db_update = (table, find_data, update_data, cb) => {
		(find_data == '') ? find_data == 1: 0;
		let quiry_data = [update_data, find_data];
		console.log( `___ - UPDATE ${table} - ___\n`);
		let sql = 'UPDATE ' + table + ' SET ? WHERE ?';
		conn.query(sql, quiry_data, (err, result) => {
			// consowle.log(conn.query(sql, quiry_data));
			if (err) throw err;
			cb();
		});
	}
let db_delete = (table, find_data, cb) => {
		console.log( `___ - DELETE ${table} - ___\n`);
		let sql = 'DELETE FROM ' + table + ' WHERE ?';
		conn.query(sql, find_data, (err, res_arr) => {
			// console.log(conn.query(sql, find_data));
			if (err) throw err;
			cb();
		});
	}

let db_gen_advanced_read = (table, find_data, orderBy, sort , start, limit) => {
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
	db_gen_advanced_read
};
