// src/lib/context-manager.ts

export interface UserContext {
    lastInteraction: Date;
    currentTopic?: string;
    previousTopics: string[];
    emergencyContacts: {
      primary: string;
      others: string[];
    };
    healthDevices: {
      type: string;
      status: 'connected' | 'disconnected';
      lastReading?: Date;
    }[];
    medications: {
      name: string;
      schedule: string[];
      lastTaken?: Date;
    }[];
    preferences: {
      language: string;
      notifications: boolean;
      accessibilitySettings: {
        fontSize: 'normal' | 'large' | 'extra-large';
        voiceSpeed: 'normal' | 'slow' | 'very-slow';
        highContrast: boolean;
      };
    };
  }
  
  export class ContextManager {
    private context: UserContext;
  
    constructor(userId: string) {
      // 初始化用户上下文
      this.context = {
        lastInteraction: new Date(),
        previousTopics: [],
        emergencyContacts: {
          primary: '',
          others: []
        },
        healthDevices: [],
        medications: [],
        preferences: {
          language: 'en',
          notifications: true,
          accessibilitySettings: {
            fontSize: 'normal',
            voiceSpeed: 'normal',
            highContrast: false
          }
        }
      };
    }
  
    public updateContext(topic: string) {
      this.context.lastInteraction = new Date();
      if (this.context.currentTopic) {
        this.context.previousTopics.push(this.context.currentTopic);
      }
      this.context.currentTopic = topic;
    }
  
    public getRelevantContext(topic: string): any {
      // 根据当前话题返回相关上下文
      switch (topic) {
        case 'emergency':
          return {
            contacts: this.context.emergencyContacts,
            lastEmergency: this.context.previousTopics.includes('emergency')
          };
        case 'health':
          return {
            devices: this.context.healthDevices,
            medications: this.context.medications
          };
        case 'preferences':
          return this.context.preferences;
        default:
          return {};
      }
    }
  
    public getSuggestions(): string[] {
      // 基于上下文提供建议
      const suggestions: string[] = [];
      const now = new Date();
      
      // 检查设备连接状态
      const disconnectedDevices = this.context.healthDevices
        .filter(device => device.status === 'disconnected');
      if (disconnectedDevices.length > 0) {
        suggestions.push('Some of your health devices are disconnected');
      }
  
      // 检查药物提醒
      const currentHour = now.getHours();
      this.context.medications.forEach(med => {
        if (med.schedule.includes(`${currentHour}:00`)) {
          suggestions.push(`Time to take ${med.name}`);
        }
      });
  
      return suggestions;
    }
  
    public updatePreferences(preferences: Partial<UserContext['preferences']>) {
      this.context.preferences = {
        ...this.context.preferences,
        ...preferences
      };
    }
  }