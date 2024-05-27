import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, where, getFirestore } from 'firebase/firestore';
import app from '../firebase';

function Comanda() {
    const [comandasPendientes, setComandasPendientes] = useState([]);
    const [mesaSeleccionada, setMesaSeleccionada] = useState('');
    const [mesas, setMesas] = useState([]);

    const db = getFirestore();

    useEffect(() => {
        const obtenerComandasPendientes = async () => {
            const q = query(collection(db, 'comandas'));
            const querySnapshot = await getDocs(q);
            setComandasPendientes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        const obtenerMesas = async () => {
            const snapshot = await getDocs(collection(db, 'mesas'));
            setMesas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        obtenerComandasPendientes();
        obtenerMesas();

    }, []);

    function enPreparacion(idComanda) {
        console.log('En preparación');
        updateDoc(doc(db, 'comandas', idComanda), { estado: 'En preparación' });
    }
    
    function listo(idComanda) {
        console.log('Listo');
        updateDoc(doc(db, 'comandas', idComanda), { estado: 'Listo' });
    }

    return (
        <div>
            <h1>Comandas</h1>
            
            <select value={mesaSeleccionada} onChange={(e) => setMesaSeleccionada(e.target.value)}>
                <option value="">Todas las mesas</option>
                {mesas.map((mesa, index) => (
                    <option key={index} value={mesa.id}>Nº: {mesa.numero}</option>
                ))}
            </select>

            {comandasPendientes.filter(comanda => mesaSeleccionada === '' || comanda.idMesa === mesaSeleccionada).map((comanda, index) => (
                <div key={index}>
                    {/* <h2>{comanda.id}</h2> */}
                    <h3>Mesa nº: {comanda.numeroMesa}</h3>
                    <p>{comanda.estado}</p>
                    <button onClick={() => enPreparacion(comanda.id)}>En preparación</button>
                    <button onClick={() => listo(comanda.id)}>Listo</button>
                    {
                        comanda.productos.map((producto, index) => (
                            <div key={index} className='d-flex w-50 gap-2'>
                                <p>Producto: {producto.nombre}</p>
                                <p>Unidades: {producto.cantidad}</p>
                            </div>
                        ))
                    }
                </div>
            ))}
        </div>
    );
}

export default Comanda;