import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import app from '../firebase';
import { set } from 'firebase/database';

function GestionarCarta() {
    const auth = getAuth(app);
    const db = getFirestore(app);

    let user = auth.currentUser;
    const [isAdmin, setIsAdmin] = useState(false);
    const [carta, setCarta] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [esVisibleFormEditar, setEsVisibleFormEditar] = useState(false);
    const [isFormVisibleCategory, setIsFormVisibleCategory] = useState(false);
    const [newProduct, setNewProduct] = useState({ nombre: '', precio: '', ingredientes: '', imagen: '' });
    const [categoria, setCategoria] = useState('');
    const [categoriaElegida, setCategoriaElegida] = useState('');
    const [categoriaEditing, setCategoriaEditing] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [nuevaCategoria, setNuevaCategoria] = useState('');
    const [mostrarBorrarCategoria, setMostrarBorrarCategoria] = useState(false);
    const [categoriaAEliminar, setCategoriaAEliminar] = useState('');

    const [loading, setLoading] = useState(true);

    /*
    * Comprueba si el usuario autenticado es administrador y actualiza el estado
    * del usuario con el rol de administrador
    * 
    * @param {Object} user - El usuario autenticado
    */
    async function comprobarRol(user) {
        const usersSnapshot = await getDocs(collection(db, "users"));
        usersSnapshot.forEach((doc) => {
            if (doc.data().uid === user.uid && doc.data().rol === 'admin') {
                setIsAdmin(true);
            }
        });
    }

    /*
    * Comprueba si hay un usuario autenticado y actualiza el estado
    * del usuario con el usuario autenticado al cargar el componente
    * 
    * Comprueba si el usuario autenticado es administrador y actualiza el estado
    * del usuario con el rol de administrador
    * 
    * Comprueba si el usuario autenticado está inactivo y cierra la sesión
    */
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
    * Obtiene los datos de la carta de la base de datos de Firebase
    * y actualiza el estado de la carta con los datos obtenidos
    * al cargar el componente
    */
    async function obtenerCarta() {
        const db = getFirestore();
        const data = await getDocs(collection(db, "carta"));
        const cartaData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

        for (const item of cartaData) {
            const productosData = await getDocs(collection(db, "carta", item.id, "productos"));
            item.productos = productosData.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        }

        setCarta(cartaData);
        setLoading(false);
    }

    useEffect(() => {
        obtenerCarta();
    }, []);

    /*
    * Elimina un producto de la carta
    *
    * @param {string} id - El id del producto a eliminar
    * @param {string} categoria - La categoría del producto a eliminar
    * 
    * @returns {Promise} - Devuelve una promesa con la operación
    * de eliminar un producto de la carta
    */
    async function eliminarProductoDeCarta(id, categoria) {
        await deleteDoc(doc(db, "carta", categoria, "productos", id));
        obtenerCarta();
    }

    /*
    * Agrega un producto a la carta
    *
    * @param {Event} e - El evento del botón de añadir producto
    * a la carta
    * 
    * @returns {Promise} - Devuelve una promesa con la operación
    * de añadir un producto a la carta
    */
    async function agregarProductoACarta(e) {
        e.preventDefault();
        if (categoriaElegida === '') {
            alert('Por favor, selecciona una categoría antes de añadir un producto.');
            return;
        }
        await addDoc(collection(db, "carta", categoriaElegida, "productos"), newProduct);
        setIsFormVisible(false);
        obtenerCarta();
    }

    /*
    * Agrega una nueva categoría a la carta
    *
    * @param {Event} e - El evento del botón de añadir categoría
    * a la carta
    *   
    * @returns {Promise} - Devuelve una promesa con la operación
    * de añadir una nueva categoría a la carta
    */
    async function agregarNuevaCategoria(e) {
        e.preventDefault();
        await addDoc(collection(db, "carta"), { categoria: nuevaCategoria });
        setIsFormVisibleCategory(false);
        obtenerCarta();
    }

    /*
    * Edita un producto de la carta
    *
    * @param {string} id - El id del producto a editar
    * @param {Object} producto - El producto a editar
    */
    function editarProducto(id, producto) {
        setEsVisibleFormEditar(!esVisibleFormEditar);
        setEditingProduct(producto);
    }

    /*
    * Edita una categoría de la carta
    *
    * @param {string} id - El id de la categoría a editar
    * @param {string} categoria - La categoría a editar
    */
    function editarCategoria(id, categoria) {
        setCategoriaEditing(id);
        setCategoria(categoria);
    }

    /*
    * Guarda los cambios del producto editado
    *
    * @param {Event} e - El evento del botón de guardar cambios
    * del producto editado
    * 
    * @returns {Promise} - Devuelve una promesa con la operación
    * de guardar los cambios del producto editado
    */
    async function saveEditarProducto(e) {
        e.preventDefault();
        if (editingProduct.imagen === '') {
            editingProduct.imagen = newProduct.imagen;
        }
        await updateDoc(doc(db, "carta", editingProduct.categoria, "productos", editingProduct.id), editingProduct);
        setEditingProduct(null);
        obtenerCarta();
        setEsVisibleFormEditar(false);
    }

    /*
    * Guarda los cambios de la categoría editada
    *
    * @param {Event} e - El evento del botón de guardar cambios
    * de la categoría editada
    * 
    * @returns {Promise} - Devuelve una promesa con la operación
    * de guardar los cambios de la categoría editada
    */
    async function saveEditarCategoria(e) {
        e.preventDefault();
        await updateDoc(doc(db, "carta", categoriaEditing), { categoria });
        setCategoriaEditing(null);
        obtenerCarta();
    }

    /*
    * Sube una imagen a Firebase Storage
    *
    * @param {Event} e - El evento del input de subir imagen
    * 
    * @returns {Promise} - Devuelve una promesa con la operación
    */
    const subirImagen = async (e) => {
        const file = e.target.files[0];
        const storage = getStorage(app);
        const storageRef = ref(storage, 'images/' + file.name);
        const uploadTask = uploadBytesResumable(storageRef, file);
    
        uploadTask.on('state_changed', 
            (snapshot) => {
                // Proccessing...
            }, 
            (error) => {
                // Handle unsuccessful uploads
            }, 
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    if (editingProduct) {
                        setEditingProduct({ ...editingProduct, imagen: downloadURL });
                    } else {
                        setNewProduct({ ...newProduct, imagen: downloadURL });
                    }                
                });
            }
        );
    }

    /*
    * Elimina una categoría de la carta
    *
    * @param {string} id - El id de la categoría a eliminar
    */
    async function eliminarCategoria(id) {
        const productosSnapshot = await getDocs(collection(db, "carta", id, "productos"));
        if (!productosSnapshot.empty) {
            setMostrarBorrarCategoria(true);
            setCategoriaAEliminar(id);
            return;
        }
        await deleteDoc(doc(db, "carta", id));
        obtenerCarta();
    }

    return (
        <div>

            <div className="container">
                {isAdmin && (
                    <>
                        <div className='d-flex flex-column align-items-center gap-3'>
                            <h1 className='text-center mt-4'>Gestión Carta</h1>
                            {loading && 
                                <div className="spinner-border text-warning" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            }
                        </div>

                        <div>
                            <div className='btns-crear'>
                                <button className="btn btn-outline-primary" onClick={() => setIsFormVisible(!isFormVisible)}>Añadir nuevo producto</button>
                                <button className="btn btn-outline-primary" onClick={() => setIsFormVisibleCategory(!isFormVisibleCategory)}>Añadir nueva categoría</button>
                            </div>

                            {isFormVisibleCategory && (
                                <div className='w-100 d-flex justify-content-center flex-column align-items-center'>
                                    <h2>Crear nueva categoría</h2>
                                    <form className='form-edit-producto w-75' onSubmit={agregarNuevaCategoria}>
                                        <label>
                                            Categoría:
                                            <input type="text" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} />
                                        </label>
                                        <button className='button1' type="submit">Crear categoría</button>
                                    </form>
                                </div>
                            )}

                            {isFormVisible && (
                                <div className='w-100 d-flex justify-content-center flex-column align-items-center'>
                                    <h2>Crear nuevo producto</h2>
                                    <form className='form-edit-producto w-75' onSubmit={agregarProductoACarta}>
                                        <label>
                                            Categoría:
                                            <select value={categoriaElegida} onChange={(e) => setCategoriaElegida(e.target.value)}>
                                                <option value=''>Selecciona una categoría</option>
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
                                            <textarea rows='4' cols='50' value={newProduct.ingredientes} onChange={(e) => setNewProduct({ ...newProduct, ingredientes: e.target.value })} />
                                        </label>
                                        <label>
                                            Imagen:
                                            <input type="file" onChange={subirImagen} />
                                        </label>
                                        <button className='button1' type="submit">Crear producto</button>
                                    </form>
                                </div>
                            )}

                            <div className="accordion carta" id="accordionExample">
                                {carta.map((item, index) => (
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
                                                            {!producto.imagen && 
                                                            <img src="https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/imagenotfound.jpg?alt=media&token=d53941ce-18b4-4f99-bdea-85e6f86943a9" alt={producto.nombre} />}
                                                            {producto.imagen && 
                                                            <img src={producto.imagen} alt={producto.nombre} />
                                                            }
                                                        </div>
                                                        <div className="producto__info">
                                                            <h2>{producto.nombre}</h2>
                                                            <p><strong>Precio: </strong>{producto.precio} €</p>
                                                            <p><strong>Ingredientes: </strong>{producto.ingredientes}</p>
                                                            <div className='d-flex flex-column gap-2'>
                                                                <p><strong>Acciones: </strong></p>
                                                                <button className='btn btn-outline-warning' onClick={() => editarProducto(producto.id, { ...producto, categoria: item.id })}>Editar</button>
                                                                {editingProduct && producto.id === editingProduct.id && esVisibleFormEditar && (
                                                                    <form className='form form-edit-producto' onSubmit={saveEditarProducto}>
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
                                                                            <input type="file" onChange={subirImagen} />
                                                                        </label>
                                                                        <button type="submit" className='button1'>Guardar cambios</button>
                                                                    </form>
                                                                )}
                                                                <button className='btn btn-outline-danger' onClick={() => eliminarProductoDeCarta(producto.id, item.id)}>Eliminar</button>
                                                            </div>
                                                        </div>                                                
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='d-flex justify-content-center flex-column align-items-center mt-5 mb-5'>
                            <h2>Categorías</h2>
                            <ul className="list-group w-75">
                                {carta.map((item) => (
                                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        {categoriaEditing === item.id ? (
                                            <form className='form form-edit-producto w-100 justify-content-center align-items-center' onSubmit={saveEditarCategoria}>
                                                <div className="d-flex gap-2 w-100 form-edit-categoria">
                                                    <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
                                                    <button type="submit" className='btn btn-primario'>Guardar cambios</button>
                                                </div>
                                            </form>
                                        ) : (
                                            <>
                                                <span>{item.categoria}</span>
                                                <div>
                                                    <button className='btn btn-outline-warning btn-sm me-2' onClick={() => editarCategoria(item.id, item.categoria)}>Editar</button>
                                                    <button className='btn btn-outline-danger btn-sm' onClick={() => eliminarCategoria(item.id)}>Eliminar</button>
                                                </div>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>

                        </div>

                        {mostrarBorrarCategoria && (
                            <div className="modal text-black" tabIndex="-1" role="dialog" style={{ display: 'block'}}>
                                <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header text-danger">
                                            <h5 className="modal-title">Eliminar Categoría</h5>
                                        </div>
                                        <div className="modal-body">
                                            <p>La categoría contiene productos y no se puede eliminar.</p>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-outline-danger" data-dismiss="modal" onClick={() => setMostrarBorrarCategoria(false)}>Cerrar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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
        </div>
    );
}

export default GestionarCarta;
