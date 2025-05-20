export interface CreatePresentation {
  amount: number;
  unit_measurement_id: number;
}

export type UpdatePresentation = Partial<CreatePresentation>
