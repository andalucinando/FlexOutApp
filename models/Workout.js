const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const workoutSchema = new Schema({
	title: String,
	description: String,
    exercises: Array
});

const Workout = mongoose.model('Workout', workoutSchema);
module.exports = Workout;