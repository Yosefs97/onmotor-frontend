// utils/generatePdf.jsx
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import React from 'react';

// משיכת פונט עברי 
Font.register({
  family: 'Assistant',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/gh/googlefonts/assistant@main/fonts/ttf/Assistant-Regular.ttf' },
    { src: 'https://cdn.jsdelivr.net/gh/googlefonts/assistant@main/fonts/ttf/Assistant-Bold.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Assistant', fontSize: 12, backgroundColor: '#faf8f5', direction: 'rtl' },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', borderBottomWidth: 3, borderBottomColor: '#d9534f', paddingBottom: 15, marginBottom: 25 },
  headerRight: { alignItems: 'flex-start' },
  headerLeft: { alignItems: 'flex-end' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a' },
  subtitle: { fontSize: 12, color: '#555', marginTop: 4 },
  receiptTitle: { fontSize: 16, fontWeight: 'bold', color: '#d9534f' },
  date: { fontSize: 10, color: '#555', marginTop: 5 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#d9534f', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 4, marginBottom: 12, marginTop: 25 },
  customerDetails: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 5 },
  customerText: { fontSize: 11, color: '#2b2b2b' },
  table: { width: '100%', marginTop: 15 },
  tableHeader: { flexDirection: 'row-reverse', backgroundColor: '#2b2b2b', padding: 8 },
  tableHeaderText: { color: 'white', fontWeight: 'bold', fontSize: 10, textAlign: 'right' },
  tableRow: { flexDirection: 'row-reverse', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', padding: 8, backgroundColor: '#ffffff' },
  col3: { width: '40%', textAlign: 'right', paddingRight: 5 },
  col1: { width: '20%', textAlign: 'right', paddingRight: 5 },
  summaryWrapper: { flexDirection: 'row', justifyContent: 'flex-start', marginTop: 15 },
  summaryTable: { width: '50%' },
  summaryRow: { flexDirection: 'row-reverse', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', backgroundColor: '#f0f0f0' },
  summaryTitle: { width: '60%', padding: 8, color: '#555', textAlign: 'right' },
  summaryValue: { width: '40%', padding: 8, textAlign: 'right' },
  totalRow: { flexDirection: 'row-reverse', backgroundColor: '#d9534f' },
  totalText: { color: 'white', fontWeight: 'bold', padding: 8 },
  notes: { marginTop: 40, backgroundColor: '#f0f0f0', padding: 15, borderRightWidth: 4, borderRightColor: '#d9534f' },
  notesText: { fontSize: 9.5, color: '#555' }
});

const ReceiptDocument = ({ orderNumber, customer, cartItems, subTotal, vat, total, dateStr }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <Text style={styles.title}>OnMotor Media</Text>
          <Text style={styles.subtitle}>אסף אפריים ויוסף סבג - אופקים</Text>
        </View>
        <View style={styles.headerLeft}>
          <Text style={styles.receiptTitle}>קבלה מס' {orderNumber.replace('#', '')}</Text>
          <Text style={styles.date}>תאריך מסמך: {dateStr}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>פרטי הלקוח</Text>
      <View style={styles.customerDetails}>
        <Text style={styles.customerText}>לכבוד: {customer.name}</Text>
        <Text style={styles.customerText}>טלפון: {customer.phone}</Text>
      </View>
      <View style={styles.customerDetails}>
        <Text style={styles.customerText}>כתובת: {customer.address}</Text>
      </View>

      <Text style={styles.sectionTitle}>פירוט פריטים ושירותים</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.col3]}>פירוט</Text>
          <Text style={[styles.tableHeaderText, styles.col1]}>כמות</Text>
          <Text style={[styles.tableHeaderText, styles.col1]}>מחיר יחידה</Text>
          <Text style={[styles.tableHeaderText, styles.col1]}>סה"כ</Text>
        </View>
        {cartItems.map((item, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={styles.col3}>{item.title}</Text>
            <Text style={styles.col1}>{item.quantity}</Text>
            <Text style={styles.col1}>₪{item.price?.amount || 0}</Text>
            <Text style={styles.col1}>₪{((item.price?.amount || 0) * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summaryWrapper}>
        <View style={styles.summaryTable}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTitle}>סכום ביניים</Text>
            <Text style={styles.summaryValue}>₪{subTotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTitle}>מע"מ (17%)</Text>
            <Text style={styles.summaryValue}>₪{vat}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.summaryTitle, styles.totalText]}>סה"כ לתשלום</Text>
            <Text style={[styles.summaryValue, styles.totalText]}>₪{total}</Text>
          </View>
        </View>
      </View>

      <View style={styles.notes}>
        <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#555' }}>הערות ותנאים:</Text>
        <Text style={styles.notesText}>תקופת האחריות למוצר תעבורה תהיה עפ"י הנחיית היצרן ולא תפחת מ-3 חודשים או 6,000 ק"מ, לפי המוקדם.</Text>
        <Text style={[styles.notesText, { marginTop: 10, textAlign: 'center' }]}>מסמך ממוחשב זה חתום דיגיטלית באופן מאובטח.</Text>
      </View>

    </Page>
  </Document>
);

export async function generateReceiptPdf(orderNumber, customer, cartItems) {
  const total = cartItems.reduce((sum, item) => sum + (item.price?.amount || 0) * item.quantity, 0);
  const vat = (total - (total / 1.17)).toFixed(2);
  const subTotal = (total / 1.17).toFixed(2);
  const dateStr = new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' });

  // הפקודה שונתה ל-renderToBuffer שעובדת מעולה בסביבת השרתים של Vercel
  const buffer = await renderToBuffer(
    <ReceiptDocument
      orderNumber={orderNumber}
      customer={customer}
      cartItems={cartItems}
      subTotal={subTotal}
      vat={vat}
      total={total.toFixed(2)}
      dateStr={dateStr}
    />
  );

  return buffer;
}