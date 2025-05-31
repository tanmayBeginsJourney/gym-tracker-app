import { ChatMessage, ChatContext, UserProfile, Workout, DailyNutrition } from '../types';
import { storageService } from './storage';

// AI Configuration - Multiple Options
const AI_CONFIG = {
  // Option 1: Local Ollama (Recommended - Free & Private)
  OLLAMA_URL: 'http://localhost:11434/api/generate',
  OLLAMA_MODEL: 'qwen2.5:7b', // Perfect for RTX 4070 - fits entirely in 8GB VRAM
  
  // Option 2: OpenAI API (Paid but excellent)
  OPENAI_URL: 'https://api.openai.com/v1/chat/completions',
  OPENAI_KEY: 'sk-your-openai-key-here', // Replace with your OpenAI key
  OPENAI_MODEL: 'gpt-4o-mini', // Cost-effective and very capable
  
  // Option 3: Hugging Face (Current fallback)
  HF_URL: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
  HF_KEY: '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',
  
  // AI Provider Priority (will try in this order)
  PROVIDER_PRIORITY: ['ollama', 'openai', 'huggingface'] as const
};

type AIProvider = typeof AI_CONFIG.PROVIDER_PRIORITY[number];

class AIService {
  private conversationHistory: ChatMessage[] = [];

  async generateResponse(userMessage: string): Promise<string> {
    try {
      // Build comprehensive context with time awareness
      const context = await this.buildPersonalizedContext();
      
      // Add time-based context
      const timeContext = this.buildTimeContext();
      context.timeContext = timeContext;
      
      console.log('🤖 AI Context built:', {
        totalWorkouts: context.currentStats?.totalWorkouts,
        recentWorkouts: context.recentWorkouts?.length,
        userProfile: !!context.userProfile,
        hasGoals: context.userProfile?.goals?.length || 0
      });
      
      // Try AI providers in priority order
      for (const provider of AI_CONFIG.PROVIDER_PRIORITY) {
        try {
          const response = await this.callAIProvider(provider, userMessage, context);
          if (response && response.length > 50) { // Ensure we got a real response
            console.log(`✅ AI response from ${provider}`);
            return response;
          }
        } catch (error) {
          console.log(`❌ ${provider} failed:`, error);
          continue;
        }
      }
      
      // Enhanced fallback with full context
      console.log('🔄 Using enhanced fallback with context');
      return this.generateIntelligentFallback(userMessage, context);
      
    } catch (error) {
      console.error('AI Service error:', error);
      return "I'm having trouble right now, but I'm here to help with your fitness journey! 💪";
    }
  }

  private async callAIProvider(provider: AIProvider, userMessage: string, context: ChatContext): Promise<string | null> {
    const prompt = this.buildPersonalizedPrompt(userMessage, context);
    
    switch (provider) {
      case 'ollama':
        return this.callOllama(prompt);
      case 'openai':
        return this.callOpenAI(userMessage, context);
      case 'huggingface':
        return this.callHuggingFace(prompt);
      default:
        return null;
    }
  }

