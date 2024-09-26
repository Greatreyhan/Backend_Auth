import { Sequelize } from "sequelize";

const db = new Sequelize('auth_db', 'root', 'Kiko312!',{
    host : 'localhost',
    dialect: 'mysql'
})

export default db