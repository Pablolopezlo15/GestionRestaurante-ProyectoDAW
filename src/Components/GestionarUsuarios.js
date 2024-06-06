import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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

    }, []);

    async function obtenerUsuarios() {
        const snapshot = await getDocs(collection(db, 'users'));
        const usuariosData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setUsuarios(usuariosData);
    }

    async function handleDelete(id) {
        await deleteDoc(doc(db, 'users', id));
    }


    return (
        <>
        {isAdmin && 
            <>
                <div className="container">
                    <h1>Gestionar Usuarios</h1>
                    <Link to="/registro" className="btn btn-primary">Nuevo Usuario</Link>
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
                                    <td>{usuario.rol}</td>
                                    <td className='d-flex flex-column gap-2'>
                                        <button className="btn btn-warning w-100" >Editar</button>
                                        <button className="btn btn-danger w-100">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                        
                </div>
            </>
        }
        {!isAdmin && <p>No tienes permisos para acceder a esta página</p>}

        </>

    );

}

export default GestionarUsuarios;