  private async callOllama(prompt: string): Promise<string | null> {
    try {
      const response = await fetch(AI_CONFIG.OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: AI_CONFIG.OLLAMA_MODEL,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 500
          }
        }),
      });

      if (!response.ok) throw new Error(`Ollama HTTP error: ${response.status}`);
      
      const data = await response.json();
      return data.response?.trim() || null;
    } catch (error) {
      throw new Error(`Ollama error: ${error}`);
    }
  }

  private async callOpenAI(userMessage: string, context: ChatContext): Promise<string | null> {
    try {
      const messages = [
        {
          role: 'system',
          content: this.buildOpenAISystemPrompt(context)
        },
        {
          role: 'user', 
          content: userMessage
        }
      ];

      const response = await fetch(AI_CONFIG.OPENAI_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.OPENAI_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: AI_CONFIG.OPENAI_MODEL,
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error(`OpenAI HTTP error: ${response.status}`);
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (error) {
      throw new Error(`OpenAI error: ${error}`);
    }
  }

  private async callHuggingFace(prompt: string): Promise<string | null> {
    try {
      const response = await fetch(AI_CONFIG.HF_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.HF_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 150,
            temperature: 0.7,
            do_sample: true,
          }
        }),
      });

      if (!response.ok) throw new Error(`HF HTTP error: ${response.status}`);
      
      const data = await response.json();
      if (data && data[0] && data[0].generated_text) {
        const generatedText = data[0].generated_text.replace(prompt, '').trim();
        return generatedText || null;
      }
      
      return null;
    } catch (error) {
      throw new Error(`HuggingFace error: ${error}`);
    }
  }

  private async buildPersonalizedContext(): Promise<ChatContext> {
    const userProfile = await storageService.getUserProfile();
    
    // Get recent workouts (last 14 days for better context)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const recentWorkouts = await storageService.getWorkoutsByDateRange(fourteenDaysAgo, new Date());
    
    // Get recent nutrition
    const allNutrition = await storageService.getAllNutrition();
    const recentNutrition = allNutrition.filter(n => {
      const nutritionDate = new Date(n.date);
      return nutritionDate >= fourteenDaysAgo;
    });

    // Calculate comprehensive stats
    const allWorkouts = await storageService.getAllWorkouts();
    const totalWorkouts = allWorkouts.length;
    const averageWorkoutDuration = totalWorkouts > 0 
      ? allWorkouts.reduce((sum, w) => sum + w.duration, 0) / totalWorkouts 
      : 0;

    // Get strongest lifts and progress trends
    const allProgress = await storageService.getAllProgress();
    const strongestLifts = allProgress
      .sort((a, b) => b.maxWeight - a.maxWeight)
      .slice(0, 10);

    return {
      recentWorkouts,
      recentNutrition,
      userGoals: userProfile?.goals || [],
      currentStats: {
        totalWorkouts,
        averageWorkoutDuration,
        strongestLifts
      },
      userProfile: userProfile || undefined, // Convert null to undefined
      workoutHistory: allWorkouts,
      dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      currentTime: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
      })
    };
  }

  private buildPersonalizedPrompt(userMessage: string, context: ChatContext): string {
    const { userProfile, recentWorkouts, currentStats, dayOfWeek } = context;
    
    let prompt = `You are an expert personal trainer and fitness coach. Today is ${dayOfWeek}.

USER PROFILE:`;
    
    if (userProfile) {
      prompt += `
Name: ${userProfile.name}
Goals: ${userProfile.goals.join(', ')}
Experience: ${userProfile.experienceLevel}`;

      if (userProfile.personalDetails) {
        const details = userProfile.personalDetails;
        prompt += `
Target Physique: ${details.targetPhysique}
Weak Points: ${details.weakBodyParts.join(', ')}
Workout Style: ${details.preferredWorkoutStyle}
Specific Goals: ${details.specificGoals.join(', ')}
Personal Challenges: ${details.personalChallenges.join(', ')}`;
      }
    }

    prompt += `

RECENT ACTIVITY:
- Total workouts completed: ${currentStats.totalWorkouts}
- Workouts in last 2 weeks: ${recentWorkouts.length}
- Average workout duration: ${Math.round(currentStats.averageWorkoutDuration)} minutes`;

    if (recentWorkouts.length > 0) {
      const lastWorkout = recentWorkouts[recentWorkouts.length - 1];
      const daysSinceLastWorkout = Math.floor(
        (Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      prompt += `
- Last workout: ${daysSinceLastWorkout} day(s) ago - ${lastWorkout.exercises.length} exercises`;
    }

    if (currentStats.strongestLifts.length > 0) {
      prompt += `
- Strongest lifts: ${currentStats.strongestLifts.slice(0, 3).map(lift => 
        `${lift.exerciseName} ${lift.maxWeight}kg`
      ).join(', ')}`;
    }

    prompt += `

User question: "${userMessage}"

Respond as a knowledgeable, motivating personal trainer who knows this person well. Be specific, encouraging, and reference their goals and progress. Keep responses under 200 words but be detailed and actionable.`;

    return prompt;
  }

  private buildOpenAISystemPrompt(context: ChatContext): string {
    const { userProfile, recentWorkouts, currentStats, dayOfWeek } = context;
    
    return `You are a highly knowledgeable personal trainer and fitness coach. Today is ${dayOfWeek}.

ABOUT YOUR CLIENT:
${userProfile ? `
- Name: ${userProfile.name}, Age: ${userProfile.age}, Experience: ${userProfile.experienceLevel}
- Goals: ${userProfile.goals.join(', ')}
- Body stats: ${userProfile.weight}kg, ${userProfile.height}cm
${userProfile.personalDetails ? `
- Target physique: ${userProfile.personalDetails.targetPhysique}
- Weak body parts to focus on: ${userProfile.personalDetails.weakBodyParts.join(', ')}
- Specific goals: ${userProfile.personalDetails.specificGoals.join(', ')}
- Workout style preference: ${userProfile.personalDetails.preferredWorkoutStyle}
- Personal challenges: ${userProfile.personalDetails.personalChallenges.join(', ')}
- Additional context: ${userProfile.personalDetails.additionalNotes}` : ''}` : 'New user - help them get started'}

CURRENT FITNESS STATUS:
- Total workouts: ${currentStats.totalWorkouts}
- Recent activity: ${recentWorkouts.length} workouts in last 2 weeks
- Average session: ${Math.round(currentStats.averageWorkoutDuration)} minutes
${recentWorkouts.length > 0 ? `- Last workout: ${Math.floor((Date.now() - new Date(recentWorkouts[recentWorkouts.length - 1].date).getTime()) / (1000 * 60 * 60 * 24))} days ago` : ''}

Your role is to provide personalized, actionable fitness advice. Remember their specific goals, weak points, and preferences. Be encouraging but realistic. Reference their progress and tailor recommendations to their experience level.`;
  }

  private generateIntelligentFallback(userMessage: string, context: ChatContext): string {
    const { userProfile, recentWorkouts, dayOfWeek, currentStats } = context;
    const lowerMessage = userMessage.toLowerCase();
    
    // Greetings and introduction
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      const greeting = context.timeContext?.timeOfDay === 'morning' ? 'Good morning' : 
                     context.timeContext?.timeOfDay === 'afternoon' ? 'Good afternoon' :
                     context.timeContext?.timeOfDay === 'evening' ? 'Good evening' : 'Hey there';
      
      let response = `${greeting}! 💪 `;
      
      if (currentStats.totalWorkouts === 0) {
        response += "Ready to start your fitness journey? I can help you plan your first workout!";
      } else if (recentWorkouts.length > 0) {
        const lastWorkout = recentWorkouts[recentWorkouts.length - 1];
        const daysSince = Math.floor((Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSince === 0) {
          response += "Great job on today's workout! How are you feeling?";
        } else if (daysSince === 1) {
          response += "How did yesterday's workout treat you? Ready for another session?";
        } else {
          response += `It's been ${daysSince} days since your last workout. Let's get back in there!`;
        }
      } else {
        response += `You've completed ${currentStats.totalWorkouts} workouts so far. What's on the agenda today?`;
      }
      
      return response;
    }
    
    // About me / What do you know about me
    if (lowerMessage.includes('what do you know about me') || lowerMessage.includes('about me')) {
      let response = "Here's what I know about your fitness journey:\n\n";
      
      if (userProfile) {
        response += `💪 Fitness Level: ${userProfile.experienceLevel}\n`;
        if (userProfile.goals?.length) {
          response += `🎯 Goals: ${userProfile.goals.join(', ')}\n`;
        }
        if (userProfile.weight && userProfile.height) {
          response += `📊 Stats: ${userProfile.weight}kg, ${userProfile.height}cm\n`;
        }
        if (userProfile.personalDetails?.weakBodyParts?.length) {
          response += `🎪 Focus Areas: ${userProfile.personalDetails.weakBodyParts.join(', ')}\n`;
        }
      }
      
      response += `🏋️ Workouts Completed: ${currentStats.totalWorkouts}\n`;
      
      if (recentWorkouts.length > 0) {
        const lastWorkout = recentWorkouts[recentWorkouts.length - 1];
        const daysSince = Math.floor((Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24));
        response += `📅 Last Workout: ${daysSince} day(s) ago (${lastWorkout.exercises?.length || 0} exercises)\n`;
      }
      
      if (currentStats.averageWorkoutDuration > 0) {
        response += `⏱️ Average Session: ${Math.round(currentStats.averageWorkoutDuration)} minutes\n`;
      }
      
      response += "\nWhat would you like to work on next?";
      return response;
    }
    
    // Progress questions
    if (lowerMessage.includes('progress') || lowerMessage.includes('how am i doing')) {
      if (currentStats.totalWorkouts === 0) {
        return "You're at the starting line - the most exciting place to be! Every expert was once a beginner. Ready to log your first workout? 🚀";
      } else if (currentStats.totalWorkouts < 5) {
        return `Excellent start! You've completed ${currentStats.totalWorkouts} workout${currentStats.totalWorkouts === 1 ? '' : 's'}. The hardest part is building the habit - you're doing great! Keep the momentum going! 💪`;
      } else {
        let response = `Amazing progress! You've completed ${currentStats.totalWorkouts} workouts. `;
        
        if (recentWorkouts.length >= 3) {
          response += "Your consistency is outstanding! ";
        } else if (recentWorkouts.length > 0) {
          response += "Let's work on consistency - aim for 3-4 workouts per week. ";
        }
        
        if (currentStats.averageWorkoutDuration > 0) {
          const avgDuration = Math.round(currentStats.averageWorkoutDuration);
          response += `Your sessions average ${avgDuration} minutes, which is ${avgDuration >= 45 ? 'perfect' : avgDuration >= 30 ? 'good' : 'a great start'}! `;
        }
        
        response += "Every workout is making you stronger! 🔥";
        return response;
      }
    }
    
    // Workout suggestions and what to do today
    if (lowerMessage.includes('what should i do') || lowerMessage.includes('workout today') || lowerMessage.includes('what to train')) {
      let response = `Great question! Today is ${dayOfWeek || 'a perfect day'} for training. `;
      
      if (userProfile?.personalDetails?.weakBodyParts?.length) {
        response += `Since you want to focus on ${userProfile.personalDetails.weakBodyParts.join(' and ')}, `;
      }
      
      if (recentWorkouts.length === 0) {
        response += "I'd recommend starting with a full-body routine to build your foundation. Focus on compound movements like squats, push-ups, and planks!";
      } else {
        const lastWorkout = recentWorkouts[recentWorkouts.length - 1];
        const daysSince = Math.floor((Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSince >= 2) {
          response += "you've had good recovery time. Perfect for a strong session! What muscle group are you excited to train?";
        } else if (daysSince === 1) {
          response += "how about targeting a different muscle group than yesterday? This keeps you fresh and balanced.";
        } else {
          response += "since you trained today, maybe some light stretching or mobility work would be perfect!";
        }
      }
      
      return response;
    }
    
    // Exercise form and technique
    if (lowerMessage.includes('how do i do') || lowerMessage.includes('form') || lowerMessage.includes('technique')) {
      return "Great question about form! Proper technique is crucial for both safety and results. For specific exercises, I'd recommend:\n\n1. Start with bodyweight or light weights\n2. Focus on slow, controlled movements\n3. Full range of motion\n4. Breathe properly (exhale on exertion)\n\nWhich exercise would you like tips on? 🎯";
    }
    
    // Motivation and encouragement
    if (lowerMessage.includes('motivated') || lowerMessage.includes('motivation') || lowerMessage.includes('tired') || lowerMessage.includes('hard')) {
      if (currentStats.totalWorkouts > 0) {
        return `I see you've already completed ${currentStats.totalWorkouts} workout${currentStats.totalWorkouts === 1 ? '' : 's'} - that proves you have what it takes! 💪 Every champion has felt tired or unmotivated at times. The difference is they show up anyway. Your future self will thank you for every rep you do today! 🔥`;
      } else {
        return "Starting is always the hardest part, but you're here asking questions - that's already progress! 🌟 Remember: you don't have to be great to get started, but you have to get started to be great. Your fitness journey begins with the next step you take! 💪";
      }
    }
    
    // Specific goals and advice
    if (userProfile?.personalDetails?.specificGoals?.length) {
      const goals = userProfile.personalDetails.specificGoals.join(', ');
      return `I remember your goals: ${goals}. Every workout gets you closer! ${this.getGoalSpecificAdvice(lowerMessage, userProfile.personalDetails.specificGoals)} What specific area would you like to focus on today?`;
    }
    
    // Fallback with context
    let contextualResponse = "I'm here to help you crush your fitness goals! ";
    
    if (currentStats.totalWorkouts > 0) {
      contextualResponse += `With ${currentStats.totalWorkouts} workout${currentStats.totalWorkouts === 1 ? '' : 's'} under your belt, you're building something great. `;
    }
    
    contextualResponse += "Tell me what you want to work on and I'll guide you through it! 💪";
    
    return contextualResponse;
  }

  private getGoalSpecificAdvice(message: string, goals: string[]): string {
    const lowerGoals = goals.map(g => g.toLowerCase());
    
    if (lowerGoals.some(g => g.includes('weight loss') || g.includes('lose weight'))) {
      return "For weight loss, combine strength training with cardio and focus on consistency.";
    }
    
    if (lowerGoals.some(g => g.includes('muscle') || g.includes('build') || g.includes('gain'))) {
      return "For muscle building, prioritize progressive overload and compound exercises.";
    }
    
    if (lowerGoals.some(g => g.includes('strength') || g.includes('strong'))) {
      return "For strength gains, focus on heavy compound movements with proper rest.";
    }
    
    return "Let's work systematically towards your goals.";
  }

  // Enhanced method with better UX
  async generateResponseWithDelay(userMessage: string): Promise<string> {
    // Shorter, more realistic delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    return this.generateResponse(userMessage);
  }

  // Get conversation starters based on current context
  async getPersonalizedStarters(): Promise<string[]> {
    const context = await this.buildPersonalizedContext();
    const { userProfile, recentWorkouts, dayOfWeek } = context;
    const starters = [];

    // Day-specific suggestions
    starters.push(`What should I focus on this ${dayOfWeek}?`);
    
    if (recentWorkouts.length === 0) {
      starters.push("I'm ready to start working out!");
      starters.push("What's a good beginner routine?");
    } else {
      starters.push("How's my progress looking?");
      starters.push("Any tips for today's session?");
    }

    // Goal-specific suggestions
    if (userProfile?.personalDetails?.weakBodyParts.length) {
      const weakPart = userProfile.personalDetails.weakBodyParts[0];
      starters.push(`Help me improve my ${weakPart}`);
    }

    return starters.slice(0, 3);
  }

  private buildTimeContext() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    let timeOfDay = 'morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else if (hour >= 21 || hour < 6) timeOfDay = 'night';
    
    return {
      currentTime: now.toISOString(),
      timeOfDay,
      dayOfWeek: dayNames[dayOfWeek],
      hour,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6
    };
  }

  private async getLastMessageTimeGap(): Promise<{ gapMinutes: number; gapHours: number; gapDays: number } | null> {
    try {
      const chatHistory = await storageService.getChatHistory();
      if (chatHistory.length === 0) return null;
      
      const lastMessage = chatHistory[chatHistory.length - 1];
      const now = new Date();
      const lastMessageTime = new Date(lastMessage.timestamp);
      
      const gapMs = now.getTime() - lastMessageTime.getTime();
      const gapMinutes = Math.floor(gapMs / (1000 * 60));
      const gapHours = Math.floor(gapMs / (1000 * 60 * 60));
      const gapDays = Math.floor(gapMs / (1000 * 60 * 60 * 24));
      
      return { gapMinutes, gapHours, gapDays };
    } catch (error) {
      console.error('Error calculating message gap:', error);
      return null;
    }
  }

  // Clear conversation history
  async clearConversationHistory(): Promise<void> {
    this.conversationHistory = [];
  }
}

// Export singleton instance
export const aiService = new AIService();

// Setup instructions for different AI providers
export const aiSetupInstructions = {
  ollama: `
🔧 OLLAMA SETUP (Recommended - Free & Private):

1. Install Ollama: https://ollama.ai/download
2. Run: ollama pull qwen2.5:14b
3. Start Ollama service
4. AI will automatically work locally!

Benefits: Free, private, excellent quality, no API limits
`,
  
  openai: `
🔧 OPENAI SETUP (Paid but excellent):

1. Get API key: https://platform.openai.com/api-keys  
2. Replace 'sk-your-openai-key-here' in aiService.ts
3. Costs ~$1-3/month for typical usage

Benefits: Same as ChatGPT app, excellent reasoning
`,
  
  current: `
🔧 CURRENT SETUP (HuggingFace - Basic but working):

Your HuggingFace token is configured. The AI will work but with limited personalization.
For the best experience, consider upgrading to Ollama (free) or OpenAI (paid).
`
}; 