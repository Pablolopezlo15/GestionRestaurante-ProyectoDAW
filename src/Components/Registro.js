import app from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

function Registro() {
    const auth = getAuth(app);
    const db = getFirestore(app);

    let user = auth.currentUser;
    const [isAdmin, setIsAdmin] = useState(false);

    async function comprobarRol(user) {
        const usersSnapshot = await getDocs(collection(db, "users"));
        usersSnapshot.forEach((doc) => {
            if (doc.data().uid === user.uid && doc.data().rol === 'admin') {
                setIsAdmin(true);
            }
        });
    }

    function registro(e) {
        e.preventDefault();
    
        const nombre = document.getElementById('nombre').value;
        const correo = document.getElementById('correo').value;
        const contraseña = document.getElementById('contraseña').value;
        const rol = document.querySelector('select').value;

        createUserWithEmailAndPassword(auth, correo, contraseña, nombre, rol)
            .then((userCredential) => {
                console.log("Registrado");
                const user = userCredential.user;
                user.displayName = nombre;
                updateProfile(user, {
                    displayName: nombre,
                }).then(() => {
                    setDoc(doc(db, "users", user.uid), {
                        rol: rol,
                        uid: user.uid,
                        email: correo,
                    });
                }).catch((error) => {
                    console.log(error);
                });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode);
            });
        
    }


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                comprobarRol(user);
            }
        });

        return () => unsubscribe();
    }, [auth]);

    return(
        <div>
            <h1>Registro</h1>
            {isAdmin && (
                <form>
                    <label>Nombre</label>
                    <input type="text" name="nombre" id="nombre" />
                    <label>Rol</label>
                    <select name="rol">
                        <option value="admin">Administrador</option>
                        <option value="user">Usuario</option>
                    </select>

                    <label>Correo</label>
                    <input type="email" name="correo" id="correo" />
                    <label>Contraseña</label>
                    <input type="password" name="contraseña" id="contraseña" />
                    <button onClick={registro}>Registrarse</button>
                </form>
            )}
            {!isAdmin && <p>No tienes permisos para acceder a esta página</p>}
        </div>
    )
}

export default Registro;