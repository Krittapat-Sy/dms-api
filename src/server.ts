import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();
app.listen(env.PORT, () => {
    console.log(`DMS API v1 listening on http://localhost:${env.PORT}`);
});
