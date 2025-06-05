import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrumSepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "RainbowKit demo",
  projectId: "4270c874e7dea4dadb7df2a6dc26d264",
  chains: [arbitrumSepolia],
  ssr: true,
});
