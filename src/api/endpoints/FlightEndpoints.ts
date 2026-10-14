export const FlightEndpoints = {
    routes: '/pss/routes',
    calendar: '/pss/v3/calendar',
    airshop: '/pss/shop/airshop',
    seatmaps: (token: string) => `/pss/shop/seatmaps/${token}`,
    merchandise: (token: string) => `/pss/shop/merchandise/${token}`,
    bundle: (bundleId: string) => `/pss/shop/bundle/${bundleId}`,
    flights: '/pss/shop/flights',
    travelers: (token: string) => `/pss/shop/travelers/${token}`,
} as const;
