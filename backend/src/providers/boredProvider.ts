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
    super('https://www.boredapi.com/api');
  }

  async getRandomActivity(): Promise<BoredActivity> {
    const response = await this.client.get('/activity/');
    
    return this.addTimestamp({
      activity: response.data.activity,
      type: response.data.type,
      participants: response.data.participants,
      price: response.data.price
    });
  }
}