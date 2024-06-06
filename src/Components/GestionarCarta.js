import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import app from '../firebase';

function GestionarCarta() {
    const auth = getAuth(app);
    const db = getFirestore(app);

    let user = auth.currentUser;
    const [isAdmin, setIsAdmin] = useState(false);
    const [carta, setCarta] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isFormVisibleCategory, setIsFormVisibleCategory] = useState(false);
    const [newProduct, setNewProduct] = useState({ nombre: '', precio: '', ingredientes: '', imagen: '' });
    const [categoria, setCategoria] = useState('');
    const [categoriaElegida, setCategoriaElegida] = useState({ categoria: '' });
    const [editingProduct, setEditingProduct] = useState(null);
    const [nuevaCategoria, setNuevaCategoria] = useState('');

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

        return () => unsubscribe();
    }, [auth]);

    async function obtenerCarta() {
        const db = getFirestore();
        const data = await getDocs(collection(db, "carta"));
        const cartaData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

        for (const item of cartaData) {
            const productosData = await getDocs(collection(db, "carta", item.id, "productos"));
            item.productos = productosData.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        }

        setCarta(cartaData);
    }


    useEffect(() => {
        obtenerCarta();
    }, []);


    const handleDelete = async (id, categoria) => {
        console.log(id, categoria);
        await deleteDoc(doc(db, "carta", categoria, "productos", id));
        obtenerCarta();
    }

    const handleAddProduct = async (e) => {
        e.preventDefault();
        await addDoc(collection(db, "carta", categoriaElegida, "productos"), newProduct);
        setIsFormVisible(false);
        obtenerCarta();
    }

    const handleAddCategoria = async (e) => {
        e.preventDefault();
        await addDoc(collection(db, "carta"), { categoria: nuevaCategoria });
        setIsFormVisibleCategory(false);
        obtenerCarta();
    }

    const handleEdit = (id, producto) => {
        setEditingProduct(producto);
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(editingProduct);
    
        if(editingProduct.imagen === '') {
            editingProduct.imagen = newProduct.imagen;
        }
    
        await updateDoc(doc(db, "carta", editingProduct.categoria, "productos", editingProduct.id), editingProduct);
        setEditingProduct(null);
    
        obtenerCarta();
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        const storage = getStorage(app);
        const storageRef = ref(storage, 'images/' + file.name);
        const uploadTask = uploadBytesResumable(storageRef, file);
    
        uploadTask.on('state_changed', 
            (snapshot) => {
                // Proccessing...
                console.log(snapshot);
                console.log(storageRef)
            }, 
            (error) => {
                // Handle unsuccessful uploads
            }, 
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    if(editingProduct) {
                        setEditingProduct({ ...editingProduct, imagen: downloadURL });
                    } else {
                        setNewProduct({ ...newProduct, imagen: downloadURL });
                    }                });
            }
        );
    }

    return (
        <div>
            <h1 className='text-center mt-4'>Gestión Carta</h1>
            <div className="container">

                {isAdmin && (
                    <>
                        <div>
                            <div className='btns-crear'>
                                <button class="btn btn-outline-primary" onClick={() => setIsFormVisible(!isFormVisible)}>Añadir nuevo producto</button>
                                <button class="btn btn-outline-primary" onClick={() => setIsFormVisibleCategory(!isFormVisibleCategory)}>Añadir nueva categoría</button>
                            </div>

                            {isFormVisibleCategory && (
                                <form onSubmit={handleAddCategoria}>
                                    <label>
                                        Categoría:
                                        <input type="text" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} />
                                    </label>
                                    <button type="submit">Crear categoría</button>
                                </form>
                            )}

                            {isFormVisible && (
                                <form onSubmit={handleAddProduct}>
                                    <label>
                                        Categoría:
                                        <select value={categoriaElegida} onChange={(e) => setCategoriaElegida(e.target.value)}>
                                            {carta.map((item) => (
                                                <option key={item.id} value={item.id}>{item.categoria}</option>
                                            ))}
                                        </select>

                                    </label>
                                    <label>
                                        Nombre:
                                        <input type="text" value={newProduct.nombre} onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })} />
                                    </label>
                                    <label>
                                        Precio:
                                        <input type="number" value={newProduct.precio} onChange={(e) => setNewProduct({ ...newProduct, precio: e.target.value })} />
                                    </label>
                                    <label>
                                        Ingredientes:
                                        <input type="text" value={newProduct.ingredientes} onChange={(e) => setNewProduct({ ...newProduct, ingredientes: e.target.value })} />
                                    </label>
                                    <label>
                                        Imagen:
                                        <input type="file" value={newProduct.imagen} onChange={handleImageUpload} />
                                    </label>
                                    <button type="submit">Crear producto</button>
                                </form>
                            )}


                            <div className="accordion carta" id="accordionExample">
                                {
                                    carta.map((item, index) => (
                                        <div className="accordion-item" key={item.id}>
                                            <h2 className="accordion-header" id={`heading${index}`}>
                                                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${index}`} aria-expanded="true" aria-controls={`collapse${index}`}>
                                                    {item.categoria}
                                                </button>
                                            </h2>
                                            <div id={`collapse${index}`} className="accordion-collapse collapse" aria-labelledby={`heading${index}`} data-bs-parent="#accordionExample">
                                                <div className="accordion-body">
                                                    {item.productos && item.productos.map(producto => (
                                                        <div key={producto.id} className="producto">
                                                            <div className="producto__imagen">
                                                                <img src={producto.imagen} alt={producto.nombre} />
                                                            </div>
                                                            <div className="producto__info">
                                                                <h2>{producto.nombre}</h2>
                                                                <p><strong>Precio: </strong>{producto.precio} €</p>
                                                                <p><strong>Ingredientes: </strong>{producto.ingredientes}</p>
                                                                <div className='d-flex flex-column gap-2'>
                                                                    <p><strong>Acciones: </strong></p>
                                                                    <button className='btn btn-outline-warning' onClick={() => handleEdit(producto.id, { ...producto, categoria: item.id })}>Editar</button>

                                                                    {editingProduct && (
                                                                        <form className='form form-edit-producto' onSubmit={handleSubmit}>
                                                                            <label>Nombre:
                                                                                <input type="text" value={editingProduct.nombre} onChange={(e) => setEditingProduct({ ...editingProduct, nombre: e.target.value })} />               
                                                                            </label>
                                                                            <label>Precio (€):
                                                                                <input type="number" value={editingProduct.precio} onChange={(e) => setEditingProduct({ ...editingProduct, precio: e.target.value })} />
                                                                            </label>
                                                                            <label>Ingredientes:
                                                                                <textarea type="text" value={editingProduct.ingredientes} onChange={(e) => setEditingProduct({ ...editingProduct, ingredientes: e.target.value })} />
                                                                            </label>
                                                                            <label>Imagen:
                                                                                <input type="file" onChange={handleImageUpload} />
                                                                            </label>
                                                                            <button type="submit" className='button1'>Guardar cambios</button>
                                                                        </form>
                                                                    )}
                                                                    <button className='btn btn-outline-danger' onClick={() => handleDelete(producto.id, item.id)}>Eliminar</button>
                                                                </div>

                                                            </div>                                                
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }

                            </div>
                        </div>
                    </>
                )}
                {!isAdmin && <p>No tienes permisos para acceder a esta página</p>}
            </div>
        </div>
    )
}

export default GestionarCarta;