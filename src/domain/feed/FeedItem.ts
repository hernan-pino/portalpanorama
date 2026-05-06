import { FeedItemType } from './FeedItemType'

export interface FeedItemProps {
  readonly id: string
  readonly userId: string
  readonly listingId: string
  readonly type: FeedItemType
  readonly payload?: Record<string, unknown>
  readonly read: boolean
  readonly createdAt: Date
}

export class FeedItem {
  readonly id: string
  readonly userId: string
  readonly listingId: string
  readonly type: FeedItemType
  readonly payload?: Record<string, unknown>
  readonly read: boolean
  readonly createdAt: Date

  private constructor(props: FeedItemProps) {
    this.id = props.id
    this.userId = props.userId
    this.listingId = props.listingId
    this.type = props.type
    this.payload = props.payload
    this.read = props.read
    this.createdAt = props.createdAt
  }

  static create(props: FeedItemProps): FeedItem {
    return new FeedItem(props)
  }

  markAsRead(): FeedItem {
    return new FeedItem({
      id: this.id,
      userId: this.userId,
      listingId: this.listingId,
      type: this.type,
      payload: this.payload,
      read: true,
      createdAt: this.createdAt,
    })
  }
}
