// components/NavigationMenu.jsx
'use client';
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { scrollToBottomOfElement } from "./utils/scrollUtils";

export default function NavigationMenu({ mobile = false, onClose = () => {} }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [subOpenIndex, setSubOpenIndex] = useState(null);
  const menuRefs = useRef([]);
  const router = useRouter();

  const toggleMenu = (index) => {
    const newIndex = openIndex === index ? null : index;
    setOpenIndex(newIndex);
    setSubOpenIndex(null); // סגירת תתי־תפריטים כשעוברים בין תפריטים
  };

  useEffect(() => {
    if (openIndex !== null && menuRefs.current[openIndex]) {
      scrollToBottomOfElement(menuRefs.current[openIndex]);
    }
  }, [openIndex]);

  const menus = [
    { title: 'OnMotor Parts', path: '/shop', links: [] },
    {
      title: 'סקירות', path: '/reviews', links: [
        { title: 'מבחני דרכים', path: '/reviews/motorcycles' },
        { title: 'סקירות ציוד', path: '/reviews/gear' },
        { title: 'סקירות וידאו', path: '/reviews/video' },
      ]
    },
    {
      title: 'ציוד', path: '/gear', links: [
        { title: 'שטח', path: '/gear/offroad' },
        { title: 'כביש', path: '/gear/road' },
        { title: 'אדוונצ׳ר', path: '/gear/adventure' },
        { title: 'קסטום', path: '/gear/custom' },
      ]
    },
    { title: 'רלב"ד', path: '/law-book', links: [{ title: 'שאל את הרלב"ד', path: '/law-book/ask-question' }] },
    {
      title: 'פורום', path: '/forum', links: [
        { title: 'פורום טכני', path: '/forum/tech' },
        { title: 'טיולים', path: '/forum/rides' },
        { title: 'קנייה/מכירה', path: '/forum/sale' },
      ]
    },
    {
      title: 'בלוג', path: '/blog', links: [
        { title: 'אחד על אחד (פודקאסט)', path: '/blog/podcast' },
        { title: 'בקסדה', path: '/blog/in-helmet' },
        { title: 'על הנייר', path: '/blog/paper' },
        { title: 'טיפים', path: '/blog/tips' },
        {
          title: 'מדריכים', path: '/blog/guides', links: [
            { title: 'מדריך טכני ותחזוקה', path: '/blog/guides/guide-tech' },
            { title: 'מדריך לרוכב המתחיל', path: '/blog/guides/guide-beginner' },
            { title: 'מדריך קניית אופנוע יד 2', path: '/blog/guides/guide-buy' },
            { title: 'מדריך לרוכב המתקדם', path: '/blog/guides/guide-advanced' },

          ]
        }
      ]
    },
    {
      title: 'חדשות', path: '/news', links: [
        { title: 'חדשות מקומיות', path: '/news/local' },
        { title: 'חדשות מהעולם', path: '/news/global' },
      ]
    },
    {
      title: 'צור קשר', path: '/contact', links: [
        { title: 'וואטסאפ', path: 'https://wa.me/972522304604' },
        { title: 'שלח מייל', path: 'mailto:onmotormedia@gmail.com' },
      ]
    }
  ];

  return (
    <div className={mobile ? "max-h-[100vh] overflow-y-0 pr-8" : ""}>
      <nav className={mobile ? "flex flex-col gap-2 text-2xl text-right" : "flex gap-2 text-lm font-semibold"}>
        {menus.map((menu, index) => {
          const hasLinks = menu.links && menu.links.length > 0;
          const isOnMotorParts = menu.title === 'OnMotor Parts';

          const handleClick = () => {
            if (mobile && hasLinks && !isOnMotorParts) {
              toggleMenu(index);
            } else {
              onClose();
              router.push(menu.path);
            }
          };

          return (
            <div
              key={index}
              className={`relative ${!mobile ? "group" : ""}`}
              ref={(el) => (menuRefs.current[index] = el)}
            >
              <button
                onClick={handleClick}
                className={`flex items-center gap-1 w-full px-2 py-1 text-lm font-semibold text-right
                  ${isOnMotorParts ? 'text-[#e60000] font-bold animate-parts-bounce' : 'hover:text-[#e60000]'}`}
              >
                <span className="flex-1">{menu.title}</span>
                {hasLinks && (!mobile || !isOnMotorParts) && (
                  <span className="text-xl">
                    {mobile ? (openIndex === index ? "▲" : "▼") : "▼"}
                  </span>
                )}
              </button>

              {/* dropdown */}
              {hasLinks && (
                mobile ? (
                  !isOnMotorParts && (
                    <div
                      className={`flex flex-col gap-1 mt-4 pr-4 text-lm ${openIndex === index ? "block" : "hidden"}`}
                    >
                      {menu.links.map((link, idx) => {
                        const hasSubLinks = link.links && link.links.length > 0;
                        const subOpen = subOpenIndex === `${index}-${idx}`;

                        return (
                          <div key={idx} className="flex flex-col">
                            <button
                              onClick={() => {
                                if (hasSubLinks) {
                                  setSubOpenIndex(subOpen ? null : `${index}-${idx}`);
                                } else {
                                  onClose();
                                  router.push(link.path);
                                }
                              }}
                              className="flex justify-between items-center py-1 hover:text-[#e60000]"
                            >
                              <span>{link.title}</span>
                              {hasSubLinks && <span>{subOpen ? "▲" : "▼"}</span>}
                            </button>

                            {hasSubLinks && (
                              <div className={`flex flex-col pr-4 ${subOpen ? "block" : "hidden"}`}>
                                {link.links.map((sublink, sIdx) => (
                                  <Link
                                    key={sIdx}
                                    href={sublink.path}
                                    onClick={onClose}
                                    className="block py-1 hover:text-[#e60000] text-right"
                                  >
                                    {sublink.title}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="absolute right-0 w-56 bg-black shadow-lg rounded p-2 z-50 text-right hidden group-hover:flex flex-col">
                    {menu.links.map((link, idx) => {
                      const hasSubLinks = link.links && link.links.length > 0;
                      return (
                        <div key={idx} className="relative group/sub">
                          <Link
  href={link.path}
  className="block px-4 py-2 text-sm text-white hover:text-[#e60000] whitespace-nowrap text-right relative"
>
  <span>{link.title}</span>
  {link.title === "מדריכים" && (
    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs">▼</span>
  )}
</Link>


                          {hasSubLinks && (
                            <div className="absolute top-full right-0 w-54 bg-black shadow-lg rounded p-2 z-50 text-right hidden group-hover/sub:flex flex-col">
                              {link.links.map((sublink, sIdx) => (
                                <Link
                                  key={sIdx}
                                  href={sublink.path}
                                  className="block px-4 py-2 text-sm text-white hover:text-[#e60000] whitespace-nowrap text-right"
                                >
                                  {sublink.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  </div>
                )
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
