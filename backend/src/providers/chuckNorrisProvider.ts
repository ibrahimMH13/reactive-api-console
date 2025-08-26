import { BaseProvider } from './base';

interface ChuckNorrisJoke {
  joke: string;
  category: string;
  timestamp: string;
}

export class ChuckNorrisProvider extends BaseProvider {
  constructor() {
    super('https://api.chucknorris.io/jokes');
  }

  async getRandomJoke(): Promise<ChuckNorrisJoke> {
    const response = await this.client.get('/random');
    
    return this.addTimestamp({
      joke: response.data.value,
      category: response.data.categories?.[0] || 'general'
    });
  }

  async searchJokes(query: string): Promise<ChuckNorrisJoke[]> {
    const response = await this.client.get('/search', {
      params: { query }
    });

    if (!response.data.result?.length) {
      throw new Error(`No Chuck Norris jokes found for "${query}"`);
    }

    return response.data.result.slice(0, 5).map((joke: any) => this.addTimestamp({
      joke: joke.value,
      category: joke.categories?.[0] || 'general'
    }));
  }
}