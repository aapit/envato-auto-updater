var urlPattern = require('url-pattern');
var urlParser = require('url');

module.exports = {
    parseUrl: function(url) {
        var pattern = new urlPattern('(http(s)\\://)(:subdomain.):domain.:tld(\\::port)(/*)')
        return pattern.match(url);
    },

    getPort: function(url) {
        return module.exports.parseUrl(url).port;
    },

    getQueryParams: function(url) {
        return urlParser.parse(url, true).query;
    }
};
