// utils/linkifyText.js
export function linkifyText(text) {
  if (!text) return '';

  // נזהה כתובות אינטרנט
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // נחליף כל כתובת בתגית <a>
  return text.replace(
    urlRegex,
    (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[#e60000] hover:underline">${url}</a>`
  );
}
