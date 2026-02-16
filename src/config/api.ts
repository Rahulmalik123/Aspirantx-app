/**
 * API Configuration
 * 
 * Re-exports API configuration from constants/config.ts
 * Use APP_CONFIG.API_BASE_URL for the base URL
 * 
 * @example
 * import { API_URL, APP_CONFIG } from './config/api';
 * 
 * Note: All API services automatically use this via src/api/client.ts
 * You should NOT need to use this directly in most cases.
 */

import { APP_CONFIG } from '../constants/config';

export const API_URL = APP_CONFIG.API_BASE_URL;
export const SOCKET_URL = APP_CONFIG.SOCKET_URL;
export const API_TIMEOUT = APP_CONFIG.API_TIMEOUT;

export { APP_CONFIG };
