import app from '../firebase';
import { getFirestore, collection, addDoc, getDocs, where, query, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

import PDF from './PDFenRegistro';
import { PDFDownloadLink, PDFViewer  } from '@react-pdf/renderer';

function RegistroMesas() {
    const auth = getAuth(app);
    const db = getFirestore(app);

    let user = auth.currentUser;
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mesas, setMesas] = useState([]);
    const [numeroMesa, setNumeroMesa] = useState();

    const [pdfDocument, setPdfDocument] = useState(null);


    async function comprobarRol(user) {
        const usersSnapshot = await getDocs(collection(db, "users"));
        usersSnapshot.forEach((doc) => {
            if (doc.data().uid === user.uid && doc.data().rol === 'admin') {
                setIsAdmin(true);
            }
        });
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                comprobarRol(user);
    
                const unsubscribeSnapshot = onSnapshot(collection(db, "users"), (snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === "modified" && change.doc.data().uid === user.uid) {
                            setIsAdmin(change.doc.data().rol === 'admin');
                        }
                    });
                });
    
                return () => {
                    unsubscribeSnapshot();
                    unsubscribe();
                }
            }
        });
    
        return () => unsubscribe();
    }, [auth]);

    /*
    * Obtiene el registro de mesas de un día concreto
    */
    function obtenerRegistroMesas(dia, numero) {
        setLoading(true);
    
        let [year, month, day] = dia.split("-");
        let formattedDate = `${parseInt(day)}/${parseInt(month)}/${year}`;
        
        const registroMesasRef = collection(db, 'registroMesas');
        const querySnapshot = query(registroMesasRef, where('dia', '==', formattedDate));
    
        const unsubscribe = onSnapshot(querySnapshot, (snapshot) => {
            let mesas = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setMesas(mesas);
            setLoading(false);
        });
    
        return unsubscribe;
    }

    /*
    * Calcula la cuenta de una mesa
    */
    function calcularCuenta(mesa, dia, horaApertura, comandasPendientes, usuario) {
        console.log(comandasPendientes)
        setPdfDocument(<PDF mesaActual={mesa} dia={dia} horaApertura={horaApertura} comandasPendientes={comandasPendientes} usuario={usuario} />);
    }

    return(
        <div className='d-flex flex-column w-100 justify-content-center align-items-center mt-5'>
            {isAdmin && (
                <>
                    <h1>Registro de Mesas</h1>
                    {loading && 
                        <div className="spinner-border text-warning" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    }

                    <p>Selecciona el día del que quieres obtener el registro de mesas</p>
                    <div className='d-flex justify-content-center gap-2 align-items-center mt-2'>
                        <input type='date' onChange={(e) => obtenerRegistroMesas(e.target.value)}></input>
                        <select name='numero' onChange={(e) => setNumeroMesa(e.target.value)}>
                            <option value=''>Selecciona una mesa</option>
                            <option value='1'>Mesa 1</option>
                            <option value='2'>Mesa 2</option>
                            <option value='3'>Mesa 3</option>
                            <option value='4'>Mesa 4</option>
                            <option value='5'>Mesa 5</option>
                            <option value='6'>Mesa 6</option>
                        </select>
                    </div>
                    <div className='table-responsive mt-3 rounded-3'>
                        <table className='table table-striped'>
                            <thead>
                                <tr>
                                    <th scope='col'>Mesa</th>
                                    <th scope='col'>Hora de apertura</th>
                                    <th scope='col'>Hora de cierre</th>
                                    <th scope='col'>Comandas</th>
                                </tr>
                            </thead>
                            <tbody>
                            {mesas.filter(mesa => numeroMesa ? mesa.numero == numeroMesa : true).map((mesa) => (
                                <tr key={mesa.id}>
                                    <td>{mesa.numero}</td>
                                    <td>{mesa.horaapertura}</td>
                                    <td>{mesa.horacierre}</td>
                                    <td>
                                        <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target={`#modal${mesa.id}`}>Ver comandas</button>

                                        <div className="modal fade" id={`modal${mesa.id}`} tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                            <div className="modal-dialog">
                                                <div className="modal-content">
                                                    <div className="modal-header">
                                                        <h5 className="modal-title" id="exampleModalLabel">Comandas de la mesa {mesa.numero}</h5>
                                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setPdfDocument(null)}></button>
                                                    </div>

                                                    <div className="modal-body d-flex flex-column gap-1">
                                                        {mesa.comandas.map((comanda) => (
                                                            <div key={comanda.id} className='comanda-registro'>
                                                                <p>Hora de la comanda: {comanda.horacreacion}</p>
                                                                {comanda.productos.map((producto) => (
                                                                    <div key={producto.id}>
                                                                        <p>{producto.nombre} -- {producto.cantidad} unidad/es</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    { pdfDocument &&
                                                        <PDFViewer className='pdf'>
                                                            {pdfDocument}
                                                        </PDFViewer>
                                                    }
                                                    
                                                    <div className="modal-footer">
                                                        { pdfDocument &&
                                                                <PDFDownloadLink className="btn btn-primary" document={pdfDocument} fileName={"Mesa" + mesa.numero + " " + new Date().toLocaleTimeString()}>
                                                                    {({ blob, url, loading, error }) => (loading ? 'Cargando documento...' : 'Descargar cuenta')}
                                                                </PDFDownloadLink>
                                                        }
                                                        <button type="button" className="btn btn-secondary" onClick={() => calcularCuenta(mesa, mesa.dia, mesa.horaapertura, mesa.comandas, user.displayName)}>Sacar cuenta</button>
                                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => setPdfDocument(null)}>Cerrar</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            </tbody>
                        </table>
                    </div>

                </>
                
            )}
            {!isAdmin && 
                <div className="d-flex justify-content-center align-items-center flex-column mt-5">
                    <h2>No tienes permisos para acceder a esta página</h2>
                    <div className='d-flex flex-wrap justify-content-center align-items-center'>
                        <img src="https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/prohibido%20mano.webp?alt=media&token=50d5c971-7304-4976-bc17-6cd4da7d4c71" alt="403" />
                        <img src="https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/403.webp?alt=media&token=d9a3d9ba-803e-4141-bd5e-30b491ff79b9" alt="403" />
                    </div>
                </div>
            }
        </div>
    );

}

export default RegistroMesas;