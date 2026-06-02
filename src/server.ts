import 'dotenv/config';
import app from "./app";
import { ConnectionTODB } from './config/db'
import { DB_NAME } from './constant'
import dotenv from 'dotenv';
dotenv.config({
  'path': './.env',
  'override': true
});
// { override: true }

const PORT = process.env.PORT || 3000;

ConnectionTODB().then(() => { console.log(`${DB_NAME} connected successfully `) }).catch((err: string | 'something occurs in connecting ' | 'error in ConnectionTODB ' = 'ERROR') => {
  console.error(`Error connecting ${DB_NAME}:`,);
  // process.exit(1);
});
 
app.listen(PORT, () => { console.log(`Server running on port:${PORT}`); });
