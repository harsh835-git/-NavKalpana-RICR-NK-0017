const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Progress = require('../models/Progress');
const CheckIn = require('../models/CheckIn');
const Chat = require('../models/Chat');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/message', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user;
    
    // Gather context
    const [recentProgress, recentCheckins] = await Promise.all([
      Progress.find({ user: user._id }).sort({ date: -1 }).limit(14),
      CheckIn.find({ user: user._id }).sort({ date: -1 }).limit(7)
    ]);
    
    const { profile } = user;
    const weightLogs = recentProgress.filter(p => p.weight);
    const avgWeeklyChange = weightLogs.length >= 2 ?
      (weightLogs[0].weight - weightLogs[weightLogs.length - 1].weight) / (weightLogs.length / 7) : 0;
    
    const workoutLogs = recentProgress.filter(p => p.workoutCompletion);
    const workoutAdherence = workoutLogs.length > 0 ?
      workoutLogs.filter(l => l.workoutCompletion === 'completed').length / workoutLogs.length * 100 : 0;
    
    const dietLogs = recentProgress.filter(p => p.dietAdherence);
    const dietAdherence = dietLogs.length > 0 ?
      dietLogs.filter(l => l.dietAdherence === 'followed').length / dietLogs.length * 100 : 0;
    
    const fatigueFlags = recentCheckins.filter(c => 
      c.energyLevel === 'slightly_fatigued' || c.energyLevel === 'very_tired'
    ).length;
    
    const systemPrompt = `You are FitAI Coach, a personal fitness and nutrition coach. Always format your response using Markdown:
- Use **bold** for key terms, numbers, and important advice
- Use bullet points or numbered lists for steps and recommendations
- Use headings (##) only when the response covers multiple distinct topics
- Keep responses focused and actionable — 100 to 200 words max
- Add a safety note only if medically relevant

User profile:
- **Name:** ${user.name}
- **Goal:** ${profile?.goal || 'n/a'}
- **Current weight:** ${weightLogs[0]?.weight || profile?.currentWeight || 'n/a'} kg → **Target:** ${profile?.goalWeight || 'n/a'} kg
- **Daily calories:** ${profile?.targetCalories || 'n/a'} kcal
- **Workout adherence:** ${Math.round(workoutAdherence)}%
- **Diet adherence:** ${Math.round(dietAdherence)}%
- **Weekly weight change:** ${avgWeeklyChange.toFixed(2)} kg
- **Fatigue flags (last 7 days):** ${fatigueFlags}/7
- **Activity level:** ${profile?.activityLevel || 'n/a'}
- **Experience:** ${profile?.experienceLevel || 'n/a'}`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { maxOutputTokens: 10000, temperature: 0.7 }
    });
    const result = await model.generateContent(systemPrompt + '\n\nQuestion: ' + message);
    const response = result.response.text();
    
    // Save to chat history
    let chat = await Chat.findOne({ user: user._id });
    if (!chat) chat = new Chat({ user: user._id, messages: [] });
    chat.messages.push({ role: 'user', content: message });
    chat.messages.push({ role: 'assistant', content: response });
    if (chat.messages.length > 100) chat.messages = chat.messages.slice(-100);
    await chat.save();
    
    res.json({ message: response });
  } catch (err) {
    console.error('Chat error:', err);
    if (err.status === 429) {
      return res.status(429).json({
        message: 'The AI coach is temporarily unavailable due to API quota limits. Please try again later or contact support to upgrade the API plan.'
      });
    }
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
});

// Get chat history
router.get('/history', protect, async (req, res) => {
  try {
    const chat = await Chat.findOne({ user: req.user._id });
    res.json({ messages: chat?.messages?.slice(-20) || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
