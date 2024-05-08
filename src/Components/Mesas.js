import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, updateDoc, doc, onSnapshot } from 'firebase/firestore';


function Mesas() {
    const [mesas, setMesas] = useState([]);
    const db = getFirestore();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'mesas'), (snapshot) => {
            setMesas(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        });
    
        return () => unsubscribe();
    }, []);

    function abrirMesa(id) {
        console.log('Mesa abierta');
        
        updateDoc(doc(db, 'mesas', id), { estado: 'ocupada' });
    }

    function cerrarMesa(id) {
        console.log('Mesa cerrada');
        updateDoc(doc(db, 'mesas', id), { estado: 'libre' });
    }

    function crearComanda() {
        console.log('Comanda creada');
    }

    return (
        <>
            <div>
                <h1>Mesas</h1>
                
                {mesas.map((mesa) => (
                    <div key={mesa.id}>
                        <h2>Mesa {mesa.numero}</h2>
                        <p>Capacidad: {mesa.capacidad}</p>
                        <p>Estado: {mesa.estado}</p>
                        <p>Hora de apertura: {}</p>
                        { mesa.estado == 'ocupada' && 
                            <button onClick={() => cerrarMesa(mesa.id)}>Cerrar Mesa</button> }
                        { mesa.estado == 'libre' &&
                            <button onClick={() => abrirMesa(mesa.id)}>Abrir Mesa</button> }                      
                        <button onClick={crearComanda}>Crear Comanda</button>
                    </div>
                ))}
            </div>
        </>
    )
}

export default Mesas;