const axolotl = require('axolotl')
const co = require('co')
const prettyPrint = require('./prettyPrint')

var aliceSession
var bobSession

var aliceIdentityKeyPair
var aliceSignedPreKeyPair
var bobIdentityKeyPair
var bobSignedPreKeyPair
var bobOneTimePreKeyPair

var alicePreKeyBundle
var bobPreKeyBundle

var aliceStore
var bobStore

var aliceAxolotl
var bobAxolotl

function* init () {
  aliceStore = {
    getLocalIdentityKeyPair: function() { return aliceIdentityKeyPair },
    getLocalRegistrationId: function() { return 666 },
    getLocalSignedPreKeyPair: function(id) { return id === 6 ? aliceSignedPreKeyPair : null },
    getLocalPreKeyPair: function(id) { return null }
  }

  bobStore = {
    getLocalIdentityKeyPair: function() { return bobIdentityKeyPair },
    getLocalRegistrationId: function() { return 3 },
    getLocalSignedPreKeyPair: function(id) { return id === 5 ? bobSignedPreKeyPair : null },
    getLocalPreKeyPair: function(id) { return id === 31337 ? bobOneTimePreKeyPair : null }
  }

  aliceAxolotl = axolotl(aliceStore)
  bobAxolotl = axolotl(bobStore)

  aliceSession = {}
  bobSession = {}

  aliceIdentityKeyPair = yield bobAxolotl.generateIdentityKeyPair()
  aliceSignedPreKeyPair = yield bobAxolotl.generateIdentityKeyPair()
  bobIdentityKeyPair = yield bobAxolotl.generateIdentityKeyPair()
  bobOneTimePreKeyPair = yield bobAxolotl.generateIdentityKeyPair()
  var bobSignedPreKey = yield bobAxolotl.generateSignedPreKey(bobIdentityKeyPair, 5)
  bobSignedPreKeyPair = bobSignedPreKey.keyPair

  alicePreKeyBundle = {
    registrationId: 666,
    preKey: null,
    preKeyId: null,
    signedPreKey: aliceSignedPreKeyPair.public,
    signedPreKeyId: 6,
    signedPreKeySignature: null,
    identityKey: aliceIdentityKeyPair.public
  }

  bobPreKeyBundle = {
    registrationId: 3,
    preKey: null,
    preKeyId: null,
    signedPreKey: bobSignedPreKeyPair.public,
    signedPreKeyId: 5,
    signedPreKeySignature: bobSignedPreKey.signature, 
    identityKey: bobIdentityKeyPair.public
  }
}

function* test() {
  var plaintext = new Buffer('hello world')
  console.log('STARTING')
  var aliceInitialSession = yield aliceAxolotl.createSessionFromPreKeyBundle(bobPreKeyBundle)
  console.log('CREATED SESSION')
  var encryptionResult = yield aliceAxolotl.encryptMessage(aliceInitialSession, plaintext)
  console.log('ALICE ENCRYPTED MESSAGE')
  var decryptionResult = yield bobAxolotl.decryptPreKeyWhisperMessage(null, encryptionResult.body)
  console.log('BOB DECRYPTED MESSAGE')
  
  console.log('Decrypted registrationId: ' + decryptionResult.registrationId)
  console.log('Decrypted message: ' + new Buffer(decryptionResult.message).toString())
}

console.log('HELLO')
co.wrap(function* (){
  console.log('WELCOME')
  yield* init()
  yield* test()
})().then(function() {
  console.log('GREAT SUCCESS')
}).catch(function(err) {
  console.error(err)
})
