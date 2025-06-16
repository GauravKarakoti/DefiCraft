import { useEffect } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { useWeb3Modal } from '@web3modal/react';

// Extend Window interface to include our custom function
declare global {
  interface Window {
    connectWallet?: () => Promise<void>;
  }
}

export default function UnityGame() {
  const { open } = useWeb3Modal();
  
  // Initialize Unity context with proper hook
  const { unityProvider } = useUnityContext({
    loaderUrl: "build/build.loader.js",
    dataUrl: "build/build.data",
    frameworkUrl: "build/build.framework.js",
    codeUrl: "build/build.wasm",
  });

  useEffect(() => {
    // Add wallet connection handler to window
    window.connectWallet = async () => {
      await open();
    };

    // Cleanup function
    return () => {
      if (window.connectWallet) {
        delete window.connectWallet;
      }
    };
  }, [open]);

  return (
    <div className="game-container">
      <Unity unityProvider={unityProvider} />
    </div>
  );
}