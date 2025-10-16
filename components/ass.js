//  /app/api/forgot-password/route.js
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const usersPath = path.join(process.cwd(), 'data', 'users.json');

function readUsers() {
  if (!fs.existsSync(usersPath)) return [];
  return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
}

function writeUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
}

function generateTempPassword(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function sendEmail(to, subject, html) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: `OnMotor Media <${process.env.SMTP_USER}>`,
    to,
    subject,
    html
  });
}

export async function POST(req) {
  try {
    const { email } = await req.json();
    const users = readUsers();
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
      return new Response(JSON.stringify({ error: 'Email not found' }), { status: 404 });
    }

    const newPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedPassword;
    writeUsers(users);

    const message = `
      <p>שלום,</p>
      <p>בקשת לאפס את הסיסמה שלך. להלן הסיסמה הזמנית החדשה:</p>
      <p><strong>${newPassword}</strong></p>
      <p>מומלץ להיכנס ולהחליף אותה לסיסמה קבועה.</p>
      <p>צוות OnMotor Media</p>
    `;

    await sendEmail(email, 'איפוס סיסמה - OnMotor Media', message);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ✅ /app/api/change-password/route.js
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

//const usersPath = path.join(process.cwd(), 'data', 'users.json');

function readUsers() {
  if (!fs.existsSync(usersPath)) return [];
  return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
}

function writeUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf-8');
}

