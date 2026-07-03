import { useState, useEffect, useRef } from 'react';
import { 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  IndianRupee, 
  Utensils, 
  FileText, 
  RotateCcw, 
  Check, 
  Sparkles, 
  AlertCircle, 
  X, 
  Lock,
  Smartphone,
  Download,
  Loader2,
  Copy
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function App() {
  // Helper to get today's date formatted as YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // State Variables for Form
  const [clientName, setClientName] = useState('');
  const [eventAddress, setEventAddress] = useState('');
  const [eventDate, setEventDate] = useState(getTodayDate());
  const [servingTime, setServingTime] = useState('');
  const [totalGuests, setTotalGuests] = useState<number | ''>('');
  const [perPlateRate, setPerPlateRate] = useState<number | ''>('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [foodType, setFoodType] = useState<'Normal' | 'Jain' | 'Swaminarayan'>('Normal');
  const [jainPlates, setJainPlates] = useState<number | ''>('');
  const [swaminarayanPlates, setSwaminarayanPlates] = useState<number | ''>('');

  // Food type labels mapping for English and Gujarati
  const FOOD_TYPE_LABELS = {
    Normal: { en: '🟢 Normal', gu: '🟢 સામાન્ય' },
    Jain: { en: '🌿 Jain', gu: '🌿 જૈન' },
    Swaminarayan: { en: '🛕 Swaminarayan', gu: '🛕 સ્વામિનારાયણ' }
  };

  // Selected Menu typed directly by the owner
  const [selectedMenu, setSelectedMenu] = useState('');

  // Total Amount state (calculated but manually editable)
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [isTotalAmountManuallyEdited, setIsTotalAmountManuallyEdited] = useState(false);

  // App Alerts / Toasts
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  // Modals status
  const [showResetModal, setShowResetModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyModalLang, setCopyModalLang] = useState<'en' | 'gu'>('en');

  // Client WhatsApp details in modal
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappError, setWhatsappError] = useState('');

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  // Trigger Toast Helper
  const showToast = (text: string, type: 'error' | 'success' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Recalculate default total amount when rate or plates change
  useEffect(() => {
    if (!isTotalAmountManuallyEdited) {
      const guests = Number(totalGuests);
      const rate = Number(perPlateRate);
      if (totalGuests === '' || perPlateRate === '') {
        setTotalAmount('');
      } else {
        setTotalAmount((isNaN(guests) ? 0 : guests) * (isNaN(rate) ? 0 : rate));
      }
    }
  }, [totalGuests, perPlateRate, isTotalAmountManuallyEdited]);

  // Handle manual changes to total amount
  const handleTotalAmountChange = (val: string) => {
    setIsTotalAmountManuallyEdited(true);
    if (val === '') {
      setTotalAmount('');
    } else {
      const num = Number(val);
      setTotalAmount(isNaN(num) ? 0 : num);
    }
  };

  // Reset total amount calculation back to automatic
  const resetTotalToAutomatic = () => {
    setIsTotalAmountManuallyEdited(false);
    const guests = Number(totalGuests);
    const rate = Number(perPlateRate);
    if (totalGuests === '' || perPlateRate === '') {
      setTotalAmount('');
    } else {
      setTotalAmount((isNaN(guests) ? 0 : guests) * (isNaN(rate) ? 0 : rate));
    }
    showToast('Total amount recalculated automatically.');
  };

  // Return the selected menu typed by the owner
  const getCompiledMenuText = (lang: 'en' | 'gu'): string => {
    if (!selectedMenu.trim()) {
      return lang === 'en' ? '(No menu entered)' : '(કોઈ મેનુ ટાઇપ કરેલ નથી)';
    }
    return selectedMenu.trim();
  };

  // Parser to split menu text into 3 balanced columns for aesthetic list layout
  const getMenuColumns = (text: string) => {
    if (!text.trim()) {
      return [[], [], []];
    }
    // Clean bullet symbols and split by line break or separator characters
    const items = text
      .split(/\n|,|•|-|\*/)
      .map(item => item.trim())
      .filter(item => item.length > 0 && !item.startsWith('━━'));
    
    if (items.length === 0) {
      return [[], [], []];
    }
    
    // Distribute items into 3 columns
    const cols: string[][] = [[], [], []];
    items.forEach((item, index) => {
      cols[index % 3].push(item);
    });
    return cols;
  };

  // Validate the Quotation Form
  const isFormValid = () => {
    return { valid: true, msg: '' };
  };

  // Handle WhatsApp Button Trigger
  const handleWhatsAppTrigger = () => {
    const check = isFormValid();
    if (!check.valid) {
      showToast(check.msg, 'error');
      // Scroll to top on mobile to see the error toast
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setWhatsappError('');
    setShowWhatsAppModal(true);
  };

  // Confirm and Execute Reset Form
  const handleResetForm = () => {
    setClientName('');
    setEventAddress('');
    setEventDate(getTodayDate());
    setServingTime('');
    setTotalGuests('');
    setPerPlateRate('');
    setSpecialInstructions('');
    setSelectedMenu('');
    setFoodType('Normal');
    setJainPlates('');
    setSwaminarayanPlates('');
    setTotalAmount('');
    setIsTotalAmountManuallyEdited(false);
    setShowResetModal(false);
    showToast('Form reset successful!');
  };

  // Generate WhatsApp Message String
  const generateMessageText = (lang: 'en' | 'gu'): string => {
    const lines: string[] = [];
    if (lang === 'en') {
      lines.push('PUNIT CATERERS');
      lines.push('Delicious Food • Memorable Events');
      lines.push('');
      lines.push('━━━━━━━━━━━━━━━━━━');
      lines.push('');
      lines.push('CATERING QUOTATION');
      lines.push('');
      
      if (clientName.trim()) {
        lines.push(`Client Name: ${clientName.trim()}`);
        lines.push('');
      }
      if (eventAddress.trim()) {
        lines.push(`Event Address: ${eventAddress.trim()}`);
        lines.push('');
      }
      if (eventDate) {
        lines.push(`Event Date: ${eventDate}`);
        lines.push('');
      }
      if (servingTime.trim()) {
        lines.push(`Time: ${servingTime.trim()}`);
        lines.push('');
      }
      if (totalGuests !== '') {
        lines.push(`Total Plates: ${totalGuests}`);
        lines.push('');
      }
      
      const foodTypeLabel = FOOD_TYPE_LABELS[foodType].en;
      if (foodType === 'Jain' && jainPlates !== '') {
        lines.push(`Food Type: ${foodTypeLabel} (${jainPlates} Jain plates, ${totalGuests !== '' ? Number(totalGuests) - Number(jainPlates) : 0} Normal plates)`);
      } else if (foodType === 'Swaminarayan' && swaminarayanPlates !== '') {
        lines.push(`Food Type: ${foodTypeLabel} (${swaminarayanPlates} Swaminarayan plates, ${totalGuests !== '' ? Number(totalGuests) - Number(swaminarayanPlates) : 0} Normal plates)`);
      } else {
        lines.push(`Food Type: ${foodTypeLabel}`);
      }
      lines.push('');

      if (selectedMenu.trim()) {
        const formattedMenu = getCompiledMenuText('en');
        lines.push('Selected Menu:');
        lines.push(formattedMenu);
        lines.push('');
      }
      if (perPlateRate !== '') {
        lines.push(`Per Plate Rate: ₹${perPlateRate}`);
        lines.push('');
      }
      if (totalAmount !== '') {
        lines.push(`Total Amount: ₹${totalAmount}`);
        lines.push('');
      }
      if (specialInstructions.trim()) {
        lines.push('Special Instructions:');
        lines.push(specialInstructions.trim());
        lines.push('');
      }
      
      lines.push('━━━━━━━━━━━━━━━━━━');
      lines.push('');
      lines.push('Thank you for choosing PUNIT CATERERS!');
    } else {
      lines.push('પુનિત કેટરર્સ');
      lines.push('સ્વાદિષ્ટ ભોજન • યાદગાર પ્રસંગો');
      lines.push('');
      lines.push('━━━━━━━━━━━━━━━━━━');
      lines.push('');
      lines.push('કેટરિંગ ક્વોટેશન');
      lines.push('');
      
      if (clientName.trim()) {
        lines.push(`ગ્રાહકનું નામ: ${clientName.trim()}`);
        lines.push('');
      }
      if (eventAddress.trim()) {
        lines.push(`પ્રસંગનું સરનામું: ${eventAddress.trim()}`);
        lines.push('');
      }
      if (eventDate) {
        lines.push(`તારીખ: ${eventDate}`);
        lines.push('');
      }
      if (servingTime.trim()) {
        lines.push(`સમય: ${servingTime.trim()}`);
        lines.push('');
      }
      if (totalGuests !== '') {
        lines.push(`કુલ પ્લેટ: ${totalGuests}`);
        lines.push('');
      }
      
      const foodTypeLabel = FOOD_TYPE_LABELS[foodType].gu;
      if (foodType === 'Jain' && jainPlates !== '') {
        lines.push(`ભોજનનો પ્રકાર: ${foodTypeLabel} (${jainPlates} જૈન પ્લેટ, ${totalGuests !== '' ? Number(totalGuests) - Number(jainPlates) : 0} સામાન્ય પ્લેટ)`);
      } else if (foodType === 'Swaminarayan' && swaminarayanPlates !== '') {
        lines.push(`ભોજનનો પ્રકાર: ${foodTypeLabel} (${swaminarayanPlates} સ્વામિનારાયણ પ્લેટ, ${totalGuests !== '' ? Number(totalGuests) - Number(swaminarayanPlates) : 0} સામાન્ય પ્લેટ)`);
      } else {
        lines.push(`ભોજનનો પ્રકાર: ${foodTypeLabel}`);
      }
      lines.push('');

      if (selectedMenu.trim()) {
        const formattedMenu = getCompiledMenuText('gu');
        lines.push('પસંદ કરેલ મેનુ:');
        lines.push(formattedMenu);
        lines.push('');
      }
      if (perPlateRate !== '') {
        lines.push(`એક પ્લેટનો ભાવ: ₹${perPlateRate}`);
        lines.push('');
      }
      if (totalAmount !== '') {
        lines.push(`કુલ રકમ: ₹${totalAmount}`);
        lines.push('');
      }
      if (specialInstructions.trim()) {
        lines.push('ખાસ સૂચનાઓ:');
        lines.push(specialInstructions.trim());
        lines.push('');
      }
      
      lines.push('━━━━━━━━━━━━━━━━━━');
      lines.push('');
      lines.push('પુનિત કેટરર્સ પસંદ કરવા બદલ આપનો હાર્દિક આભાર!');
    }

    return lines.join('\n').trim();
  };

  // Validate WhatsApp Phone Number and Launch WhatsApp
  const handleSendWhatsApp = (lang: 'en' | 'gu') => {
    // Validate 10-digit phone number
    const cleaned = whatsappNumber.replace(/\D/g, '');
    if (cleaned.length !== 10 || !/^[6-9]\d{9}$/.test(cleaned)) {
      setWhatsappError('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
      return;
    }

    setWhatsappError('');
    const finalMsg = generateMessageText(lang);
    // Properly encode message for web compatibility
    const encodedText = encodeURIComponent(finalMsg);
    
    // Construct universal WhatsApp link
    const waUrl = `https://wa.me/91${cleaned}?text=${encodedText}`;
    
    // Attempt automatic opening
    const openedWindow = window.open(waUrl, '_blank');
    
    if (!openedWindow) {
      showToast('Popup blocker active. Please click the direct link provided.', 'error');
    } else {
      showToast('Quotation prepared! Opening WhatsApp...', 'success');
      setShowWhatsAppModal(false);
    }
  };

  // Copy formatted message text to clipboard
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast('Quotation text copied successfully!', 'success');
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
        showToast('Failed to copy. Please copy manually from the preview box.', 'error');
      });
  };

  // Generate and Download PDF using jsPDF + html2canvas
  const handleDownloadPDF = async () => {
    const check = isFormValid();
    if (!check.valid) {
      showToast(check.msg, 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Save and optimize stylesheets to bypass html2canvas oklch unsupported color function crash
    const originalStyles: { element: HTMLStyleElement; content: string }[] = [];
    const originalLinks: { element: HTMLLinkElement; placeholder: Comment }[] = [];
    const tempStyles: HTMLStyleElement[] = [];
    const originalGetComputedStyle = window.getComputedStyle;
    let customGetComputedStyleInstalled = false;

    try {
      setIsGeneratingPDF(true);
      showToast('Preparing your high-quality PDF...', 'success');

      // Monkey-patch window.getComputedStyle to intercept oklch and oklab colors returned from computed styles
      window.getComputedStyle = function (elt, pseudoElt) {
        const style = originalGetComputedStyle(elt, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            if (prop === 'getPropertyValue') {
              return function(propertyName: string) {
                const value = target.getPropertyValue(propertyName);
                if (typeof value === 'string' && (value.includes('oklch') || value.includes('oklab'))) {
                  return value
                    .replace(/oklch\([^)]+\)/g, 'rgb(120, 113, 108)')
                    .replace(/oklab\([^)]+\)/g, 'rgb(120, 113, 108)');
                }
                return value;
              };
            }
            const val = Reflect.get(target, prop, target);
            if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
              return val
                .replace(/oklch\([^)]+\)/g, 'rgb(120, 113, 108)')
                .replace(/oklab\([^)]+\)/g, 'rgb(120, 113, 108)');
            }
            if (typeof val === 'function') {
              return val.bind(target);
            }
            return val;
          }
        });
      };
      customGetComputedStyleInstalled = true;

      // 1. Clean <style> tags
      const styleTags = Array.from(document.querySelectorAll('style'));
      for (const tag of styleTags) {
        originalStyles.push({ element: tag, content: tag.innerHTML });
        if (tag.innerHTML.includes('oklch') || tag.innerHTML.includes('oklab')) {
          tag.innerHTML = tag.innerHTML
            .replace(/oklch\(([^)]+)\)/g, 'rgb(120, 113, 108)')
            .replace(/oklab\(([^)]+)\)/g, 'rgb(120, 113, 108)');
        }
      }

      // 2. Clean external link stylesheets by converting to style tags with replaced oklch and oklab
      const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
      for (const link of linkTags) {
        try {
          const response = await fetch(link.href);
          if (response.ok) {
            const cssText = await response.text();
            if (cssText.includes('oklch') || cssText.includes('oklab')) {
              const cleanedCss = cssText
                .replace(/oklch\(([^)]+)\)/g, 'rgb(120, 113, 108)')
                .replace(/oklab\(([^)]+)\)/g, 'rgb(120, 113, 108)');
              
              const tempStyle = document.createElement('style');
              tempStyle.innerHTML = cleanedCss;
              document.head.appendChild(tempStyle);
              tempStyles.push(tempStyle);

              const placeholder = document.createComment('temp_link_placeholder');
              link.parentNode?.replaceChild(placeholder, link);
              originalLinks.push({ element: link, placeholder });
            }
          }
        } catch (err) {
          console.warn('Failed to clean link stylesheet:', link.href, err);
        }
      }

      // Allow DOM to fully recalculate styles and update
      await new Promise((resolve) => setTimeout(resolve, 200));

      const element = printableRef.current;
      if (!element) {
        throw new Error('Printable element not found');
      }

      // Render hidden element to canvas at high resolution
      const canvas = await html2canvas(element, {
        scale: 2.2, // Extremely crisp resolution scale
        useCORS: true,
        logging: false,
        backgroundColor: '#fdfcf7', // Keep pristine cream background
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      const ratio = canvasWidth / pdfWidth;
      const imgHeightOnPdf = canvasHeight / ratio;

      if (imgHeightOnPdf <= pdfHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeightOnPdf, undefined, 'FAST');
      } else {
        // Safe multi-page flow if content goes beyond single page
        let heightLeft = imgHeightOnPdf;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightOnPdf, undefined, 'FAST');
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeightOnPdf;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightOnPdf, undefined, 'FAST');
          heightLeft -= pdfHeight;
        }
      }

      const safeClientName = clientName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Client';
      pdf.save(`Punit_Caterers_Quotation_${safeClientName}_${eventDate}.pdf`);
      showToast('PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      showToast('Failed to generate PDF. Please try again.', 'error');
    } finally {
      if (customGetComputedStyleInstalled) {
        window.getComputedStyle = originalGetComputedStyle;
      }
      // 3. Restore all original styles and link tags
      for (const style of originalStyles) {
        style.element.innerHTML = style.content;
      }
      for (const temp of tempStyles) {
        temp.parentNode?.removeChild(temp);
      }
      for (const item of originalLinks) {
        if (item.placeholder && item.placeholder.parentNode) {
          item.placeholder.parentNode.replaceChild(item.element, item.placeholder);
        }
      }
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] selection:bg-[#2563EB] selection:text-white pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="toast-notification"
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl transition-all duration-300 max-w-sm w-11/12 animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === 'error' 
              ? 'bg-blue-900 text-white border border-blue-700' 
              : 'bg-slate-900 text-blue-50 border border-blue-500/20'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-blue-300 shrink-0" />
          )}
          <p className="text-sm font-medium leading-relaxed">{toastMessage.text}</p>
          <button 
            onClick={() => setToastMessage(null)}
            className="ml-auto p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Elegant Header / Logo Area */}
      <header className="bg-[#2563EB] text-white shadow-xl relative overflow-hidden py-5 px-4">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute -left-16 -top-16 w-48 h-48 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full bg-blue-400/15 blur-3xl"></div>

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-wide text-white" id="brand-title">
            PUNIT CATERERS
          </h1>
          <p className="text-blue-100 text-[10px] md:text-xs tracking-widest uppercase font-semibold mt-1.5 bg-blue-800/50 px-3 py-1 rounded-full border border-blue-500/40 inline-flex items-center gap-1.5">
            <span>Delicious Food</span>
            <span className="text-blue-300">•</span>
            <span>Memorable Events</span>
          </p>

          <p className="text-blue-200 text-[10px] tracking-wide font-medium mt-1">
            સ્વાદિષ્ટ ભોજન • યાદગાર પ્રસંગો
          </p>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* Main Workspace Form Panel */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md border border-stone-100 overflow-hidden mb-12">
            
            {/* Header Section */}
            <div className="bg-[#EFF4FF] py-4 px-6 text-[#1E40AF] flex items-center justify-between border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <Utensils className="w-5 h-5 text-[#2563EB]" />
                <h2 className="font-serif font-bold text-lg tracking-wide">Generate Catering Quotation</h2>
              </div>
              <div className="hidden sm:flex items-center gap-1 bg-[#2563EB]/10 text-[11px] font-semibold tracking-wider text-[#1E40AF] px-3 py-1 rounded-full border border-[#2563EB]/20">
                <Lock className="w-3 h-3" /> SECURE CLIENT OUTBOUND
              </div>
            </div>

            {/* Form Fields Area */}
            <div className="p-6 space-y-6">
              
              {/* Client Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Client Name */}
                <div className="space-y-1.5" id="field-client-name">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#2563EB]" />
                    Client Name
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Rajeshbhai Patel"
                      className="w-full bg-stone-50 hover:bg-stone-100/50 focus:bg-white text-stone-900 border border-stone-200 focus:border-[#2563EB] rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 outline-none focus:ring-4 focus:ring-[#2563EB]/10 shadow-inner"
                    />
                    {clientName.trim().length > 0 && (
                      <Check className="w-4 h-4 text-green-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>

                {/* Event Date */}
                <div className="space-y-1.5" id="field-event-date">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                    Event Date
                  </label>
                  <input 
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-stone-50 hover:bg-stone-100/50 focus:bg-white text-stone-900 border border-stone-200 focus:border-[#2563EB] rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 outline-none focus:ring-4 focus:ring-[#2563EB]/10 shadow-inner"
                  />
                </div>

                {/* Event Address */}
                <div className="space-y-1.5 sm:col-span-2" id="field-event-address">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                    Event Address / Venue
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={eventAddress}
                      onChange={(e) => setEventAddress(e.target.value)}
                      placeholder="e.g. Shalin Bungalows, Near Iskcon Temple, Ahmedabad"
                      className="w-full bg-stone-50 hover:bg-stone-100/50 focus:bg-white text-stone-900 border border-stone-200 focus:border-[#2563EB] rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 outline-none focus:ring-4 focus:ring-[#2563EB]/10 shadow-inner"
                    />
                    {eventAddress.trim().length > 0 && (
                      <Check className="w-4 h-4 text-green-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>

                {/* Serving Time */}
                <div className="space-y-1.5" id="field-serving-time">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                    Time
                  </label>
                  <input 
                    type="text"
                    value={servingTime}
                    onChange={(e) => setServingTime(e.target.value)}
                    placeholder="e.g. 7:00 PM to 11:00 PM"
                    className="w-full bg-stone-50 hover:bg-stone-100/50 focus:bg-white text-stone-900 border border-stone-200 focus:border-[#2563EB] rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 outline-none focus:ring-4 focus:ring-[#2563EB]/10 shadow-inner"
                  />
                </div>

                {/* Total Guests */}
                <div className="space-y-1.5" id="field-total-guests">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#2563EB]" />
                    Total Plates
                  </label>
                  <input 
                    type="number"
                    min="1"
                    placeholder="e.g. 150"
                    value={totalGuests}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTotalGuests(val === '' ? '' : Number(val));
                    }}
                    className="w-full bg-stone-50 hover:bg-stone-100/50 focus:bg-white text-stone-900 border border-stone-200 focus:border-[#2563EB] rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 outline-none focus:ring-4 focus:ring-[#2563EB]/10 shadow-inner"
                  />
                </div>

                {/* Food Type Selector */}
                <div className="space-y-1.5 sm:col-span-2" id="field-food-type">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#2563EB]" />
                    Food Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Normal', 'Jain', 'Swaminarayan'] as const).map((type) => {
                      const isSelected = foodType === type;
                      return (
                        <button
                          type="button"
                          key={type}
                          onClick={() => setFoodType(type)}
                          className={`py-3 px-2 rounded-xl border text-center transition-all duration-150 flex flex-col items-center justify-center gap-1 cursor-pointer select-none ${
                            isSelected 
                              ? 'bg-[#EFF4FF] border-[#2563EB] shadow-md ring-1 ring-[#2563EB]/30' 
                              : 'bg-stone-50/50 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
                          }`}
                        >
                          <span className="text-base font-bold">
                            {type === 'Normal' ? '🟢' : type === 'Jain' ? '🌿' : '🛕'}
                          </span>
                          <span className={`text-xs font-bold block ${isSelected ? 'text-[#1E40AF]' : 'text-stone-900'}`}>
                            {type}
                          </span>
                          <span className={`text-[10px] block font-medium ${isSelected ? 'text-blue-700' : 'text-stone-500'}`}>
                            {type === 'Normal' ? 'સામાન્ય' : type === 'Jain' ? 'જૈન' : 'સ્વામિનારાયણ'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Conditional Plates Count Section */}
                  {(foodType === 'Jain' || foodType === 'Swaminarayan') && (
                    <div className="mt-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100/80 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-xs font-semibold text-[#1E40AF] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>How many people for {foodType} plates? / {foodType === 'Jain' ? 'જૈન' : 'સ્વામિનારાયણ'} પ્લેટની સંખ્યા?</span>
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {foodType === 'Jain' && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
                              Jain Plates / જૈન પ્લેટ
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={totalGuests || undefined}
                              placeholder="e.g. 20"
                              value={jainPlates}
                              onChange={(e) => {
                                const val = e.target.value;
                                setJainPlates(val === '' ? '' : Number(val));
                              }}
                              className="w-full bg-white text-stone-900 border border-stone-200 focus:border-[#2563EB] rounded-lg px-3.5 py-2 text-sm font-medium outline-none focus:ring-4 focus:ring-[#2563EB]/10 shadow-inner"
                            />
                          </div>
                        )}

                        {foodType === 'Swaminarayan' && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
                              Swaminarayan Plates / સ્વામિનારાયણ પ્લેટ
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={totalGuests || undefined}
                              placeholder="e.g. 15"
                              value={swaminarayanPlates}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSwaminarayanPlates(val === '' ? '' : Number(val));
                              }}
                              className="w-full bg-white text-stone-900 border border-stone-200 focus:border-[#2563EB] rounded-lg px-3.5 py-2 text-sm font-medium outline-none focus:ring-4 focus:ring-[#2563EB]/10 shadow-inner"
                            />
                          </div>
                        )}
                        
                        {/* Optional helper message */}
                        <div className="flex items-end">
                          <p className="text-[10px] text-stone-500 italic pb-2">
                            {totalGuests !== '' && (foodType === 'Jain' ? jainPlates !== '' : swaminarayanPlates !== '') ? (
                              <span>
                                Remaining {Number(totalGuests) - (foodType === 'Jain' ? Number(jainPlates) : Number(swaminarayanPlates))} plates will be Normal.
                              </span>
                            ) : (
                              <span>Enter specific count of plates. Default is all plates.</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Menu Typing Area */}
              <div className="space-y-1.5 pt-2 border-t border-stone-100" id="field-selected-menu">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#2563EB]" />
                    Selected Menu
                  </label>
                  <span className="text-[11px] text-stone-500 font-medium">Type details of all dishes</span>
                </div>
                <div className="relative">
                  <textarea 
                    value={selectedMenu}
                    onChange={(e) => setSelectedMenu(e.target.value)}
                    placeholder="Type the menu here. For example:
• Welcome Drinks: Rose Mint Mocktail, Masala Chaas
• Starters: Nylon Khaman, Cheese Corn Balls
• Main Course: Paneer Tikka Masala, Ringan Bataka Shaak
• Sweets: Kesar Basundi, Hot Jalebi with Rabdi
• Breads & Rice: Butter Puri, Phulka Rotli, Dal & Rice
• Accompaniments: Masala Papad, Salad, Pickles"
                    rows={8}
                    className="w-full bg-stone-50 hover:bg-stone-100/50 focus:bg-white text-stone-900 border border-stone-200 focus:border-[#2563EB] rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 outline-none focus:ring-4 focus:ring-[#2563EB]/10 shadow-inner min-h-[160px]"
                  />
                  {selectedMenu.trim().length > 0 && (
                    <div className="absolute right-3.5 bottom-3.5 bg-green-100 text-green-800 p-1 rounded-full">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 leading-normal">
                  💡 Hint: You can use bullet points (• or -) and line breaks to format the menu beautifully.
                </p>
              </div>

              {/* Financial Calculation Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-stone-100">
                
                {/* Per Plate Rate */}
                <div className="space-y-1.5" id="field-per-plate-rate">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-[#2563EB]" />
                    Per Plate Rate (₹)
                  </label>
                  <input 
                    type="number"
                    min="1"
                    placeholder="e.g. 450"
                    value={perPlateRate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPerPlateRate(val === '' ? '' : Number(val));
                    }}
                    className="w-full bg-stone-50 hover:bg-stone-100/50 focus:bg-white text-stone-900 border border-stone-200 focus:border-[#2563EB] rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 outline-none focus:ring-4 focus:ring-[#2563EB]/10 shadow-inner"
                  />
                </div>

                {/* Total Amount */}
                <div className="space-y-1.5" id="field-total-amount">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-[#2563EB]" />
                      Total Amount (₹)
                    </label>
                    {isTotalAmountManuallyEdited && (
                      <button 
                        type="button"
                        onClick={resetTotalToAutomatic}
                        className="text-[10px] text-[#2563EB] hover:text-[#1E40AF] font-bold underline"
                        title="Recalculate automatically based on Rate and Plates"
                      >
                        Recalculate
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type="number"
                      placeholder="Automatic calculation"
                      value={totalAmount}
                      onChange={(e) => handleTotalAmountChange(e.target.value)}
                      className={`w-full text-stone-900 border rounded-xl px-4 py-3 text-sm font-bold transition-all duration-150 outline-none focus:ring-4 focus:ring-[#2563EB]/10 shadow-inner ${
                        isTotalAmountManuallyEdited 
                          ? 'bg-[#EFF4FF] border-[#2563EB] focus:bg-white' 
                          : 'bg-stone-100 border-stone-200 focus:border-stone-300'
                      }`}
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {isTotalAmountManuallyEdited ? (
                        <span className="text-[10px] font-bold bg-[#2563EB]/10 text-[#1E40AF] px-1.5 py-0.5 rounded border border-[#2563EB]/20">MANUAL</span>
                      ) : (
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">AUTO</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Special Instructions */}
              <div className="space-y-1.5" id="field-special-instructions">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                  Special Instructions <span className="text-stone-400 text-[10px] lowercase font-normal">(optional)</span>
                </label>
                <textarea 
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Sweet to be prepared using pure Amul Ghee. Extra starters for VIP guests."
                  rows={2}
                  className="w-full bg-stone-50 hover:bg-stone-100/50 focus:bg-white text-stone-900 border border-stone-200 focus:border-[#2563EB] rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 outline-none focus:ring-4 focus:ring-[#2563EB]/10 shadow-inner resize-none"
                />
              </div>

              {/* Core Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleWhatsAppTrigger}
                  className="flex-1 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white py-4 px-6 rounded-xl font-bold tracking-wide transition-all duration-150 shadow-md flex items-center justify-center gap-2.5 text-sm md:text-base cursor-pointer"
                  id="btn-whatsapp-dispatch"
                  disabled={isGeneratingPDF}
                >
                  <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.488 1.977 14.03 1.053 11.4 1.053 5.962 1.053 1.532 5.421 1.53 10.85c-.001 1.73.453 3.42 1.316 4.915l-.994 3.63 3.734-.979zm11.23-6.843c-.3-.15-1.77-.875-2.04-.975-.27-.1-.466-.15-.66.15-.194.3-.75.95-.92 1.15-.17.2-.34.225-.64.075-.3-.15-1.266-.467-2.41-1.485-.89-.794-1.49-1.775-1.665-2.075-.175-.3-.019-.461.13-.61.136-.134.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.66-1.59-.9-2.175-.235-.572-.475-.495-.66-.502-.17-.007-.365-.007-.56-.007-.195 0-.51.075-.78.375-.27.3-1.03 1.01-1.03 2.46 0 1.45 1.055 2.85 1.2 3.05.145.2 2.08 3.175 5.035 4.455.703.305 1.25.488 1.68.625.707.225 1.35.193 1.86.117.568-.085 1.77-.725 2.02-1.425.25-.7.25-1.3 0-1.425-.075-.125-.27-.2-.57-.35z"/>
                  </svg>
                  <span>Send WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="flex-1 bg-[#2563EB] hover:bg-[#1E40AF] active:scale-[0.98] text-white py-4 px-6 rounded-xl font-bold tracking-wide transition-all duration-150 shadow-md flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer disabled:opacity-75"
                  id="btn-download-pdf"
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <Download className="w-5 h-5 text-white" />
                  )}
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  disabled={isGeneratingPDF}
                  className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 py-4 px-5 rounded-xl font-bold tracking-wide transition-all duration-150 flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer disabled:opacity-50"
                  id="btn-form-reset"
                >
                  <RotateCcw className="w-4.5 h-4.5" />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCopyModal(true)}
                  disabled={isGeneratingPDF}
                  className="bg-white hover:bg-[#EFF4FF] text-[#2563EB] border border-blue-200 py-4 px-5 rounded-xl font-bold tracking-wide transition-all duration-150 flex items-center justify-center gap-2 text-sm md:text-base cursor-pointer disabled:opacity-50"
                  id="btn-copy-msg-trigger"
                >
                  <Copy className="w-4.5 h-4.5" />
                  <span>Copy Message</span>
                </button>
              </div>

            </div>

          </div>



      </main>

      {/* MODAL 1: WHATSAPP SEND OUTBOUND PANEL */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-stone-900 rounded-2xl max-w-md w-full shadow-2xl border border-stone-100 overflow-hidden flex flex-col transform scale-100 transition-all duration-300">
            
            {/* Header */}
            <div className="bg-[#2563EB] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-100" />
                <h3 className="font-serif font-bold text-base tracking-wide">Send Quotation via WhatsApp</h3>
              </div>
              <button 
                onClick={() => setShowWhatsAppModal(false)}
                className="p-1 hover:bg-white/15 rounded text-stone-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* WhatsApp Input Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  Client WhatsApp Number <span className="text-red-500">*</span>
                </label>
                
                <div className="flex rounded-xl shadow-inner overflow-hidden border border-stone-200 bg-stone-50 focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-[#2563EB]/10 transition duration-150">
                  {/* Permanent Indian Country Prefix Badge */}
                  <span className="bg-stone-200 text-stone-700 font-bold px-4 flex items-center text-sm border-r border-stone-200">
                    +91
                  </span>
                  
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={whatsappNumber}
                    onChange={(e) => {
                      // Accept only numbers
                      const val = e.target.value.replace(/\D/g, '');
                      setWhatsappNumber(val);
                      if (val.length === 10 && /^[6-9]\d{9}$/.test(val)) {
                        setWhatsappError('');
                      }
                    }}
                    className="w-full bg-transparent px-4 py-3.5 text-sm font-semibold text-stone-900 outline-none"
                    autoFocus
                  />
                  
                  {whatsappNumber.length === 10 && /^[6-9]\d{9}$/.test(whatsappNumber) && (
                    <span className="flex items-center pr-3.5 text-green-600">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </span>
                  )}
                </div>

                {whatsappError ? (
                  <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {whatsappError}
                  </p>
                ) : (
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Accepts any valid 10-digit Indian mobile number (e.g. 9876543210).
                  </p>
                )}
              </div>

              {/* Language Selection section */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <p className="text-xs font-bold text-stone-700 uppercase tracking-wider block text-center">
                  Select Quotation Language
                </p>
                <p className="text-[11px] text-stone-500 text-center">
                  Choose a language to generate the WhatsApp template and launch chat:
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {/* English Selection */}
                  <button
                    onClick={() => handleSendWhatsApp('en')}
                    disabled={!/^[6-9]\d{9}$/.test(whatsappNumber)}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      /^[6-9]\d{9}$/.test(whatsappNumber)
                        ? 'bg-[#EFF4FF] hover:bg-blue-100 border-blue-200 hover:border-blue-300 shadow-sm active:scale-95'
                        : 'bg-stone-50 border-stone-200 opacity-60 cursor-not-allowed text-stone-400'
                    }`}
                  >
                    <span className="text-3xl">🇬🇧</span>
                    <span className="font-bold text-xs uppercase tracking-widest text-stone-850">English</span>
                    <span className="text-[9px] text-[#2563EB] font-semibold">Perfect Formatting</span>
                  </button>

                  {/* Gujarati Selection */}
                  <button
                    onClick={() => handleSendWhatsApp('gu')}
                    disabled={!/^[6-9]\d{9}$/.test(whatsappNumber)}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      /^[6-9]\d{9}$/.test(whatsappNumber)
                        ? 'bg-[#EFF4FF] hover:bg-blue-100 border-blue-200 hover:border-blue-300 shadow-sm active:scale-95'
                        : 'bg-stone-50 border-stone-200 opacity-60 cursor-not-allowed text-stone-400'
                    }`}
                  >
                    <span className="text-3xl">🇮🇳</span>
                    <span className="font-bold text-xs uppercase tracking-widest text-stone-850">ગુજરાતી</span>
                    <span className="text-[9px] text-[#2563EB] font-semibold">શુદ્ધ ગુજરાતી મેસેજ</span>
                  </button>
                </div>
              </div>

              {/* Handshake Failover Link */}
              {/^[6-9]\d{9}$/.test(whatsappNumber) && (
                <div className="bg-stone-50 p-3.5 rounded-lg text-center text-[11px] leading-relaxed border border-stone-200/60 text-stone-600">
                  <p className="font-semibold text-stone-700">Can't open new window?</p>
                  <div className="flex justify-center gap-4 mt-1">
                    <a 
                      href={`https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(generateMessageText('en'))}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#2563EB] hover:text-[#1E40AF] hover:underline font-bold"
                    >
                      English Direct Link
                    </a>
                    <span className="text-stone-300">|</span>
                    <a 
                      href={`https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(generateMessageText('gu'))}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#2563EB] hover:text-[#1E40AF] hover:underline font-bold"
                    >
                      ગુજરાતી Direct Link
                    </a>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM RESET FORM */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-250">
          <div className="bg-white text-stone-900 rounded-xl p-6 max-w-sm w-full shadow-2xl border border-stone-100 space-y-4">
            
            {/* Warning icon and title */}
            <div className="flex items-center gap-3 text-[#1E40AF]">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif font-bold text-lg">Reset Quotation Form?</h3>
            </div>
            
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to clear all currently entered client details, event specifications, and selected menu choices? This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 font-bold px-4 py-2.5 rounded-lg text-xs tracking-wider uppercase transition cursor-pointer"
              >
                No, Keep Form
              </button>
              
              <button
                type="button"
                onClick={handleResetForm}
                className="bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold px-4 py-2.5 rounded-lg text-xs tracking-wider uppercase transition cursor-pointer"
              >
                Yes, Reset All
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: COPY QUOTATION TEXT */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-250">
          <div className="bg-white text-stone-900 rounded-2xl max-w-md w-full shadow-2xl border border-stone-100 overflow-hidden flex flex-col transform scale-100 transition-all duration-300">
            
            {/* Header */}
            <div className="bg-[#2563EB] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-blue-100" />
                <h3 className="font-serif font-bold text-base tracking-wide">Copy Message / મેસેજ કોપી</h3>
              </div>
              <button 
                onClick={() => setShowCopyModal(false)}
                className="p-1 hover:bg-white/15 rounded text-stone-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              
              <p className="text-xs text-stone-600 leading-relaxed">
                Click a language tab to see the formatted message. You can copy the message and directly paste it to send to your client.
              </p>

              {/* Language Selection Tabs */}
              <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setCopyModalLang('en')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                    copyModalLang === 'en'
                      ? 'bg-white text-[#2563EB] shadow-sm'
                      : 'text-stone-500 hover:text-stone-850'
                  }`}
                >
                  🇬🇧 English Message
                </button>
                <button
                  type="button"
                  onClick={() => setCopyModalLang('gu')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                    copyModalLang === 'gu'
                      ? 'bg-white text-[#2563EB] shadow-sm'
                      : 'text-stone-500 hover:text-stone-850'
                  }`}
                >
                  🇮🇳 ગુજરાતી મેસેજ
                </button>
              </div>

              {/* Message Box with End Copy Button */}
              <div className="flex flex-col gap-3">
                <div className="relative bg-stone-50 border border-stone-200 rounded-xl p-4 max-h-[250px] overflow-y-auto font-mono text-xs text-stone-850 whitespace-pre-wrap shadow-inner leading-relaxed select-all">
                  {generateMessageText(copyModalLang)}
                </div>

                {/* Big Copy Button directly at the end of the message box */}
                <button
                  type="button"
                  onClick={() => handleCopyToClipboard(generateMessageText(copyModalLang))}
                  className="w-full bg-[#2563EB] hover:bg-[#1E40AF] active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Message Text</span>
                </button>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="bg-stone-50 px-6 py-4 flex justify-end border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowCopyModal(false)}
                className="bg-white hover:bg-stone-150 text-stone-700 border border-stone-200 font-bold px-4 py-2 rounded-lg text-xs tracking-wider uppercase transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Hidden printable template specifically optimized for single-page A4 PDF export */}
      <div 
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          zIndex: -50,
          width: '794px',
          height: '1123px',
          overflow: 'visible',
        }}
      >
        <div 
          ref={printableRef}
          className="w-[794px] p-10 relative flex flex-col justify-between"
          style={{
            fontFamily: '"Inter", "Noto Sans Gujarati", sans-serif',
            minHeight: '1123px', // Exactly A4 height at 96 DPI
            border: '14px solid #2563EB', // Blue premium outer border
            backgroundColor: '#FFFFFF',
            color: '#1c1917',
          }}
        >
          {/* Inner Blue Elegant Border */}
          <div 
            className="p-8 h-full flex flex-col justify-between flex-1 relative"
            style={{ border: '1.5px solid rgba(37, 99, 235, 0.5)' }}
          >
            
            {/* Decorative Corners */}
            {/* Top-Left Branch */}
            <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden pointer-events-none select-none">
              <svg width="128" height="128" viewBox="0 0 128 128">
                <path d="M 0,0 L 110,0 C 90,30 30,90 0,110 Z" fill="#2563EB" />
                <path d="M 0,113 C 35,93 93,35 113,0" fill="none" stroke="#2563EB" strokeWidth="2" />
                <path d="M 0,117 C 38,97 97,38 117,0" fill="none" stroke="#1E40AF" strokeWidth="0.75" opacity="0.8" />
                <path d="M 10,10 Q 45,45 80,80" stroke="#1E40AF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <path d="M 30,30 Q 42,20 48,28 Q 38,38 30,30 Z" fill="#2563EB" />
                <path d="M 30,30 Q 20,42 28,48 Q 38,38 30,30 Z" fill="#2563EB" />
                <path d="M 50,50 Q 62,40 68,48 Q 58,58 50,50 Z" fill="#2563EB" />
                <path d="M 50,50 Q 40,62 48,68 Q 58,58 50,50 Z" fill="#2563EB" />
                <path d="M 70,70 Q 82,60 88,68 Q 78,78 70,70 Z" fill="#2563EB" />
              </svg>
            </div>

            {/* Bottom-Left Swoop */}
            <div className="absolute bottom-0 left-0 w-24 h-24 overflow-hidden pointer-events-none select-none">
              <svg width="96" height="96" viewBox="0 0 96 96">
                <path d="M 0,96 L 0,65 C 20,75 75,90 96,96 Z" fill="#2563EB" />
                <path d="M 0,62 C 22,72 77,87 96,94" fill="none" stroke="#2563EB" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Bottom-Right Branch */}
            <div className="absolute bottom-0 right-0 w-32 h-32 overflow-hidden pointer-events-none select-none">
              <svg width="128" height="128" viewBox="0 0 128 128">
                <path d="M 128,128 L 18,128 C 38,98 98,38 128,18 Z" fill="#2563EB" />
                <path d="M 128,15 C 95,35 35,95 15,128" fill="none" stroke="#2563EB" strokeWidth="2" />
                <path d="M 128,11 C 91,31 31,91 11,128" fill="none" stroke="#1E40AF" strokeWidth="0.75" opacity="0.8" />
                <path d="M 118,118 Q 83,83 48,48" stroke="#1E40AF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <path d="M 98,98 Q 86,108 80,100 Q 90,90 98,98 Z" fill="#2563EB" />
                <path d="M 98,98 Q 108,86 100,80 Q 90,90 98,98 Z" fill="#2563EB" />
                <path d="M 78,78 Q 66,88 60,80 Q 70,70 78,78 Z" fill="#2563EB" />
                <path d="M 78,78 Q 88,66 80,60 Q 70,70 78,78 Z" fill="#2563EB" />
                <path d="M 58,58 Q 46,68 40,60 Q 50,50 58,58 Z" fill="#2563EB" />
              </svg>
            </div>

            {/* Top-Right Ribbon Badge */}
            <div className="absolute top-0 right-8 w-20 h-36 pointer-events-none select-none z-10">
              <svg width="80" height="144" viewBox="0 0 80 144">
                <path d="M 4,0 L 76,0 L 76,120 L 40,100 L 4,120 Z" fill="#1E40AF" />
                <path d="M 8,0 L 8,112 L 40,94 L 72,112 L 72,0" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                <path d="M 11,0 L 11,108 L 40,90 L 69,108 L 69,0" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" opacity="0.8" />
                
                <g transform="translate(25, 12)">
                  <path d="M 4,18 L 24,18 L 24,15 C 24,15 28,15 28,10 C 28,5 24,3 21,5 C 21,1 17,-1 14,0 C 11,-1 7,1 7,5 C 4,3 0,5 0,10 C 0,15 4,15 4,15 Z" fill="rgba(255, 255, 255, 0.15)" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 6,18 L 22,18" stroke="#fff" strokeWidth="1.5" />
                </g>
                <text x="40" y="56" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="Georgia, serif" textAnchor="middle" letterSpacing="0.05em">CATERING</text>
                <text x="40" y="67" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="Georgia, serif" textAnchor="middle" letterSpacing="0.05em">QUOTATION</text>
                <path d="M 24,78 Q 40,70 56,78" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                <circle cx="40" cy="74" r="1.5" fill="#fff" />
              </svg>
            </div>

            {/* Header / Logo Section */}
            <div className="text-center pt-2 pb-5">
              <span className="tracking-[0.3em] text-[10px] block text-stone-400 font-serif mb-1">✨ SHREE GANESHAY NAMAH ✨</span>
              
              <h1 className="font-serif font-extrabold tracking-widest text-3xl text-[#1E40AF]">PUNIT CATERERS</h1>
              <p className="text-[11px] tracking-[0.25em] font-bold uppercase text-[#2563EB] mt-1">Delicious Food • Memorable Events</p>
              
              {/* Divider Flourish */}
              <div className="flex items-center justify-center my-3 select-none pointer-events-none">
                <svg width="140" height="10" viewBox="0 0 140 10">
                  <path d="M 0,5 L 55,5 Q 60,1 65,5 Q 70,9 75,5 Q 80,1 85,5 L 140,5" fill="none" stroke="#2563EB" strokeWidth="1.25" />
                  <circle cx="70" cy="5" r="2.5" fill="#1E40AF" stroke="#2563EB" strokeWidth="0.75" />
                </svg>
              </div>
            </div>

            {/* Event Details Grid - Structured Dual Column */}
            <div className="bg-white/90 border border-stone-200/80 rounded-2xl p-6 shadow-sm space-y-4 relative z-10 mb-6">
              
              {/* Row 1: Client Name & Serving Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#EFF4FF] border border-blue-200 flex items-center justify-center shrink-0">
                    <User className="w-5.5 h-5.5 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-stone-500">Client Name / ગ્રાહકનું નામ</p>
                    <p className="font-extrabold text-[15px] text-stone-950">{clientName.trim() || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 border-l border-stone-150 pl-4">
                  <div className="w-11 h-11 rounded-full bg-[#EFF4FF] border border-blue-200 flex items-center justify-center shrink-0">
                    <Clock className="w-5.5 h-5.5 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-stone-500">Time / સમય</p>
                    <p className="font-extrabold text-[15px] text-stone-950">{servingTime.trim() || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Row 2: Event Address & Total Guests */}
              <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#EFF4FF] border border-blue-200 flex items-center justify-center shrink-0">
                    <MapPin className="w-5.5 h-5.5 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-stone-500">Event Address / પ્રસંગનું સ્થળ</p>
                    <p className="font-extrabold text-[13px] text-stone-950 break-words max-w-[240px] leading-snug">{eventAddress.trim() || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 border-l border-stone-150 pl-4">
                  <div className="w-11 h-11 rounded-full bg-[#EFF4FF] border border-blue-200 flex items-center justify-center shrink-0">
                    <Users className="w-5.5 h-5.5 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-stone-500">Total Plates / કુલ પ્લેટ</p>
                    <p className="font-extrabold text-[15px] text-[#2563EB]">{totalGuests || 'N/A'} Plates</p>
                  </div>
                </div>
              </div>

              {/* Row 3: Event Date & Food Type */}
              <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#EFF4FF] border border-blue-200 flex items-center justify-center shrink-0">
                    <Calendar className="w-5.5 h-5.5 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-stone-500">Event Date / પ્રસંગની તારીખ</p>
                    <p className="font-extrabold text-[15px] text-[#2563EB]">{eventDate || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 border-l border-stone-150 pl-4">
                  <div className="w-11 h-11 rounded-full bg-[#EFF4FF] border border-blue-200 flex items-center justify-center shrink-0">
                    <Utensils className="w-5.5 h-5.5 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-stone-500">Food Type / ભોજનનો પ્રકાર</p>
                    <p className="font-extrabold text-[14px] text-stone-950 leading-normal">
                      {FOOD_TYPE_LABELS[foodType].en} / {FOOD_TYPE_LABELS[foodType].gu.split(' ')[1]}
                      {foodType === 'Jain' && jainPlates !== '' && (
                        <span className="block text-[11px] text-[#2563EB] font-bold mt-0.5">
                          {jainPlates} Jain | {totalGuests !== '' ? Number(totalGuests) - Number(jainPlates) : 0} Normal Plates
                        </span>
                      )}
                      {foodType === 'Swaminarayan' && swaminarayanPlates !== '' && (
                        <span className="block text-[11px] text-[#2563EB] font-bold mt-0.5">
                          {swaminarayanPlates} Swami. | {totalGuests !== '' ? Number(totalGuests) - Number(swaminarayanPlates) : 0} Normal Plates
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Selected Menu Block - 3-Column Layout inside blue frame */}
            <div className="bg-[#EFF4FF] border border-[#2563EB]/25 rounded-2xl p-6 pt-7 pb-5 relative mb-6 shadow-inner flex-1 flex flex-col justify-start min-h-[280px]">
              {/* Crimson Title Tab */}
              <div className="absolute -top-3.5 left-6 bg-[#1E40AF] text-white px-4 py-1 rounded-md text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm border border-[#2563EB]/35">
                <Utensils className="w-3.5 h-3.5 text-blue-100" />
                <span>Selected Menu / પસંદ કરેલ ભોજન મેનુ</span>
              </div>

              {(!selectedMenu.trim()) ? (
                <p className="text-stone-400 italic text-xs text-center py-10 my-auto">No items selected yet. Please type in the menu field.</p>
              ) : (
                <div className="grid grid-cols-3 gap-6 pt-2">
                  {getMenuColumns(selectedMenu).map((col, colIdx) => (
                    <div key={colIdx} className="space-y-2">
                      {col.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-start gap-1.5 text-[11.5px] text-stone-900 font-bold leading-relaxed">
                          <span className="text-[#2563EB] font-black select-none">•</span>
                          <span className="break-words">{item}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing Section */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center mb-1">
                  <IndianRupee className="w-4.5 h-4.5 text-stone-850" />
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-stone-500">Per Plate Rate</span>
                <span className="text-[8px] text-stone-400 block font-semibold">પ્લેટ દીઠ રેટ</span>
                <span className="font-extrabold text-stone-900 text-lg mt-0.5">₹{perPlateRate || '0'}</span>
              </div>

              <div className="bg-[#EFF4FF] border border-[#2563EB]/20 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <div className="w-9 h-9 rounded-full bg-blue-100/50 flex items-center justify-center mb-1">
                  <Users className="w-4.5 h-4.5 text-[#2563EB]" />
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#1E40AF]">Total Plates</span>
                <span className="text-[8px] text-blue-600 block font-semibold">કુલ પ્લેટ</span>
                <span className="font-extrabold text-[#1E40AF] text-lg mt-0.5">{totalGuests || '0'}</span>
              </div>

              <div className="bg-[#EFF4FF] border border-blue-200 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                  <IndianRupee className="w-4.5 h-4.5 text-[#1E40AF] stroke-[2.5]" />
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#1E40AF]">Total Amount</span>
                <span className="text-[8px] text-blue-600 block font-semibold">કુલ અંદાજિત રકમ</span>
                <span className="font-extrabold text-[#1E40AF] text-lg mt-0.5">₹{totalAmount || '0'}</span>
              </div>
            </div>

            {/* Special Instructions Banner */}
            <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-4 flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#EFF4FF] border border-[#2563EB]/20 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400">Special Instructions / ખાસ સૂચનાઓ</p>
                <p className="text-xs text-stone-750 italic font-semibold leading-relaxed mt-1">
                  {specialInstructions.trim() || 'None / કોઈ ખાસ સૂચના નથી'}
                </p>
              </div>
            </div>

            {/* Footer & Signature Block */}
            <div className="text-center pt-5 mt-4 border-t border-dashed border-stone-250 flex justify-between items-end relative z-10">
              <div className="text-left space-y-1">
                <p className="font-bold text-xs" style={{ color: '#292524' }}>For, PUNIT CATERERS</p>
                <div className="h-14"></div>
                <p className="text-[10px]" style={{ color: '#a8a29e' }}>Authorized Signature / સહી</p>
              </div>
              
              <div className="text-center pb-1">
                <span className="italic font-serif text-stone-500 text-xs block mb-0.5">Thank you for choosing</span>
                <div className="flex items-center justify-center gap-2">
                  <svg width="32" height="16" viewBox="0 0 32 16" className="inline-block shrink-0 rotate-180">
                    <path d="M 0,8 Q 16,3 32,8" fill="none" stroke="#2563EB" strokeWidth="1.5" />
                    <path d="M 8,5 Q 12,1 16,6 Q 12,10 8,5 Z" fill="#2563EB" />
                  </svg>
                  <span className="font-serif font-extrabold tracking-widest text-[15px] text-[#1E40AF]">PUNIT CATERERS</span>
                  <svg width="32" height="16" viewBox="0 0 32 16" className="inline-block shrink-0">
                    <path d="M 0,8 Q 16,3 32,8" fill="none" stroke="#2563EB" strokeWidth="1.5" />
                    <path d="M 8,5 Q 12,1 16,6 Q 12,10 8,5 Z" fill="#2563EB" />
                  </svg>
                </div>
                <p className="text-[9px] text-stone-400 font-medium tracking-wide mt-1">Serving Love since 1995</p>
              </div>

              <div className="text-right text-[10px] text-stone-400 space-y-0.5">
                <p className="font-semibold text-stone-600">Punit Caterers</p>
                <p className="text-[8.5px]">Ahmedabad, Gujarat</p>
                <p className="text-[8px]">Printed: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
