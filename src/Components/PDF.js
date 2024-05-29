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
    image: {
        width: '100px',
        height: '100px'
    },
    title: {
        fontSize: 24,
        textAlign: 'center'
    }
});

function PDF({ mesa, horaApertura }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Image style={styles.image} src={PLlogo} />
                    <Text style={styles.title}>Cuenta</Text>
                    <Text>Mesa: {mesa}</Text>
                    <Text>Hora de apertura: {horaApertura}</Text>
                </View>
            </Page>
        </Document>
    );
}

export default PDF;