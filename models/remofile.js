const mongoose = require('mongoose');

const remoSchema = mongoose.Schema({
  folderName: {
      type: String
  },
  subFolder: [],
  files: [],
  parent: {
    type: String
  }
});

module.exports = mongoose.model('Filedata',remoSchema);
