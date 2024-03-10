import jwt from 'jsonwebtoken';
import * as operations from '../controllers/operations';
import User from '../services/user/user.schema';
import settings from '../../settings.json';
import crypto from 'crypto-js';

/**
 * This function is used for decoding auth token.
 * @param {String} token The token to decode.
 * @returns returns the decoded user found in database.
 */
export default async function decodeAuthToken(token) {
  try {
    const decoded = jwt.verify(token, settings.secret);
    const user = await operations.findOne({ table: User, key: { id: decoded.id } });
    if (!user) throw new Error('user not found');
    // await operations.populate(user, { path: "store" });
    delete user?.password;
    return user;
  }
  catch (e) {
    console.log(e);
  }
}

/**
 * This function is used for encrypt auth token when user forgot password.
 * @data - data is payload of secret data.
 * @returns - returns the encrpted token.
 */
export const encryptToken = async (data) => {
  try {
    const token = crypto.AES.encrypt(JSON.stringify(data), settings.secret).toString();
    return token;
  } catch (error) {
    console.log(error);
    throw new Error('Something went wrong');
  }
};

/**
 * This function is used for decrypt data from token.
 * @token - previously generate encrpted data.
 * @returns decrypt token and return this data.
 */
export const decryptToken = (token) => {
  try {
    let data = crypto.AES.decrypt(token, settings.secret).toString(
      crypto.enc.Utf8
    );
    data = JSON.parse(data);
    return data;
  } catch (error) {
    console.log(error);
    throw new Error('Something went wrong');
  }
};