var test = require('tape')
var sender = require('.')
var prettyPrint = require('./prettyPrint')

test('foo', function (t) {
  t.equal('foo', 'foo')
  t.end()
})

test('bar', function (t) {
  t.equal('bar', 'bar')
  t.end()
})

test('register', function (t) {
  sender.register(function (axol, store) {
    console.log('Generated registration info')
    t.end()
  })
})

test('communicate', function (t) {
  sender.register(function (axolA, storeA) {
    console.log('Generated registration info A')
    sender.register(function (axolB, storeB) {
      console.log('Generated registration info B')

      console.log('\n\nA to B: hello world')
      var preKeyBundleForB = {
        registrationId: storeB.getLocalRegistrationId(),
        identityKey: storeB.getLocalIdentityKeyPair().public,
        preKeyId: null, // 0,
        preKey: null, // storeB.getLocalPreKeyPair(0).keyPair.public,
        signedPreKeyId: 1,
        signedPreKey: storeB.getLocalSignedPreKeyPair(1).keyPair.public,
        signedPreKeySignature: storeB.getLocalSignedPreKeyPair(1).signature
      }

      console.log('Creating sessAtoB')
      var sessAtoB = null
      axolA.createSessionFromPreKeyBundle(preKeyBundleForB).then(function (result) {
        console.log('Encrypting message from A to B')
        sessAtoB = result
        return axolA.encryptMessage(sessAtoB, new Buffer('magic letters'))
      }, function (err) {
        t.end('failed to create session')
      }).then(function (msg) {
        console.log('Encrypted! message:' + prettyPrint(msg.body))
        return axolB.decryptPreKeyWhisperMessage(undefined, msg.body)
      }, function (err) {
        t.end('failed to encrypt')
      }).then(function (msg) {
        console.log('Decrypted! message:' + prettyPrint(msg, 1))
        t.end()
      }, function (err) {
        t.end('failed to decrypt: ' + err)
      })
    })
  })
})
