import { WeatherProvider } from './weatherProvider';
import { GitHubProvider } from './githubProvider';
import { CatFactsProvider } from './catFactsProvider';
import { ChuckNorrisProvider } from './chuckNorrisProvider';
import { BoredProvider } from './boredProvider';

export class ProviderService {
  public weather: WeatherProvider;
  public github: GitHubProvider;
  public catFacts: CatFactsProvider;
  public chuckNorris: ChuckNorrisProvider;
  public bored: BoredProvider;

  constructor() {
    this.weather = new WeatherProvider();
    this.github = new GitHubProvider();
    this.catFacts = new CatFactsProvider();
    this.chuckNorris = new ChuckNorrisProvider();
    this.bored = new BoredProvider();
  }

  // Convenience methods for backward compatibility
  async getWeather(city: string) {
    return this.weather.getWeather(city);
  }

  async getCatFact() {
    return this.catFacts.getRandomFact();
  }

  async searchGitHubUsers(query: string) {
    return this.github.searchUsers(query);
  }

  async getChuckNorrisJoke(search?: string) {
    return search 
      ? this.chuckNorris.searchJokes(search)
      : this.chuckNorris.getRandomJoke();
  }

  async getBoredActivity() {
    return this.bored.getRandomActivity();
  }
}

export const providerService = new ProviderService();

