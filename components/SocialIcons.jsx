//components\SocialIcons.jsx
'use client';
import React from "react";
import { FaFacebook, FaWhatsapp, FaTiktok, FaYoutube, FaTelegram, FaEnvelope, FaInstagram } from "react-icons/fa";

export default function SocialIcons({ size}) {
  return (
    <div className="flex justify-center md:justify-end gap-4 text-3xl mb-1">
        <a href="https://facebook.com/OnMotorMedia" target="_blank" className="hover:scale-120 transition-transform text-[#1877F2]"><FaFacebook /></a>
        <a href="https://chat.whatsapp.com/JjwmpUDyVQl0tKikbpDEJA" target="_blank" className="hover:scale-120 transition-transform text-[#25D366]"><FaWhatsapp /></a>
        <a href="https://tiktok.com/@onmotor_media" target="_blank" className="hover:scale-120 transition-transform text-white"><FaTiktok /></a>
        <a href="https://youtube.com/@onmotormedia" target="_blank" className="hover:scale-120 transition-transform text-[#FF0000]"><FaYoutube /></a>
        <a href="https://t.me/Onmotormedia" target="_blank" className="hover:scale-120 transition-transform text-[#229ED9]"><FaTelegram /></a>
        <a href="https://mail.google.com/mail/?view=cm&to=onmotormedia@gmail.com" target="_blank"  className="hover:scale-120 transition-transform text-[#D44638]"><FaEnvelope /></a>
        <a href="https://instagram.com/OnMotor_media" target="_blank" className="hover:scale-120 transition-transform text-[#3f729b]"><FaInstagram /></a>
    </div>
  );
}
