export interface PresentationResponse {
  data: Presentation
}

export interface Presentation {
  id: number
  amount: number
  unit_measurement: UnitMeasurement
}

interface UnitMeasurement {
  id: number
  name: string
  abbreviation: string
}
