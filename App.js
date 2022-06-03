/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import type {Node} from 'react';
import React from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql,
} from '@apollo/client';
import {Colors} from 'react-native/Libraries/NewAppScreen';
const client = new ApolloClient({
  uri: 'https://graphql.anilist.co',
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          Page: {
            keyArgs: false,
            merge(existing, incoming) {
              return {
                ...incoming,
                media: [...(existing?.media || []), ...(incoming?.media || [])],
              };
            },
          },
        },
      },
    },
  }),
});

const QUERY = gql`
  query GetPage($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
      }
      media {
        id
      }
    }
  }
`;

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const {data, loading, refetch, fetchMore, networkStatus} = useQuery(QUERY, {
    variables: {
      page: 1,
      perPage: 10,
    },
  });

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text>{loading ? 'Loading...' : 'Not Loading'}</Text>
          <Text>
            {'Network status: '}
            {networkStatus}
          </Text>
        </View>
        <Button title={'Refetch'} onPress={() => refetch()} />
        <Button
          title={'FetchMore'}
          onPress={
            data?.Page?.pageInfo?.hasNextPage
              ? () =>
                  fetchMore({
                    variables: {
                      page: data?.Page?.pageInfo?.currentPage + 1,
                      perPage: 10,
                    },
                  })
              : undefined
          }
        />
        <View>
          {data?.Page?.media?.map(m => (
            <Text key={m.id}>{m.id}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Root = () => (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
export default Root;
