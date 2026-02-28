require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenAI } = require('@google/genai'); 
const express = require('express'); // 🌟 โหลดระบบหน้าม้า

// 🌟 สร้างหน้าเว็บไซต์ปลอมๆ เพื่อให้ Render.com ยอมให้เรารันฟรี!
const app = express();
app.get('/', (req, res) => res.send('น้องไลท์คุง ออนไลน์เฝ้ากิลด์ 24 ชั่วโมงแล้วบอส!'));
app.listen(process.env.PORT || 3000, () => console.log('✅ Web Server Online!'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

client.once('ready', () => {
    console.log(`✅ น้อง ${client.user.tag} ออนไลน์พร้อมปกป้อง CEO นนท์ 24 ชม.!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const triggerWords = ['ไลท์', 'ไลท์คุง', 'light', 'lightkung'];
    const contentLower = message.content.toLowerCase();
    const isMentioned = triggerWords.some(word => contentLower.includes(word));
    
    if (!isMentioned) return; 

    try {
        const userName = message.member ? message.member.displayName : message.author.username;
        const userRoles = message.member ? message.member.roles.cache.map(r => r.name).join(', ') : 'Member';
        const promptWithContext = `[ข้อมูลคนคุยด้วย -> ชื่อ: ${userName}, ยศ: ${userRoles}]\nข้อความ: ${message.content}`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: promptWithContext,
            config: {
                systemInstruction: `คุณคือ "น้องไลท์คุง" บอท AI ประจำกิลด์ "Starlight Eclipse"
                
หน้าที่: ตอบคำถามและสืบค้นข้อมูลให้คนในกิลด์

ระบบสแกนบุคคล:
1. ระดับ CEO (บอส): ถ้าคนคุยคือ "นนท์" หรือยศ "CEO", "Owner" ให้เทิดทูน เชื่อฟัง และรับใช้เต็มที่
2. ระดับ Admin: ถ้ามียศ "Admin", "แอดมิน" ให้พูดจาให้เกียรติและรับฟัง
3. ระดับลูกกิลด์: ให้เปิดโหมดวัยรุ่นทรงกวนตีน ขี้เล่น ชอบแซว ด่าได้ด่า พูดจาห้วนๆ ห้ามมีครับ/ค่ะ!

กฎเหล็ก: ใครนินทา "CEO นนท์" มึงด่าสวนทันที!`
            }
        });
        
        let replyText = response.text.trim().replace(/^"|"$/g, '');
        return message.reply(replyText);

    } catch (err) {
        console.log("❌ AI Error:", err.message);
        return message.reply("เอ๋อแดกเลย ระบบกูรวนแป๊บ!"); 
    }
});

client.login(process.env.DISCORD_TOKEN);
