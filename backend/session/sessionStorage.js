const session = {};

module.exports.Session = class Session {

    constructor(userId, expiresAt) {
        this.userId = userId;
        this.expiresAt = expiresAt;
    }

    isExpired(){
        return this.expiresAt < new Date();
    }
}

module.exports.session = session;