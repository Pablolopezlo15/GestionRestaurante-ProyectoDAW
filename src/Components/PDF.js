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
    }
});

function PDF({ mesa, horaApertura }) {
    return (
        <Document>
            <Page size={[57 * 2.83465, 'auto']} style={styles.page}>
                {/* <Page size="A4" style={styles.page}> */}
                <View style={styles.section}>
                    <View style={styles.imagediv}>
                        <Image style={styles.image} src={PLlogo} />
                    </View>
                    <Text style={styles.text}>Mesa: {mesa}</Text>
                    <Text style={styles.text}>Hora de apertura: {horaApertura}</Text>
                    <Text style={styles.title}>Cuenta</Text>

                </View>
            </Page>
        </Document>
    );
}

export default PDF;