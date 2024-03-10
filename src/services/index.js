
import order from './Order/order';
import product from './product/product';
import user from './user/user';
export const services = (app) => {
  app.configure(user);
  app.configure(product);
  app.configure(order);
};