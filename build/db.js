"use strict";
var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "@ristotlE456",
    database: "bcl"
});
con.connect(function (err) {
    if (err)
        throw err;
    console.log("Connected!");
});
module.exports = con;
var dbConfig = {
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "@ristotlE456",
    database: "bcl"
};
var pool = mysql.createPool(dbConfig);
var connection = function () {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err)
                reject(err);
            //console.log("MySQL pool connected: threadId " + connection.threadId);
            var query = function (sql, binding) {
                return new Promise(function (resolve, reject) {
                    connection.query(sql, binding, function (err, result) {
                        if (err)
                            reject(err);
                        resolve(result);
                    });
                });
            };
            var release = function () {
                return new Promise(function (resolve, reject) {
                    if (err)
                        reject(err);
                    //console.log("MySQL pool released: threadId " + connection.threadId);
                    resolve(connection.release());
                });
            };
            resolve({ query: query, release: release });
        });
    });
};
var query = function (sql, binding) {
    return new Promise(function (resolve, reject) {
        pool.query(sql, binding, function (err, result, fields) {
            if (err)
                reject(err);
            resolve(result);
        });
    });
};
module.exports = { pool: pool, connection: connection, query: query };
