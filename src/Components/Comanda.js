import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, where, getFirestore, onSnapshot } from 'firebase/firestore';
import app from '../firebase';
import { set } from 'firebase/database';

function Comanda() {
    const [comandasPendientes, setComandasPendientes] = useState([]);
    const [mesaSeleccionada, setMesaSeleccionada] = useState('');
    const [mesas, setMesas] = useState([]);
    const [loading, setLoading] = useState(true);

    const db = getFirestore();


    function obtenerComandasPendientes() {
        const q = query(collection(db, 'comandas'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const newComandas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setComandasPendientes(newComandas);
            setLoading(false);
        });
    
        return unsubscribe;
    }

    useEffect(() => {


        const obtenerMesas = async () => {
            const snapshot = await getDocs(collection(db, 'mesas'));
            setMesas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        obtenerComandasPendientes();
        obtenerMesas();

    }, []);

    function enPreparacion(idComanda) {
        console.log('En preparación');
        updateDoc(doc(db, 'comandas', idComanda), { estado: 'En preparación', hora: new Date().toLocaleTimeString()});
    }
    
    function listo(idComanda) {
        console.log('Listo');
        updateDoc(doc(db, 'comandas', idComanda), { estado: 'Listo', hora: new Date().toLocaleTimeString()});

    }

    function entregado(idComanda) {
        console.log('Entregado');
        updateDoc(doc(db, 'comandas', idComanda), { estado: 'Entregado', hora: new Date().toLocaleTimeString()});
    }

    return (
        <>
            <div className='container'>

                <div className='d-flex justify-content-center gap-2 mt-5'>
                    <h1>Comandas</h1>
                    {loading && 
                        <div className="spinner-border text-warning" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    }
                    <select className='form-select select-mesas' value={mesaSeleccionada} onChange={(e) => setMesaSeleccionada(e.target.value)}>
                        <option value="">Todas las mesas</option>
                        {mesas.sort((a, b) => a.numero - b.numero).map((mesa, index) => (
                            <option key={index} value={mesa.id}>Nº: {mesa.numero}</option>
                        ))}
                    </select>
                </div>
                    
                <div className='mt-4'>
                    {comandasPendientes.filter(comanda => mesaSeleccionada === '' || (comanda.idMesa === mesaSeleccionada && comanda.estado !== 'Entregado'))
                    .sort((a, b) => {
                        const order = ['Pendiente', 'En preparación', 'Listo', 'Entregado'];
                        return order.indexOf(a.estado) - order.indexOf(b.estado);
                    })
                    .map((comanda, index) => (
                        <div key={index} className='card mb-3'>
                            <div className={`card-body ${comanda.estado === 'Listo' ? 'card-listo' : comanda.estado === 'En preparación' ? 'card-enpreparacion' : comanda.estado === 'Pendiente' ? 'card-pendiente' : 'card-entregado'}`}>                        
                                <h3 className='card-title'>Mesa nº: {comanda.numeroMesa}</h3>
                                <p>Hora creación: {comanda.horacreacion}</p>

                                <p className={`card-text ${comanda.estado === 'Listo' ? 'texto-verde' : comanda.estado === 'En preparación' ? 'texto-naranja' : comanda.estado === 'Pendiente' ? 'texto-rojo' : 'texto-azul'}`}>  
                                    {comanda.estado} {comanda.estado === 'Entregado' ? 'a las' : 'desde'} {comanda.hora}
                                </p>

                                <h4>Comanda</h4>
                                {comanda.productos.map((producto, index) => (
                                    <div key={index} className='d-flex justify-content-between mt-2'>
                                        <p className='mb-0'>Producto: {producto.nombre}</p>
                                        <p className='mb-0'>Unidades: {producto.cantidad}</p>
                                    </div>
                                ))}
                                {comanda.observaciones && 
                                    <div>
                                        <h4>Observaciones</h4>
                                        <p>{comanda.observaciones}</p>
                                    </div>

                                }

                                <div className='d-flex mt-2 gap-2'>
                                    <button className='btn btn-warning' onClick={() => enPreparacion(comanda.id)}>En preparación</button>
                                    <button className='btn btn-success' onClick={() => listo(comanda.id)}>Listo</button>
                                    <button className='btn btn-primary' onClick={() => entregado(comanda.id)}>Entregado</button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Comanda;