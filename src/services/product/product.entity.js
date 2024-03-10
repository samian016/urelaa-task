import Product from './product.schema';
const createAllowed = new Set(['title', 'category', 'purchasePrice', 'salePrice', 'currentStock', 'image']);
const allowedQuery = new Set(['title', 'category', 'purchasePrice', 'salePrice', 'paginate']);
const updateAllowed = new Set([ 'title', 'category', 'purchasePrice', 'salePrice', 'image']);

/* this is the default populate object for Product */
const populate = {
  path: '',
  strictPopulate: false
}

/**
 * This function is used to create an item with image or without image.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the deleted data .
 */
export const create = ({ db }) => async (req, res) => {
  try {
    if (req.files?.image?.path) {
      req.body = JSON.parse(req.body.data);
      req.body.image = await imageUp(req.files.image.path)
    }
    const valid = Object.keys(req.body).every(k => createAllowed.has(k));
    if (!valid) return res.status(400).send({ status: 400, reason: 'Bad request' });
    const isExist = await db.findOne({ table: Product, key: { title: req.body.title } });
    if (isExist) return res.status(400).send('Already Exist');
    const product = await db.create({ table: Product, key: req.body, populate: populate });
    return res.status(200).send(product);
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};


/**
 * This function is used get one item in the database .
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns a object, that contains resulted data and other information like page, limit.
 */
export const getOne = ({ db }) => async (req, res) => {
  try {
    const product = await db.findOne({ table: Product, key: { id: req.params.id } });
    if (!product) return res.status(404).send('item not found');
    return res.status(200).send(product);
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};


/**
 * This function is used get all item in the database by query.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns a object, that contains resulted data and other information like page, limit.
 */
export const getAll = ({ db }) => async (req, res) => {
  try {
    const paginate = req.query.paginate === 'false' ? false : true;
    delete req.query.paginate;
    const products = await db.find({ table: Product, key: { query: req.query, allowedQuery: allowedQuery, paginate: paginate } });
    res.status(200).send(products);
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
export const update = ({ db, imageUp }) => async (req, res) => {
  try {
    const product = await db.findOne({ table: Product, key: { id: req.params.id } });
    if (!product) return res.status(404).send('Product not found');
    if (req.files?.image?.path) {
      req.body = JSON.parse(req.body.data);
      req.body.avatar = await imageUp(req.files?.image.path)
    };
    const isValid = Object.keys(req.body).every(k => updateAllowed.has(k));
    if (!isValid) return res.status(400).send('Bad request');
    Object.keys(req.body).forEach(k => (product[k] = req.body[k]));
    await db.save(product);
    return res.status(200).send(product);
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};



/**
 * This function is used delete an product with image by id.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the deleted data .
 */
export const remove = ({ db }) => async (req, res) => {
  try {
    const product = await db.remove({ table: Product, key: { id: req.params.id } });
    if (!product) return res.status(404).send('Product not found');
    if (product?.image) {
      fs.unlink(product.image, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
    return res.status(200).send(product);
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};
