//data\articles\index.js
import newsMotorcycle from './newsMotorcycle';
import blog from './blog';
import gear from './gear'; // ✅ הוספת ציוד
import reviews from './reviews';


// אם יש קבצים נוספים (helmets, tests וכו') – תוסיף גם אותם כאן

const articlesData = [
  ...newsMotorcycle,
  ...blog,
  ...gear, // ✅ הוספת כתבות ציוד
  ...reviews,
  
];

export default articlesData;
