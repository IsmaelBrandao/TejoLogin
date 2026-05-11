import { Stack } from "expo-router";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Head>
        <title>TEJOPAN</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=tejopan-2" />
      </Head>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F6F3EE" },
        }}
      />
    </>
  );
}
