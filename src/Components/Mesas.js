import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, setDoc, updateDoc, doc, onSnapshot, addDoc, getDoc, deleteDoc, where, query } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import CrearComanda from './CrearComanda';
import PDF from './PDF';
import { PDFDownloadLink, PDFViewer  } from '@react-pdf/renderer';

function Mesas() {
    const [user, setUser] = useState();

    const [mesaActual, setMesaActual] = useState(null);
    const [mesas, setMesas] = useState([]);
    const [carta, setCarta] = useState([{}]);
    const [comandasPendientes, setComandasPendientes] = useState([{}]);
    const [mostrarCreacionComanda, setMostrarCreacionComanda] = useState(false);
    const [mostrarComandasMesa, setMostrarComandasMesa] = useState(false);
    const [pdfDocument, setPdfDocument] = useState(null);

    const [loading, setLoading] = useState(true);
    const db = getFirestore();
    const auth = getAuth();


    function obtenerMesas() {
        const unsubscribe = onSnapshot(collection(db, 'mesas'), (snapshot) => {
            let mesas = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            mesas.sort((a, b) => a.numero - b.numero);
            setMesas(mesas);
            setLoading(false);
        })

        return unsubscribe;
    }
    
    function obtenerComandasPendientes() {
        const unsubscribe = onSnapshot(collection(db, 'comandas'), (snapshot) => {
            let comandas = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setComandasPendientes(comandas);
        })

        return unsubscribe;
    }

    useEffect(() => {
        obtenerMesas();
        obtenerComandasPendientes();
        setUser(auth.currentUser);

    }, []);

    function abrirMesa(id) {
        console.log('Mesa abierta');
        
        updateDoc(doc(db, 'mesas', id), { estado: 'ocupada', horaapertura: new Date().toLocaleTimeString(), dia: new Date().toLocaleDateString()});
    }

    async function cerrarMesa(id) {
        const db = getFirestore();
        const mesaRef = doc(db, 'mesas', id);
    
        const mesaSnap = await getDoc(mesaRef);
        const mesaData = mesaSnap.data();
    
        const comandasQuery = query(collection(db, 'comandas'), where('idMesa', '==', id));
        const comandasSnapshot = await getDocs(comandasQuery);
    
        if (comandasSnapshot.empty) {
            await updateDoc(mesaRef, { estado: 'libre', horacierre: new Date().toLocaleTimeString(), dia: new Date().toLocaleDateString()});
    
            return;
        }
    
        await updateDoc(mesaRef, { estado: 'libre', dia: new Date().toLocaleDateString()})
        .then(() => {
            const registroComandasRef = collection(db, 'registroMesas');
    
            addDoc(registroComandasRef, {
                ...mesaData,
                comandas: comandasSnapshot.docs.map(doc => doc.data()),
                horacierre: new Date().toLocaleTimeString(),
                dia: new Date().toLocaleDateString()
            }).then(() => {
                for (const doc of comandasSnapshot.docs) {
                    deleteDoc(doc.ref);
                }
            });
        });
    }

    function crearComanda(id) {
        console.log('Comanda creada');
        setMesaActual(id);
        setMostrarCreacionComanda(true);

    }

    function ocultarComanda() {
        setMostrarCreacionComanda(false);
    }

    function calcularCuenta(mesaActual, dia, horaApertura, comandasPendientes, usuario) {
        console.log(comandasPendientes);
        setMesaActual(mesaActual);
            setPdfDocument(<PDF mesa={mesaActual} dia={dia} horaApertura={horaApertura} comandasPendientes={comandasPendientes} usuario={usuario} />);
            console.log('Cuenta calculada');
        
    }

    return (
        <>
            <h1 className='text-center mt-3'>Mesas</h1>

            <div className='contenedor-principal'>
            {loading && 
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            }
                {mesas.map((mesa) => (
                    <div key={mesa.id}>
                        <div className='mesa-info d-flex gap-3 align-items-center justify-content-center flex-wrap'>
                            <h2>Mesa {mesa.numero}</h2>
                            <p>Capacidad: {mesa.capacidad}</p>
                            <p>Estado: {mesa.estado}</p>
                            
                        </div>

                        <div key={mesa.id} className='d-flex gap-3 flex-column'>


                            {mesa.estado === 'ocupada' && 
                                <>
                                    <p className='text-center'>Hora de apertura: {mesa.horaapertura} Día: {mesa.dia}</p>
                                    <button type='button' className="btn btn-secondary" onClick={() => setMostrarComandasMesa(!mostrarComandasMesa)}>
                                        {mostrarComandasMesa ? 'Ocultar comandas' : 'Mostrar comandas'}
                                    </button>

                                    { mostrarComandasMesa && 
                                        <div className="card">
                                            {comandasPendientes.map((comanda) => (comanda.idMesa === mesa.id &&
                                                <div className="card-body" key={comanda.id}>
                                                    <h5 className="card-title">{comanda.estado}</h5>
                                                    <ul className="list-group list-group-flush">
                                                    {comanda.productos.map((producto, index) => (
                                                        <li key={index} className="list-group-item">{producto.nombre} {producto.cantidad} unidad/es</li>
                                                    ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    }
                                    <button type="button" className="btn btn-outline-danger" onClick={() => cerrarMesa(mesa.id)}>Cerrar Mesa</button>
                                    <button type="button" className="btn btn-outline-primary" onClick={() => crearComanda(mesa.id)}>Nueva comanda</button>

                                    {mesaActual === mesa.id && mostrarCreacionComanda && 
                                        <div className='d-flex flex-column'>
                                            <button type="button" className="btn btn-outline-secondary" onClick={ocultarComanda}>Cerrar Comanda</button>
                                            <CrearComanda idMesa={mesaActual} numeroMesa={mesa.numero} />
                                        </div>

                                    }
                                    <button type='button' className="btn btn-info" onClick={() => calcularCuenta(mesa.id, mesa.dia, mesa.horaapertura, comandasPendientes, user.displayName )}>Calcular Cuenta</button>
                                    {mesa.id == mesaActual && pdfDocument && (
                                        <>
                                            <PDFDownloadLink document={pdfDocument} fileName={"Mesa" + mesa.numero + " " + new Date().toLocaleTimeString()}>
                                              {({ loading }) => (loading ? 'Cargando documento...' : 'Descargar cuenta')}
                                            </PDFDownloadLink>
                                            <PDFViewer>
                                              {pdfDocument}
                                            </PDFViewer>
                                        </>
                                    )}
                                </>
                            }
                            { mesa.estado === 'libre' &&
                            <>
                                <p>Cerrada desde: {mesa.horacierre} Día: {mesa.dia}</p>
                                <button type="button" className="btn btn-outline-success" onClick={() => abrirMesa(mesa.id)}>Abrir Mesa</button>
                            </>
                            }                   
                        </div>
                        
                    </div>
                ))}
            </div>
        </>
    )
}

export default Mesas;