import { Task } from '@serenity-js/core';
import { PostRequest, Send } from '@serenity-js/rest';
import { FlightEndpoints } from '../endpoints/FlightEndpoints.js';
import type { FlightSearchRequest } from '../models/FlightSearchRequest.js';

export class SearchFlights {
    static withCriteria(criteria: FlightSearchRequest): Task {
        return Task.where(`#actor searches flights from ${criteria.origin} to ${criteria.destination}`,
            Send.a(PostRequest.to(FlightEndpoints.airshop).with({
                passengerTypes: {
                    items: [{ code: 'ADT', count: criteria.adults }],
                },
                itineraryShops: {
                    items: [
                        {
                            dateTimeDepart: { date: criteria.departureDate },
                            locationDepart: { code: criteria.origin },
                            locationArrive: { code: criteria.destination },
                        },
                        ...(criteria.returnDate
                            ? [{
                                dateTimeDepart: { date: criteria.returnDate },
                                locationDepart: { code: criteria.destination },
                                locationArrive: { code: criteria.origin },
                            }]
                            : []),
                    ],
                },
                attributeItems: {
                    items: [{ typeCode: 'language', code: 'ES' }],
                },
            })),
        );
    }
}
