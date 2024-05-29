import React, { useState } from "react";
import { useEffect } from "react";
import { getFirestore, collection, getDocs, setDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import '../assets/css/carta.css';

function Carta() {

    const [carta, setCarta] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const db = getFirestore();
            const data = await getDocs(collection(db, "carta"));
            const cartaData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    
            for (const item of cartaData) {
                const productosData = await getDocs(collection(db, "carta", item.id, "productos"));
                item.productos = productosData.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            }
    
            setCarta(cartaData);
            console.log(carta);
        }
        fetchData();
    }, []);

    return (
        <>
            <div className="container">
                <div>
                    <div>
                        <h1>Carta</h1>
                        <p>En esta sección se mostrará la carta del restaurante</p>
                    </div>
                </div>

                {/* <div className="section">
                    {
                        carta.map((item) => {
                            return (
                                <div className="card" key={item.nombre}>
                                    <img src={item.imagen} alt={item.nombre} />
                                    <h3>{item.nombre}</h3>
                                    <p><strong>Precio: </strong>{item.precio} €</p>
                                    <p><strong>Ingredientes: </strong>{item.ingredientes}</p>
                                </div>
                            );
                        })
                    }
                </div> */}

                <div className="accordion carta" id="accordionExample">
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
                                                    <img src={producto.imagen} alt={producto.nombre} />
                                                </div>
                                                <div className="producto__info">
                                                    <h2>{producto.nombre}</h2>
                                                    <p><strong>Precio: </strong>{producto.precio} €</p>
                                                    <p><strong>Ingredientes: </strong>{producto.ingredientes}</p>
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