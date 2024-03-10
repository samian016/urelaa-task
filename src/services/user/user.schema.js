import { Schema, model } from 'mongoose';
const jwt = require('jsonwebtoken');
const bCrypt = require('bcrypt');
const paginate = require('mongoose-paginate-v2');


const schema = new Schema({
  username: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
  },
  role: {
    type: String,
    required: true,
    default: 'customer',
    enum: ['admin', 'customer']
  },
}, { timestamps: true });

/* this method is used to generate web token to authenticate  */
schema.methods.generateToken = async function () {
  const token = jwt.sign({ id: this.id.toString() }, process.env.SECRET);
  return token;
};

/* this pre method generates a hashed password for user password*/
schema.pre('save', async function (next) {
  try {
    const user = this;
    if (!user.isModified('password')) return next();
    const salt = await bCrypt.genSalt(10);
    const hash = await bCrypt.hash(user.password, salt);
    user.password = hash;
    next();
  } catch (e) {
    throw new Error(e.message);
  }
});

/* this pre method compares password when someone wants to login using a user name and password*/
schema.methods.checkPassword = async function (submittedPass) {
  return await bCrypt.compare(submittedPass, this.password);
};
schema.plugin(paginate);
schema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.__v;
  delete userObject.createdAt;
  delete userObject.updatedAt;
  delete userObject.password;
  return JSON.parse(JSON.stringify(userObject).replace(/_id/g, 'id'));
};

export default model('User', schema);