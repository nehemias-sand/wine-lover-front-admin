export interface ManufacturerResponse {
    data: Manufacturer;
}

export interface Manufacturer {
    id: number,
    name: string;
    city: string;
    country: string;
    description: string;
}
