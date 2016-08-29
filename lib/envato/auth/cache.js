var auth_cache = {
    load: function() {
        var fs = require('fs');
        fs.readFile('./.cache', function (err, data) {
          if (err) {
            throw err; 
          }
          console.log(JSON.parse(data).refresh_token);
        });
    }
};

module.exports = {
    'load': auth_cache.load
};
