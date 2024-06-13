import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteUser as firebaseDeleteUser, getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import app from '../firebase';

function GestionarUsuarios() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [usuarios, setUsuarios] = useState([]);
    const [usuario, setUsuario] = useState({});


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

    async function borrarUsuario(userId) {
        try {
            await deleteDoc(doc(db, 'users', userId));
            await auth.deleteUser(userId);
            console.log('Usuario eliminado');
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
        }
    }

    async function cambiarRol(id, newRole) {
        const userRef = doc(db, 'users', id);
        await updateDoc(userRef, { rol: newRole });
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
                                    <th>Acciones</th>
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
                                        <button className="btn btn-outline-danger w-100" onClick={() => borrarUsuario(usuario.id)}>Eliminar</button>
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