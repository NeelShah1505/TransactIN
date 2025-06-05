"use client";
import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://testnet-rpc.sign.global/api/graphql", // Replace with your actual GraphQL endpoint
  cache: new InMemoryCache(),
});

export default client;
