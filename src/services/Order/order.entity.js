import Order from './order.schema';
import Product from '../product/product.schema';

const createAllowed = new Set(['items']);
const allowedQuery = new Set(['totalAmount', 'customer', 'status', 'paginate']);
const updateAllowed = new Set(['title', 'category', 'purchasePrice', 'salePrice', 'image']);

/* this is the default populate object for order */
const populate = {
  path: 'customer items.item',
  strictPopulate: false,
  select:"name email username phone avatar role title category purchasePrice salePrice currentStock image"
}

export const create = ({ db }) => async (req, res) => {
  try {
    const valid = Object.keys(req.body).every(k => createAllowed.has(k));
    if (!valid) return res.status(400).send({ status: 400, reason: 'Bad request' });
    if (typeof req.body.items !== 'object') return res.status(400).send('Bad request');
    const ids = Object.keys(req.body.items);
    if (ids.length <= 0) return res.status(400).send('Bad request');
    const prods = await db.find({ table: Product, key: { _id: { $in: ids }, paginate:false } });

    if (prods.length <= 0) return res.status(400).send('Invalid request');
    const orderItems = prods.map((ech) => {
      // checking the stock after reducing the current order quantity. if positive then ok to order, or return null
      if (req.body.items[ech.id] <= ech.currentStock) {
        return {
          item: ech.id,
          quantity: req.body.items[ech.id],
          itemTotal: req.body.items[ech.id] * ech.salePrice
        }
      } else return null;
    });
    // make failed the oreder request if any items has null status after checking the stock
    if (orderItems.includes(null)) return res.status(500).send('Something went wrong');

    const order = await db.create({ table: Order, key: { items: orderItems, customer: req.user.id, totalAmount: orderItems.reduce((acc, curr) => acc + curr.itemTotal, 0) } });

    // reducing the currentstock after order
    await Promise.all(prods.map(prod => {
      prod.currentStock = prod.currentStock - req.body.items[prod.id] ;
      return db.save(prod);
    }));
    const populated = await db.populate(order, populate);
    return res.status(200).send(populated);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send('Something went wrong');
  }
};

export const getOrders = ({ db }) => async (req, res) => {
  try {
    const paginate = req.query.paginate === 'false' ? false : true;
    delete req.query.paginate;
    const orders = await db.find({ table: Order,  key: { query: req.query, allowedQuery: allowedQuery, paginate: paginate, populate } });
    return res.status(200).send(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).send('Something went wrong');
  }
};

export const getOrderById = ({ db }) => async (req, res) => {
  try {
    const order = await db.findOne({ table: Order, key: { id: req.params.id, populate } });
    if (!order) return res.status(404).send({ error: 'Order not found' });
    return res.status(200).send(order);
  } catch (error) {
    console.error('Error getting order by ID:', error);
    res.status(500).send('Something went wrong');
  }
};

export const updateOrderStatus = ({ db }) => async (req, res) => {
  try {
    const { status } = req.body;

    const order = await db.findOne({ table: Order, key: { id: req.params.id } });

    if (!order)  return res.status(404).send({ error: 'Order not found' });

    order.status = status;
    await db.save(order);
    return res.status(200).send(order);

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).send('Something went wrong');
  }
};

export const deleteOrder = ({ db }) => async (req, res) => {
  try {
    const order = await db.remove({ table: Order, key: { id: req.params.id, populate   } });
    if (!order) return res.status(404).send({ error: 'Order not found' });
    // add stock if the order under processing or pending
    if (['pending', 'processing'].includes(order.status)) {
      await Promise.all(order.items.map(async (each) => {
        const prod = await db.findOne({ table: Product, key: { id: each.item._id } });
        prod.currentStock = prod.currentStock + each.quantity;
        db.save(prod);
      }));
    }
    return res.status(200).send(order);
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).send('Something went wrong');
  }
};
