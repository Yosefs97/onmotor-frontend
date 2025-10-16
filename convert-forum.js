const fs = require('fs');
const path = require('path');

// הנתיב אל forum.json
const forumJsonPath = path.join(__dirname, 'data', 'forum.json');

// הנתיב אליו נייצא את קובץ ה־JS החדש
const outputPath = path.join(__dirname, 'data', 'articles', 'forum.js');

// טען את קובץ ה־JSON
const forumData = JSON.parse(fs.readFileSync(forumJsonPath, 'utf-8'));

const forumArticles = [];

forumData.forEach(category => {
  category.posts.forEach(post => {
    forumArticles.push({
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author,
      date: post.date,
      category: 'forum',
      subcategory: category.id,
      comments: post.comments || [],
      image: `/forum/${category.id}.jpg`,
    });
  });
});

// צור קובץ JS עם export default
const jsContent =
  `const forumArticles = ${JSON.stringify(forumArticles, null, 2)};\n\nexport default forumArticles;\n`;

// כתוב לקובץ
fs.writeFileSync(outputPath, jsContent, 'utf-8');

console.log('✅ forum.js נוצר בהצלחה מתוך forum.json');
