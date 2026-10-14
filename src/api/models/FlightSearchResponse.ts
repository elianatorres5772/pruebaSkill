export interface FlightSearchResponse {
    content: {
        airshop: {
            key: string;
            itineraryShops: {
                items: Array<{
                    dateTimeDepart: { date: string };
                    locationDepart: { code: string };
                    locationArrive: { code: string };
                }>;
            };
            passengerTypes: {
                items: Array<{ code: string; count: number }>;
            };
            pointOfSale: {
                country: { code: string };
                currency: { code: string };
                language: { code: string };
            };
        };
        flightSegmentItineraries: {
            items: Array<{
                fareProducts: {
                    items: Array<{
                        code: string;
                        typeCode: string;
                        prices: {
                            items: Array<{
                                baseAmount: { value: number; currency: { code: string } };
                                totalAmount: { value: number; currency: { code: string } };
                            }>;
                        };
                    }>;
                };
                flights: {
                    items: Array<{
                        key: string;
                        airlineMarketing: { code: string };
                        flightNumber: string;
                        scheduledDepart: { date: string; time: string };
                        scheduledArrive: { date: string; time: string };
                        locationDepart: { code: string; cityName: string };
                        locationArrive: { code: string; cityName: string };
                        equipment: { code: string; description: string };
                        status: { code: string; description: string };
                    }>;
                };
                itinerary: { code: string; key: string };
            }>;
        };
    };
}
