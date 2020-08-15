const mongoose = require('mongoose');

const remoSchema = mongoose.Schema({
  folderName: {
      type: String
  },
  subFolder: [],
  files: []
});

module.exports = mongoose.model('Filedata',remoSchema);
