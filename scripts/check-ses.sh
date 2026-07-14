#!/usr/bin/env bash
set -euo pipefail

EMAIL="${1:-saliyapathum711@gmail.com}"
REGION="${AWS_REGION:-us-east-1}"

echo "SES status for: $EMAIL (region: $REGION)"
echo

IDENTITY="$(aws sesv2 get-email-identity --email-identity "$EMAIL" --region "$REGION" 2>/dev/null || true)"
if [ -z "$IDENTITY" ]; then
  echo "Identity not found. Creating and sending verification email..."
  aws sesv2 create-email-identity --email-identity "$EMAIL" --region "$REGION" >/dev/null
  echo "Verification email sent to $EMAIL"
else
  echo "$IDENTITY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"Verification status: {d.get('VerificationStatus','unknown')}\"); print(f\"Can send: {d.get('VerifiedForSendingStatus', False)}\")"
fi

echo
ACCOUNT="$(aws sesv2 get-account --region "$REGION")"
echo "$ACCOUNT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"Production access: {d.get('ProductionAccessEnabled', False)}\"); print(f\"Sending enabled: {d.get('SendingEnabled', False)}\")"

echo
if ! echo "$ACCOUNT" | python3 -c "import sys,json; exit(0 if json.load(sys.stdin).get('ProductionAccessEnabled') else 1)"; then
  echo "NOTE: SES is in SANDBOX mode."
  echo "  - Sender must be verified"
  echo "  - Recipients must also be verified unless you request production access"
  echo "  - Request access: AWS Console → SES → Account dashboard → Request production access"
fi
