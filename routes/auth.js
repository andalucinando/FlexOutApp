const router = require("express").Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.post('/login', (req, res, next) => {
	const { username, password } = req.body;
	// check if we have a user with that username in the database
	User.findOne({ username: username })
		.then(userFromDB => {
			if (userFromDB === null) {
				// if not -> the username is not correct -> show login again
				res.status(400).json({ message: 'incorrect credentials' })
			}
			// username is correct
			// we check the password from the input against the hash in the database
			// compareSync() returns true or false 
			if (bcrypt.compareSync(password, userFromDB.password)) {
				// if it matches -> all credentials are correct
				// we log the user in
				req.session.user = userFromDB;
				res.status(200).json(userFromDB);
			} else {
				// if the password is not matching -> show the form again 
				res.status(400).json({ message: 'incorrect credentials' })
			}
		})
});


router.post('/signup', (req, res, next) => {
	console.log(req.body);
	const { username, password } = req.body;
	// validation
	// is the password 4+ chars
	if (password.length < 4) {
		// if not show the signup form again with a message
		res.status(400).json({ message: 'Your password needs to be 4 chars min' });
		return;
	}
	// is the username empty
	if (username.length === 0) {
		res.status(400).json({ message: 'Username cannot be empty' });
		return;
	}
	// validation passed
	// we now check if the username already exists
	User.findOne({ username: username })
		.then(userFromDB => {
			// if user exists 
			if (userFromDB !== null) {
				// we render signup again
				res.status(400).json({ message: 'Username is already taken' });
			} else {
				// if we reach this line the username can be used
				// password as the value for the password field
				const salt = bcrypt.genSaltSync();
				const hash = bcrypt.hashSync(password, salt);
				console.log(hash);
				// we create a document for that user in the db with the hashed 
				User.create({ username: username, password: hash })
					.then(createdUser => {
						console.log(createdUser);
						// log the user in
						req.session.user = createdUser;
						res.status(200).json(createdUser);
					})
					.catch(err => {
						next(err);
					})
			}
		})
});

router.get('/loggedin', (req, res, next) => {
	console.log('this is the loggedin in user from the session: ', req.session.user);
	const user = req.session.user;
	res.json(user);
});

router.delete('/logout', (req, res, next) => {
	req.session.destroy();
	res.status(200).json({ message: 'successful logout' });
})

module.exports = router;