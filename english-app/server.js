require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = 'gpt-4o';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// System prompts
const CHAT_SYSTEM_PROMPT = (scenario, subScenario) => `You are a friendly native English speaker helping a Chinese user practice conversational English. You are role-playing a real-life scenario.

Your role:
1. Stay in character for the scenario. Start by setting the scene and initiating the conversation naturally.
2. Speak naturally as a native speaker would — use contractions, idioms, phrasal verbs, and casual language appropriate to the situation.
3. When the user writes something grammatically correct but unnatural, provide a correction in this exact format:
   [CORRECTION: original="what user said" corrected="native alternative" explanation="简短中文解释"]
   Then continue the conversation naturally.
4. Keep your responses concise (2-4 sentences typically). This is a conversation, not a lecture.
5. Occasionally introduce useful expressions or idioms that fit the context naturally.
6. If the user seems stuck, offer a hint or rephrase your question more simply.
7. Respond ONLY in English (except for explanations in corrections which should be in Chinese).
8. Do NOT over-correct. Only correct things that sound unnatural to a native speaker.

Current scenario: ${scenario}
Sub-scenario: ${subScenario}`;

const TRANSLATE_SYSTEM_PROMPT = `You are an expert Chinese-English translator who specializes in idiomatic, natural translations — not literal word-for-word translations.

Given input text, provide THREE translation variants:
1. formal: Professional/written register
2. casual: Everyday spoken English that a native speaker would actually use
3. slang: Very informal, trendy, or colloquial version (if applicable; if no meaningful slang exists, make it extra casual/fun)

Also provide:
- A brief note (in Chinese) explaining key differences between the variants
- Any cultural context that affects the translation

You MUST respond in this exact JSON format and nothing else:
{
  "formal": "...",
  "casual": "...",
  "slang": "...",
  "note": "...",
  "cultural_context": "..."
}`;

const SUMMARIZE_SYSTEM_PROMPT = `Review this English conversation practice session and provide a learning summary.

Extract:
1. key_expressions: 5-8 useful native English expressions that appeared in this conversation, each with "en" (English expression), "zh" (Chinese meaning), and "example" (example usage)
2. corrections: List of corrections made to the user's English, each with "original", "corrected", and "explanation" (in Chinese)
3. areas_to_improve: 2-3 specific areas the user should focus on (in Chinese)
4. encouragement: A brief encouraging note about what the user did well (in Chinese)

You MUST respond in valid JSON format with these four fields and nothing else.`;

// POST /api/chat — Streaming conversation
app.post('/api/chat', async (req, res) => {
  const { messages, scenario, subScenario } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Build OpenAI messages format: system + conversation
    const openaiMessages = [
      { role: 'system', content: CHAT_SYSTEM_PROMPT(scenario || 'General conversation', subScenario || 'Free talk') },
      ...(messages || [])
    ];

    const stream = await openai.chat.completions.create({
      model: MODEL,
      messages: openaiMessages,
      max_tokens: 1024,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

// POST /api/translate — Idiomatic translation
app.post('/api/translate', async (req, res) => {
  const { text, direction } = req.body;

  const directionHint = direction === 'zh2en'
    ? 'Translate the following Chinese text into English:'
    : 'Translate the following English text into Chinese (provide formal/casual/slang in Chinese):';

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: TRANSLATE_SYSTEM_PROMPT },
        { role: 'user', content: `${directionHint}\n\n${text}` }
      ],
      max_tokens: 1024,
    });

    const content = response.choices[0].message.content;
    try {
      const parsed = JSON.parse(content);
      res.json({ code: 0, data: parsed });
    } catch {
      res.json({ code: 0, data: { formal: content, casual: content, slang: content, note: '', cultural_context: '' } });
    }
  } catch (error) {
    console.error('Translate error:', error);
    res.status(500).json({ code: -1, error: error.message });
  }
});

// POST /api/summarize — Conversation summary
app.post('/api/summarize', async (req, res) => {
  const { messages, scenario } = req.body;

  const conversationText = messages
    .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
    .join('\n');

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SUMMARIZE_SYSTEM_PROMPT },
        { role: 'user', content: `Here is the conversation from a "${scenario}" practice session:\n\n${conversationText}\n\nPlease provide the learning summary in JSON format.` }
      ],
      max_tokens: 2048,
    });

    const content = response.choices[0].message.content;
    try {
      const parsed = JSON.parse(content);
      res.json({ code: 0, data: parsed });
    } catch {
      res.json({ code: 0, data: { key_expressions: [], corrections: [], areas_to_improve: [], encouragement: content } });
    }
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ code: -1, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`English Practice App running at http://localhost:${PORT}`);
});
