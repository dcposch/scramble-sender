var test = require('tape')
var sender = require('.')

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
        identityKey: storeB.getLocalIdentityKeyPair().public,
        preKeyId: 0,
        preKey: storeB.getLocalPreKeyPair(0).keyPair.public,
        signedPreKeyId: 1,
        signedPreKey: storeB.getLocalSignedPreKeyPair(1).keyPair.public,
        signedPreKeySignature: storeB.getLocalSignedPreKeyPair(1).signature
      }
      console.log(['preKeyBundleForB', preKeyBundleForB])

      console.log('Creating sessAtoB')
      axolA.createSessionFromPreKeyBundle(preKeyBundleForB).then(function (sessAtoB) {
        console.log('Encrypting message from A to B')
        return axolA.encryptMessage(sessAtoB, toBytes('magic letters'))
      }, function (err) {
        t.end('failed to create session')
      }).then(function (msg) {
        console.log('Encrypted! message:' + prettyPrint(msg, 1))
        console.log('B decrypting message')
        return axolB.decryptPreKeyWhisperMessage(null, msg.body)
      }, function (err) {
        t.end('failed to encrypt')
      }).then(function (msg) {
        console.log('Decrypted! message:' + prettyPrint(msg, 1))
        t.end()
      }, function (err) {
        t.end('failed to decrypt: ' + prettyPrint(err))
      })
    })
  })
})

function prettyPrint (obj, level) {
  if (typeof obj !== 'object' || obj === undefined || obj === null) {
    return '' + obj
  }
  if (obj instanceof ArrayBuffer) {
    return new Buffer(obj).toString('hex')
  }
  if (Array.isArray(obj) && obj.length === 0) {
    return '[]'
  }
  if (Object.keys(obj).length === 0) {
    return '{}'
  }

  var nextLevel = (level || 0) + 1
  var newline = '\n' + new Array(nextLevel).join('  ')
  // works for both objects and arrays
  var lines = Object.keys(obj).map(function (key) {
    return key + ': ' + prettyPrint(obj[key], nextLevel)
  })
  return newline + lines.join(newline)
}

function toBytes (str) {
  return new Uint8Array(new Buffer(str, 'utf8'))
}
