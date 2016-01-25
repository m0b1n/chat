'use strict';

var path = require('path'),
        mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');

var dateIn = mongoose.model('dateIn', {code: String, idUser: String, date: Number});
var dateOut = mongoose.model('dateOut', {code: String, idUser: String, date: Number});
var group = mongoose.model('group', {code: String, name: String, id: String, admin: String});
var groupMember = mongoose.model('groupMember', {code: String, id: String, user: String});
var msgGroup = mongoose.model('msgGroup', {code: String, id: String, msg: String, sender: String, reciever: String, date: String, type: String});
var msgUser = mongoose.model('msgUser', {code: String, msg: String, sender: String, reciever: String, date: String, type: String});
var user = mongoose.model('user', {code: String, name: String, id: String, pass: String});

var mappings = {
    get: function (userId, callback) {
        user.findOne({id: userId}, function (err, user) {
            if (err || !user || user.length === 0) {
                return callback(new Error('user not found.'));
            }
            callback(null, user);
        });
    },
    getGroups: function (callback) {
        group.find(function (err, group) {
            if (err || !group || group.length === 0) {
                return callback(new Error('groups not found.'));
            }
            callback(null, group);
        });
    },
    getAll: function (callback) {
        user.find(function (err, user) {
            if (err || !user || user.length === 0) {
                return callback(new Error('users not found.'));
            }
            callback(null, user);
        });
    },
    getHistorySentTemp: function (sen, rec, callback) {
        msgUser.find({sender: sen, reciever: rec}, function (err, msgUser) {
            if (err || !msgUser || msgUser.length === 0) {
                return callback(new Error('msgUser not found.'));
            }
            callback(null, msgUser);
        });
    },
    getHistoryRecTemp: function (sen, rec, callback) {
        msgUser.find({sender: rec, reciever: sen}, function (err, msgUser) {
            if (err || !msgUser || msgUser.length === 0) {
                return callback(new Error('msgUser not found.'));
            }
            callback(null, msgUser);
        });
    },
    createHistory: function (code, sen, rec, msg, date, type, callback) {
        var msgusr = new msgUser({code: code, msg: msg, sender: sen, reciever: rec, date: date, type: type});
        msgusr.save(function (err) {
            if (err) // ...
                return callback(new Error('did not saved msgusr!'));

            callback(null, "finished saving");
        });
    },
    createHistoryGrp: function (code, id, sen, rec, msg, date, type, callback) {
        var msggrp = new msgGroup({code: code, id: id, msg: msg, sender: sen, reciever: rec, date: date, type: type});
        msggrp.save(function (err) {
            if (err) // ...
                return callback(new Error('did not saved msgGroup!'));

            callback(null, "finished saving");
        });
    },
    createUser: function (code, id, name, pass, callback) {
        var usr = new user({code: code, name: name, id: id, pass: pass});
        usr.save(function (err) {
            if (err) // ...
                return callback(new Error('did not saved usr!'));

            callback(null, "finished saving");
        });
    },
    createGroup: function (code, id, name, admin, callback) {
        var grp = new group({code: code, name: name, id: id, admin: admin});
        grp.save(function (err) {
            if (err) // ...
                return callback(new Error('did not saved group!'));

            callback(null, "finished saving");
        });
    },
    addUserGroup: function (code, id, user, callback) {
        var grpmem = new groupMember({code: code, id: id, user: user});
        grpmem.save(function (err) {
            if (err) // ...
                return callback(new Error('did not saved grpmem!'));

            callback(null, "finished saving");
        });
    }
};



module.exports = mappings;