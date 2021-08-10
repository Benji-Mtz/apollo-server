const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');

const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env'});

const connectDB = require('./config/db');

// Conectar a la base de datos
connectDB();

// servidor
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        // console.log(req.headers['authorization']);
        const token = req.headers['authorization'] || '';
        if (token) {
            try {
                const usuario = jwt.verify( token, process.env.SECRETA );
                // console.log(usuario);

                return {
                    usuario
                }

            } catch (error) {
                console.log("Hubo un error con el token");
                console.log(error);
            }
        }
    }
});


// Arranque del server
server.listen().then( ({url}) => {
    console.log(`Servidor listo en la ULR ${url}`);
})