const { gql } = require('apollo-server');

// Schema
const typeDefs = gql`
    type Usuario {
        id: ID
        nombre: String
        apellido: String
        email: String
        creado: String
    }
    input UsuarioInput {
        nombre: String!
        apellido: String!
        email: String!
        password: String!
    }
    type Token {
        token: String
    }
    type Producto {
        id: ID
        nombre: String
        existencia: String
        precio: String
        creado: String
    }
    input AutenticarInput {
        email: String!
        password: String!
    }
    input ProductoInput {
        nombre: String!
        existencia: Int!
        precio: Float!
    }
    type Query {
        # Usuarios
        obtenerUsuario(token: String!) : Usuario

        # Productos
        obtenerProductos: [Producto]
        obtenerProducto (id: ID!) : Producto 
    }

    type Mutation {
        # Usuarios
        nuevoUsuario(input: UsuarioInput): Usuario
        autenticarUsuario(input: AutenticarInput): Token

        # Productos
        nuevoProducto(input: ProductoInput) : Producto
        actualizarProducto(id: ID!, input: ProductoInput ) : Producto
        eliminarProducto( id: ID! ): String
    }
`;

module.exports = typeDefs;