import { BaseProvider } from './base';

interface BoredActivity {
  activity: string;
  type: string;
  participants: number;
  price: number;
  timestamp: string;
}

export class BoredProvider extends BaseProvider {
  constructor() {
    super('https://bored-api.appbrewery.com/');
  }

  async getRandomActivity(): Promise<BoredActivity> {
    try {
      const response = await this.client.get('/random');
      
      return this.addTimestamp({
        activity: response.data.activity,
        type: response.data.type,
        participants: response.data.participants,
        price: response.data.price
      });
    } catch (error) {
      // Fallback to mock data if API is down
      const mockActivities = [
        { activity: "Learn a new programming language", type: "education", participants: 1, price: 0 },
        { activity: "Take a walk in the park", type: "recreational", participants: 1, price: 0 },
        { activity: "Read a book", type: "education", participants: 1, price: 0 },
        { activity: "Write in a journal", type: "relaxation", participants: 1, price: 0 },
        { activity: "Try cooking a new recipe", type: "cooking", participants: 1, price: 0.3 }
      ];
      
      const randomActivity = mockActivities[Math.floor(Math.random() * mockActivities.length)];
      
      return this.addTimestamp(randomActivity);
    }
  }
}