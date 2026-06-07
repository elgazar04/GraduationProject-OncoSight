import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from '../../components/shared/Icon';
import '../patient/PatientPages.css';

const detailsTrans = {
  en: {
    title: 'Brain Tumor Classification',
    subtitle: 'Detailed clinical insights into the primary tumor types classified by the OncoSight AI pipeline',
    urgency: 'Triage Level',
    symptomsTitle: 'Key Clinical Symptoms',
    imagingTitle: 'MRI Imaging Characteristics',
    treatmentTitle: 'Pathological Features & Treatment Plan',
    pathology: 'Tumor Pathology',
    treatment: 'Standard Treatment',
    pipelineTitle: 'Diagnostic AI Pipeline',
    ctaTitle: 'Ready to run an MRI analysis?',
    ctaSubtitle: 'Upload a brain MRI scan and obtain a clinical classification report in seconds.',
    ctaBtn: 'Go to Portal',
    glioma: {
      title: 'Glioma',
      subtitle: 'Primary Brain Tumor (Glial Cells)',
      urgency: 'Urgent / Emergency',
      description: 'Gliomas are primary brain tumors that originate in the glial cells, which support and protect neurons in the brain. They represent about 30% of all brain tumors and 80% of all malignant brain tumors.',
      symptoms: [
        'Persistent, worsening headaches',
        'Nausea, vomiting, or cognitive decline',
        'Seizures or focal neurological deficits',
        'Personality changes and irritability'
      ],
      characteristics: 'Highly invasive, diffuse boundaries, varying grades (from slow-growing Grade I pilocytic astrocytoma to Grade IV Glioblastoma Multiforme, which is extremely aggressive).',
      imaging: 'T1-weighted contrast-enhanced MRI typically shows dense ring-like enhancement with central necrosis and surrounding vasogenic edema.',
      plan: 'Multi-modal approach: maximal safe surgical resection, followed by adjuvant radiotherapy and chemotherapy (e.g., Temozolomide).'
    },
    meningioma: {
      title: 'Meningioma',
      subtitle: 'Meningeal Membrane Tumor',
      urgency: 'Routine / Elective',
      description: 'Meningiomas arise from the meninges—the three protective layers of tissue surrounding the brain and spinal cord. They are the most common primary brain tumor in adults, accounting for over 35% of cases, and are typically benign (WHO Grade I).',
      symptoms: [
        'Gradual vision changes (blurriness or double vision)',
        'Localized headaches or hearing loss',
        'Arm or leg weakness',
        'Memory loss or confusion'
      ],
      characteristics: 'Slow-growing, well-demarcated, extra-axial (growing outside the brain tissue itself), compressing adjacent structures rather than invading them.',
      imaging: 'Bright, uniform contrast enhancement with a characteristic "dural tail" sign along the adjacent dura mater on T1 post-contrast scans.',
      plan: 'Active surveillance ("watch and wait") for small, asymptomatic tumors. Surgical resection (craniotomy) or stereotactic radiosurgery (Gamma Knife) for symptomatic or growing cases.'
    },
    pituitary: {
      title: 'Pituitary Tumor',
      subtitle: 'Sellar Region Adenoma',
      urgency: 'Routine / Urgent',
      description: 'Pituitary tumors develop in the pituitary gland, a pea-sized endocrine organ located at the base of the brain (sellar region). They represent 10% to 15% of all intracranial tumors and are almost exclusively benign adenomas.',
      symptoms: [
        'Bitemporal hemianopsia (loss of peripheral vision due to optic chiasm compression)',
        'Hormonal imbalances (fatigue, unexplained weight changes)',
        'Persistent frontal headaches',
        'Endocrine syndromes (e.g., Acromegaly, Cushing disease)'
      ],
      characteristics: 'Encapsulated, located in the sellar cavity, classified as microadenomas (<10mm) or macroadenomas (>=10mm) which exert mass effect.',
      imaging: 'T1 post-contrast images reveal a mass in the pituitary sella, often showing delayed enhancement compared to the normal pituitary gland.',
      plan: 'Medical management with dopamine agonists (for prolactinomas). Transsphenoidal endoscopic surgery for macroadenomas compressing the optic chiasm, followed by radiation therapy if residual tissue remains.'
    },
    pipeline: [
      { step: '01', title: 'MRI Classification', desc: 'EfficientNetB0 deep convolutional network categorizes tumor type.', color: '#00ffb2' },
      { step: '02', title: 'Spatial Segmentation', desc: 'U-Net architecture segments precise tumor boundary masks.', color: '#00e5ff' },
      { step: '03', title: 'Metric Extraction', desc: 'OpenCV processes dimensions, volume, area, and hemisphere.', color: '#1e90ff' },
      { step: '04', title: 'Triage Fusing', desc: 'XGBoost models combine MRI features and patient intake history.', color: '#b388ff' }
    ]
  },
  ar: {
    title: 'تصنيف أورام الدماغ',
    subtitle: 'رؤى سريرية مفصلة حول أنواع الأورام الرئيسية التي يتم تصنيفها بواسطة نموذج أونكو سايت للذكاء الاصطناعي',
    urgency: 'مستوى الفرز',
    symptomsTitle: 'الأعراض السريرية الرئيسية',
    imagingTitle: 'خصائص تصوير الرنين المغناطيسي',
    treatmentTitle: 'السمات الباثولوجية وخطة العلاج',
    pathology: 'باثولوجيا الورم',
    treatment: 'العلاج القياسي',
    pipelineTitle: 'خطوات التشخيص بالذكاء الاصطناعي',
    ctaTitle: 'جاهز لإجراء تحليل الرنين المغناطيسي؟',
    ctaSubtitle: 'قم برفع فحص الرنين المغناطيسي للدماغ واحصل على تقرير تصنيف سريري في ثوانٍ معدودة.',
    ctaBtn: 'ذهاب إلى البوابة',
    glioma: {
      title: 'ورم دبقي',
      subtitle: 'ورم دماغي أولي (الخلايا الدبقية)',
      urgency: 'عاجل / طوارئ',
      description: 'الأورام الدبقية هي أورام دماغية أولية تنشأ في الخلايا الدبقية التي تدعم وتحمي الخلايا العصبية في الدماغ. وهي تمثل حوالي 30٪ من جميع أورام الدماغ و80٪ من جميع أورام الدماغ الخبيثة.',
      symptoms: [
        'صداع مستمر ومتفاقم',
        'غثيان، قيء، أو تدهور معرفي',
        'نوبات صرع أو عجز عصبي بؤري',
        'تغيرات في الشخصية وسرعة الانفعال'
      ],
      characteristics: 'ارتشاحي للغاية، حدود منتشرة، درجات متفاوتة (من الورم النجمي الشعري البطيء النمو من الدرجة الأولى إلى الورم الأرومي الدبقي متعدد الأشكال من الدرجة الرابعة وهو شديد العدوانية).',
      imaging: 'يظهر الرنين المغناطيسي معزز التباين T1 عادةً تعزيزاً كثيفاً شبيهاً بالحلقة مع نخر مركزي ووذمة وعائية محيطة.',
      plan: 'نهج متعدد الوسائط: الاستئصال الجراحي الآمن الأقصى، يليه العلاج الإشعاعي المساعد والعلاج الكيميائي (مثل تيموزولوميد).'
    },
    meningioma: {
      title: 'ورم سحائي',
      subtitle: 'ورم غشاء السحايا',
      urgency: 'روتيني / اختياري',
      description: 'تنشأ الأورام السحائية من السحايا - وهي الطبقات الثلاث الواقية من الأنسجة المحيطة بالدماغ والنخاع الشوكي. وهي أكثر أورام الدماغ الأولية شيوعاً لدى البالغين، حيث تمثل أكثر من 35٪ من الحالات، وعادة ما تكون حميدة (الدرجة الأولى وفقاً لمنظمة الصحة العالمية).',
      symptoms: [
        'تغيرات تدريجية في الرؤية (ضبابية أو رؤية مزدوجة)',
        'صداع موضعي أو فقدان السمع',
        'ضعف في الذراع أو الساق',
        'فقدان الذاكرة أو الارتباك'
      ],
      characteristics: 'بطيء النمو، محدد بوضوح، خارج المحور (ينمو خارج أنسجة الدماغ نفسها)، ويضغط على الهياكل المجاورة بدلاً من غزوها.',
      imaging: 'تعزيز تباين ساطع وموحد مع علامة "الذيل الجافي" المميزة على طول الأم الجافية المجاورة في فحوصات T1 بعد التباين.',
      plan: 'المراقبة النشطة ("الانتظار والمراقبة") للأورام الصغيرة الخالية من الأعراض. الاستئصال الجراحي (حج القحف) أو الجراحة الإشعاعية التجسيمية (سكين غاما) للحالات المصحوبة بأعراض أو النامية.'
    },
    pituitary: {
      title: 'ورم غدي نخامي',
      subtitle: 'ورم منطقة السرج التركي',
      urgency: 'روتيني / عاجل',
      description: 'تتطور أورام الغدة النخامية في الغدة النخامية، وهي عضو غدد صماء بحجم حبة البازلاء يقع في قاعدة الدماغ (منطقة السرج التركي). وهي تمثل 10٪ إلى 15٪ من جميع الأورام داخل الجمجمة وهي أورام غدية حميدة بشكل خارق تقريباً.',
      symptoms: [
        'عمى شقي صدغي مزدوج (فقدان الرؤية المحيطية بسبب ضغط التصالب البصري)',
        'اختلالات هرمونية (إرهاق، تغيرات غير مفسرة في الوزن)',
        'صداع جبهي مستمر',
        'متلازمات الغدد الصماء (مثل ضخامة الأطراف، داء كوشينغ)'
      ],
      characteristics: 'مغلف، يقع في تجويف السرج التركي، ويصنف على أنه أورام غدية صغيرة (<10 مم) أو أورام غدية كبيرة (>=10 مم) والتي تحدث تأثيراً كبيراً للكتلة.',
      imaging: 'تكشف صور T1 بعد التباين عن كتلة في السرج النخامي، وغالباً ما تظهر تعزيزاً متأخراً مقارنة بالغدة النخامية الطبيعية.',
      plan: 'العلاج الدوائي بمحفزات الدوبامين (للأورام البرولاكتينية). الجراحة بالمنظار عبر وتدي للأورام الغدية الكبيرة التي تضغط على التصالب البصري، تليها العلاج الإشعاعي في حالة بقاء أنسجة متبقية.'
    },
    pipeline: [
      { step: '01', title: 'تصنيف الرنين المغناطيسي', desc: 'تقوم شبكة EfficientNetB0 العصبية التلافيفية العميقة بتصنيف نوع الورم.', color: '#00ffb2' },
      { step: '02', title: 'التجزئة المكانية', desc: 'تقوم بنية U-Net بتجزئة أقنعة حدود الورم بدقة عالية.', color: '#00e5ff' },
      { step: '03', title: 'استخراج المقاييس', desc: 'تكتشف مكتبة OpenCV الأبعاد والحجم والمساحة ونصف الكرة المخية.', color: '#1e90ff' },
      { step: '04', title: 'دمج وتصنيف الفرز', desc: 'تدمج نماذج XGBoost ميزات الرنين المغناطيسي مع التاريخ الصحي للمريض لتحديد خطة الفرز.', color: '#b388ff' }
    ]
  }
};

