export interface CreateReview {
  title: string
  content: string
  cover_image: File
}

export type UpdateReview = Partial<CreateReview>
