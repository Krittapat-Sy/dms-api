import morgan from 'morgan';

morgan.token('reqid', (req: any) => req.id);

export const logger = morgan(':method :url :status - :response-time ms reqid=:reqid');
