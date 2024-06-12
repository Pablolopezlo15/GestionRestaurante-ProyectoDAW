import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteUser as firebaseDeleteUser, getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import app from '../firebase';

function GestionarMesas() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [mesas, setMesas] = useState([]);
    const [nuevaMesa, setNuevaMesa] = useState(false);
    const [mesa, setMesa] = useState({});
    const [capacidad, setCapacidad] = useState(0);
    const [editingId, setEditingId] = useState(null);
    const [editCapacidad, setEditCapacidad] = useState('');


    const db = getFirestore();
    const auth = getAuth();

    async function comprobarRol(user) {
        const usersSnapshot = await getDocs(collection(db, "users"));
        usersSnapshot.forEach((doc) => {
            if (doc.data().uid === user.uid && doc.data().rol === 'admin') {
                setIsAdmin(true);
            }
        });
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                comprobarRol(user);
            }
        });
        obtenerMesas();

        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {

        const unsubscribe = onSnapshot(collection(db, 'mesas'), (snapshot) => {
            const mesasData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setMesas(mesasData);
        });

        return () => unsubscribe();
    }, [db]);

    async function obtenerMesas() {

        const snapshot = await getDocs(collection(db, 'mesas'));
        const mesasData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setMesas(mesasData);
    }

    async function borrarMesa(mesaId) {
        try {
            await deleteDoc(doc(db, 'mesas', mesaId));
            console.log('Mesa eliminada');
        } catch (error) {
            console.error('Error al eliminar la mesa:', error);
        }
    }

    const CrearNuevaMesa = async (e) => {
        const numero = mesas.length > 0 ? Math.max(...mesas.map(mesa => mesa.numero)) + 1 : 1;
    
        e.preventDefault();
        const docRef = await addDoc(collection(db, "mesas"), { 
            capacidad: capacidad,
            dia: new Date().toLocaleDateString(),
            estado: 'libre',
            horaapertura: '',
            horacierre: '',
            numero: numero,
        });
        setNuevaMesa(false);
        console.log("Document written with ID: ", docRef.id);
    }

    const handleEdit = (mesa) => {
        setEditingId(mesa.id);
        setEditCapacidad(mesa.capacidad);
    }

    const handleSave = async (id) => {
        try {
            await updateDoc(doc(db, 'mesas', id), { capacidad: editCapacidad });
            setEditingId(null);
            console.log('Mesa actualizada');
        } catch (error) {
            console.error('Error al actualizar la mesa:', error);
        }
    }

    return (
        <>
        {isAdmin && 
            <div className="container">
                <div>
                    <div className="d-flex justify-content-center flex-column align-items-center mt-4">
                        <h1>Gestionar Mesas</h1>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => setNuevaMesa(!nuevaMesa)}>Nueva mesa</button>

                <div className="d-flex justify-content-center mt-4">
                    {nuevaMesa &&
                        <form onSubmit={CrearNuevaMesa}>
                            <div className="mb-3">
                                <label htmlFor="capacidad" className="form-label">Capacidad</label>
                                <input type="number" className="form-control" id="capacidad" onChange={(e) => setCapacidad(e.target.value)} />
                            </div>
                            <button type="submit" className="btn btn-primary">Crear</button>
                        </form>
                    }
                </div>
                <div className="d-flex justify-content-center mt-4">
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Número de mesa</th>
                                <th scope="col">Capacidad</th>
                                <th scope="col">Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            mesas.sort((a, b) => a.numero - b.numero).map((mesa) => (
                                <tr key={mesa.id}>
                                    <td>{mesa.numero}</td>
                                    <td>
                                        {editingId === mesa.id ? (
                                            <input type="text" value={editCapacidad} onChange={(e) => setEditCapacidad(e.target.value)} />
                                        ) : (
                                            mesa.capacidad
                                        )}
                                    </td>
                                    <td className='btn-acciones-mesas'>
                                        {editingId === mesa.id ? (
                                            <button className="btn btn-success" onClick={() => handleSave(mesa.id)}>Guardar</button>
                                        ) : (
                                            <button className="btn btn-warning" onClick={() => handleEdit(mesa)}>Editar</button>
                                        )}
                                        <button className="btn btn-danger" onClick={() => borrarMesa(mesa.id)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        }
        {!isAdmin && <p>No tienes permisos para acceder a esta página</p>}

        </>
    );
}

export default GestionarMesas;