import { Email } from '@domain/shared/Email'
import { UserRole } from './UserRole'

export interface UserProps {
  readonly id: string
  readonly email: Email
  readonly name: string
  readonly role: UserRole
  // Preferencia opcional (C.3-bis): sube su comuna primero, transparente/desactivable.
  readonly homeCommuneId?: string
  readonly createdAt: Date
}

export class User {
  readonly id: string
  readonly email: Email
  readonly name: string
  readonly role: UserRole
  readonly homeCommuneId?: string
  readonly createdAt: Date

  private constructor(props: UserProps) {
    this.id = props.id
    this.email = props.email
    this.name = props.name
    this.role = props.role
    this.homeCommuneId = props.homeCommuneId
    this.createdAt = props.createdAt
  }

  static create(props: UserProps): User {
    return new User(props)
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN
  }

  withProfile(name: string, homeCommuneId?: string): User {
    return new User({ ...this.toProps(), name, homeCommuneId })
  }

  private toProps(): UserProps {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      homeCommuneId: this.homeCommuneId,
      createdAt: this.createdAt,
    }
  }
}
