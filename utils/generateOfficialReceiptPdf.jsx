// utils/generateOfficialReceiptPdf.jsx
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font, Link, Image } from '@react-pdf/renderer';
import React from 'react';

Font.register({
  family: 'Assistant',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/gh/hafontia/Assistant@master/Fonts/TTF/Assistant-Regular.ttf' },
    { src: 'https://cdn.jsdelivr.net/gh/hafontia/Assistant@master/Fonts/TTF/Assistant-Bold.ttf', fontWeight: 'bold' }
  ]
});

const RtlText = ({ text, style, centered }) => (
  <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: centered ? 'center' : 'flex-start' }}>
    {String(text).split(' ').map((word, index) => (
      <Text key={index} style={style}>{word} </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Assistant', fontSize: 12, backgroundColor: '#faf8f5', position: 'relative' },
  watermarkContainer: { position: 'absolute', top: -20, left: -20, right: -20, bottom: -20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', zIndex: -1, overflow: 'hidden' },
  watermarkImage: { width: 140, margin: 25, opacity: 0.05, transform: 'rotate(-35deg)' },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', borderBottomWidth: 3, borderBottomColor: '#d9534f', paddingBottom: 15, marginBottom: 25 },
  headerTitleContainer: { alignItems: 'flex-start', width: '40%' }, 
  receiptTitle: { fontSize: 24, fontWeight: 'bold', color: '#d9534f', textAlign: 'right', marginBottom: 4 },
  dateRow: { flexDirection: 'row-reverse', justifyContent: 'flex-start' },
  date: { fontSize: 10, color: '#555', textAlign: 'right' },
  headerCompanyContainer: { alignItems: 'flex-start', width: '60%' }, 
  logoContainer: { flexDirection: 'row', marginBottom: 8 }, 
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  redText: { color: '#d9534f' },
  mixedRow: { flexDirection: 'row-reverse', justifyContent: 'flex-start', marginBottom: 3, flexWrap: 'wrap' },
  subtitleLabel: { fontSize: 10, color: '#555', textAlign: 'right', fontWeight: 'bold' },
  subtitleColon: { fontSize: 10, color: '#555', marginHorizontal: 2 },
  subtitleValue: { fontSize: 10, color: '#555', textAlign: 'right' },
  linkText: { fontSize: 10, color: '#0066cc', textDecoration: 'underline', textAlign: 'right' },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#d9534f', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 4, marginBottom: 12, marginTop: 25, textAlign: 'right', width: '100%' },
  customerDetailsBox: { flexDirection: 'column', alignItems: 'flex-end', width: '100%' },
  customerLabel: { fontSize: 11, color: '#2b2b2b', fontWeight: 'bold' },
  customerColon: { fontSize: 11, color: '#2b2b2b', marginHorizontal: 2 },
  customerValue: { fontSize: 11, color: '#2b2b2b' },
  table: { width: '100%', marginTop: 15 },
  tableHeader: { flexDirection: 'row-reverse', backgroundColor: '#2b2b2b', padding: 8 },
  tableHeaderText: { color: 'white', fontWeight: 'bold', fontSize: 10, textAlign: 'center' },
  tableRow: { flexDirection: 'row-reverse', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', padding: 8, backgroundColor: '#ffffff', alignItems: 'center' },
  col3: { width: '40%', textAlign: 'center' }, 
  col1: { width: '20%', textAlign: 'center' }, 
  summaryWrapper: { flexDirection: 'row-reverse', justifyContent: 'flex-start', marginTop: 15 },
  summaryTable: { width: '50%' },
  summaryRow: { flexDirection: 'row-reverse', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', backgroundColor: '#f0f0f0' },
  summaryTitle: { width: '60%', padding: 8, color: '#555', textAlign: 'right' },
  summaryValue: { width: '40%', padding: 8, textAlign: 'right' },
  totalRow: { flexDirection: 'row-reverse', backgroundColor: '#d9534f' },
  totalText: { color: 'white', fontWeight: 'bold', padding: 8, textAlign: 'right' },
  paymentNoticeBox: { marginTop: 25, backgroundColor: '#f0fdf4', padding: 12, borderRightWidth: 4, borderRightColor: '#22c55e', alignItems: 'flex-end', width: '100%' },
  paymentNoticeTitle: { fontSize: 12, fontWeight: 'bold', color: '#166534', marginBottom: 4, textAlign: 'right' },
  notes: { marginTop: 15, backgroundColor: '#f9f9f9', padding: 12, borderRightWidth: 4, borderRightColor: '#888', alignItems: 'flex-end', width: '100%' },
  notesTitleRow: { flexDirection: 'row-reverse', marginBottom: 4 },
  notesTitle: { fontWeight: 'bold', fontSize: 10, color: '#555', textAlign: 'right' },
  notesText: { fontSize: 9.5, color: '#555', textAlign: 'right', marginTop: 3 }
});

const OfficialReceiptDocument = ({ receiptNumber, orderNumber, customer, items, paymentMethod, subTotal, vat, total, dateStr }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      <View style={styles.watermarkContainer}>
        {Array.from({ length: 40 }).map((_, i) => (
          <Image key={i} src="https://www.onmotormedia.com/wp-content/uploads/2023/06/onmotor-logo.png" style={styles.watermarkImage} />
        ))}
      </View>
      
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.receiptTitle}>קבלה מס' {receiptNumber}</Text>
          <View style={styles.dateRow}>
            <Text style={styles.date}>תאריך הפקה</Text>
            <Text style={styles.date}>:</Text>
            <RtlText text={dateStr} style={[styles.date, { marginRight: 3 }]} />
          </View>
          {orderNumber && (
             <View style={styles.dateRow}>
               <Text style={styles.date}>עבור הזמנה</Text>
               <Text style={styles.date}>:</Text>
               <Text style={[styles.date, { marginRight: 3 }]}>{orderNumber.replace('#', '')}</Text>
             </View>
          )}
        </View>

        <View style={styles.headerCompanyContainer}>
          <View style={styles.logoContainer}>
            <Text style={[styles.title, styles.redText]}>O</Text>
            <Text style={styles.title}>n</Text>
            <Text style={[styles.title, styles.redText]}>M</Text>
            <Text style={styles.title}>otor </Text>
            <Text style={[styles.title, styles.redText]}>P</Text>
            <Text style={styles.title}>arts</Text>
          </View>
          
          <View style={styles.mixedRow}>
            <Text style={styles.subtitleLabel}>מספר עוסק / שותפות</Text>
            <Text style={styles.subtitleColon}>:</Text>
            <RtlText text="558641379 מ.א. / ס.ת 44 20" style={styles.subtitleValue} />
          </View>
          <View style={styles.mixedRow}>
            <Text style={styles.subtitleLabel}>כתובת</Text>
            <Text style={styles.subtitleColon}>:</Text>
            <RtlText text="הלוחמים 15, בני ברק, מיקוד 5131017" style={styles.subtitleValue} />
          </View>
          <View style={styles.mixedRow}>
            <Text style={styles.subtitleLabel}>טלפון</Text>
            <Text style={styles.subtitleColon}>:</Text>
            <Text style={styles.subtitleValue}>054-6957197</Text>
          </View>
          <View style={styles.mixedRow}>
            <Text style={styles.subtitleLabel}>אתר</Text>
            <Text style={styles.subtitleColon}>:</Text>
            <Link src="https://www.onmotormedia.com/shop" style={styles.linkText}>
              https://www.onmotormedia.com/shop
            </Link>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>פרטי הלקוח</Text>
      <View style={styles.customerDetailsBox}>
        <View style={styles.mixedRow}>
          <Text style={styles.customerLabel}>לכבוד</Text>
          <Text style={styles.customerColon}>:</Text>
          <RtlText text={customer.name} style={styles.customerValue} />
        </View>
        <View style={styles.mixedRow}>
          <Text style={styles.customerLabel}>טלפון</Text>
          <Text style={styles.customerColon}>:</Text>
          <Text style={styles.customerValue}>{customer.phone}</Text>
        </View>
        <View style={styles.mixedRow}>
          <Text style={styles.customerLabel}>כתובת מלאה</Text>
          <Text style={styles.customerColon}>:</Text>
          <RtlText text={customer.address || "לא צוין"} style={styles.customerValue} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>פירוט פריטים ששולמו</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.col3]}>פירוט</Text>
          <Text style={[styles.tableHeaderText, styles.col1]}>כמות</Text>
          <Text style={[styles.tableHeaderText, styles.col1]}>מחיר יחידה</Text>
          <Text style={[styles.tableHeaderText, styles.col1]}>סה"כ</Text>
        </View>
        {items.map((item, i) => (
          <View style={styles.tableRow} key={i}>
            <View style={[styles.col3, { alignItems: 'center' }]}>
              <RtlText centered={true} text={item.title} style={{ fontSize: 10, color: '#2b2b2b', textAlign: 'center' }} />
            </View>
            <Text style={styles.col1}>{item.quantity}</Text>
            <Text style={styles.col1}>{item.price} ₪</Text>
            <Text style={styles.col1}>{(Number(item.price) * Number(item.quantity)).toFixed(2)} ₪</Text>
          </View>
        ))}
      </View>

      <View style={styles.summaryWrapper}>
        <View style={styles.summaryTable}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTitle}>סכום ביניים</Text>
            <Text style={styles.summaryValue}>{subTotal} ₪</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTitle}>מע"מ (17%)</Text>
            <Text style={styles.summaryValue}>{vat} ₪</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.summaryTitle, styles.totalText]}>סה"כ שולם</Text>
            <Text style={[styles.summaryValue, styles.totalText]}>{total} ₪</Text>
          </View>
        </View>
      </View>

      {/* קופסה ירוקה שמאשרת את התשלום ורושמת איך שולם */}
      <View style={styles.paymentNoticeBox}>
        <View style={styles.mixedRow}>
          <Text style={styles.paymentNoticeTitle}>סטטוס</Text>
          <Text style={[styles.paymentNoticeTitle, { marginHorizontal: 2 }]}>:</Text>
          <Text style={styles.paymentNoticeTitle}>שולם במלואו</Text>
        </View>
        <View style={styles.mixedRow}>
          <Text style={{ fontSize: 10, color: '#166534', textAlign: 'right' }}>אופן התשלום</Text>
          <Text style={{ fontSize: 10, color: '#166534', textAlign: 'right', marginHorizontal: 2 }}>:</Text>
          <RtlText text={paymentMethod || "אשראי"} style={{ fontSize: 10, color: '#166534', textAlign: 'right' }} />
        </View>
      </View>

      <View style={styles.notes}>
        <View style={styles.notesTitleRow}>
          <Text style={styles.notesTitle}>הערות ותנאים</Text>
          <Text style={styles.notesTitle}>:</Text>
        </View>
        <RtlText text='תקופת האחריות למוצר תעבורה תהיה עפ"י הנחיית היצרן ולא תפחת מ-3 חודשים או 6,000 ק"מ, לפי המוקדם.' style={styles.notesText} />
        <RtlText text="מסמך ממוחשב זה חתום דיגיטלית באופן מאובטח ומהווה קבלה רשמית על תשלום." style={[styles.notesText, { marginTop: 6 }]} />
      </View>

    </Page>
  </Document>
);

export async function generateOfficialReceiptPdf(receiptNumber, orderNumber, customer, items, paymentMethod) {
  const totalRaw = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const vat = (totalRaw - (totalRaw / 1.17)).toFixed(2);
  const subTotal = (totalRaw / 1.17).toFixed(2);
  const total = totalRaw.toFixed(2);
  const dateStr = new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' });

  const buffer = await renderToBuffer(
    <OfficialReceiptDocument
      receiptNumber={receiptNumber}
      orderNumber={orderNumber}
      customer={customer}
      items={items}
      paymentMethod={paymentMethod}
      subTotal={subTotal}
      vat={vat}
      total={total}
      dateStr={dateStr}
    />
  );
  return buffer;
}