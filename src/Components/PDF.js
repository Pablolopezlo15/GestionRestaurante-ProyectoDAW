import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import PLlogo from '../assets/img/logo512.png'

const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#E4E4E4'
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1
    },
    imagediv: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',  
        width: '100px',
        height: '100px'  
    },
    image: {
        width: '100%',
        height: '100%'
    },
    title: {
        fontSize: 14,
        textAlign: 'center'
    },
    text: {
        fontSize: 10,
    },
    table: {
        display: "table",
        width: "auto",
        borderStyle: "solid",
        borderColor: '#bfbfbf',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0
    },
    tableRow: { 
        margin: "auto", 
        flexDirection: "row" 
    },
    tableCol: { 
        width: "25%", 
        fontSize: 8,
        borderStyle: "solid", 
        borderColor: '#bfbfbf',
        borderBottomColor: '#ffffff',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0
    },
    tableColHeader: {
        width: "25%", 
        fontSize: 10,
        borderStyle: "solid", 
        borderColor: '#bfbfbf',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: '#bfbfbf'
    },
});

function PDF({ mesa, horaApertura, comandasPendientes }) {
    return (
        <Document>
            <Page size={[80 * 2.83465, 'auto']} style={styles.page}>
                <View style={styles.section}>
                    <View style={styles.imagediv}>
                        <Image style={styles.image} src={PLlogo} />
                    </View>
                    {/* <Text style={styles.text}>Mesa: {mesa}</Text> */}
                    <Text style={styles.text}>Hora de apertura: {horaApertura}</Text>
                    <Text style={styles.title}>Cuenta</Text>
                    <View style={styles.table}>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableColHeader}>Producto</Text>
                            <Text style={styles.tableColHeader}>Cantidad</Text>
                            <Text style={styles.tableColHeader}>Precio</Text>
                            <Text style={styles.tableColHeader}>Total</Text>
                        </View>
                        {comandasPendientes.map((comanda) => (
                            comanda.idMesa === mesa &&
                            comanda.productos.map((producto) => (
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableCol}>{producto.nombre}</Text>
                                    <Text style={styles.tableCol}>{producto.cantidad}</Text>
                                    <Text style={styles.tableCol}>{producto.precio}</Text>
                                    <Text style={styles.tableCol}>{producto.precio * producto.cantidad}</Text>
                                </View>
                            ))
                        ))}
                    </View>
                    <Text style={styles.text}>Total: {comandasPendientes.filter(comanda => comanda.idMesa === mesa).reduce((total, comanda) => {
                        return total + comanda.productos.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
                    }, 0)}€</Text>
                </View>
            </Page>
        </Document>
    );
}

export default PDF;