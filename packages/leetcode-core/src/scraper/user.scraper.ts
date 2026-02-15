import { IUserScraper } from "../contracts/scraper.contract";
import { IGraphQLClient } from "../contracts/client.contract";
import { userProfileQuery } from "../queries/userProfile.query";
import { userSchema } from "../validators/user.schema";
import { formatUser } from "../formatters/user.formatter";

export class UserScraper implements IUserScraper {
    constructor(private client: IGraphQLClient) { }

    async fetch(username: string) {
        const raw = await this.client.request<any>(
            userProfileQuery,
            { username }
        );

        const validated = userSchema.parse(raw);

        if (!validated.matchedUser) {
            throw new Error("User not found");
        }

        return formatUser(validated.matchedUser);
    }

}
