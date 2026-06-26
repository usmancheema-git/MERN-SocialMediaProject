import 'dotenv/config';
import app from "./app.js";
import { ConnectionTODB } from './config/db.js';
import { DB_NAME } from './constant.js';
const PORT = process.env.PORT || 3000;
ConnectionTODB()
    .then(() => {
    console.log(`${DB_NAME} connected successfully`);
    app.listen(PORT, () => {
        console.log(`Server running on port:${PORT}`);
    });
})
    .catch((err) => {
    console.error(`Error connecting ${DB_NAME}:`, err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map