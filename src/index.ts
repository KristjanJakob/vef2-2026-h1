import 'dotenv/config';
import { createApp } from './app';

const app = createApp();

const port = Number(process.env.PORT) || 3000;
const host = '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`);
});