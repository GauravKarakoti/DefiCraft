import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const PAYMASTER_URL = "https://paymaster-testnet.nerochain.io";

export const getGasCoverage = async (playerAddress) => {
  try { 
    const response = await axios.get(
      `${PAYMASTER_URL}/coverage-rules?address=${playerAddress}`,
      { 
        headers: { Authorization: `Bearer ${process.env.PAYMASTER_API_KEY}`,
        timeout: 5000
      } }
    );
    return response.data.coverage;
  } catch (error) {
    console.error('Paymaster error:', error);
    // Fallback coverage
    return { percentage: 100, level: 1 };
  } 
};

const coverageCache = new Map();
export const getCachedGasCoverage = async (playerAddress) => {
  if (coverageCache.has(playerAddress)) {
    return coverageCache.get(playerAddress);
  }
  const coverage = await getGasCoverage(playerAddress);
  coverageCache.set(playerAddress, coverage);
  setTimeout(() => coverageCache.delete(playerAddress), 60000); // 1 min cache
  return coverage;
};

export const sponsorTransaction = async (txData) => {
  const response = await axios.post(
    `${PAYMASTER_URL}/sponsor`,
    txData,
    { headers: { Authorization: `Bearer ${process.env.PAYMASTER_API_KEY}` } }
  );
  return response.data.sponsoredTx;
};