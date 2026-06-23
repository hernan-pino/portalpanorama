import { randomBytes, createHash } from 'node:crypto'
import { TokenGenerator } from '@application/ports/TokenGenerator'

export class CryptoTokenGenerator implements TokenGenerator {
  generate(): string {
    // 32 bytes ⇒ 256 bits de entropía, hex (64 chars). Inadivinable por fuerza bruta.
    return randomBytes(32).toString('hex')
  }

  hash(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex')
  }
}
