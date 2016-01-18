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

// Registers a new user. Produces the user's ID, public and private key, and prekey pairs.
// Calls back with a ready-to-use axolotl instance and underlying store.
function register (callback) {
  var identityKeyPair = null
  var registrationId = null
  var signedPreKeyPair = []
  var preKeyPairs = []
  var store = {
    getLocalIdentityKeyPair: function () { return identityKeyPair },
    getLocalRegistrationId: function () { return registrationId },
    getLocalSignedPreKeyPair: function (id) { return signedPreKeyPairs[id] },
    getLocalPreKeyPair: function (id) { return preKeyPairs[id] }
  }
  var axol = axolotl(store)
  axol.generateIdentityKeyPair().then(function (result) {
    identityKeyPair = result
    console.log('IdentityKeyPair: ' + keyPairToString(result))

    axol.generateRegistrationId().then(function (result) {
      registrationId = result
      console.log('RegistrationId: ' + result)

      axol.generateSignedPreKey(identityKeyPair, 1).then(function (result) {
        signedPreKeyPair[result.id] = result
        console.log('SignedKeyPair #' + result.id + ': ' + keyPairToString(result.keyPair))

        axol.generatePreKeys(0, 100).then(function (result) {
          preKeyPairs = result
          console.log('PreKeys:\n\t' + result.map(function (pair) {
            return 'PreKey #' + pair.id + ': ' + keyPairToString(pair.keyPair)
          }).join('\n\t'))

          axol.generateLastResortPreKey().then(function (result) {
            preKeyPairs[result.id] = result
            console.log('LastResortPreKey #' + result.id + ': ' + keyPairToString(result.keyPair))

            callback(axol, store)
          })
        })
      })
    })
  })
}

function keyPairToString (keyPair) {
  return ('(public ' + hex(keyPair.public)
    + ', private ' + hex(keyPair.private) + ')')
}

function hex (buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), function (x) {
    return (0x100 + x).toString(16).substring(1)
  }).join('')
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
