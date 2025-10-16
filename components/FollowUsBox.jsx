// components/FollowUsBox.jsx
'use client';
import { FaFacebook, FaWhatsapp, FaTiktok, FaYoutube, FaTelegram, FaEnvelope, FaInstagram } from "react-icons/fa";

export default function FollowUsBox() {
  return (
    <div className="bg-white shadow-md rounded-md overflow-hidden relative mb-4">
      <h3 className="bg-red-600 text-white font-bold text-lg px-3 py-2">
        מוזמנים לעקוב אחרינו
      </h3>

      <div className="flex justify-around items-center py-4 text-3xl">
        <a
          href="https://facebook.com/OnMotorMedia"
          target="_blank"
          className="hover:scale-110 transition-transform text-[#1877F2]"
        >
          <FaFacebook />
        </a>
        <a
          href="https://chat.whatsapp.com/JjwmpUDyVQl0tKikbpDEJA"
          target="_blank"
          className="hover:scale-110 transition-transform text-[#25D366]"
        >
          <FaWhatsapp />
        </a>
        <a
          href="https://tiktok.com/@onmotor_media"
          target="_blank"
          className="hover:scale-110 transition-transform text-black"
        >
          <FaTiktok />
        </a>
        <a
          href="https://youtube.com/@onmotormedia"
          target="_blank"
          className="hover:scale-110 transition-transform text-[#FF0000]"
        >
          <FaYoutube />
        </a>
        <a
          href="https://t.me/Onmotormedia"
          target="_blank"
          className="hover:scale-110 transition-transform text-[#229ED9]"
        >
          <FaTelegram />
        </a>
        <a
          href="https://instagram.com/OnMotor_media"
          target="_blank"
          className="hover:scale-110 transition-transform text-[#E1306C]"
        >
          <FaInstagram />
        </a>
      </div>
    </div>
  );
}
