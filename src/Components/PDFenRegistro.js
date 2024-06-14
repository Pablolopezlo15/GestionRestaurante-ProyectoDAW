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
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'row',  
        width: '65%',
        height: '80px'  
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
    textCenter: {
        fontSize: 10,
        textAlign: 'center'
    },
    textTotal: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'right'
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
    barraHorizontal: {
        height: 1,
        backgroundColor: '#000', 
        marginVertical: 5,
    },
});

function PDFenRegistro({ mesa, dia, horaApertura, comandasPendientes, usuario }) {
    return (
        <Document>
            <Page size={[80 * 2.83465, 'auto']} style={styles.page}>
                <View style={styles.section}>

                    <View style={styles.imagediv}>
                        <Image style={styles.image} src={PLlogo} />
                        <View>
                            <Text style={styles.text}>Restaurante Pablo López</Text>
                            <Text style={styles.text}>C/ Recogidas, Granada</Text>
                            <Text style={styles.text}>Teléfono: 722276894</Text>
                        </View>
                    </View>
                    <View style={styles.barraHorizontal} />
                    <Text style={styles.text}>Atendido por: {usuario}</Text>
                    <Text style={styles.text}>Fecha: {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}</Text>
                    <Text style={styles.text}>Hora de apertura: {horaApertura} - {dia}</Text>
                    <View style={styles.barraHorizontal} />

                    <View style={styles.table}>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableColHeader}>Producto</Text>
                            <Text style={styles.tableColHeader}>Cantidad</Text>
                            <Text style={styles.tableColHeader}>Precio</Text>
                            <Text style={styles.tableColHeader}>Importe</Text>
                        </View>
                        {comandasPendientes.map((comanda, comandaIndex) => (
                          comanda.productos.map((producto, productoIndex) => (
                            <View key={`comanda-${comandaIndex}-producto-${productoIndex}`} style={styles.tableRow}>
                              <Text style={styles.tableCol}>{producto.nombre}</Text>
                              <Text style={styles.tableCol}>{producto.cantidad}</Text>
                              <Text style={styles.tableCol}>{parseFloat(producto.precio).toFixed(2).replace('.', ',')}€</Text>
                              <Text style={styles.tableCol}>{(parseFloat(producto.precio) * producto.cantidad).toFixed(2).replace('.', ',')}€</Text>
                            </View>
                          ))
                        ))}
                    </View>
                    <View style={styles.barraHorizontal} />

                    <Text style={styles.textTotal}>Total (Impuestos Incluidos): 
                      {comandasPendientes.reduce((total, comanda) => {
                          return total + comanda.productos.reduce((acc, producto) => acc + (parseFloat(producto.precio) * producto.cantidad), 0);
                      }, 0).toFixed(2).replace('.', ',')}€
                    </Text>
                </View>
            </Page>
        </Document>
    );
}

export default PDFenRegistro;