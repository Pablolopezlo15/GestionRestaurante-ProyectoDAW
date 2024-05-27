import React, { useState, useEffect } from 'react';
import { getFirestore ,collection, getDocs, addDoc } from 'firebase/firestore';
import app from '../firebase';

function CrearComanda({ idMesa, numeroMesa }) {
    const [comanda, setComanda] = useState([]);
    const [carta, setCarta] = useState([]);
    const db = getFirestore();

    // useEffect(() => {
    //     const obtenerCarta = async () => {
    //         const snapshot = await getDocs(collection(db, 'carta'));
    //         setCarta(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    //     };

    //     obtenerCarta();
    // }, []);

    useEffect(() => {
        const obtenerCarta = async () => {
            const snapshot = await getDocs(collection(db, 'carta'));
            const cartaData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    
            for (const item of cartaData) {
                const productosData = await getDocs(collection(db, "carta", item.id, "productos"));
                item.productos = productosData.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            }
    
            setCarta(cartaData);
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
            idMesa: idMesa,
            numeroMesa: numeroMesa
        };
    
        const comandaRef = await addDoc(collection(db, 'comandas'), comandaData);
        await addDoc(collection(db, 'mesas', idMesa, 'comandas'), { idComanda: comandaRef.id });

        setComanda([]);
        console.log('Comanda enviada');
    }

    return (
        <div>
            <h2>Comanda</h2>
            {/* {carta.map((producto, index) => (
                <div key={index} className='d-flex w-50'>
                    <p>{producto.nombre}</p>
                    <p>{producto.precio}€</p>
                    <div>
                        <img src={producto.imagen} alt={producto.nombre} className='w-25'/>
                    </div>
                    <button onClick={() => agregarProducto(producto)}>Agregar a la comanda</button>
                </div>
            ))} */}
            {carta.map((item, index) => (
                <div key={index}>
                    <h2>{item.categoria}</h2>
                    {item.productos && item.productos.map(producto => (
                        <div key={producto.id} className='d-flex w-50'>
                            <p>{producto.nombre}</p>
                            <p>{producto.precio}€</p>
                            <div>
                                <img src={producto.imagen} alt={producto.nombre} className='w-25'/>
                            </div>
                            <button onClick={() => agregarProducto(producto)}>Agregar a la comanda</button>
                        </div>
                    ))}
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