export async function POST(request) {
  const { username, currentPassword, newPassword } = await request.json();

  if (!username || !currentPassword || !newPassword) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }

  const users = readUsers();
  const userIndex = users.findIndex(u => u.username === username || u.email === username);

  if (userIndex === -1) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }

  const isMatch = await bcrypt.compare(currentPassword, users[userIndex].password);
  if (!isMatch) {
    return new Response(JSON.stringify({ error: 'Incorrect current password' }), { status: 401 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  users[userIndex].password = hashedPassword;
  writeUsers(users);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}



//app\forum\[category]\[slug]\page.jsx
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import PostDetails from '@/components/PostDetails';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function PostPage({ params }) {
  const filePath = path.join(process.cwd(), 'data', 'forum.json');
  const forumData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const category = forumData.find(cat => cat.id === params.category);
  if (!category) return notFound();

  const post = category.posts.find(p => p.id === params.slug);
  if (!post) return notFound();

  const breadcrumbs = [
    { label: 'דף הית', href: '/' },
    { label: 'פורום', href: '/forum' },
    { label: category.name, href: `/forum/${category.id}` },
    { label: post.title }
  ];

  return (
    <PageContainer title={post.title} breadcrumbs={breadcrumbs}>
      

      <PostDetails post={post} />
    </PageContainer>
  );
}


//app\articles\[slug]\page.jsx

import articlesData from "@/data/articlesData";
import PageContainer from "@/components/PageContainer";
import ArticleHeader from "@/components/ArticleHeader";
import SimpleKeyValueTable from "@/components/SimpleKeyValueTable";
import Tags from "@/components/Tags";
import SimilarArticles from "@/components/SimilarArticles";
import CommentForm from "@/components/CommentForm";
import { notFound } from "next/navigation";
import CommentsSection from "@/components/CommentsSection";


export default function ArticlePage({ params }) {
  const rawArticle = articlesData.find(a => a.slug === params.slug);
  if (!rawArticle) return notFound();

  const defaultArticle = {
    title: "כתבה ללא כותרת",
    description: "אין תיאור זמין",
    image: "/default-image.jpg",
    imageSrc: "/default-image.jpg",
    imageAlt: "תמונה כללית",
    author: "מערכת OnMotor",
    date: "2025-06-22",
    time: "10:00",
    tags: [],
    content: "",
    tableData: {},
    href: "",
    category: "general",
    subcategory: "general",
  };

  const article = { ...defaultArticle, ...rawArticle };
  const paragraphs = article.content?.split("\n\n") || [];

  return (
    <PageContainer
      title={article.title}
      breadcrumbs={[
        { label: "דף הבית", href: "/" },
        { label: "כתבות", href: "/articles" },
        { label: article.title }
      ]}
    >
      <div className="mx-auto max-w-[740px] space-y-4 text-right leading-relaxed text-lg">
        {/* 🟠 כותב, תאריך, תמונה */}
        <ArticleHeader
          author={article.author}
          date={article.date}
          time={article.time}
          image={article.image}
          imageSrc={article.imageSrc}
          imageAlt={article.imageAlt}
        />

        {/* 🟢 תוכן הכתבה */}
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}

        {/* 🔵 טבלה אם קיימת */}
        {article.tableData && (
          <SimpleKeyValueTable data={article.tableData} />
        )}

        {/* 🟣 תגיות */}
        <Tags tags={article.tags} />


        {/* 🔴 כתבות דומות */}
        <SimilarArticles currentSlug={article.slug} category={article.category} />
        
        {/* 🟡 מבנה תגובות*/}
        <CommentsSection articleUrl={`https://onmotor-media.com${article.href}`} />


        
      </div>
    </PageContainer>
  );
}



//" clientlayout"

'use client';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { FaFacebook, FaWhatsapp, FaTiktok, FaYoutube, FaTelegram, FaEnvelope, FaInstagram } from "react-icons/fa";
import AuthNewsletterBox from './AuthNewsletterBox';




const suggestions = [
  { title: "סקירת קסדות", path: "/reviews/gear" },
  { title: "סקירת מעיל רכיבה", path: "/reviews/gear" },
  { title: "חדשות אופנועים", path: "/news" },
  { title: "פורום טכני", path: "/forum" },
  { title: "צור קשר", path: "/contact" },
  { title: "כתבה על KTM 1290", path: "/news/ktm-1290" },
  { title: "סקירת GoPro לרוכבים", path: "/reviews/video" },
];

const headlines = [
  { text: "מזל טוב - הונדה מציינת חצי מיליארד מכירות", link: "/news/honda-milestone" },
  { text: "סקירת קסדות עדכניות", link: "/news/helmet-review" },
  { text: "מדריך לרכיבה נכונה בחורף", link: "/guide/winter-riding" },
  { text: "הצטרפו לפורום הרוכבים שלנו", link: "/forum" },
];

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let typingInterval;
    const fullText = headlines[currentHeadline].text;

    setDisplayedText('');
    typingInterval = setInterval(() => {
      setDisplayedText((prev) => {
        if (prev.length < fullText.length) {
          return fullText.slice(0, prev.length + 1);
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            setCurrentHeadline((prev) => (prev + 1) % headlines.length);
          }, 2000);
          return prev;
        }
      });
    }, 80);

    return () => clearInterval(typingInterval);
  }, [currentHeadline]);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setFiltered(
      value.length >= 1
        ? suggestions.filter((s) =>
          s.title.toLowerCase().includes(value.toLowerCase())
        )
        : []
    );
  };

  const handleSelect = (item) => {
    setQuery('');
    setFiltered([]);
    router.push(item.path);
  };

  return (
    <>
      {/* HEADER */}

      <header className="bg-black text-[#C0C0C0] px-6 py-2 flex flex-col md:flex-row justify-between shadow-md border-b border-gray-800 sticky top-0 z-50 w-full">
        <div className="flex items-center gap-4 flex-wrap">
          <img
            src="/OnMotorLogo.Png"
            className="hover:scale-110 transition-transform w-20 cursor-pointer"
            onClick={() => (window.location.href = "/")}
          />
          <div onClick={() => (window.location.href = "/")} className="cursor-pointer">
            <h1 className="hover:scale-110 transition-transform text-4xl font-bold leading-none">
              <span className="text-4.5xl text-[#e60000]">O</span>
              <span className="text-[#C0C0C0]">n</span>
              <span className="text-4.5xl text-[#e60000]">M</span>
              <span className="text-[#C0C0C0]">otor </span>
              <span className="text-4.5xl text-[#e60000]">M</span>
              <span className="text-[#C0C0C0]">edia</span>
            </h1>
            <p className="text-sm mt-1 font-bold">איפה שמנוע וגלגלים פוגשים מדיה</p>
          </div>

          {/* חיפוש */}
          <div className="relative mt-1 md:mt-0">
            <input
              type="text"
              dir="rtl"
              value={query}
              onChange={handleChange}
              placeholder=" חפש באתר"
              className="w-full text-right p-2 rounded border border-[#e60000] text-white shadow"
            />
            {filtered.length > 0 && (
              <ul dir="rtl" className="absolute mt-1 right-0 bg-white text-black w-full z-50 rounded shadow-lg border border-gray-50">
                {filtered.map((item, idx) => (
                  <li
                    key={idx}
                    className="px-3 py-1 hover:bg-gray-200 cursor-pointer border-b"
                    onClick={() => handleSelect(item)}
                  >
                    {item.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* אייקונים */}
        <div className="absolute top-5 right-5 flex gap-4 text-3xl z-50">
          <a href="https://facebook.com/OnMotorMedia" target="_blank" className="hover:scale-120 transition-transform text-[#1877F2]"><FaFacebook /></a>
          <a href="https://chat.whatsapp.com/JjwmpUDyVQl0tKikbpDEJA" target="_blank" className="hover:scale-120 transition-transform text-[#25D366]"><FaWhatsapp /></a>
          <a href="https://tiktok.com/@onmotor_media" target="_blank" className="hover:scale-120 transition-transform text-white"><FaTiktok /></a>
          <a href="https://youtube.com/@onmotormedia" target="_blank" className="hover:scale-120 transition-transform text-[#FF0000]"><FaYoutube /></a>
          <a href="https://t.me/Onmotormedia" target="_blank" className="hover:scale-120 transition-transform text-[#229ED9]"><FaTelegram /></a>
          <a href="https://mail.google.com/mail/?view=cm&to=onmotormedia@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:scale-120 transition-transform text-[#D44638]"><FaEnvelope /></a>
          <a href="https://instagram.com/OnMotor_media" target="_blank" className="hover:scale-120 transition-transform text-[#3f729b]"><FaInstagram /></a>
        </div>

        {/* תפריטים נוספים... (כפי שכבר כתבת בהמשך הקוד) */}
        <div className="flex flex-col justify-end">
          <nav className="flex gap-8 text-lg font-semibold relative">
            <div className="relative group">
              <span className="hover:text-[#e60000] flex items-center gap-0 cursor-pointer text-[#C0C0C0]">
                סקירות <span className="text-sm">▼</span>
              </span>

              <div
                className="absolute right-0 mt-0 w-100 bg-black rounded p-2 z-50 text-right
                     opacity-100 group-hover:opacity-100 
                     invisible group-hover:visible 
                     transition-all duration-100 
                     pointer-events-none group-hover:pointer-events-auto"
              >
                <Link href="/reviews/motorcycles" className="block px-4 py-2 text-sm hover:text-[#e60000]"> מבחני דרכים</Link>
                <Link href="/reviews/gear" className="block px-4 py-2 text-sm hover:text-[#e60000]"> סקירות ציוד</Link>
                <Link href="/reviews/video" className="block px-4 py-2 text-sm hover:text-[#e60000]"> סקירות וידאו</Link>
              </div>
            </div>
            {/* תפריט נפתח - חדשות */}
            <div className="relative group">
              <Link href="/news">
                <span className="hover:text-[#e60000] flex items-center gap-0 cursor-pointer text-[#C0C0C0] hold:text">
                  חדשות <span className="text-sm">▼</span>
                </span>
              </Link>
              <div className="absolute right-0 mt-0 w-100 bg-black rounded p-2 z-50 text-right
                     opacity-100 group-hover:opacity-100 
                     invisible group-hover:visible 
                     transition-all duration-100 
                     pointer-events-none group-hover:pointer-events-auto">
                <Link href="/news/local" className="block px-4 py-1 text-sm hover:text-[#e60000]">חדשות מקומיות</Link>
                <Link href="/news/global" className="block px-4 py-1 text-sm hover:text-[#e60000]">חדשות מהעולם</Link>
              </div>
            </div>
            {/* ציוד */}
            <div className="relative group">
              <span className="hover:text-[#e60000] cursor-pointer flex items-center gap-1">
                ציוד <span className="text-sm">▼</span>
              </span>
              <div className="absolute right-0 mt-0 w-100 bg-black rounded p-2 z-50 text-right
                     opacity-100 group-hover:opacity-100 
                     invisible group-hover:visible 
                     transition-all duration-100 
                     pointer-events-none group-hover:pointer-events-auto">
                <Link href="/gear/helmets" className="block px-4 py-1 text-sm hover:text-[#e60000]">קסדות</Link>
                <Link href="/gear/jackets" className="block px-4 py-1 text-sm hover:text-[#e60000]">מעילים</Link>
                <Link href="/gear/gloves" className="block px-4 py-1 text-sm hover:text-[#e60000]">כפפות</Link>
              </div>
            </div>
            {/* פורום */}
            <div className="relative group">
              <span className="hover:text-[#e60000] cursor-pointer flex items-center gap-1">
                פורום <span className="text-sm">▼</span>
              </span>
              <div className="absolute right-0 mt-0 w-100 bg-black rounded p-2 z-50 text-right
                     opacity-100 group-hover:opacity-100 
                     invisible group-hover:visible 
                     transition-all duration-100 
                     pointer-events-none group-hover:pointer-events-auto">
                <Link href="/forum/tech" className="block px-4 py-1 text-sm hover:text-[#e60000]">פורום טכני</Link>
                <Link href="/forum/rides" className="block px-4 py-1 text-sm hover:text-[#e60000]">טיולים</Link>
                <Link href="/forum/sale" className="block px-4 py-1 text-sm hover:text-[#e60000]">קנייה/מכירה</Link>
              </div>
            </div>
            {/* פורום */}
            <div className="relative group">
              <span className="hover:text-[#e60000] cursor-pointer flex items-center gap-1">
                בלוג <span className="text-sm">▼</span>
              </span>
              <div className="absolute right-0 mt-0 w-100 bg-black rounded p-2 z-50 text-right
                     opacity-100 group-hover:opacity-100 
                     invisible group-hover:visible 
                     transition-all duration-100 
                     pointer-events-none group-hover:pointer-events-auto">
                <Link href="/forum/tech" className="block px-4 py-1 text-sm hover:text-[#e60000]">אחד על אחד(פודקאסט)</Link>
                <Link href="/forum/rides" className="block px-4 py-1 text-sm hover:text-[#e60000]">בקסדה</Link>
                <Link href="/forum/sale" className="block px-4 py-1 text-sm hover:text-[#e60000]">על הנייר</Link>
              </div>
            </div>

            {/* צור קשר */}
            <div className="relative group">
              <span className="hover:text-[#e60000] cursor-pointer flex items-center gap-1">
                צור קשר <span className="text-sm">▼</span>
              </span>
              <div className="absolute right-0 mt-0 w-100 bg-black rounded p-2 z-50 text-right
                      opacity-100 group-hover:opacity-100 
                      invisible group-hover:visible 
                      transition-all duration-100 
                      pointer-events-none group-hover:pointer-events-auto">
                <a
                  href="https://wa.me/972522304604"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-1 text-sm hover:text-[#e60000]"
                >
                  צור קשר בוואטסאפ
                </a>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=onmotormedia@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-1 text-sm hover:text-[#e60000]"
                >
                  Gmail שלח מייל דרך
                </a>
              </div>
            </div>

          </nav>
        </div>

      </header>

      {/* תיבת הרשמה / התחברות */}
      <AuthNewsletterBox />

      {/* טיקר חדשות - עד חצי עמוד וללא מרווח מלמעלה */}
      <div dir="rtl" className="bg-[#e60000] px-5 font-bold text-lm overflow-hidden whitespace-nowrap flex items-center w-1/2 ml-auto h-[40px] sticky top-[97px] z-40">
        <span className="shrink-0 ml-3 text-lm leading-[40px]">מה חדש:</span>
        {isClient && (
          <a href={headlines[currentHeadline].link} className="hover:underline text-white truncate leading-[40px] text-sm w-full">
            {displayedText}
          </a>
        )}
      </div>

      {/* תוכן הדף */}
      <main className="min-h-screen">{children}</main>


      <footer className="bg-black text-[#C0C0C0] px-6 pt-1 pb-2 shadow-md border-t border-gray-800 w-full">
        {/* רצועת אייקונים */}
        <div className="flex flex-wrap justify-center md:justify-end gap-4 text-2xl mb-2">
          <a href="https://facebook.com/OnMotorMedia" target="_blank" className="hover:scale-110 transition-transform text-[#1877F2]">
            <FaFacebook />
          </a>
          <a href="https://chat.whatsapp.com/JjwmpUDyVQl0tKikbpDEJA" target="_blank" className="hover:scale-110 transition-transform text-[#25D366]">
            <FaWhatsapp />
          </a>
          <a href="https://tiktok.com/@onmotor_media" target="_blank" className="hover:scale-110 transition-transform text-white">
            <FaTiktok />
          </a>
          <a href="https://youtube.com/@onmotormedia" target="_blank" className="hover:scale-110 transition-transform text-[#FF0000]">
            <FaYoutube />
          </a>
          <a href="https://t.me/Onmotormedia" target="_blank" className="hover:scale-110 transition-transform text-[#229ED9]">
            <FaTelegram />
          </a>
          <a href="https://mail.google.com/mail/?view=cm&to=onmotormedia@gmail.com" target="_blank" className="hover:scale-110 transition-transform text-[#D44638]">
            <FaEnvelope />
          </a>
          <a href="https://instagram.com/OnMotor_media" target="_blank" className="hover:scale-110 transition-transform text-[#3f729b]">
            <FaInstagram />
          </a>
        </div>

        {/* טקסט זכויות יוצרים */}
        <div className="text-center text-xs md:text-sm border-t border-gray-700 pt-3">
          &copy; {new Date().getFullYear()} OnMotor Media - כל הזכויות שמורות.
        </div>
      </footer>
    </>
  );
}


//layout.js

import './globals.css';
import ClientLayout from './components/ClientLayout';


export const metadata = {
  title: 'OnMotor Media',
  description: 'מגזין הדו-גלגלי של ישראל',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}


//news



import Link from 'next/link';

export default function NewsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-gray-100 px-4 py-4 text-[#111]">
      <h1 className="text-2xl font-bold text-[#e60000] mb-4">חדשות</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* חדשות מקומיות */}
        <div className="bg-white rounded shadow-md p-4">
          <h2 className="text-xl font-semibold text-[#e60000] mb-2">חדשות מקומיות</h2>
          <p className="text-sm text-gray-700 mb-2">כאן תמצאו את כל מה שקורה בארץ.</p>
          <Link href="/news/local" className="text-blue-600 hover:underline">צפה בכל הכתבות המקומיות →</Link>
        </div>

        {/* חדשות עולמיות */}
        <div className="bg-white rounded shadow-md p-4">
          <h2 className="text-xl font-semibold text-[#e60000] mb-2">חדשות עולמיות</h2>
          <p className="text-sm text-gray-700 mb-2">מבט גלובלי על עולם הרכב והתחבורה.</p>
          <Link href="/news/global" className="text-blue-600 hover:underline">צפה בכל הכתבות מהעולם →</Link>
        </div>
      </div>
    </main>
  );
}

export default function NewsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-gray-100 px-4 py-4 text-[#111]">
      <h1 className="text-2xl font-bold text-[#e60000] mb-4">חדשות</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* חדשות מקומיות */}
        <div className="bg-white rounded shadow-md p-4">
          <h2 className="text-xl font-semibold text-[#e60000] mb-2">חדשות מקומיות</h2>
          <p className="text-sm text-gray-700 mb-2">כאן תמצאו את כל מה שקורה בארץ.</p>
          <Link href="/news/local" className="text-blue-600 hover:underline">צפה בכל הכתבות המקומיות →</Link>
        </div>

        {/* חדשות עולמיות */}
        <div className="bg-white rounded shadow-md p-4">
          <h2 className="text-xl font-semibold text-[#e60000] mb-2">חדשות עולמיות</h2>
          <p className="text-sm text-gray-700 mb-2">מבט גלובלי על עולם הרכב והתחבורה.</p>
          <Link href="/news/global" className="text-blue-600 hover:underline">צפה בכל הכתבות מהעולם →</Link>
        </div>
      </div>
    </main>
  );
}
