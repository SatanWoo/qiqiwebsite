
/*
 * GET home page.
 */

exports.info = function(req, res) {
	res.render('info', 
		{
			title:'Ziqi Wu',
			items:[1991, 'Satanwoo', 'Male', 'Tongji University']
		});
};

var crypto = require('crypto');
var User = require('../models/User.js')
var Weibo = require('../models/Weibo.js');

module.exports = function(app) {
	app.get('/', function(req, res) {
		Weibo.get(null, function(err, weibos) {
			if (err) {
				weibos = [];
			}

			res.render('index', 
				{ 
					title:'首页', 
					weibos:weibos
				}
			);
		});
	});

	app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res){
		res.render('reg', {title : '注册'});
	});

	app.post('/reg', checkNotLogin);
	app.post('/reg', function(req, res){
		if (req.body['password-repeat'] != req.body['password']) {
			req.flash('error', '两次密码不一致，请重新输入');
			return res.redirect('/reg');
		}

		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');

		var newUser = new User(
			{ 
				name: req.body.username,
			 	password: password,
			}
		);

		User.get(newUser.name, function(err, user) {
			if (user) {
				err = '哎呀！昵称已经存在了，换一个吧~';
			}
				
			if (err) {
				req.flash('error', err); 
				return res.redirect('/reg');
			}

			newUser.save(function(err) {
				if (err) {
					req.flash('error', err); 
					return res.redirect('/reg');
				}
				req.session.user = newUser; 
				req.flash('success', '注册成功，开始尽情享受奇奇网吧'); 
				res.redirect('/');
			});
		});
	});

	app.get('/login', checkNotLogin);
	app.get('/login', function(req, res) {
		res.render('login', {title: '用户登录'});
	});

	app.post('/login', checkNotLogin);
	app.post('/login', function(req, res) {
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');

		User.get(req.body.username, function(err, user){
			if (!user) {
				req.flash('error', '用户名不存在~');
				return res.redirect('/login');
			}

			if (user.password != password){
				req.flash('error', '密码错误~');
				return res.redirect('/login');
			}

			req.session.user = user;
			req.flash('success', '欢迎回来');
			res.redirect('/');
		});
	});

	app.get('/logout', checkLogin); 
	app.get('/logout', function(req, res) {
		req.session.user = null; 
		req.flash('success', '登出成功'); 
		res.redirect('/');
	});

	app.post('/post', checkLogin);
	app.post('/post', function(req, res) {
		var user = req.session.user;
		var weibo = new Weibo(user.name, req.body.weibo);
		weibo.save(function(err) {
			if (err) {
				req.flash('error', '发表失败');
				return res.redirect('/');
			} else {
				req.flash('success', '发表成功');
				return res.redirect('/' + user.name);
			}
		});
	});

	app.get('/:username', function(req, res) {
		User.get(req.params.username, function(err,user) {
			if (!user) {
				req.flash('error', '对不起，您查找的用户没有来过奇奇网哦');
				return res.redirect('/');
			}

			Weibo.get(user.name, function(err, weibos) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}

				res.render('user', 
					{
						title:user.name,
						weibos:weibos
					}
				);
			});
		});
	});

	function checkLogin(req, res, next) {
		if (!req.session.user) {
			req.flash('error', '您还未登录');
			res.redirect('/login');
		}

		next();
	}

	function checkNotLogin(req, res, next) {
		if (req.session.user) {
			req.flash('error', '您已经登录了');
			res.redirect('/');
		}

		next();
	}
};
// ziqi web

// exports.login = function(req, res) {

// };

// exports.doLogin = function(req, res) {

// };

// exports.logout = function(req, res) {
	
// };

// exports.post = function(req, res) {

// };

// exports.reg = function(req, res) {
	
// };

// exports.doReg = function(req, res) {

// };

// exports.users = function(req, res) {

// };

