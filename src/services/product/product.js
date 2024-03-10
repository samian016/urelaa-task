import { auth, checkRole } from '../middlewares';
import { create, getAll, getOne, remove, update } from './product.entity';
export default function product() {

  /**
    * POST /product
    * @description this route is used to create a product.
    * @response {Object} 200 - the new product.
    */
  this.route.post('/product', auth, checkRole(['admin']), create(this));

  /**
    * GET /product
    * @description this route is used to get all products.
    * @response {Object} 200 - the  products.
    */
  this.route.get('/product', auth, getAll(this));

  /**
    * GET /product/:id
    * @description this route is used to get a product.
    * @response {Object} 200 - the  product.
    */
  this.route.get('/product/:id', auth, getOne(this));

  /**
   * PATCH /product/:id
   * @description this route is used to update a product.
   * @response {Object} 200 - the  product.
   */
  this.route.patch('/product/:id', auth, checkRole(['admin']), update(this));

  /**
 * DELETE /product/:id
 * @description this route is used to remove a product.
 * @response {Object} 200 - the product.
 */
  this.route.delete('/product/:id', auth, checkRole(['admin']), remove(this));
}