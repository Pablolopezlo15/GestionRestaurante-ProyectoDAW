import React, { useState, useEffect } from 'react';
import { getFirestore ,collection, getDocs, addDoc } from 'firebase/firestore';
import app from '../firebase';

function CrearComanda({ idMesa }) {
    const [comanda, setComanda] = useState([]);
    const [carta, setCarta] = useState([]);
    const db = getFirestore();

    useEffect(() => {
        const obtenerCarta = async () => {
            const snapshot = await getDocs(collection(db, 'carta'));
            setCarta(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        };

        obtenerCarta();
    }, []);

    function agregarProducto(producto) {
        const productoExistente = comanda.find(p => p.id === producto.id);

        if (productoExistente) {
            productoExistente.cantidad += 1;
            setComanda([...comanda]);
        } else {
            setComanda([...comanda, { ...producto, cantidad: 1 }]);
        }
    }

    function disminuirCantidad(producto) {
        const productoExistente = comanda.find(p => p.id === producto.id);

        if (productoExistente.cantidad > 1) {
            productoExistente.cantidad -= 1;
            setComanda([...comanda]);
        } else {
            setComanda(comanda.filter(p => p.id !== producto.id));
        }
    }

    async function enviarComanda() {
        const comandaData = {
            productos: comanda,
            estado: 'pendiente',
            idMesa: idMesa
        };
    
        const comandaRef = await addDoc(collection(db, 'comandas'), comandaData);
        await addDoc(collection(db, 'mesas', idMesa, 'comandas'), { idComanda: comandaRef.id });

        setComanda([]);
        console.log('Comanda enviada');
    }

    return (
        <div>
            <h2>Comanda</h2>
            {carta.map((producto, index) => (
                <div key={index}>
                    <p>{producto.nombre}</p>
                    <p>{producto.precio}€</p>
                    <img src={producto.imagen} alt={producto.nombre} />
                    <button onClick={() => agregarProducto(producto)}>Agregar a la comanda</button>
                </div>
            ))}
            <h2>Productos en la comanda:</h2>
            {comanda.map((producto, index) => (
                <div key={index}>
                    <p>{producto.nombre}</p>
                    <img src={producto.imagen} alt={producto.nombre} />
                    <p>{producto.precio}€</p>
                    <button onClick={() => disminuirCantidad(producto)}>-</button>
                    <span>{producto.cantidad}</span>
                    <button onClick={() => agregarProducto(producto)}>+</button>
                </div>
            ))}
            <button onClick={enviarComanda}>Enviar Comanda</button>
        </div>
    );
}

export default CrearComanda;