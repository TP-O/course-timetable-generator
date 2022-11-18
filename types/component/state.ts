export type LazyData<T> = {
  show: T[]
  hide: T[]
}

export type Order = 'asc' | 'desc'

export type Sorting<K> = {
  by: K
  direction: Order
}
