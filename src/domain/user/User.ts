import { Email } from '@domain/shared/Email'
import { RUT } from '@domain/shared/RUT'
import { UserRole } from './UserRole'

export interface UserProps {
  readonly id: string
  readonly email: Email
  readonly name: string
  readonly role: UserRole
  readonly rut?: RUT
  readonly createdAt: Date
}

export class User {
  readonly id: string
  readonly email: Email
  readonly name: string
  readonly role: UserRole
  readonly rut?: RUT
  readonly createdAt: Date

  private constructor(props: UserProps) {
    this.id = props.id
    this.email = props.email
    this.name = props.name
    this.role = props.role
    this.rut = props.rut
    this.createdAt = props.createdAt
  }

  static create(props: UserProps): User {
    return new User(props)
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN
  }

  isBusinessOwner(): boolean {
    return this.role === UserRole.BUSINESS_OWNER
  }

  withRole(role: UserRole): User {
    return new User({
      id: this.id,
      email: this.email,
      name: this.name,
      role,
      rut: this.rut,
      createdAt: this.createdAt,
    })
  }

  withProfile(name: string, rut?: RUT): User {
    return new User({
      id: this.id,
      email: this.email,
      name,
      role: this.role,
      rut,
      createdAt: this.createdAt,
    })
  }
}
