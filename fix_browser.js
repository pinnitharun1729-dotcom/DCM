import fs from 'fs';

let content = fs.readFileSync('src/components/DuePaymentModal.tsx', 'utf-8');

const browserImport = `
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
`;

content = content.replace(
  /import \{ CheckCircle2, Copy, ExternalLink, Info, UploadCloud, X \} from 'lucide-react';/,
  "import { CheckCircle2, Copy, ExternalLink, Info, UploadCloud, X } from 'lucide-react';\n" + browserImport
);

const browserOpen = `
  const openSbiCollect = async () => {
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url: SBI_COLLECT_URL });
    } else {
      window.open(SBI_COLLECT_URL, '_blank', 'noopener,noreferrer');
    }
  };
`;

content = content.replace(
  /  const handleProceedToPayment = \(\) => \{\n    window\.open\(SBI_COLLECT_URL, '_blank', 'noopener,noreferrer'\);\n  \};/,
  browserOpen + "\n  const handleProceedToPayment = () => {\n    openSbiCollect();\n  };"
);

fs.writeFileSync('src/components/DuePaymentModal.tsx', content);
