// Kav's branches, from the kav-cafe demo (Instagram "أوقات العمل" highlight + the two newer branches announced in posts).
export const branches = [
  { id: 'jamiyin', en: 'Drive Thru · Al Jamiyin', ar: 'درايف ثرو · حي الجامعيين' },
  { id: 'aziziyah', en: 'Al Aziziyah', ar: 'حي العزيزية' },
  { id: 'salam', en: 'Al Salam · King Abdulaziz St', ar: 'حي السلام · شارع الملك عبدالعزيز' },
  { id: 'maternity', en: 'Maternity & Children Hospital · Dammam', ar: 'مستشفى الولادة والأطفال · الدمام' },
  { id: 'kfsh', en: 'King Fahd Specialist Hospital · Dammam', ar: 'مستشفى الملك فهد التخصصي · الدمام' },
  { id: 'qatif-central', en: 'Qatif Central Hospital', ar: 'مستشفى القطيف المركزي' },
  { id: 'pmbf', en: 'Prince Mohammed bin Fahd Hospital', ar: 'مستشفى الأمير محمد بن فهد' },
];

export const branchById = Object.fromEntries(branches.map((b) => [b.id, b]));
