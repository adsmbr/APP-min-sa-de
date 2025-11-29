/**
 * Sistema de logging configurável para desenvolvimento e produção
 */

const isDevelopment = import.meta.env.MODE === 'development';
const level = (import.meta.env.VITE_LOG_LEVEL || (isDevelopment ? 'debug' : 'error')).toLowerCase();
const order = { error: 0, warn: 1, info: 2, debug: 3, log: 4 };
const allow = (l) => order[l] <= order[level];

export const logger = {
  log: (...args) => {
    if (allow('log')) console.log(...args);
  },
  
  error: (...args) => {
    if (allow('error')) console.error(...args);
  },
  
  warn: (...args) => {
    if (allow('warn')) console.warn(...args);
  },
  
  debug: (...args) => {
    if (allow('debug')) console.debug(...args);
  },
  
  info: (...args) => {
    if (allow('info')) console.info(...args);
  }
};

export default logger;