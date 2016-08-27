module.exports = {
    refreshToken: null,
    accessToken: null,
    expiresAt: null,

    /**
     * Sets the auth variables from the Envato auth response.
     */
    set: function(res) {
        this.refreshToken   = res.refresh_token;
        this.accessToken    = res.access_token;
        this.expiresAt      = this.now() + res.expires_in;
    },

    now: function() {
        return Math.floor(Date.now() / 1000);
    },

    hasAccess: function() {
        return this.accessToken && this.now() < this.expiresAt;
    }
};
