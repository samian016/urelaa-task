import { auth, checkRole } from '../middlewares';
import { create, deleteOrder, getOrderById, getOrders, updateOrderStatus } from './order.entity';
export default function order() {

  /**
    * POST /order
    * @description this route is used to create a order.
    * @response {Object} 200 - the new order.
    */
  this.route.post('/order', auth, create(this));

  /**
    * GET /order
    * @description this route is used to get all orders.
    * @response {Object} 200 - the orders.
    */
  this.route.get('/order', auth, checkRole(['admin']), getOrders(this));

  /**
    * GET /order/:id
    * @description this route is used to get one orders.
    * @response {Object} 200 - the order.
    */
  this.route.get('/order/:id', auth, getOrderById(this));


  /**
    * DELETE /order/:id
    * @description this route is used to delete order by id.
    * @response {Object} 200 - the order.
    */
  this.route.delete('/order/:id', auth, checkRole(['admin']), deleteOrder(this));

  /**
    * PATCH /order/:id
    * @description this route is used to change status of a order by id.
    * @response {Object} 200 - the order.
    */
  this.route.patch('/order/:id', auth, checkRole(['admin']), updateOrderStatus(this));
}