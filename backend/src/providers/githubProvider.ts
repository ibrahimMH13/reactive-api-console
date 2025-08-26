import { BaseProvider } from './base';

interface GitHubUser {
  login: string;
  name: string;
  avatar: string;
  followers: number;
  repos: number;
  url: string;
  timestamp: string;
}

export class GitHubProvider extends BaseProvider {
  constructor() {
    super('https://api.github.com');
  }

  async searchUsers(query: string, limit: number = 5): Promise<GitHubUser[]> {
    if (!query.trim()) {
      throw new Error('Search query cannot be empty');
    }

    const response = await this.client.get('/search/users', {
      params: {
        q: query,
        per_page: limit
      }
    });
    
    // Fetch detailed user info for each user found in search
    const users = await Promise.all(
      response.data.items.slice(0, limit).map(async (user: any) => {
        try {
          // Get detailed user info
          const detailResponse = await this.client.get(`/users/${user.login}`);
          const detailData = detailResponse.data;
          
          return this.addTimestamp({
            login: user.login,
            name: detailData.name || user.login,
            avatar: user.avatar_url,
            followers: detailData.followers || 0,
            repos: detailData.public_repos || 0,
            url: user.html_url
          });
        } catch (error) {
          // Fallback to basic search data if detailed fetch fails
          console.warn(`Failed to get detailed info for ${user.login}:`, error);
          return this.addTimestamp({
            login: user.login,
            name: user.login,
            avatar: user.avatar_url,
            followers: 0,
            repos: 0,
            url: user.html_url
          });
        }
      })
    );

    return users;
  }
}