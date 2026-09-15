// utils/generatePdf.jsx
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer';
import React from 'react';

// משיכת פונט עברי מהמאגר המקורי
Font.register({
  family: 'Assistant',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/gh/hafontia/Assistant@master/Fonts/TTF/Assistant-Regular.ttf' },
    { src: 'https://cdn.jsdelivr.net/gh/hafontia/Assistant@master/Fonts/TTF/Assistant-Bold.ttf', fontWeight: 'bold' }
  ]
});

// פונקציית קסם שמונעת התהפכות של מספרים וסימני פיסוק בתוך משפטים בעברית
const RtlText = ({ text, style }) => (
  <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
    {String(text).split(' ').map((word, index) => (
      <Text key={index} style={style}>{word} </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Assistant', fontSize: 12, backgroundColor: '#faf8f5' },
  
  // הדר
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', borderBottomWidth: 3, borderBottomColor: '#d9534f', paddingBottom: 15, marginBottom: 25 },
  
  headerTitleContainer: { alignItems: 'flex-start', width: '40%' }, 
  receiptTitle: { fontSize: 22, fontWeight: 'bold', color: '#d9534f', textAlign: 'right', marginBottom: 4 },
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
  
  // טבלה
  table: { width: '100%', marginTop: 15 },
  tableHeader: { flexDirection: 'row-reverse', backgroundColor: '#2b2b2b', padding: 8 },
  tableHeaderText: { color: 'white', fontWeight: 'bold', fontSize: 10, textAlign: 'right' },
  tableRow: { flexDirection: 'row-reverse', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', padding: 8, backgroundColor: '#ffffff' },
  col3: { width: '40%', paddingRight: 5, alignItems: 'flex-start' }, // יישור כותרת הפריט
  col1: { width: '20%', textAlign: 'right', paddingRight: 5 },
  
  // סיכום מחירון
  summaryWrapper: { flexDirection: 'row-reverse', justifyContent: 'flex-start', marginTop: 15 },
  summaryTable: { width: '50%' },
  summaryRow: { flexDirection: 'row-reverse', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', backgroundColor: '#f0f0f0' },
  summaryTitle: { width: '60%', padding: 8, color: '#555', textAlign: 'right' },
  summaryValue: { width: '40%', padding: 8, textAlign: 'right' },
  totalRow: { flexDirection: 'row-reverse', backgroundColor: '#d9534f' },
  totalText: { color: 'white', fontWeight: 'bold', padding: 8, textAlign: 'right' },
  
  // התראת תשלום
  unpaidNoticeBox: { marginTop: 25, backgroundColor: '#fff5f5', padding: 12, borderRightWidth: 4, borderRightColor: '#d9534f', alignItems: 'flex-end', width: '100%' },
  unpaidNoticeTitle: { fontSize: 12, fontWeight: 'bold', color: '#d9534f', marginBottom: 4, textAlign: 'right' },
  unpaidNoticeText: { fontSize: 10, color: '#444', textAlign: 'right' },

  // הערות ותנאים
  notes: { marginTop: 15, backgroundColor: '#f9f9f9', padding: 12, borderRightWidth: 4, borderRightColor: '#888', alignItems: 'flex-end', width: '100%' },
  notesTitleRow: { flexDirection: 'row-reverse', marginBottom: 4 },
  notesTitle: { fontWeight: 'bold', fontSize: 10, color: '#555', textAlign: 'right' },
  notesText: { fontSize: 9.5, color: '#555', textAlign: 'right', marginTop: 3 }
});

const ReceiptDocument = ({ orderNumber, customer, cartItems, subTotal, vat, total, dateStr }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* 1. הדר */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.receiptTitle}>סיכום הזמנה {orderNumber.replace('#', '')}</Text>
          <View style={styles.dateRow}>
            <Text style={styles.date}>תאריך מסמך</Text>
            <Text style={styles.date}>:</Text>
            {/* שימוש ברכיב הקסם לתאריך */}
            <RtlText text={dateStr} style={[styles.date, { marginRight: 3 }]} />
          </View>
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
            {/* שימוש ברכיב הקסם למספר עוסק */}
            <RtlText text="558641379 מ.א. / ס.ת 44 20" style={styles.subtitleValue} />
          </View>

          <View style={styles.mixedRow}>
            <Text style={styles.subtitleLabel}>כתובת</Text>
            <Text style={styles.subtitleColon}>:</Text>
            {/* שימוש ברכיב הקסם לכתובת החברה */}
            <RtlText text="הלוחמים 15, בני ברק, מיקוד 5131017" style={styles.subtitleValue} />
          </View>

          <View style={styles.mixedRow}>
            <Text style={styles.subtitleLabel}>טלפון</Text>
            <Text style={styles.subtitleColon}>:</Text>
            <Text style={styles.subtitleValue}>054-6957197</Text>
          </View>

          <View style={styles.mixedRow}>
            <Text style={styles.subtitleLabel}>דוא"ל</Text>
            <Text style={styles.subtitleColon}>:</Text>
            <Text style={styles.subtitleValue}>onmotorparts@gmail.com</Text>
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

      {/* 2. פרטי הלקוח */}
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
          <RtlText text={customer.address} style={styles.customerValue} />
        </View>
      </View>

      {/* 3. טבלת פריטים */}
      <Text style={styles.sectionTitle}>פירוט פריטים ושירותים</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.col3, { alignItems: 'flex-end' }]}>פירוט</Text>
          <Text style={[styles.tableHeaderText, styles.col1]}>כמות</Text>
          <Text style={[styles.tableHeaderText, styles.col1]}>מחיר יחידה</Text>
          <Text style={[styles.tableHeaderText, styles.col1]}>סה"כ</Text>
        </View>
        {cartItems.map((item, i) => (
          <View style={styles.tableRow} key={i}>
            <View style={styles.col3}>
               {/* שימוש ברכיב הקסם לכותרת המוצר (כדי שמספרים כמו KTM 1090 לא יתהפכו) */}
              <RtlText text={item.title} style={{ fontSize: 10, color: '#2b2b2b' }} />
            </View>
            <Text style={styles.col1}>{item.quantity}</Text>
            <Text style={styles.col1}>{item.price?.amount || 0} ₪</Text>
            <Text style={styles.col1}>{((item.price?.amount || 0) * item.quantity).toFixed(2)} ₪</Text>
          </View>
        ))}
      </View>

      {/* 4. סיכום מחירים */}
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
            <Text style={[styles.summaryTitle, styles.totalText]}>סה"כ לתשלום</Text>
            <Text style={[styles.summaryValue, styles.totalText]}>{total} ₪</Text>
          </View>
        </View>
      </View>

      {/* 5. קופסת התראת תשלום */}
      <View style={styles.unpaidNoticeBox}>
        <View style={styles.mixedRow}>
          <Text style={styles.unpaidNoticeTitle}>לתשומת לבך</Text>
          <Text style={[styles.unpaidNoticeTitle, { marginHorizontal: 2 }]}>:</Text>
          <Text style={styles.unpaidNoticeTitle}>הזמנה זו טרם שולמה</Text>
        </View>
        <RtlText text="נציג מטעמנו ייצור עמך קשר בהקדם האפשרי לצורך השלמת התשלום ותיאום פרטי המשלוח." style={styles.unpaidNoticeText} />
      </View>

      {/* 6. הערות ותנאים */}
      <View style={styles.notes}>
        <View style={styles.notesTitleRow}>
          <Text style={styles.notesTitle}>הערות ותנאים</Text>
          <Text style={styles.notesTitle}>:</Text>
        </View>
        <RtlText text='תקופת האחריות למוצר תעבורה תהיה עפ"י הנחיית היצרן ולא תפחת מ-3 חודשים או 6,000 ק"מ, לפי המוקדם.' style={styles.notesText} />
        <RtlText text="מסמך ממוחשב זה אינו מהווה חשבונית מס וחתום דיגיטלית באופן מאובטח." style={[styles.notesText, { marginTop: 6 }]} />
      </View>

    </Page>
  </Document>
);

export async function generateReceiptPdf(orderNumber, customer, cartItems) {
  const total = cartItems.reduce((sum, item) => sum + (item.price?.amount || 0) * item.quantity, 0);
  const vat = (total - (total / 1.17)).toFixed(2);
  const subTotal = (total / 1.17).toFixed(2);
  const dateStr = new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' });

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