import axios from "axios";

const RZP_KEY    = process.env.RAZORPAY_KEY_ID     ?? "MOCK_KEY";
const RZP_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "MOCK_SECRET";
const RZP_ACCT   = process.env.RAZORPAY_ACCOUNT_NO ?? "MOCK_ACCT";
const IS_MOCK    = RZP_KEY === "MOCK_KEY";

export interface RZPPayoutResult {
  id:     string;
  status: string;
  utr?:   string;
  mock?:  boolean;
}

export async function initiateUPIPayout(params: {
  amount:           number;
  upiId:            string;
  claimId:          string;
  fundAccountId?:   string;
}): Promise<RZPPayoutResult> {
  if (IS_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return {
      id:     `rzp_mock_${Date.now()}`,
      status: "processing",
      utr:    `UTR${Math.floor(Math.random() * 1e10)}`,
      mock:   true,
    };
  }

  const auth = Buffer.from(`${RZP_KEY}:${RZP_SECRET}`).toString("base64");
  const res = await axios.post(
    "https://api.razorpay.com/v1/payouts",
    {
      account_number:  RZP_ACCT,
      fund_account_id: params.fundAccountId,
      amount:          params.amount * 100,
      currency:        "INR",
      mode:            "UPI",
      purpose:         "payout",
      narration:       `GigShield claim ${params.claimId}`,
    },
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return { id: res.data.id, status: res.data.status, utr: res.data.utr };
}
