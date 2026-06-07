import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
  en: {
    logo: "OncoSight",
    home: "Home",
    dashboard: "Dashboard",
    history: "Scan History",
    uploadScan: "Upload MRI",
    doctors: "Find Doctors",
    consultations: "Consultations",
    profile: "Profile",
    login: "Log In",
    register: "Register",
    logout: "Log Out",
    languageToggle: "العربية",
    adminDashboard: "Admin Dashboard",
    // Home Page
    heroTitle: "Precision Brain Tumor Detection Powered by Advanced AI",
    heroSubtitle: "Upload cranial MRI scans to obtain instant segmentation overlays and clinical analysis metrics.",
    getStarted: "Get Started Now",
    learnMore: "Learn More",
    features: "Platform Features",
    aiSegmentation: "AI-Powered Segmentation",
    clinicalAnalytics: "Clinical Metrics",
    telehealth: "Direct Consultation",
    aiSegmentationDesc: "State-of-the-art neural networks pinpoint and contour potential brain tumors in real time.",
    clinicalAnalyticsDesc: "Detailed area measurements, hemispheric localization, and triage classification metrics.",
    telehealthDesc: "Instantly share clinical results and book live video/chat reviews with certified radiologists.",
    accuracyStat: "99.2% Accuracy",
    scansProcessedStat: "12,000+ Scans",
    processingTimeStat: "under 60s",
    statsHeader: "Reliable Triage Metrics When Every Second Counts",
  },
  ar: {
    logo: "أونكو سايت",
    home: "الرئيسية",
    dashboard: "لوحة التحكم",
    history: "سجل التحاليل",
    uploadScan: "رفع رنين مغناطيسي",
    doctors: "الأطباء المعالجون",
    consultations: "الاستشارات الطبية",
    profile: "الملف الشخصي",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    logout: "تسجيل الخروج",
    languageToggle: "English",
    adminDashboard: "لوحة تحكم المسؤول",
    // Home Page
    heroTitle: "كشف دقيق لأورام الدماغ مدعوم بالذكاء الاصطناعي المتقدم",
    heroSubtitle: "قم برفع صور الرنين المغناطيسي للدماغ للحصول على تراكيب التجزئة الفورية ومقاييس التحليل السريري.",
    getStarted: "ابدأ الآن",
    learnMore: "معرفة المزيد",
    features: "ميزات المنصة",
    aiSegmentation: "تجزئة مدعومة بالذكاء الاصطناعي",
    clinicalAnalytics: "المقاييس السريرية",
    telehealth: "الاستشارة المباشرة",
    aiSegmentationDesc: "تحدد الشبكات العصبية الحديثة أورام الدماغ المحتملة وتحدد محيطها في الوقت الفعلي.",
    clinicalAnalyticsDesc: "قياسات مفصلة للمساحة، وتحديد نصف الكرة المخية المصاب، ومقاييس تصنيف الفرز.",
    telehealthDesc: "شارك النتائج السريرية على الفور واحجز جلسات استشارية مرئية أو نصية مع أخصائيي الأشعة المعتمدين.",
    accuracyStat: "دقة 99.2٪",
    scansProcessedStat: "+12,000 رنين",
    processingTimeStat: "أقل من 60 ثانية",
    statsHeader: "مقاييس فرز موثوقة عندما يكون لكل ثانية أهميتها",
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', lang);
    // Apply LTR or RTL direction dynamically
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key) => {
    return translations[lang][key] || key;
  };

  const value = {
    lang,
    toggleLanguage,
    t,
    isRtl: lang === 'ar'
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
