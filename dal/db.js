'use strict';

var path = require('path'), Datastore = require('nedb');

var db = {
	mappings : new Datastore({
		filename : path.join(__dirname, 'mappings.db'),
		autoload : true
	})
};

var mappings = {
	get : function(id, callback) {
		db.mappings.findOne({
			code : "user",
			id : id
		}, function(err, mapping) {
			if (err || !mapping) {
				return callback(new Error('id not found.'));
			}
			callback(null, mapping);
		});
	},
	getGrp : function(id, callback) {
		db.mappings.findOne({
			code : "group",
			id : id
		}, function(err, mapping) {
			if (err || !mapping) {
				return callback(new Error('grp not found.'));
			}
			callback(null, mapping);
		});
	},
	getGrpMember : function(idGrp, callback) {
		db.mappings.find({
			code : "groupMember",
			id : idGrp
		}, function(err, mapping) {
			if (err || !mapping) {
				return callback(new Error('id not found.'));
			}
			callback(null, mapping);
		});
	},
	getGroups : function(callback) {
		db.mappings.find({
			code : "group"
		}, function(err, mapping) {
			if (err || !mapping) {
				return callback(new Error('id not found.'));
			}
			callback(null, mapping);
		});
	},
	getAll : function(callback) {
		db.mappings.find({
			code : "user"
		}, function(err, mapping) {
			if (err || !mapping) {
				return callback(new Error('id not found.'));
			}
			callback(null, mapping);
		});
	},
	getHistoryGrpTemp : function(rec, callback) {
		db.mappings.find({
			reciever : rec
		}).sort({
			date : 1
		}).exec(callback);
	},
	getHistorySentTemp : function(sen, rec, callback) {
		db.mappings.find({
			sender : sen,
			reciever : rec
		}).sort({
			date : 1
		}).exec(callback);
	},
	getHistoryRecTemp : function(sen, rec, callback) {
		db.mappings.find({
			sender : rec,
			reciever : sen
		}).sort({
			date : 1
		}).exec(callback);
	},
	createHistory : function(code, sen, rec, msg, date, type, callback) {
		db.mappings.insert({
			code : code,
			sender : sen.id,
			reciever : rec.id,
			message : msg,
			date : date,
			type : type
		}, callback);
	},
	createUser : function(code, id, name, gender, pass, callback) {
		db.mappings.insert({
			code : code,
			id : id,
			name : name,
			gender : gender,
			pass : pass
		}, callback);
	},

	createGroup : function(code, id, name, admin, callback) {
		db.mappings.insert({
			code : code,
			id : id,
			name : name,
			admin : admin
		}, callback);

	},
	addUserGroup : function(code, id, user, callback) {
		db.mappings.insert({
			code : code,
			id : id,
			user : user
		}, callback);
	},
	setDateIn : function(code, id, date, callback) {
		db.mappings.insert({
			code : code,
			id : id,
			date : date
		}, callback);

	},
	getDateIn : function(code, id, callback) {
		db.mappings.insert({
			code : code,
			id : id
		}, callback);

	},
	getDateOut : function(code, id, callback) {
		db.mappings.insert({
			code : code,
			id : id
		}, callback);

	},
	setDateOut : function(code, id, date, callback) {
		db.mappings.insert({
			code : code,
			id : id,
			date : date
		}, callback);

	}
};

module.exports = mappings;
