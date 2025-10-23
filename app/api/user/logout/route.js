// app/api/user/logout/route.js
import { serialize } from 'cookie';

export async function POST() {
    try {
        // יצירת עוגייה שתחליף את 'token' ותגדיר את תפוגתה לעבר.
        // maxAge: 0 - קריטי למחיקת העוגייה מיידית.
        const cookie = serialize('token', '', {
            httpOnly: true,
            secure: true, // חובה: להתאים להגדרות ה-Login לצורך יציבות ב-HTTPS
            sameSite: 'Lax', // חובה: להתאים להגדרות ה-Login
            path: '/',
            maxAge: 0, // תיקון: הגדרת התפוגה לאפס מוחקת את העוגייה
        });

        console.log('נשלחה עוגייה למחיקה באמצעות maxAge=0');

        // החזרת תשובה שמכילה את כותרת מחיקת העוגייה
        return new Response(JSON.stringify({ success: true, message: 'התנתקות מוצלחת' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': cookie,
            },
        });
    } catch (err) {
        console.error('שגיאת התנתקות:', err);
        return new Response(JSON.stringify({ error: 'שגיאה פנימית בשרת' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
