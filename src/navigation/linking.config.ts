import { LinkingOptions } from '@react-navigation/native';

/**
 * Deep link URL scheme: aspirantx://
 *
 * Supported URLs:
 *   aspirantx://battle/{battleId}        → LiveBattle screen
 *   aspirantx://battle-result/{battleId} → BattleResult screen
 *   aspirantx://post/{postId}            → PostDetail screen
 *   aspirantx://user/{userId}            → UserProfile screen
 */
export const linking: LinkingOptions<any> = {
  // aspirantx:// — custom scheme (always works, no verification needed)
  // https://aspirantx.com — App Links / Universal Links (requires hosted .well-known files)
  prefixes: ['aspirantx://', 'https://aspirantx.com'],
  config: {
    screens: {
      // Root: Auth screen is not deep-linkable
      Main: {
        screens: {
          LiveBattle: 'battle/:battleId',
          BattleResult: 'battle-result/:battleId',
          PostDetail: 'post/:postId',
          UserProfile: 'user/:userId',
        },
      },
    },
  },
};
