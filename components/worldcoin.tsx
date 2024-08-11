'use client';

import { redirect } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { VerificationLevel, IDKitWidget, useIDKit } from '@worldcoin/idkit';
import type { ISuccessResult } from '@worldcoin/idkit';
import { verify } from '@/app/actions/verify';
import axios from 'axios';
import {usePrivy} from '@privy-io/react-auth';

export default function WorldCoin() {

  const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`;
  const action = process.env.NEXT_PUBLIC_WLD_ACTION;

  const {ready, authenticated, login,user,logout} = usePrivy();

  if (!app_id) {
    throw new Error('app_id is not set in environment variables!');
  }
  if (!action) {
    throw new Error('action is not set in environment variables!');
  }

  const { setOpen } = useIDKit();

  const onSuccess = async(result: ISuccessResult) => {
    console.log('Success:', result);
    try {
    const response = await axios.post('http://localhost:4000/api/verify-wallet', {
        address: user?.wallet?.address,
    });
    if (response.status === 200) {
      console.log('Wallet verified successfully:', response.data.message);
    } else {
      console.log('Failed to verify wallet:', response.data.message);
    }
  } catch (error) {
    console.error('Error verifying wallet:', error);
  }
};

const handleProof = async (result: ISuccessResult) => {
    try {
        const data = await verify(result);

        if (data.success) {
            const response = await axios.post('http://localhost:4000/api/verify-wallet', {
                address: user?.wallet?.address,
            });
            console.log('Wallet verification response:', response.data);
        } else {
            throw new Error(`Verification failed: ${data.detail}`);
        }
    } catch (error) {
        console.error('Error verifying wallet:', error);
    }
};

  return (
    <div className="flex h-screen items-center justify-center bg-slate-300">
      <div className="w-96 rounded-md bg-white p-4 text-center">
        <IDKitWidget
          action={action}
          app_id={app_id}
          onSuccess={onSuccess}
          handleVerify={handleProof}
          verification_level={VerificationLevel.Device}
        />
        <button
          className="m-4 rounded-md border purple-500 border-purple-500 text-purple-500 px-3 py-2.5 text-sm font-semibold shadow-sm hover:bg-purple-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={() => setOpen(true)}
        >
            Verify with WorldCoin
        </button>
      </div>
    </div>
  );
}
