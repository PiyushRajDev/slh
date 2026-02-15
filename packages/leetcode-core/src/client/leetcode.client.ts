import { IGraphQLClient } from "../contracts/client.contract";

export class LeetCodeClient implements IGraphQLClient {
  private endpoint = "https://leetcode.com/graphql";

  async request<T>(
    query: string,
    variables: Record<string, unknown>
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });

      const json = await res.json();

      if (json.errors) {
        throw new Error(JSON.stringify(json.errors));
      }

      return json.data;
    } finally {
      clearTimeout(timeout);
    }
  }
}
