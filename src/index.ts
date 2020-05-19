import { checkToken } from "./middleware";

export {};
const dotenv = require('dotenv');
dotenv.config();

const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const port = 3000 || process.env.PORT

const setController = require('./product_set/set_controller')
const productsRouter = require('./product_set/products_controller');
const userRouter = require('./auth/user_controller');
const orderController = require('./sales/order_controller');

app.use(cors());
//app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//app.use(authMiddleWare);

app.get('/', (req, res) => res.send('bcl v1'))

app.use('/users', userRouter)

//app.use(checkToken);

app.use('/products', productsRouter);
app.use('/sets', setController)
app.use('/orders', orderController)

app.listen(port, () => console.log(`BCL listening at http://localhost:${port}`))