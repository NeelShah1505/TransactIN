import Header from "@/components/header/Header";
import Link from "next/link";
import gnABI from "@/contract/gn.json";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white text-gray-900 font-sans">
        {/* Hero Section */}
        <section className="text-center px-6 py-20 bg-gradient-to-b from-white to-purple-100">
          <div className="max-w-4xl mx-auto">
            <p className="mb-4">
              <span className="text-sm bg-blue-100 text-blue-700 px-4 py-1 rounded-full">
                Introducing TransactIN
              </span>
            </p>
            <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500">
              Double-Secure Your Crypto Transfers
            </h1>
            <p className="mt-6 text-lg text-gray-700">
              TransactIN is a two-step verification payment dApp using EIP-712 signatures to eliminate transfer mistakes and boost blockchain trust.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/send-request" className="customButton max-w-max" aria-label="Initiate Secure Transfer">
                Initiate Secure Transfer
              </Link>
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section className="px-6 py-16 bg-gradient-to-r from-purple-200 to-pink-200 rounded-xl mx-4 my-10">
          <p className="max-w-3xl mx-auto text-center text-lg text-gray-900">
            Say goodbye to anxiety over wrong addresses. With TransactIN, every transaction needs approval from both sender and recipient before execution—just like co-signing a digital contract.
          </p>
        </section>

        {/* Key Features */}
        <section className="px-6 py-16 bg-white">
          <h2 className="text-4xl font-bold text-center text-pink-600 mb-10">Key Features</h2>
          <div className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2 text-pink-700">1. Dual Authorization</h3>

              <p className="text-black">
                <strong>Two-Step Approval:</strong> Sender signs the intent, receiver confirms it—no transfers without mutual consent.
              </p>
              <p className="text-black">
                <strong>Secure by Design:</strong> Prevents accidental or malicious token sends.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2 text-pink-700">2. Gasless & Cross-Chain Transfers</h3>

              <p className="text-black">
                <strong>Flexible Gas Sponsorship:</strong> Anyone can pay the gas fees—even a third-party dApp.
              </p>
              <p className="text-black">
                <strong>Multi-Chain Ready:</strong> Seamlessly move assets across chains via Chainlink CCIP & Circle CCTP.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center px-6 py-20 bg-gradient-to-b from-pink-200 to-purple-200 mt-16 rounded-xl mx-4">
          <h2 className="text-4xl font-bold mb-4">Make Your Transfers Bulletproof</h2>
          <p className="text-lg mb-6">TransactIN adds a second layer of trust to your transactions—because in crypto, there’s no "undo."</p>
          <Link href="/send-request" className="customButton max-w-max" aria-label="Start Secured Transfer">
            Start Secured Transfer
          </Link>
        </section>
      </main>
    </>
  );
}