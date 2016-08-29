var request = require('request');
var urlLib = require('../tools/url');
var env = require('./env');
var auth_cache = require('./auth/cache');

var auth_private = {
    apiBaseUrl:     'https://api.envato.com',

    /**
     * Receive the response to the authentication request.
     * @param String body The json response object
     * @return Void
     */
    onReceiveAccessToken: function(res, body) {
        console.log('onReceiveAccessToken()');
        console.log(body);
        auth_private.setTokens(body);
        var msg = 'User has access? ' + module.exports.hasAccess();

        console.log(msg);
    },

    /**
     * Sets the auth variables from the Envato auth response.
     */
    setTokens: function(resStr) {
        //console.log('setTokens()');
        //console.log(resStr);
        var res = JSON.parse(resStr);
        //console.log(res);

        this.refreshToken   = res.refresh_token;
        this.accessToken    = res.access_token;
        this.expiresAt      = this.now() + res.expires_in;
    },

    now: function() {
        return Math.floor(Date.now() / 1000);
    },

    postAccessTokenRequest: function(req, res, requestToken) {
        console.log('👉  Posting request for access token');
        var onPostResponse = function(error, res, body) {
            if (!error && res.statusCode == 200) {
                auth_private.onReceiveAccessToken(res, body);
            } else {
                console.log('ERROR ' + res.statusCode);
                console.log(body);
                process.exit();
            }
        }

        var requestUrl = this.apiBaseUrl + '/token';
        var postData = {
            'grant_type': 'authorization_code',
            'code': requestToken,
            'client_id': env.client.id,
            'client_secret': env.client.secret
        };
        //console.log('postData:');
        //console.log(postData);
//process.exit();

        request.post(
            {url: requestUrl, form: postData},
            onPostResponse
        );
    }
}

module.exports = {
    refreshToken:   null,
    accessToken:    null,
    expiresAt:      null,

    hasAccess: function() {
        return this.accessToken && this.now() < this.expiresAt;
    },

    requestAccess: function() {
        /* @todo */
        auth_cache.load();
    },

    displayStart: function(req, res) {
        var redirectUrl = env.client.url + '/auth-confirm';
        var approveUrl  = auth_private.apiBaseUrl + '/authorization'
            + '?response_type=code'
            + '&client_id=' + env.client.id
            + '&redirect_uri=' + redirectUrl
        ;

        res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
        res.write('<h1>Envato Auto-Uploader</h1>');
        res.write('<a href="' + approveUrl + '">'
            + 'Approve API access for the auto-downloader.</a>');
        res.end("\n");
    },

    getLocalPort: function() {
        return urlLib.getPort(env.client.url);
    },

    receiveUserPermissionApproval: function(req, res) {
        //console.log('receiveUserPermissionApproval:');
        var queryData       = urlLib.getQueryParams(req.url);
        //console.log(queryData);
        var requestToken    = queryData.code;
        //console.log(requestToken);
        auth_private.postAccessTokenRequest(req, res, requestToken);

        //res.end();
    }
};
