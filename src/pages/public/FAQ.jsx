import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from '../../components/shared/Icon';
import '../patient/PatientPages.css';

const faqTrans = {
  en: {
    title: 'Frequently Asked Questions',
    subtitle: 'Find comprehensive answers to key questions about the OncoSight diagnostic AI platform, clinical models, and security.',
    ctaTitle: 'Have more clinical questions?',
    ctaSubtitle: 'Access the Patient Portal to view detailed reports or schedule an advisory review with verified specialists.',
    ctaBtn: 'Enter Portal',
    items: [
      {
        id: 'faq-1',
        category: 'General',
        q: 'What is OncoSight?',
        a: 'OncoSight is a state-of-the-art neuro-diagnostic platform that leverages advanced artificial intelligence and deep convolutional neural networks (CNNs) to classify, segment, and localize brain tumors from cranial MRI scans.'
      },
      {
        id: 'faq-2',
        category: 'Accuracy & Technology',
        q: 'How accurate are the AI diagnostic models?',
        a: 'Our AI pipeline achieves up to 99.2% classification accuracy on clinical validation sets. However, OncoSight is designed to assist clinicians and triage patients; all automated reports must be reviewed and verified by a certified neuro-radiologist.'
      },
      {
        id: 'faq-3',
        category: 'General',
        q: 'What types of brain tumors can the AI classify?',
        a: 'The platform is currently optimized to detect and differentiate three major types of brain tumors: Gliomas (primary glial cell tumors), Meningiomas (membranous tumors of the meninges), and Pituitary Adenomas (sellar region tumors).'
      },
      {
        id: 'faq-4',
        category: 'Privacy & Security',
        q: 'Who can access my MRI scans and medical records?',
        a: 'We implement strict security standards. All data is encrypted in transit and at rest. Your uploads and health profile are only visible to you and the verified medical professionals you explicitly choose to book consultations with.'
      },
      {
        id: 'faq-5',
        category: 'Accuracy & Technology',
        q: 'How does the 3-Tier triage routing work?',
        a: 'The system automatically evaluates tumor size, location mapping, and clinical symptoms to route cases into one of three triage levels: Emergency (immediate surgical consultation), Urgent (priority specialist review), or Routine (standard scheduled care).'
      },
      {
        id: 'faq-6',
        category: 'General',
        q: 'How do I book a consultation with a specialist?',
        a: 'Once your MRI scan report is generated, you can navigate to "Find Doctors" on your dashboard. Browse certified neuro-oncologists or radiologists, select an available time slot, and book an appointment directly through the platform.'
      }
    ]
  },
  ar: {
    title: 'الأسئلة الشائعة',
    subtitle: 'ابحث عن إجابات شاملة لجميع استفساراتك حول منصة أونكو سايت للذكاء الاصطناعي، ونماذج الفرز السريري، وحماية البيانات.',
    ctaTitle: 'هل لديك المزيد من الأسئلة الطبية؟',
    ctaSubtitle: 'قم بالدخول إلى بوابة المريض لعرض تقاريرك بالتفصيل أو لحجز مراجعة استشارية مع الأطباء المعتمدين.',
    ctaBtn: 'دخول البوابة',
    items: [
      {
        id: 'faq-1',
        category: 'عام',
        q: 'ما هي منصة أونكو سايت؟',
        a: 'أونكو سايت هي منصة تشخيصية عصبية متطورة تسخر الذكاء الاصطناعي وشبكات تلافيفية عميقة (CNNs) لتصنيف وتحديد وتجزئة أورام الدماغ بدقة عالية من صور الرنين المغناطيسي.'
      },
      {
        id: 'faq-2',
        category: 'التقنية والدقة',
        q: 'ما هي مدى دقة نماذج الذكاء الاصطناعي؟',
        a: 'يحقق خط التحليل بالذكاء الاصطناعي دقة تصنيف تصل إلى 99.2٪ في مجموعات التحقق السريري. ومع ذلك، تم تصميم أونكو سايت لمساعدة الأطباء وفرز الحالات؛ ويجب مراجعة جميع التقارير الآلية والتحقق منها من قبل أخصائي أشعة أعصاب معتمد.'
      },
      {
        id: 'faq-3',
        category: 'عام',
        q: 'ما هي أنواع أورام الدماغ التي يمكن للذكاء الاصطناعي تصنيفها؟',
        a: 'تم تحسين المنصة حالياً للكشف والتمييز بين ثلاثة أنواع رئيسية من أورام الدماغ: الأورام الدبقية (أورام الخلايا الدبقية الأولية)، الأورام السحائية (أورام غشاء السحايا)، والأورام الغدية النخامية (أورام منطقة السرج التركي).'
      },
      {
        id: 'faq-4',
        category: 'الخصوصية والأمان',
        q: 'من يمكنه الوصول إلى صور الرنين المغناطيسي وسجلاتي الطبية؟',
        a: 'نحن نطبق معايير أمنية صارمة للغاية. يتم تشفير جميع البيانات أثناء النقل وأثناء التخزين. صور الرنين المغناطيسي والملف الصحي الخاص بك مرئية فقط لك وللمهنيين الطبيين المعتمدين الذين تختار حجز استشارات معهم بشكل صريح.'
      },
      {
        id: 'faq-5',
        category: 'التقنية والدقة',
        q: 'كيف يعمل نظام فرز الحالات ثلاثي المستويات؟',
        a: 'يقوم النظام تلقائياً بتقييم حجم الورم، وموقع الإصابة، والأعراض السريرية لتوجيه الحالات إلى أحد مستويات الفرز الثلاثة: طوارئ (استشارة جراحية فورية)، عاجل (مراجعة أخصائي ذات أولوية)، أو روتيني (رعاية مجدولة قياسية).'
      },
      {
        id: 'faq-6',
        category: 'عام',
        q: 'كيف يمكنني حجز استشارة طبية مع طبيب مختص؟',
        a: 'بمجرد إنشاء تقرير فحص الرنين المغناطيسي، يمكنك الانتقال إلى "الأطباء المعالجون" من لوحة التحكم الخاصة بك. تصفح أطباء أورام الأعصاب أو أخصائيي الأشعة المعتمدين، واختر موعداً متاحاً، وقم بحجز استشارتك مباشرة عبر المنصة.'
      }
    ]
  }
};

