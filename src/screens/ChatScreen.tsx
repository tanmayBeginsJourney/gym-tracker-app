import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storage';
import SidebarNav from '../components/SidebarNav';
import { ChatMessage } from '../types';

const ChatScreen: React.FC = () => {
  console.log('🤖 ChatScreen - Component mounted');
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    console.log('🤖 ChatScreen - useEffect triggered, loading chat history...');
    loadChatHistory();
    initializeChat();
  }, []);

  const loadChatHistory = async () => {
    try {
      console.log('🤖 ChatScreen - Loading chat history from storage...');
      const history = await storageService.getChatHistory();
      console.log(`🤖 ChatScreen - Loaded ${history.length} messages from history`);
      setMessages(history);
    } catch (error) {
      console.error('❌ ChatScreen - Error loading chat history:', error);
    }
  };

  const initializeChat = async () => {
    const history = await storageService.getChatHistory();
    if (history.length === 0) {
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome-1',
        role: 'assistant',
        content: "Hey there! 💪 I'm your AI fitness coach. I can help you with workouts, nutrition, motivation, and track your progress. What would you like to know?",
        timestamp: new Date()
      };
      
      await storageService.saveChatMessage(welcomeMessage);
      setMessages([welcomeMessage]);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) {
      console.log('🤖 ChatScreen - Empty message, ignoring send');
      return;
    }

    console.log('🤖 ChatScreen - Sending message:', inputText.substring(0, 50) + '...');
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    // Save user message
    try {
      await storageService.saveChatMessage(userMessage);
      console.log('🤖 ChatScreen - User message saved to storage');
    } catch (error) {
      console.error('❌ ChatScreen - Error saving user message:', error);
    }

    try {
      console.log('🤖 ChatScreen - Requesting AI response...');
      const aiResponse = await aiService.generateResponseWithDelay(inputText.trim());
      console.log('🤖 ChatScreen - AI response received:', aiResponse.substring(0, 100) + '...');
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      await storageService.saveChatMessage(assistantMessage);
      console.log('🤖 ChatScreen - AI message saved to storage');
    } catch (error) {
      console.error('❌ ChatScreen - AI response error:', error);
      const errorMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. The AI service is temporarily unavailable. You can still track your workouts normally!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      await storageService.saveChatMessage(errorMessage);
      console.log('🤖 ChatScreen - Error message saved to storage');
    } finally {
      setIsLoading(false);
      console.log('🤖 ChatScreen - Message sending process completed');
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.role === 'user' ? styles.userMessage : styles.assistantMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.role === 'user' ? styles.userMessageText : styles.assistantMessageText
      ]}>
        {item.content}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SidebarNav currentRoute="Chat" />
      <View style={styles.content}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          ref={flatListRef}
        />
        
        {isLoading && (
          <View style={styles.loadingIndicator}>
            <Text style={styles.loadingText}>AI coach is thinking...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask your AI fitness coach..."
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  content: {
    flex: 1,
    paddingTop: 80,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3182ce',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
  },
  assistantMessageText: {
    color: '#1a365d',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  loadingIndicator: {
    padding: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#4a5568',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#3182ce',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e0',
  },
});

export default ChatScreen; 