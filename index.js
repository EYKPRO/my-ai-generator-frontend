// index.js (קוד השרת האחורי)
require('dotenv').config(); // טוען משתני סביבה מקובץ .env

const express = require('express');
const DeepSeek = require('deepseek');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; // פורט 3000 מקומית, או פורט ש-Render נותן
// הגדרות CORS: מאפשרות לאתר שלך לתקשר עם השרת
// חשוב: החלף את 'https://eykpro.github.io' ב-URL האמיתי של האתר שלך מ-GitHub Pages
app.use(cors({
    origin: [
        'http://localhost:8080', // עבור בדיקה מקומית של האתר שלך
        'https://eykproE.github.io', // כתובת ה-GitHub Pages הכללית שלך
        'https://eykpro.github.io/my-ai-generator-frontend' // כתובת הפרויקט הספציפית ב-GitHub Pages
    ]
}));
app.use(express.json()); // מאפשר לשרת לקבל גוף בקשות בפורמט JSON

// וודא שמפתח ה-API של DeepSeek מוגדר במשתני הסביבה
const deepseekApiKey = process.env.DEEPSEEK_KEY;
if (!deepseekApiKey) {
    console.error('שגיאה: משתנה סביבה DEEPSEEK_KEY לא מוגדר!');
    process.exit(1); // צא מהאפליקציה אם המפתח חסר
}


// נקודת קצה (Endpoint) שאליה האתר ישלח בקשות
app.post('/generate', async (req, res) => {
    const userPrompt = req.body.prompt; // מקבל את הטקסט מהאתר

    if (!userPrompt) {
        return res.status(400).json({ error: 'חסרה בקשה (prompt) מגוף הבקשה.' });
    }

    try {
        // הגדרת המודל של DeepSeek וההנחיה
        const messages = [
            {
                role: 'system',
                content: `אתה עוזר ויוצר תוכן. המשתמש יבקש ממך ליצור משהו.
                השב בצורה מפורטת ככל הניתן. אם המשתמש מבקש קוד או קבצים,
                ספק את הקוד המלא או מבנה הקבצים עם הוראות מפורטות.
                אם המשתמש מבקש אתר אינטרנט, צור את קוד ה-HTML המלא.
                השב בעברית בלבד.`,
            },
            {
                role: 'user',
                content: userPrompt,
            },
        ];

        const chatCompletion = await deepseek.chat.completions.create({
            model: "deepseek-coder", // או "deepseek-chat"
            messages: messages,
        });

        const reply = chatCompletion.choices[0]?.message?.content;

        if (reply) {
            res.json({ reply: reply }); // שולח את התשובה בחזרה לאתר
        } else {
            res.status(500).json({ error: 'DeepSeek לא החזיר תשובה.' });
        }

    } catch (error) {
        console.error('שגיאה בתקשורת עם DeepSeek:', error);
        res.status(500).json({ error: 'אירעה שגיאה בשרת AI: ' + error.message });
    }
});

// נקודת קצה פשוטה לבדיקה שהשרת פועל
app.get('/', (req, res) => {
    res.send('שרת ה-AI Generator פועל ונמצא במצב המתנה לבקשות!');
});

// הפעלת השרת
app.listen(port, () => {
    console.log(`שרת Backend פועל בפורט ${port}`);
});