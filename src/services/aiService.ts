import { ChatMessage, ChatContext, UserProfile, Workout, DailyNutrition } from '../types';
import { storageService } from './storage';

// Hugging Face Inference API configuration
const HF_API_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large';
const HF_API_KEY = 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Replace with your free HF token

interface HuggingFaceResponse {
  generated_text: string;
}

class AIService {
  private conversationHistory: string[] = [];

  async generateResponse(userMessage: string): Promise<string> {
    try {
      // Get user context for AI
      const context = await this.buildUserContext();
      
      // Build the prompt with context
      const prompt = this.buildContextualPrompt(userMessage, context);
      
      // Try Hugging Face API first
      try {
        const response = await this.callHuggingFaceAPI(prompt);
        if (response) {
          return response;
        }
      } catch (error) {
        console.log('HF API failed, using fallback response');
      }
      
      // Fallback to simple contextual responses
      return this.generateFallbackResponse(userMessage, context);
      
    } catch (error) {
      console.error('AI Service error:', error);
      return "I'm having trouble processing your request right now. Please try again later.";
    }
  }

  private async buildUserContext(): Promise<ChatContext> {
    const userProfile = await storageService.getUserProfile();
    
    // Get recent workouts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentWorkouts = await storageService.getWorkoutsByDateRange(sevenDaysAgo, new Date());
    
    // Get recent nutrition (last 7 days)
    const allNutrition = await storageService.getAllNutrition();
    const recentNutrition = allNutrition.filter(n => {
      const nutritionDate = new Date(n.date);
      return nutritionDate >= sevenDaysAgo;
    });

    // Calculate current stats
    const allWorkouts = await storageService.getAllWorkouts();
    const totalWorkouts = allWorkouts.length;
    const averageWorkoutDuration = totalWorkouts > 0 
      ? allWorkouts.reduce((sum, w) => sum + w.duration, 0) / totalWorkouts 
      : 0;

    // Get strongest lifts
    const allProgress = await storageService.getAllProgress();
    const strongestLifts = allProgress
      .sort((a, b) => b.maxWeight - a.maxWeight)
      .slice(0, 5);

    return {
      recentWorkouts,
      recentNutrition,
      userGoals: userProfile?.goals || [],
      currentStats: {
        totalWorkouts,
        averageWorkoutDuration,
        strongestLifts
      }
    };
  }

  private buildContextualPrompt(userMessage: string, context: ChatContext): string {
    const { recentWorkouts, recentNutrition, userGoals, currentStats } = context;
    
    let prompt = `You are a knowledgeable fitness coach AI assistant. Here's the user's current fitness context:

GOALS: ${userGoals.join(', ')}
TOTAL WORKOUTS: ${currentStats.totalWorkouts}
AVERAGE WORKOUT DURATION: ${Math.round(currentStats.averageWorkoutDuration)} minutes

RECENT WORKOUTS (last 7 days): ${recentWorkouts.length} workouts
`;

    if (recentWorkouts.length > 0) {
      const lastWorkout = recentWorkouts[recentWorkouts.length - 1];
      prompt += `Last workout: ${lastWorkout.exercises.length} exercises, ${lastWorkout.duration} minutes\n`;
    }

    if (currentStats.strongestLifts.length > 0) {
      prompt += `Strongest lifts: ${currentStats.strongestLifts.map(lift => 
        `${lift.exerciseName}: ${lift.maxWeight}kg`
      ).join(', ')}\n`;
    }

    if (recentNutrition.length > 0) {
      const avgCalories = recentNutrition.reduce((sum, n) => sum + n.dailyTotals.calories, 0) / recentNutrition.length;
      prompt += `Average daily calories: ${Math.round(avgCalories)}\n`;
    }

    prompt += `\nUser question: ${userMessage}\n\nProvide helpful, encouraging fitness advice based on their data. Keep response under 150 words.`;

    return prompt;
  }

  private async callHuggingFaceAPI(prompt: string): Promise<string | null> {
    try {
      const response = await fetch(HF_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data[0] && data[0].generated_text) {
        // Extract only the new generated text (remove the input prompt)
        const generatedText = data[0].generated_text.replace(prompt, '').trim();
        return generatedText || "I understand your question. Let me help you with that!";
      }
      
      return null;
    } catch (error) {
      console.error('Hugging Face API error:', error);
      return null;
    }
  }

  private generateFallbackResponse(userMessage: string, context: ChatContext): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Workout-related responses
    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
      if (context.recentWorkouts.length === 0) {
        return "I see you haven't logged any workouts recently. Ready to start your fitness journey? I can help you plan your first workout based on your goals!";
      } else {
        const lastWorkout = context.recentWorkouts[context.recentWorkouts.length - 1];
        return `Great job on your recent workouts! Your last session had ${lastWorkout.exercises.length} exercises and lasted ${lastWorkout.duration} minutes. What would you like to focus on next?`;
      }
    }
    
    // Progress-related responses
    if (lowerMessage.includes('progress') || lowerMessage.includes('improvement')) {
      if (context.currentStats.totalWorkouts < 5) {
        return "You're just getting started! Keep logging your workouts and I'll be able to show you amazing progress insights soon.";
      } else {
        return `You've completed ${context.currentStats.totalWorkouts} workouts! Your consistency is paying off. Keep up the great work!`;
      }
    }
    
    // Nutrition-related responses
    if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || lowerMessage.includes('food')) {
      if (context.recentNutrition.length === 0) {
        return "Nutrition tracking is key to reaching your goals! Start logging your meals and I can help you optimize your diet for better results.";
      } else {
        return "I can see you're tracking your nutrition - that's awesome! Proper nutrition fuels your workouts and recovery. Need any specific nutrition advice?";
      }
    }
    
    // Motivation and general responses
    if (lowerMessage.includes('motivation') || lowerMessage.includes('help') || lowerMessage.includes('advice')) {
      const goals = context.userGoals.join(' and ');
      return `Remember, your goals are ${goals}. Every workout gets you closer! Stay consistent, trust the process, and celebrate small wins along the way.`;
    }
    
    // Default encouraging response
    return "I'm here to help you reach your fitness goals! Whether it's about workouts, nutrition, or staying motivated, just ask me anything.";
  }

  // Method to simulate a typing delay for better UX
  async generateResponseWithDelay(userMessage: string): Promise<string> {
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    return this.generateResponse(userMessage);
  }

  // Method to get conversation starters based on user data
  async getConversationStarters(): Promise<string[]> {
    const context = await this.buildUserContext();
    const starters = [];

    if (context.recentWorkouts.length === 0) {
      starters.push("What's your fitness goal?");
      starters.push("Want help planning your first workout?");
    } else {
      starters.push("How did your last workout feel?");
      starters.push("Ready to plan your next session?");
    }

    if (context.recentNutrition.length === 0) {
      starters.push("Need help with nutrition planning?");
    } else {
      starters.push("How's your nutrition going?");
    }

    starters.push("What's your biggest fitness challenge?");
    starters.push("Want some motivation for today?");

    return starters.slice(0, 3); // Return top 3 suggestions
  }
}

// Export a singleton instance
export const aiService = new AIService();

// Instructions for setting up Hugging Face API key
export const setupInstructions = `
🔧 SETUP INSTRUCTIONS:

To enable AI chat functionality:

1. Go to https://huggingface.co/settings/tokens
2. Create a free account if you don't have one
3. Create a new token (free tier available)
4. Replace 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' in aiService.ts with your token

The AI will work in fallback mode without the token, providing contextual responses based on your fitness data.
`; 