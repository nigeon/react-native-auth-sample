import { AccountTypeEnum, OpenfortProvider } from "@openfort/react-native";
import Constants from "expo-constants";
import { Stack } from "expo-router";
export default function RootLayout() {

  return (
    <OpenfortProvider
      publishableKey={Constants.expoConfig?.extra?.openfortPublishableKey}
      walletConfig={{
        debug: false,
        accountType: AccountTypeEnum.EOA, // or EOA or DELEGATED 
        ethereumProviderPolicyId: undefined, // replace with your gas sponsorship policy
        shieldPublishableKey: Constants.expoConfig?.extra?.openfortShieldPublishableKey,
        // If you want to use AUTOMATIC embedded wallet recovery, an encryption session is required.
        getEncryptionSession: async () => {
          const res = await fetch('/api/protected-create-encryption-session', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          return (await res.json()).session;
        }
      }}
      verbose={true}
      supportedChains={[
        {
          id: 100,
          name: 'Gnosis',
          nativeCurrency: {
            name: 'Gnosis',
            symbol: 'XDAI',
            decimals: 18
          },
          rpcUrls: { default: { http: ['https://rpc.gnosis.gateway.fm'] } },
        },
      ]}
    >
      <Stack>
        <Stack.Screen name="index" />
      </Stack>
    </OpenfortProvider>
  );
}