import { useState, useRef, useEffect } from "react";

const MADHABS = [
  { id:"hanafi",  ar:"حنفي",   label:"Hanafi",   region:"Turquie · Asie centrale · Pakistan" },
  { id:"maliki",  ar:"مالكي",  label:"Maliki",   region:"Afrique du Nord · Afrique de l'Ouest" },
  { id:"shafii",  ar:"شافعي",  label:"Shafi'i",  region:"Égypte · Asie du Sud-Est" },
  { id:"hanbali", ar:"حنبلي",  label:"Hanbali",  region:"Arabie Saoudite · Golfe" },
];

const MODES = {
  normal:   { icon:"✦", label:{fr:"Standard",en:"Standard",ar:"عادي",tr:"Standart"}, color:"#c8a96e" },
  beginner: { icon:"🌱", label:{fr:"Débutant",en:"Beginner",ar:"مبتدئ",tr:"Başlangıç"}, color:"#7ec8a0" },
  ramadan:  { icon:"☽", label:{fr:"Ramadan",en:"Ramadan",ar:"رمضان",tr:"Ramazan"}, color:"#a09ee0" },
  convert:  { icon:"🤍", label:{fr:"Converti",en:"Convert",ar:"مسلم جديد",tr:"Yeni Müslüman"}, color:"#e0b07e" },
};

const LANGS = {
  fr:{ name:"FR", dir:"ltr", placeholder:"Posez votre question...", welcomeSub:"Votre compagnon islamique sourcé", you:"Vous", thinking:"Noor réfléchit...", detail:"Sources & détails", share:"Partager", scholar:"Consulter un savant", clearBtn:"Nouvelle conv.", chooseMadhab:"Choisissez votre école juridique", madhابSub:"Noor adaptera ses réponses à votre référence", confirm:"Confirmer", skip:"Passer", disclaimer:"Noor ne délivre pas de fatwas · Consultez un érudit pour votre situation", modeLabel:"Mode :", suggestions:{ normal:["Comment faire la prière Fajr ?","Qu'est-ce que le halal ?","C'est quoi le Ramadan ?","Qu'est-ce que la Sunna ?"], beginner:["C'est quoi l'Islam ?","Comment se convertir ?","Qu'est-ce que le Coran ?","Comment prier ?"], ramadan:["Comment bien jeûner ?","Qu'est-ce que la Nuit du Destin ?","Tarawih : combien de rak'at ?","Peut-on se brosser les dents ?"], convert:["Les 5 piliers de l'Islam","Comment prononcer la Shahada ?","Par où commencer ?","Les prières obligatoires"] } },
  en:{ name:"EN", dir:"ltr", placeholder:"Ask your Islamic question...", welcomeSub:"Your sourced Islamic companion", you:"You", thinking:"Noor is thinking...", detail:"Sources & details", share:"Share", scholar:"Ask a scholar", clearBtn:"New chat", chooseMadhab:"Choose your legal school", madhابSub:"Noor will adapt to your reference", confirm:"Confirm", skip:"Skip", disclaimer:"Noor does not issue fatwas · Consult a scholar for your situation", modeLabel:"Mode:", suggestions:{ normal:["How to perform Fajr prayer?","What is halal food?","What is Ramadan?","What is the Sunnah?"], beginner:["What is Islam?","How to convert to Islam?","What is the Quran?","How to pray?"], ramadan:["How to fast properly?","What is Laylat al-Qadr?","How many Tarawih rak'at?","Can I brush my teeth?"], convert:["The 5 pillars of Islam","How to say the Shahada?","Where to start?","Daily prayers explained"] } },
  ar:{ name:"AR", dir:"rtl", placeholder:"اكتب سؤالك...", welcomeSub:"رفيقك الإسلامي الموثوق", you:"أنت", thinking:"نور يفكر...", detail:"المصادر والتفاصيل", share:"مشاركة", scholar:"استشر عالماً", clearBtn:"محادثة جديدة", chooseMadhab:"اختر مذهبك الفقهي", madhابSub:"سيكيّف نور إجاباته وفق مرجعيتك", confirm:"تأكيد", skip:"تخطي", disclaimer:"نور لا يصدر فتاوى · استشر عالماً لوضعك الخاص", modeLabel:"الوضع:", suggestions:{ normal:["كيف أصلي الفجر؟","ما هو الحلال؟","ما هو رمضان؟","ما هي السنة النبوية؟"], beginner:["ما هو الإسلام؟","كيف أسلم؟","ما هو القرآن؟","كيف أصلي؟"], ramadan:["كيف أصوم صحيح؟","ما هي ليلة القدر؟","كم ركعة التراويح؟","هل أستطيع تفريش أسناني؟"], convert:["أركان الإسلام الخمسة","كيف أنطق الشهادة؟","من أين أبدأ؟","الصلوات اليومية"] } },
  tr:{ name:"TR", dir:"ltr", placeholder:"İslami sorunuzu sorun...", welcomeSub:"Kaynaklı İslami rehberiniz", you:"Siz", thinking:"Noor düşünüyor...", detail:"Kaynaklar", share:"Paylaş", scholar:"Alime danış", clearBtn:"Yeni sohbet", chooseMadhab:"Hukuk mezhebinizi seçin", madhابSub:"Noor cevapları referansınıza göre uyarlayacak", confirm:"Onayla", skip:"Geç", disclaimer:"Noor fetva vermez · Durumunuz için bir alime danışın", modeLabel:"Mod:", suggestions:{ normal:["Sabah namazı nasıl kılınır?","Helal gıda nedir?","Ramazan nedir?","Sünnet nedir?"], beginner:["İslam nedir?","Nasıl Müslüman olunur?","Kuran nedir?","Nasıl namaz kılınır?"], ramadan:["Oruç nasıl tutulur?","Kadir Gecesi nedir?","Teravih kaç rekat?","Diş fırçalanabilir mi?"], convert:["İslam'ın 5 şartı","Kelime-i şehadet nasıl söylenir?","Nereden başlamalı?","Günlük namazlar"] } },
};

