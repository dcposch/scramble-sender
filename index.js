// Produces encrypted, signed, and anonymized email in the following format:
//
// From: anonymous@scramble.io
// To: <to email address>
// Subject: Encrypted Message
// Body:
// <base64 axlotl payload containing the plaintext from, subject, and body>
//
// Such mail is then sent thru a specialized mail server via Tor.
// (Specialized in that it  will only send mail in the exact format described.
//  An anonymous remailer that accepts arbitrary plaintext mail does not work
//  due to spam.)
//
// This allows people to email each other while protecting not just what is
// being said, but also who is talking to whom.
var axolotl = require('axolotl')

var NUM_PREKEYS = 5

// Registers a new user. Produces the user's ID, public and private key, and prekey pairs.
// Calls back with a ready-to-use axolotl instance and underlying store.
function register (callback) {
  var identityKeyPair = null
  var registrationId = null
  var signedPreKeyPairs = []
  var preKeyPairs = []
  var sessions = {}
  var store = {
    getLocalIdentityKeyPair: function () { return identityKeyPair },
    getLocalRegistrationId: function () { return registrationId },
    getLocalSignedPreKeyPair: function (id) { return signedPreKeyPairs[id] },
    getLocalPreKeyPair: function (id) { return preKeyPairs[id] },

    // the following are described in the libaxolotl-javascript README,
    // but are not actually used at all. weak.
    getRemotePreKeyBundle: function() { throw new Error('unimplemented') },
    isRemoteIdentityTrusted: function() { throw new Error('unimplemented') },
    hasSession: function (name) { return !!sessions[name] },
    getSession: function (name) { return sessions[name] },
    putSession: function(name, session) { sessions[name] = session } 
  }

  var axol = axolotl(store)

  axol.generateIdentityKeyPair().then(function (result) {
    identityKeyPair = result
    console.log('IdentityKeyPair: ' + keyPairToString(result))
    return axol.generateRegistrationId()
  }).then(function (result) {
    registrationId = result
    console.log('RegistrationId: ' + result)
    return axol.generatePreKeys(0, NUM_PREKEYS)
  }).then(function (result) {
    preKeyPairs = result
    console.log('PreKeys:\n\t' + result.map(function (pair) {
      return 'PreKey #' + pair.id + ': ' + keyPairToString(pair.keyPair)
    }).join('\n\t'))
    return axol.generateLastResortPreKey()
  }).then(function (result) {
    preKeyPairs[result.id] = result
    console.log('LastResortPreKey #' + result.id + ': ' + keyPairToString(result.keyPair))
    return axol.generateSignedPreKey(identityKeyPair, 1)
  }).then(function (result) {
    signedPreKeyPairs[result.id] = result
    console.log('SignedKeyPair #' + result.id + ': ' + keyPairToString(result.keyPair) +
     '\n\tsignature: ' + new Buffer(result.signature).toString('hex'))
    callback(axol, store)
  })
}

function keyPairToString (keyPair) {
  return ('(public ' + new Buffer(keyPair.public).toString('hex') +
    ', private ' + new Buffer(keyPair.private).toString('hex') + ')')
}

// Produces an encrypted, signed, base64-encoded Axlotl message containing
// both header information (from, to, subject) and the body of an email.
function encrypt (to, from, subject, body, keys) {
  throw new Error('unimplemented')
}

function decrypt (body) {
  throw new Error('unimplemented')
}

module.exports = {
  register: register,
  encrypt: encrypt,
  decrypt: decrypt
}
