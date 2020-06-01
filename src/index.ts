import { checkToken } from "./middleware";

export {};
const dotenv = require('dotenv');
dotenv.config();

const express = require('express')
const cors = require('cors')
const path = require('path')
const app = express()
const bodyParser = require('body-parser')
const port = 3000 || process.env.PORT

const setController = require('./product_set/set_controller')
const productsRouter = require('./product_set/products_controller');
const userRouter = require('./auth/user_controller');
const orderController = require('./sales/order_controller');
const customerController = require('./sales/customer_controller')
const salesmanController = require('./sales/salesman_controller')

app.use(cors());
//app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('client'))

//app.use(authMiddleWare);

app.get('/', (req, res) => res.sendFile(path.join(__dirname + "/client/index.html")))

app.use('/users', userRouter)

app.use(checkToken);

app.use('/products', productsRouter);
app.use('/sets', setController)
app.use('/orders', orderController)
app.use('/customers', customerController);
app.use('/salesman', salesmanController)

app.listen(port, () => console.log(`BCL listening at http://localhost:${port}`))