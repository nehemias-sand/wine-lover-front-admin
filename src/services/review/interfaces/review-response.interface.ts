export interface ReviewResponse {
  data: Review
}

export interface CommentResponse {
  data: Comment
}

export interface Review {
  id: number
  title: string
  content: string
  cover_image: string
  comments_available: boolean
  username: string
  comments: Comment
}

export interface Comment {
  id: number
  content: string
  banned: boolean
  parent: string
  review: string
  by: string
}
