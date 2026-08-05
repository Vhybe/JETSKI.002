const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const apiKeyInput = document.getElementById('apiKey');
const saveKeyButton = document.getElementById('saveKey');
const clearChatButton = document.getElementById('clearChat');
const aiForm = document.getElementById('aiForm');
const userPrompt = document.getElementById('userPrompt');
const aiChat = document.getElementById('aiChat');
const aiStatus = document.getElementById('aiStatus');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}

const storageKey = 'jetskiOpenAIApiKey';

function setStatus(message, isError = false) {
  aiStatus.textContent = message;
  aiStatus.style.color = isError ? '#ffb3b3' : '';
}

function addMessage(content, role) {
  const message = document.createElement('div');
  message.className = `ai-message ${role}`;
  message.textContent = content;
  aiChat.appendChild(message);
  aiChat.scrollTop = aiChat.scrollHeight;
}

function saveApiKey() {
  const value = apiKeyInput.value.trim();
  if (!value) {
    setStatus('Enter a valid API key first.', true);
    return;
  }
  localStorage.setItem(storageKey, value);
  setStatus('API key saved locally. You can now send questions.');
}

function loadApiKey() {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    apiKeyInput.value = saved;
    setStatus('API key loaded from browser storage. Ready to chat.');
  }
}

async function sendMessage(prompt) {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    setStatus('Please enter your OpenAI API key to use the assistant.', true);
    return;
  }

  addMessage(prompt, 'user');
  addMessage('Thinking...', 'assistant');
  setStatus('Sending request to OpenAI...');

  const assistantMessage = aiChat.querySelector('.assistant:last-child');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant for a small website called JETSKI.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 512,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || 'Request failed. Check your API key and network.';
      assistantMessage.textContent = errorMessage;
      setStatus('OpenAI request failed.', true);
      return;
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'No reply returned from the API.';
    assistantMessage.textContent = reply;
    setStatus('Response received. Ask another question or clear the chat.');
  } catch (error) {
    assistantMessage.textContent = 'Unable to reach OpenAI. Check your internet connection.';
    setStatus('Network error while sending the request.', true);
  }
}

function clearChat() {
  aiChat.innerHTML = '';
  setStatus('Chat cleared. Enter a prompt to begin.');
}

saveKeyButton?.addEventListener('click', saveApiKey);
clearChatButton?.addEventListener('click', clearChat);

aiForm?.addEventListener('submit', event => {
  event.preventDefault();
  const prompt = userPrompt.value.trim();
  if (!prompt) return;
  userPrompt.value = '';
  sendMessage(prompt);
});

loadApiKey();

import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/next';
 
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
 
export default MyApp;