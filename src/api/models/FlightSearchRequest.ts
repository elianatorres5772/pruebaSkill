export interface FlightSearchRequest {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children?: number;
    infants?: number;
}
