import { IGraphQLClient } from "../contracts/client.contract";

import { profileQuery } from "../queries/profile.query";
import { contestQuery } from "../queries/contest.query";
import { contestHistoryQuery } from "../queries/contestHistory.query";
import { submissionsQuery } from "../queries/submissions.query";

import { fullProfileSchema } from "../validators/fullProfile.schema";
import { formatFullProfile } from "../formatters/fullProfile.formatter";

export class FullProfileScraper {

  constructor(private client: IGraphQLClient) {}

 async fetch(username: string) {
  const profile = await this.client.request<Record<string, unknown>>(profileQuery, { username });
  const contest = await this.client.request<Record<string, unknown>>(contestQuery, { username });
  const history = await this.client.request<Record<string, unknown>>(contestHistoryQuery, { username });
  const submissions = await this.client.request<Record<string, unknown>>(submissionsQuery, { username });

  const merged = {
    ...(profile ?? {}),
    ...(contest ?? {}),
    ...(history ?? {}),
    ...(submissions ?? {}),
  };

  const validated = fullProfileSchema.parse(merged);

  return formatFullProfile(validated);
}

 }

