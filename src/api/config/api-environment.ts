export const API_BASE_URL = process.env.API_BASE_URL ?? 'https://www.arajet.com';

export const API_DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    language: 'ES',
    'x-currency': 'USD',
    'x-point-of-sale': 'US',
} as const;
