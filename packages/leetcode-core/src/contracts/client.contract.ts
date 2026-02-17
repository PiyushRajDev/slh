export interface IGraphQLClient {
  request<T>(
    query: string,
    variables: Record<string, unknown>
  ): Promise<T>;
}
