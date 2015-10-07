/**
 * DBUser
 * ======
 *
 * This class lets you save/get a user from the database, basically so that you
 * can persist "logins" across browser refreshes.
 */
'use strict'
let User = require('./user')
let Struct = require('fullnode/lib/struct')

function DBUser (db, user) {
  if (!(this instanceof DBUser)) {
    return new DBUser(db, user)
  }
  this.fromObject({
    db: db,
    user: user
  })
}

DBUser.prototype = Object.create(Struct.prototype)
DBUser.prototype.constructor = DBUser

DBUser.prototype.save = function (user) {
  if (!user) {
    user = this.user
  }
  this.user = user
  let rev
  return this.db.get('user').then(doc => {
    rev = doc._rev
  }).catch(err => {
    if (err) {
      // if the document is not found, that's fine, that just means the user
      // has not been saved yet, so we should do that.
      if (err.message !== 'missing') {
        throw err
      }
    }
  }).then(() => {
    let doc = {
      _id: 'user',
      _rev: rev,
      user: user.toJSON()
    }
    return this.db.put(doc)
  })
}

DBUser.prototype.get = function () {
  return this.db.get('user').then(doc => {
    this.user = User().fromJSON(doc.user)
    return this.user
  })
}

module.exports = DBUser