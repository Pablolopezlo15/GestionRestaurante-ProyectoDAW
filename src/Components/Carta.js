import React, { useState } from "react";
import { useEffect } from "react";
import { getFirestore, collection, getDocs, setDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import '../assets/css/carta.css';

function Carta() {
    const [carta, setCarta] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function obtenerCarta() {
            const db = getFirestore();
            const data = await getDocs(collection(db, "carta"));
            const cartaData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    
            for (const item of cartaData) {
                const productosData = await getDocs(collection(db, "carta", item.id, "productos"));
                item.productos = productosData.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            }
    
            setCarta(cartaData);
            setLoading(false);

            console.log(carta);
        }
        obtenerCarta();
    }, []);

    return (
        <>
            <div className="container">
                <div className="d-flex justify-content-center flex-column align-items-center gap-4 ">
                    <div className="mt-5">
                        <h1>Carta</h1>
                    </div>
                    {loading && 
                        <div className="spinner-border text-warning" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    }
                </div>

                <div className="accordion carta mb-5" id="accordionExample">
                    {
                        carta.map((item, index) => (
                            <div className="accordion-item" key={item.id}>
                                <h2 className="accordion-header" id={`heading${index}`}>
                                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${index}`} aria-expanded="true" aria-controls={`collapse${index}`}>
                                        {item.categoria}
                                    </button>
                                </h2>
                                <div id={`collapse${index}`} className="accordion-collapse collapse" aria-labelledby={`heading${index}`} data-bs-parent="#accordionExample">
                                    <div className="accordion-body">
                                        {item.productos && item.productos.map(producto => (
                                            <div key={producto.id} className="producto">
                                                <div className="producto__imagen">
                                                    {producto.imagen &&
                                                        <img src={producto.imagen} alt={producto.nombre} />
                                                    }
                                                    {!producto.imagen &&
                                                        <img src="https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/imagenotfound.jpg?alt=media&token=d53941ce-18b4-4f99-bdea-85e6f86943a9" alt={producto.nombre} />
                                                    }
                                                </div>
                                                <div className="producto__info">
                                                    <h2>{producto.nombre}</h2>
                                                    <p><strong>Precio: </strong>{producto.precio} €</p>
                                                    {producto.ingredientes !== '' && <p><strong>Ingredientes: </strong>{producto.ingredientes}</p>}
                                                    
                                                </div>                                                
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>

            </div>
        </>
    );
}

export default Carta;