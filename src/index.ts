import 'dotenv/config';
import { createApp } from './app';

const app = createApp();

const port = Number(process.env.PORT ?? 3000);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});