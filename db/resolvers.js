const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env'});

const crearToken = (usuario, secreta, expiresIn ) => {
    //console.log(usuario);

    const { id, email, nombre, apellido } = usuario;

    // jwt.sign({payload}, llave-secreta, { objeto_expiracion })
    return jwt.sign({id, email, nombre, apellido}, secreta, { expiresIn })

}

// Resolvers
const resolvers = {
    Query: {
        obtenerUsuario: async (_, {token}) => {
            const usuarioId = await jwt.verify( token, process.env.SECRETA );

            return usuarioId;
        },
        obtenerProductos: async () => {
            try {
                const productos = await Producto.find({});
                return productos;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerProducto: async (_, { id }) => {
            // Revisar si el producto existe o no

            const producto = await Producto.findById( id );
            if (!producto) {
                throw new Error('Producto no encontrado');
            }

            return producto;
        },
        obtenerClientes: async () => {
            try {
                // find vacio para traer todos los clientes
                const clientes = await Cliente.find({})
                return clientes;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerClientesVendedor: async (_, {}, ctx) => {
            try {
                const clientes = await Cliente.find({ vendedor: ctx.usuario.id.toString() });
                return clientes;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerCliente: async(_,{id}, ctx) => {
            // Revisar si el cliente existe o no
            const cliente = await Cliente.findById(id);

            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Quien lo creo puede verlo
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales')
            }

            return cliente;
        }
    },
    Mutation: {
        nuevoUsuario: async (_, {input} ) => {
            
            const { email, password } = input;

            // Revisar si el usuario ya esta registrado
            const existeUsuario = await Usuario.findOne( {email} );
            
            if (existeUsuario) {
                throw new Error('El usuario ya esta registrado');
            }

            // Hashear su pass
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);

            try {
                // Save on DB
                const usuario = new Usuario( input );
                usuario.save();

                return usuario;

            } catch (error) {
                console.log(error)
            }

            //return "Creando..."
        },
        autenticarUsuario: async (_,{input}) => {
            const { email, password } = input;

            const existeUsuario = await Usuario.findOne( {email});

            if (!existeUsuario) {
                throw new Error('El usuario no existe');
            }

            // Revisar si el password es correcto
            const passwordCorrecto = await bcryptjs.compare( password, existeUsuario.password );
            if (!passwordCorrecto) {
                throw new Error('El Password es incorrecto');
            }

            // Crear token
            return {
                token: crearToken(existeUsuario, process.env.SECRETA, '24h' )
            }


        },
        nuevoProducto: async (_, { input }) => {
            try {

                const producto = new Producto(input);
                
                // almacenar en la DB
                const resultado = await producto.save();

                return resultado;

            } catch (error) {
                console.log(error);
            }
        },
        actualizarProducto: async (_, {id, input}) => {
            
            // revisar si el producto existe
            let producto = await Producto.findById( id );
            
            if (!producto) {
                throw new Error('Producto no encontrado');
            }

            // Guardarlo en la DB
            producto = await Producto.findOneAndUpdate({ _id: id }, input, { new: true });

            // Retornamos la info tipo  producto
            return producto;

        },
        eliminarProducto: async (_, { id }) => {
            // revisar si el producto existe
            let producto = await Producto.findById( id );
            
            if (!producto) {
                throw new Error('Producto no encontrado');
            }

            // Eliminar
            await Producto.findOneAndDelete({ _id: id });

            return "Producto eliminado";
            
        },
        nuevoCliente: async (_, { input }, ctx) => {

            console.log(ctx);

            const { email } = input;
            // Verificar si el cliente esta registrado
            // console.log(input);

            const cliente = await Cliente.findOne({ email });
            if(cliente) {
                throw new Error('Ese cliente ya esta registrado');
            }

            const nuevoCliente = new Cliente(input);
            
            // asignar vendedor
            nuevoCliente.vendedor = ctx.usuario.id;


            // guardarlo en la base de datos
            try {
                const resultado = await nuevoCliente.save();
                return resultado;     
            } catch (error) {
                console.log(error);
            }
           
        },
        actualizarCliente: async(_,{ id, input }, ctx) => {
            // Verficar si existe o no 
            let cliente = await Cliente.findById(id);

            if (!cliente) {
                throw new Error('Ese cliente no existe')
            }

            // Verificar si el vendedor es quien edita
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales')
            }

            // Guardar el cliente
            cliente = await Cliente.findOneAndUpdate({_id: id}, input, {new: true});

            return cliente;
        },
        eliminarCliente: async (_, { id }, ctx) => {
            // Verficar si existe o no 
            let cliente = await Cliente.findById(id);

            if (!cliente) {
                throw new Error('Ese cliente no existe')
            }

            // Verificar si el vendedor es quien edita
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales')
            }

            // Eliminar cliente 
            await Cliente.findOneAndDelete({_id: id});

            return "Cliente eliminado"
        }
    }
}

module.exports = resolvers;