export default function TumorInfo() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('glioma');

  const text = detailsTrans[lang] || detailsTrans.en;
  const activeData = text[activeTab];

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '950px', width: '100%' }}>
        <h1 className="page-title">{text.title}</h1>
        <p className="page-subtitle">{text.subtitle}</p>

        {/* Tab Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          {['glioma', 'meningioma', 'pituitary'].map(key => {
            const data = text[key];
            const isActive = activeTab === key;
            const tabColor = key === 'glioma' ? '#ff6e40' : key === 'meningioma' ? '#b388ff' : '#00e5ff';
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: '16px',
                  background: isActive ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                  border: isActive ? `1px solid ${tabColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? `0 0 15px ${tabColor}15` : 'none'
                }}
              >
                <Icon name={key === 'glioma' ? 'activity' : key === 'meningioma' ? 'target' : 'globe'} size={20} color={isActive ? tabColor : 'var(--text-tertiary)'} />
                <span>{data.title}</span>
              </button>
            );
          })}
        </div>

        {/* Main Info Display */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '32px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '20px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700 }}>{activeData.title}</h2>
              <p style={{ color: activeTab === 'glioma' ? '#ff6e40' : activeTab === 'meningioma' ? '#b388ff' : '#00e5ff', fontWeight: 500, margin: '4px 0 0 0', fontSize: '1.05rem' }}>{activeData.subtitle}</p>
            </div>
            <span style={{
              background: `${activeTab === 'glioma' ? '#ff6e40' : activeTab === 'meningioma' ? '#b388ff' : '#00e5ff'}12`,
              color: activeTab === 'glioma' ? '#ff6e40' : activeTab === 'meningioma' ? '#b388ff' : '#00e5ff',
              padding: '6px 16px',
              borderRadius: '20px',
              border: `1px solid ${activeTab === 'glioma' ? '#ff6e40' : activeTab === 'meningioma' ? '#b388ff' : '#00e5ff'}25`,
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {text.urgency}: {activeData.urgency}
            </span>
          </div>

          <p style={{ lineHeight: 1.7, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '24px' }}>
            {activeData.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '1rem', marginBottom: '12px' }}>
                <Icon name="warning" size={16} color="#ffd700" /> {text.symptomsTitle}
              </h4>
              <ul style={{ paddingInlineStart: '20px', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {activeData.symptoms.map((s, i) => <li key={i} style={{ marginBottom: '8px' }}>{s}</li>)}
              </ul>
            </div>
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '1rem', marginBottom: '12px' }}>
                <Icon name="microscope" size={16} color="#00ffb2" /> {text.imagingTitle}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                {activeData.imaging}
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="shield" size={16} color="#1e90ff" /> {text.treatmentTitle}
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '12px' }}>
              <strong>{text.pathology}:</strong> {activeData.characteristics}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              <strong>{text.treatment}:</strong> {activeData.plan}
            </p>
          </div>
        </div>

        {/* AI Pipeline Insights */}
        <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>{text.pipelineTitle}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {text.pipeline.map((item, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, color: item.color, fontFamily: "'Rajdhani', sans-serif" }}>{item.step}</span>
              <h4 style={{ color: '#fff', margin: '8px 0 6px 0', fontSize: '0.95rem' }}>{item.title}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom Call to Action */}
        <div style={{ background: 'linear-gradient(135deg, rgba(30,144,255,0.08), rgba(0,229,255,0.08))', border: '1px solid rgba(30,144,255,0.2)', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', marginBottom: '4px' }}>{text.ctaTitle}</h4>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{text.ctaSubtitle}</p>
          </div>
          <Link to="/patient/dashboard" className="btn btn--glow" style={{ padding: '12px 28px' }}>
            {text.ctaBtn}
          </Link>
        </div>

      </div>
    </main>
  );
}

