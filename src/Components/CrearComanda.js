import React, { useState, useEffect } from 'react';
import { getFirestore ,collection, getDocs, addDoc } from 'firebase/firestore';
import app from '../firebase';


function CrearComanda({ idMesa, numeroMesa }) {
    const [comanda, setComanda] = useState([]);
    const [carta, setCarta] = useState([]);
    const [mostrarCarta, setMostrarCarta] = useState(true);
    const db = getFirestore();



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
        setMostrarCarta(false);
        console.log('Comanda enviada');
    }

    return (
        <div>
            {mostrarCarta && (
            <>
                <h2>Elige los productos</h2>

                <div className="accordion carta" id="accordionExample">
                    {carta.map((item, index) => (
                        <div className="accordion-item" key={index}>
                            <h2 className="accordion-header" id={`heading${index}`}>
                                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${index}`} aria-expanded="true" aria-controls={`collapse${index}`}>
                                    {item.categoria}
                                </button>
                            </h2>
                            <div id={`collapse${index}`} className="accordion-collapse collapse" aria-labelledby={`heading${index}`} data-bs-parent="#accordionExample">
                                <div className="accordion-body">
                                    {item.productos && item.productos.map(producto => (
                                        <div key={producto.id}   className='producto-comanda d-flex justify-content-between'>
                                            <p>{producto.nombre}</p>
                                            <p>{producto.precio}€</p>
                                            <button type='button' class="btn primary" onClick={() => agregarProducto(producto)}>Agregar a la comanda</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
            )}

            <h2>Productos en la comanda:</h2>
            {comanda.map((producto, index) => (
                <div key={index} className='d-flex  align-items-center gap-2'>
                    <p>{producto.nombre}</p>
                    <p>{producto.precio}€</p>
                    <button type='button' class="btn primary" onClick={() => disminuirCantidad(producto)}>-</button>
                    <span className=''>{producto.cantidad}</span>
                    <button type='button' class="btn primary" onClick={() => agregarProducto(producto)}>+</button>
                </div>
            ))}
            <button type='button' class="btn btn-outline-success" onClick={enviarComanda}>Enviar Comanda</button>
        </div>
        
    );
}

export default CrearComanda;