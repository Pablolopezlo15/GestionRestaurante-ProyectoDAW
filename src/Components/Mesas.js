import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, updateDoc, doc, onSnapshot, addDoc, getDoc, deleteDoc } from 'firebase/firestore';
import CrearComanda from './CrearComanda';

function Mesas() {
    const [mesaActual, setMesaActual] = useState(null);
    const [mesas, setMesas] = useState([]);
    const [carta, setCarta] = useState([{}]);
    const db = getFirestore();


    
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'mesas'), (snapshot) => {
            setMesas(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        });
    
        return () => unsubscribe();
    }, []);

    function abrirMesa(id) {
        console.log('Mesa abierta');
        
        updateDoc(doc(db, 'mesas', id), { estado: 'ocupada', horaapertura: new Date().toLocaleTimeString()});
    }

    async function cerrarMesa(id) {
        const mesaRef = doc(db, 'mesas', id);
        const mesaSnap = await getDoc(mesaRef);
        const mesaData = mesaSnap.data();
    
        const comandasRef = collection(db, 'mesas', id, 'comandas');
        const comandasSnap = await getDocs(comandasRef);
    
        // Crear una nueva mesa en registroMesas
        const registroMesaRef = await addDoc(collection(db, 'registroMesas'), {
            ...mesaData,
            horacierre: new Date().toLocaleTimeString()
        });
    
        for (const doc of comandasSnap.docs) {
            const comandaData = doc.data();
            await addDoc(collection(db, 'registroMesas', registroMesaRef.id, 'comandas'), comandaData);
        }
    
        for (const doc of comandasSnap.docs) {
            await deleteDoc(doc.ref);
        }
    
        updateDoc(doc(db, 'mesas', id), { estado: 'libre', horacierre: new Date().toLocaleTimeString()});
    }

    function crearComanda(id) {
        console.log('Comanda creada');
        setMesaActual(id);
    }

    function calcularCuenta() {
        console.log('Cuenta calculada');
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
                        { mesa.estado === 'ocupada' && 
                            <>
                                <p>Comandas pendientes: {mesa.comandas}</p>
                                <p>Hora de apertura: {mesa.horaapertura}</p>
                                <button type="button" class="btn btn-outline-danger" onClick={() => cerrarMesa(mesa.id)}>Cerrar Mesa</button>
                                <button type="button" class="btn btn-outline-primary" onClick={() => crearComanda(mesa.id)}>Nueva comanda</button>

                                {mesaActual === mesa.id && <CrearComanda idMesa={mesaActual} numeroMesa={mesa.numero} />}
                                {/* <button onClick={() => calcularCuenta()}>Calcular Cuenta</button> */}
                            </>
                            }
                        { mesa.estado === 'libre' &&
                        <>
                            <p>Cerrada desde: {mesa.horacierre}</p>
                            <button type="button" class="btn btn-outline-success" onClick={() => abrirMesa(mesa.id)}>Abrir Mesa</button>
                        </>
                        }                   
                        </div>
                ))}
            </div>
        </>
    )
}

export default Mesas;