import express from "express"
import cors from "cors"
import session from "express-session"
import dotenv from "dotenv"
import db from "./config/database.js"
import SequelizeStore from 'connect-session-sequelize'
import UsersRoute from "./routes/user_route.js"
import ProductsRoute from "./routes/product_route.js"
import AuthRoute from "./routes/auth_route.js"
import KTPRoute from "./routes/ktp_route.js"

dotenv.config();

const app = express();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
    db: db
})

// Database Synchronize with Sequelize
const synchornize = async ()=>{
    try {
        await db.authenticate();
        console.log('Database connected...');

        // Automatically sync all models with the database
        await db.sync({ alter: true });  // Use { alter: true } for updating existing tables
        console.log('Database synced...');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
// Uncomment to synchronize
// synchornize();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized: true,
    store: store,
    cookie:{
        secure: 'auto'
    }
}))

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))

app.use(express.json())

// Router Part

app.use(UsersRoute);
app.use(ProductsRoute);
app.use(AuthRoute);
app.use(KTPRoute);

// store.sync()    

app.listen(process.env.APP_PORT,()=>{
    console.log('Server running on PORT:',process.env.APP_PORT)
})