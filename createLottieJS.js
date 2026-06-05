const fs = require('fs');

const loadingBeans = fs.readFileSync('7ffb3b28-1161-11ee-935b-e3167a05eef9.json', 'utf8');
const frappe = fs.readFileSync('8000220a-1161-11ee-935f-8f201a7cb674.json', 'utf8');

const jsContent = `
// Auto-generated to bypass local CORS for Lottie animations
window.loadingBeansData = ${loadingBeans};
window.frappeData = ${frappe};
`;

fs.writeFileSync('lottieData.js', jsContent);
console.log('lottieData.js created successfully!');
