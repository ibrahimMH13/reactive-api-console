import { BaseProvider } from './base';

interface CatFactResponse {
  fact: string;
  length: number;
  timestamp: string;
}

export class CatFactsProvider extends BaseProvider {
  constructor() {
    super('https://catfact.ninja');
  }

  async getRandomFact(): Promise<CatFactResponse> {
    const response = await this.client.get('/fact');
    
    return this.addTimestamp({
      fact: response.data.fact,
      length: response.data.length
    });
  }
}