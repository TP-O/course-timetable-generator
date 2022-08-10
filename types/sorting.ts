export type Order = 'asc' | 'desc'

export type Sorting<K> = {
  by: K
  direction: Order
}
