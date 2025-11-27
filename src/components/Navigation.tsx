import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

const Navigation: React.FC = () => {
  const router = useRouter();

  const navItems = [
    { href: 'https://tarot-card-homepage.vercel.app/', label: '타로', icon: '🔮', external: true, isRed: true },
    { href: 'https://lunchmenu-xi.vercel.app/', label: '점심 추천', icon: '🍱', external: true, isRed: true },
    { href: 'https://16personality-type-test.vercel.app/', label: 'MBTI 검사', icon: '🧠', external: true, isRed: true },
    { href: '/', label: '사주팔자', icon: '📿', external: false, isRed: false },
    { href: '/compatibility', label: '궁합분석', icon: '💕', external: false, isRed: false },
    { href: '/taekil', label: '택일', icon: '📅', external: false, isRed: false },
  ];

  return (
    <nav className="container mx-auto px-4 mb-8">
      <div className="flex flex-wrap justify-center gap-2">
        {navItems.map((item) => {
          const isActive = !item.external && router.pathname === item.href;
          
          if (item.external) {
            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                    item.isRed
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:from-red-700 hover:to-red-800'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </motion.div>
              </a>
            );
          }

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white text-purple-800 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
