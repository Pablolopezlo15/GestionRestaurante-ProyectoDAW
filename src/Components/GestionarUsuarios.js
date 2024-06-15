import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteUser as firebaseDeleteUser, getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';


import app from '../firebase';

function GestionarUsuarios() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [usuarios, setUsuarios] = useState([]);

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
        obtenerUsuarios();

        return () => unsubscribe();
    }, [auth]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            const usuariosData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setUsuarios(usuariosData);
        });

        return () => unsubscribe();
    }, [db]);

    async function obtenerUsuarios() {
        const snapshot = await getDocs(collection(db, 'users'));
        const usuariosData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setUsuarios(usuariosData);
    }

    async function cambiarRol(id, newRole) {
        const user = auth.currentUser;
        if (user && user.uid === id) {
            const confirmed = window.confirm("¿Estás seguro de que quieres cambiar tu propio rol?");
            if (!confirmed) {
                return;
            }
        }
        
        const userRef = doc(db, 'users', id);
        await updateDoc(userRef, { rol: newRole });
    }

    async function cambiarEstado(id, newState) {
        const user = auth.currentUser;
    
        if (user && user.uid === id && newState === 'inactivo') {
            alert('No puedes desactivarte a ti mismo');
            return;
        }
        let canChange = true;
        usuarios.forEach(usuario => {
            if (usuario.rol === 'admin' && usuario.id === id && newState === 'inactivo') {
                alert('No puedes desactivar a un administrador');
                canChange = false;
                return;
            }
        });
    
        if (!canChange) return;
    
        const userRef = doc(db, 'users', id);
        await updateDoc(userRef, { estado: newState });
    }

    return (
        <>
        {isAdmin && 
            <>
                <div className="container mt-5">
                    <h1 className='text-center'>Gestionar Usuarios</h1>
                    <Link to="/registro" className="btn btn-primary">Nuevo Usuario</Link>

                    <div className="table-responsive">
                        <table className="table mt-4">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                            {usuarios.map(usuario => (
                                <tr key={usuario.id}>
                                    <td>{usuario.correo}</td>
                                    <td>
                                        <select value={usuario.rol} onChange={(e) => cambiarRol(usuario.id, e.target.value)}>
                                            <option value="admin">Admin</option>
                                            <option value="user">User</option>
                                        </select>
                                    </td>
                                    <td className='d-flex flex-column gap-2'>
                                        <select value={usuario.estado} onChange={(e) => cambiarEstado(usuario.id, e.target.value)}>
                                            <option value="activo">Activo</option>
                                            <option value="inactivo">Inactivo</option>
                                        </select>
                                    </td>

                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
        }
        {!isAdmin && 
            <div className="d-flex justify-content-center align-items-center flex-column mt-5">
                <h2>No tienes permisos para acceder a esta página</h2>
                <div className='d-flex flex-wrap justify-content-center align-items-center'>
                    <img src="https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/prohibido%20mano.webp?alt=media&token=50d5c971-7304-4976-bc17-6cd4da7d4c71" alt="403" />
                    <img src="https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/403.webp?alt=media&token=d9a3d9ba-803e-4141-bd5e-30b491ff79b9" alt="403" />
                </div>
            </div>
        }
        </>

    );

}

export default GestionarUsuarios;