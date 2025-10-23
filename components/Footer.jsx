// components/Footer.jsx
'use client';
import React from "react";
import {
  FaFacebook,
  FaWhatsapp,
  FaTiktok,
  FaYoutube,
  FaTelegram,
  FaEnvelope,
  FaInstagram,
} from "react-icons/fa";
import LegalLinks from "@/components/LegalLinks";

export default function Footer() {
  return (
    <footer
      id="footer"
      className="bg-black text-[#C0C0C0] px-6 pt-1 pb-2 shadow-md border-t border-gray-800 w-full"
    >
      {/* אייקונים חברתיים */}
      <div className="flex justify-center md:justify-end gap-4 text-2xl mb-1">
        <a
          href="https://facebook.com/OnMotorMedia"
          target="_blank"
          className="hover:scale-120 transition-transform text-[#1877F2]"
        >
          <FaFacebook />
        </a>
        <a
          href="https://chat.whatsapp.com/JjwmpUDyVQl0tKikbpDEJA"
          target="_blank"
          className="hover:scale-120 transition-transform text-[#25D366]"
        >
          <FaWhatsapp />
        </a>
        <a
          href="https://tiktok.com/@onmotor_media"
          target="_blank"
          className="hover:scale-120 transition-transform text-white"
        >
          <FaTiktok />
        </a>
        <a
          href="https://youtube.com/@onmotormedia"
          target="_blank"
          className="hover:scale-120 transition-transform text-[#FF0000]"
        >
          <FaYoutube />
        </a>
        <a
          href="https://t.me/Onmotormedia"
          target="_blank"
          className="hover:scale-120 transition-transform text-[#229ED9]"
        >
          <FaTelegram />
        </a>
        <a
          href="https://mail.google.com/mail/?view=cm&to=onmotormedia@gmail.com"
          target="_blank"
          className="hover:scale-120 transition-transform text-[#D44638]"
        >
          <FaEnvelope />
        </a>
        <a
          href="https://instagram.com/OnMotor_media"
          target="_blank"
          className="hover:scale-120 transition-transform text-[#3f729b]"
        >
          <FaInstagram />
        </a>
      </div>

      {/* שורה תחתונה עם זכויות וקישורים */}
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-between border-t border-gray-700 pt-3 text-xs md:text-sm">
        {/* טקסט הזכויות */}
        <div className="text-center md:text-right md:ml-[1cm]">
          &copy; {new Date().getFullYear()} OnMotor Media - כל הזכויות שמורות.
        </div>

        {/* קישורי מדיניות */}
        <div className="hidden md:block md:mr-[1cm]">
          <LegalLinks layout="horizontal" />
        </div>
      </div>
    </footer>
  );
}
