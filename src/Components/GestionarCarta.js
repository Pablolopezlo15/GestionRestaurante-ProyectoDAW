import React from 'react'
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import app from '../firebase';


function GestionarCarta() {

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



    return (
        <div>
            <h1>Gestionar Carta</h1>
        </div>
    )
}

export default GestionarCarta;