import { auth, checkRole } from '../middlewares';
import { deleteUser, getAll, getOne, login, logout, me, register, updateOwn } from './user.entity';
export default function user() {

  /**
  * POST /user
  * @description this route is used to create a user.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/user', register(this));

  /**
  * POST /user/login
  * @description this route is used to login a user.
  * @response {Object} 200 - the user.
  */
  this.route.post('/user/login', login(this));

  /**
  * GET /user/me
  * @description this route is used to get user profile.
  * @response {Object} 200 - the user.
  */
  this.route.get('/user/me', auth, me(this));

  /**
  * POST /user/logout
  * @description this route is used to logout a user.
  * @response {Object} 200 - the user.
  */
  this.route.post('/user/logout', auth, logout(this));


  /**
  * GET /user
  * @description this route is used to used get all user.
  * @response {Object} 200 - the users.
  */
  this.route.get('/user', auth, getAll(this));


  /**
* GET /user/:id
* @description this route is used to used get one user.
* @response {Object} 200 - the users.
*/
  this.route.get('/user/:id', auth, getOne(this));

  /**
  * PATCH ‘/user/me’
  * @description this route is used to update own profile.
  * @response {Object} 200 - the user.
  */
  this.route.patch('/user/me', auth, updateOwn(this));


  /**
  * DELETE ‘/user/:id’
  * @description this route is used to delete user profile.
  * @response {Object} 200 - the user.
  */
  this.route.delete('/user/:id', auth, checkRole(['admin']), deleteUser(this));
}