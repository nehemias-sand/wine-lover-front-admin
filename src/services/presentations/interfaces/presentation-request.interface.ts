import type { Presentation } from './presentation-response.interface'

export type CreatePresentation = Omit<
  Presentation,
  'id'
>

export type UpdatePresentation = Partial<CreatePresentation>
