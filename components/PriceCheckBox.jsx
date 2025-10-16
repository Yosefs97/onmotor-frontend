// components/PriceCheckBox.jsx
import { FaMotorcycle } from 'react-icons/fa';

export default function PriceCheckBox() {
  return (
    <div className="p-2 w-full rounded-lg shadow-md flex flex-col justify-center items-center
      bg-gray-100 border border-red-400 text-gray-800">

      <h3 className="font-bold text-lg mb-2 text-red-600">
        בדיקת מחירון
      </h3>
      <p className="text-base text-gray-600 mb-4 text-center">
        לחץ כדי לבדוק מחירון רשמי באתר לוי יצחק
      </p>
      <a
        href="https://levi-itzhak.co.il/%D7%9E%D7%97%D7%99%D7%A8%D7%95%D7%9F-%D7%90%D7%95%D7%A4%D7%A0%D7%95%D7%A2%D7%99%D7%9D-%D7%90%D7%99%D7%A0%D7%98%D7%A8%D7%90%D7%A7%D7%98%D7%99%D7%91%D7%99"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full text-lg font-bold 
                  bg-red-600 hover:bg-red-500 
                  text-white py-2 rounded 
                  text-center flex items-center justify-center gap-2 transition"
      >
        <FaMotorcycle className="text-2xl text-white" />
        מעבר למחירון לוי יצחק
      </a>
    </div>

  );
}
