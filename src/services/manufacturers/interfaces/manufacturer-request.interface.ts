import type { Manufacturer } from './manufacturer-response.interface'

export type CreateManufacturer = Omit<
  Manufacturer,
  'id'
>

export type UpdateManufacturer = Partial<CreateManufacturer>
