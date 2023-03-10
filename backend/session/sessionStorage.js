/**
 * Object to store current sessions.
 * Key: session token
 * Value: Session object
 */
const session = {};

/**
 * Class that represents a session. Stores the user's userId and the time the session expires at.
 */
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