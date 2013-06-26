var mongodb = require('./db');

function Weibo(username, content, time) {
	this.user = username;
	this.content = content;
	if (time) {
		this.time = time;
	} else {
		this.time = new Date();
	}
};

module.exports = Weibo;

Weibo.prototype.save = function save(callback) {
	var weibo = {
		user: this.user,
		content: this.content,
		time:this.time
	};

	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		db.collection('weibo', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('user');
			collection.insert(weibo, {safe: true}, function(err, weibo) {
        		mongodb.close();
        		callback(err, weibo);
      		});
		});
	});
};

Weibo.get = function get(username, callback) {
	mongodb.open (function(err ,db) {
		if (err) {
			return callback(err);
		}

		db.collection('weibo', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			var query = {};
			if (username) {
        		query.user = username;
      		}

      		collection.find(query).sort({time:-1}).toArray(function(err, docs) {
      			mongodb.close();
      			if (err) {
      				return callback(err);
      			}

      			var weibos = [];
      			docs.forEach(function(doc, index) {
      				var weibo = new Weibo(doc.user, doc.content, doc.time);
      				weibos.push(weibo);
      			});

      			callback(null, weibos);
      		});

		});
	});
};