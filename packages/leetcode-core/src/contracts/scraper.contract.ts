export interface IUserScraper {
  fetch(username: string): Promise<any>;
}
