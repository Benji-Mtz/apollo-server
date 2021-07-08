const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');

const connectDB = require('./config/db');

// Conectar a la base de datos
connectDB();

// servidor
const server = new ApolloServer({
    typeDefs,
    resolvers
});


// Arranque del server
server.listen().then( ({url}) => {
    console.log(`Servidor listo en la ULR ${url}`);
})