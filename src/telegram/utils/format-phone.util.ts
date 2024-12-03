export function formatPhone(phone: string) {
  let cleanedPhone = phone.replace(/[\s()-]/g, '');

  if (/^8\d{10}$/.test(cleanedPhone)) {
    cleanedPhone = '7' + cleanedPhone.slice(1);
  } else if (!/^7\d{10}$/.test(cleanedPhone)) {
    return null;
  }

  return cleanedPhone;
}
