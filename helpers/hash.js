const sha1 = require('js-sha1')
const crypto = require('crypto')
const { BigInteger } = require('jsbn')

export function createVerifier (username, password, salt = null) {
  // https://gist.github.com/Treeston/db44f23503ae9f1542de31cb8d66781e
  const N = new BigInteger(
    '894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7',
    16
  )
  const g = new BigInteger('7', 16)
  salt = salt || generateSalt()

  // Calculate first hash
  const h1 = Buffer.from(
    sha1.arrayBuffer(`${username}:${password}`.toUpperCase())
  )

  // Calculate second hash
  const h2 = Buffer.from(sha1.arrayBuffer(Buffer.concat([salt, h1]))).reverse()

  // Convert to integer
  const h2bigint = new BigInteger(h2.toString('hex'), 16)

  // g^h2 mod N
  const verifierBigint = g.modPow(h2bigint, N)

  // Convert back to a buffer
  let verifier = Buffer.from(verifierBigint.toByteArray()).reverse()

  // Pad to 32 bytes
  verifier = verifier.slice(0, 32)
  if (verifier.length !== 32) {
    verifier = Buffer.concat([verifier], 32)
  }

  return verifier
}

export function generateSalt () {
  return crypto.randomBytes(32)
}
