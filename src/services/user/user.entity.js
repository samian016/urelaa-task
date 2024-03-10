import User from './user.schema';
import fs from 'fs';
/**
 * these are the array to validate the request.
 */
const createAllowed = new Set(['name', 'email', 'password', 'username']);
const allowedQuery = new Set(['name', 'username', 'page', 'limit', 'id']);
const userUpdateAllowed = new Set([
  'name', 'username', 'phone', 'password', 'avatar', 'active'
]);

/* this is the default populate object for user */
const populate = {
  path: '',
  strictPopulate: false
}


/**
 * This function is used for creating user.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const register = ({ db, ws }) => async (req, res) => {
  try {
    const valid = Object.keys(req.body).every(k => createAllowed.has(k));
    if (!valid) return res.status(400).send({ status: 400, reason: 'Bad request' });
    const fUser = await db.findOne({ table: User, key: { email: req.body.email } });
    if (fUser) return res.status(400).send('Already registered');
    const user = await db.create({ table: User, key: req.body, populate: populate });
    return res.status(200).send(user);
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};

/**
 * This function is used for login a user.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const login = ({ db }) => async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) return res.status(400).send('Bad requests');
    const user = await db.findOne({ table: User, key: { email: req.body.email, populate: { path: 'role' } } });
    if (!user) return res.status(401).send('Incorrect email or password');
    const isValid = await user.checkPassword(req.body.password);
    if (!isValid) return res.status(401).send('Incorrect email or password');
    const token = await user.generateToken();
    res.cookie(process.env.COOKIE_KEY, token, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      ...req.body.rememberMe && { expires: new Date(Date.now() + 172800000/*2 days*/) },
    });
    res.status(200).send(user);
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};


/**
 * This function is used for load a user profile from request header.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const me = ({ db }) => async (req, res) => {
  try {
    const user = await db.populate(req.user, populate);
    return res.status(200).send(user);
  }
  catch (err) {
    console.log(err);
    return res.status(500).send('Something went wrong');
  }
};



/**
 * This function is used for logout a user.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const logout = ({ db }) => async (req, res) => {
  try {
    const user = await db.findOne({ table: User, key: { id: req.user.id } });
    if (!user) return res.status(401).send('Bad request!');
    await db.save(user);
    res.clearCookie(process.env.COOKIE_KEY, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      expires: new Date(Date.now())
    });
    return res.status(200).send('Logout successful');
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};


/**
 * This function is used get one users in the database by query.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns a object, that contains resulted data and other information like page, limit.
 */
export const getOne = ({ db }) => async (req, res) => {
  try {
    const user = await db.findOne({ table: User, key: { id: req.params.id } });
    if (!user) return res.status(404).send('user not found');
    return res.status(200).send(user);
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};


/**
 * This function is used get all users in the database by query.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns a object, that contains resulted data and other information like page, limit.
 */
export const getAll = ({ db }) => async (req, res) => {
  try {
    const paginate = req.query.paginate === 'false' ? false : true;
    delete req.query.paginate;
    const users = await db.find({ table: User, key: { query: req.query, allowedQuery: allowedQuery, paginate: paginate } });
    res.status(200).send(users);
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};


/**
 * This function is used to update user own profile.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the updated data.
 */
export const updateOwn = ({ db, imageUp }) => async (req, res) => {
  try {
    if (req.files?.avatar?.path) {
      req.body = JSON.parse(req.body.data);
      req.body.avatar = await imageUp(req.files?.avatar.path)
    };
    const isValid = Object.keys(req.body).every(k => userUpdateAllowed.has(k));
    if (!isValid) return res.status(400).send('Bad request');
    Object.keys(req.body).forEach(k => (req.user[k] = req.body[k]));
    await db.save(req.user);
    const user = await db.populate(req.user, populate);
    return res.status(200).send(user);
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};


/**
 * This function is used delete an user with avatar by id.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the deleted data .
 */
export const deleteUser = ({ db }) => async (req, res) => {
  try {
    const deleteUser = await db.remove({ table: User, key: { id: req.params.id } });
    if (!deleteUser) return res.status(404).send('User not found');
    if (deleteUser?.avatar) {
      fs.unlink(deleteUser?.avatar, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
    return res.status(200).send(deleteUser);
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};
