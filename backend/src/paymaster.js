import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const PAYMASTER_URL = "https://paymaster-testnet.nerochain.io";

export const getGasCoverage = async (playerAddress) => {
  const response = await axios.get(
    `${PAYMASTER_URL}/coverage-rules?address=${playerAddress}`,
    { headers: { Authorization: `Bearer ${process.env.PAYMASTER_API_KEY}` } }
  );
  return response.data.coverage;
};

export const sponsorTransaction = async (txData) => {
  const response = await axios.post(
    `${PAYMASTER_URL}/sponsor`,
    txData,
    { headers: { Authorization: `Bearer ${process.env.PAYMASTER_API_KEY}` } }
  );
  return response.data.sponsoredTx;
};