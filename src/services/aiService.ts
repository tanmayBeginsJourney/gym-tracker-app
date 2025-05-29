import { ChatMessage, ChatContext, UserProfile, Workout, DailyNutrition } from '../types';
import { storageService } from './storage';

// AI Configuration - Multiple Options
const AI_CONFIG = {
  // Option 1: Local Ollama (Recommended - Free & Private)
  OLLAMA_URL: 'http://localhost:11434/api/generate',
  OLLAMA_MODEL: 'qwen2.5:14b', // or 'deepseek-r1:8b', 'llama3.2:8b'
  
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
      // Build comprehensive context
      const context = await this.buildPersonalizedContext();
      
      // Try AI providers in priority order
      for (const provider of AI_CONFIG.PROVIDER_PRIORITY) {
        try {
          const response = await this.callAIProvider(provider, userMessage, context);
          if (response) {
            console.log(`✅ AI response from ${provider}`);
            return response;
          }
        } catch (error) {
          console.log(`❌ ${provider} failed:`, error);
          continue;
        }
      }
      
      // Ultimate fallback
      return this.generatePersonalizedFallback(userMessage, context);
      
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
      userProfile, // Include full profile for personalization
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

  private generatePersonalizedFallback(userMessage: string, context: ChatContext): string {
    const { userProfile, recentWorkouts, dayOfWeek } = context;
    const lowerMessage = userMessage.toLowerCase();
    
    // Day-specific workout suggestions
    if (lowerMessage.includes('what should i do') || lowerMessage.includes('workout today')) {
      const suggestions = [
        `Happy ${dayOfWeek}! `,
        userProfile?.personalDetails?.weakBodyParts.length ? 
          `Since your focus areas are ${userProfile.personalDetails.weakBodyParts.join(' and ')}, ` : '',
        recentWorkouts.length === 0 ? 
          "let's start with a full-body beginner routine." :
          this.getSuggestedWorkoutType(dayOfWeek, recentWorkouts)
      ];
      
      return suggestions.join('');
    }
    
    // Progress and motivation
    if (lowerMessage.includes('progress') || lowerMessage.includes('how am i doing')) {
      if (context.currentStats.totalWorkouts < 3) {
        return "You're just getting started - every workout is building your foundation! Focus on consistency first, results will follow. 💪";
      } else {
        return `Great progress! You've completed ${context.currentStats.totalWorkouts} workouts. ${recentWorkouts.length > 0 ? 'Your consistency is paying off!' : 'Time to get back in there!'} Keep pushing towards your goals! 🔥`;
      }
    }
    
    // Specific goals support
    if (userProfile?.personalDetails?.specificGoals.length) {
      const goals = userProfile.personalDetails.specificGoals.join(', ');
      return `Remember your goals: ${goals}. Every workout gets you closer! What specific area would you like to focus on today?`;
    }
    
    return "I'm here to help you crush your fitness goals! Tell me what you want to work on and I'll guide you through it. 💪";
  }

  private getSuggestedWorkoutType(dayOfWeek: string, recentWorkouts: Workout[]): string {
    // Analyze recent workouts to suggest what to do next
    if (recentWorkouts.length === 0) return "How about starting with a full-body workout?";
    
    const lastWorkout = recentWorkouts[recentWorkouts.length - 1];
    const daysSince = Math.floor((Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince >= 2) {
      return "You've had some rest - perfect time for a strong session! What body part are you feeling motivated to train?";
    } else if (daysSince === 1) {
      return "Since yesterday's workout, how about focusing on a different muscle group today?";
    } else {
      return "Back for more already? Love the dedication! Maybe some light cardio or mobility work?";
    }
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