export default function FAQ() {
  const { lang } = useLanguage();
  const [openId, setOpenId] = useState(null);

  const text = faqTrans[lang] || faqTrans.en;

  const handleToggle = (id) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '850px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="page-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
            <Icon name="chat" size={28} color="var(--neon-cyan)" />
            <span>{text.title}</span>
          </h1>
          <p className="page-subtitle" style={{ maxWidth: '650px', margin: '12px auto 0 auto' }}>
            {text.subtitle}
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
          {text.items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                style={{
                  background: isOpen ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                  border: isOpen ? '1px solid var(--neon-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: isOpen ? '0 0 15px rgba(0, 229, 255, 0.05)' : 'none'
                }}
              >
                {/* Header */}
                <button
                  onClick={() => handleToggle(item.id)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: lang === 'ar' ? 'right' : 'left',
                    color: '#fff',
                    fontSize: '1.05rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    outline: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      color: isOpen ? 'var(--neon-cyan)' : 'var(--text-tertiary)',
                      fontWeight: 700
                    }}>
                      {item.category}
                    </span>
                    <span>{item.q}</span>
                  </div>

                  {/* Custom SVG Chevron with rotate state */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isOpen ? 'var(--neon-cyan)' : 'var(--text-tertiary)'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.3s ease',
                      flexShrink: 0
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Body Content */}
                <div
                  style={{
                    maxHeight: isOpen ? '300px' : '0',
                    opacity: isOpen ? '1' : '0',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    padding: '0 24px 20px 24px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingTop: '16px'
                  }}>
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08), rgba(0, 255, 178, 0.08))',
          border: '1px solid rgba(0, 229, 255, 0.2)',
          padding: '28px',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div style={{ flex: '1', minWidth: '285px' }}>
            <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', marginBottom: '6px', fontWeight: 700 }}>
              {text.ctaTitle}
            </h4>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {text.ctaSubtitle}
            </p>
          </div>
          <Link to="/patient/dashboard" className="btn btn--glow" style={{ padding: '12px 28px' }}>
            {text.ctaBtn}
          </Link>
        </div>
      </div>
    </main>
  );
}
