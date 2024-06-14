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
                <div className="container">
                    <h1>Gestionar Usuarios</h1>
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
        {!isAdmin && <p>No tienes permisos para acceder a esta página</p>}

        </>

    );

}

export default GestionarUsuarios;