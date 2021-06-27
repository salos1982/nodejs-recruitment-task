const mongoose =require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  releaseDate: Date,
  genre: String,
  director: String,
  createdBy: {
    type: Number,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});


const MoviesModel = mongoose.model('Movies', MovieSchema);

module.exports = MoviesModel;