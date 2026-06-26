// this will be password hasing utility :
import bcrypt from 'bcrypt';
import { ApiError } from './ApiError';
const saltRounds = 12;
async function hashpassword(password) {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    }
    catch (error) {
        console.log(` ${error} occurs during hasing password `);
    }
}
// console.log(hashpassword('PPAPAP').then((DATA)=> console.log(DATA)))
async function comparedPassword(password, hashedPassword) {
    try {
        const comparedPassword = await bcrypt.compare(password, hashedPassword);
        return comparedPassword;
    }
    catch (error) {
        console.log(` ${error} occurs during comparing  password `);
        if (error instanceof Error) {
            throw new ApiError(500, error.message);
        }
        throw new ApiError(500, 'Unknown error during password comparison');
    }
}
export { hashpassword, comparedPassword };
//# sourceMappingURL=passworHash.js.map