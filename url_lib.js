var urlPattern = require('url-pattern');

module.exports = {
    parseUrl: function(url) {
        var pattern = new urlPattern('(http(s)\\://)(:subdomain.):domain.:tld(\\::port)(/*)')
        return pattern.match(url);
    },

    getPort: function(url) {
        return module.exports.parseUrl(url).port;
    }
};
