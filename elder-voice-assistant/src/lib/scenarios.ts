// src/lib/scenarios.ts

export interface ScenarioAction {
    label: string;
    response: string;
    nextActions?: ScenarioAction[];
    type?: 'primary' | 'secondary' | 'danger';
  }
  
  export interface Scenario {
    text: string;
    actions: ScenarioAction[];
    contextual?: boolean;
  }
  
  export const scenarios: Record<string, Scenario> = {
    emergency: {
      text: "I'll help you connect with emergency services or notify your family members. What kind of assistance do you need?",
      actions: [
        {
          label: "Connect with Emergency Services",
          type: "danger",
          response: "Connecting you to emergency services... Please stay on the line.",
          nextActions: [
            {
              label: "Call 911",
              response: "Dialing 911 emergency services...",
              type: "danger"
            },
            {
              label: "Medical Assistance",
              response: "Connecting to medical emergency services..."
            }
          ]
        },
        {
          label: "Notify Family Members",
          response: "Choose who you'd like to notify:",
          nextActions: [
            {
              label: "Contact Primary Caregiver",
              response: "Notifying your primary caregiver..."
            },
            {
              label: "Contact All Emergency Contacts",
              response: "Sending notifications to all emergency contacts..."
            }
          ]
        }
      ]
    },
    
    healthMonitoring: {
      text: "I can help you with health monitoring. What would you like to do?",
      actions: [
        {
          label: "Connect Health Device",
          response: "Let's set up your health monitoring device. Select the device type:",
          nextActions: [
            {
              label: "Blood Pressure Monitor",
              response: "To connect your blood pressure monitor:\n1. Turn on Bluetooth\n2. Press and hold the device's pair button\n3. Select the device when it appears"
            },
            {
              label: "Heart Rate Monitor",
              response: "Setting up your heart rate monitor..."
            },
            {
              label: "Glucose Monitor",
              response: "Connecting your glucose monitoring device..."
            }
          ]
        },
        {
          label: "View Health Reports",
          response: "Here are your recent health metrics:",
          nextActions: [
            {
              label: "Blood Pressure History",
              response: "Displaying blood pressure readings from the past week..."
            },
            {
              label: "Heart Rate Trends",
              response: "Showing your heart rate trends..."
            }
          ]
        },
        {
          label: "Set Health Reminders",
          response: "What kind of reminder would you like to set?",
          nextActions: [
            {
              label: "Medication Reminder",
              response: "Let's set up your medication schedule..."
            },
            {
              label: "Exercise Reminder",
              response: "Setting up exercise reminders..."
            }
          ]
        }
      ]
    },
  
    dailyAssistance: {
      text: "I can help you with daily tasks. What do you need assistance with?",
      actions: [
        {
          label: "Medication Management",
          response: "How can I help with your medications?",
          nextActions: [
            {
              label: "Take Medication Now",
              response: "Checking your medication schedule for current time..."
            },
            {
              label: "View Medication Schedule",
              response: "Here is your medication schedule for today..."
            },
            {
              label: "Refill Prescription",
              response: "I'll help you refill your prescription..."
            }
          ]
        },
        {
          label: "Appointments",
          response: "What would you like to do with your appointments?",
          nextActions: [
            {
              label: "View Today's Schedule",
              response: "Here are your appointments for today..."
            },
            {
              label: "Schedule New Appointment",
              response: "Let's schedule a new appointment..."
            }
          ]
        },
        {
          label: "Transportation",
          response: "Do you need transportation assistance?",
          nextActions: [
            {
              label: "Call Transportation Service",
              response: "Connecting to transportation service..."
            },
            {
              label: "Schedule Regular Pickup",
              response: "Let's set up your regular transportation schedule..."
            }
          ]
        }
      ]
    },
  
    socialConnections: {
      text: "I can help you stay connected with family and friends. What would you like to do?",
      actions: [
        {
          label: "Video Call Family",
          response: "Who would you like to video call?",
          nextActions: [
            {
              label: "Call Children",
              response: "Initiating video call with your children..."
            },
            {
              label: "Call Grandchildren",
              response: "Connecting video call with your grandchildren..."
            }
          ]
        },
        {
          label: "Send Message",
          response: "How would you like to send a message?",
          nextActions: [
            {
              label: "Voice Message",
              response: "Recording voice message..."
            },
            {
              label: "Text Message",
              response: "Creating text message..."
            }
          ]
        },
        {
          label: "Join Social Activities",
          response: "Here are some social activities available:",
          nextActions: [
            {
              label: "View Community Events",
              response: "Showing nearby community events..."
            },
            {
              label: "Join Online Group",
              response: "Connecting to online social groups..."
            }
          ]
        }
      ]
    }
  };