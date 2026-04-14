import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const gateways = [
  {
    code: "whatsapp_manual",
    name: "WhatsApp Manual Payment",
    displayName: "Pay via WhatsApp / Mobile Money",
    description: "Send payment via mobile money and confirm on WhatsApp. Instant verification by our team.",
    logo: "/icons/whatsapp.svg",
    category: "manual",
    supportedCountries: ["South Sudan", "Uganda", "Kenya", "Tanzania", "Rwanda", "Ethiopia", "International"],
    supportedCurrencies: ["SSP", "UGX", "KES", "TZS", "USD"],
    feePercent: 0,
    feeFixed: 0,
    isActive: true,
    isAvailable: true,
    environment: "live",
    displayOrder: 1,
    fields: [
      { fieldName: "whatsapp_number", fieldLabel: "WhatsApp Number", fieldType: "text", placeholder: "+211929385157", isRequired: true, sortOrder: 1, helpText: "WhatsApp number students will message", defaultValue: "+211929385157" },
      { fieldName: "momo_number", fieldLabel: "Mobile Money Number", fieldType: "text", placeholder: "+211929385157", isRequired: true, sortOrder: 2, helpText: "Mobile money number for receiving payments", defaultValue: "+211929385157" },
      { fieldName: "account_name", fieldLabel: "Account Name", fieldType: "text", placeholder: "John", isRequired: true, sortOrder: 3, helpText: "Name on the mobile money account", defaultValue: "John" },
      { fieldName: "payment_instructions", fieldLabel: "Payment Instructions", fieldType: "textarea", placeholder: "Send payment to the mobile money number above...", isRequired: false, sortOrder: 4, helpText: "Custom instructions shown to students", defaultValue: "1. Send payment to the mobile money number shown above\n2. Take a screenshot of the confirmation\n3. Send the screenshot on WhatsApp\n4. Wait for confirmation (usually within 30 minutes)" },
    ],
  },
  {
    code: "dpo",
    name: "DPO (Direct Pay Online)",
    displayName: "Pay with Card or Mobile Money",
    description: "Pay securely with Visa, Mastercard, M-Pesa, MTN, Airtel Money and more across Africa.",
    logo: "/icons/dpo.svg",
    category: "card_mobile",
    supportedCountries: ["South Sudan", "Kenya", "Uganda", "Tanzania", "Rwanda", "Ghana", "Nigeria", "South Africa", "Zambia", "Malawi", "Mozambique", "Botswana", "Zimbabwe", "Namibia", "Mauritius", "DRC", "Cameroon", "Senegal", "Ivory Coast", "Ethiopia"],
    supportedCurrencies: ["SSP", "KES", "UGX", "TZS", "USD"],
    feePercent: 2.5,
    feeFixed: 0,
    isActive: false,
    isAvailable: true,
    environment: "sandbox",
    displayOrder: 2,
    fields: [
      { fieldName: "company_token", fieldLabel: "Company Token", fieldType: "password", placeholder: "Your DPO company token", isRequired: true, sortOrder: 1, helpText: "Found in your DPO merchant dashboard" },
      { fieldName: "service_type", fieldLabel: "Service Type", fieldType: "text", placeholder: "e.g. 3854", isRequired: true, sortOrder: 2, helpText: "DPO service type number" },
      { fieldName: "environment", fieldLabel: "Environment", fieldType: "select", placeholder: "", isRequired: true, sortOrder: 3, helpText: "Sandbox for testing, Live for real payments", fieldOptions: "sandbox,live", defaultValue: "sandbox" },
    ],
  },
  {
    code: "flutterwave",
    name: "Flutterwave",
    displayName: "Pay with Flutterwave",
    description: "Pay with M-Pesa, MTN Mobile Money, Airtel Money, Visa, Mastercard across Africa.",
    logo: "/icons/flutterwave.svg",
    category: "card_mobile",
    supportedCountries: ["Kenya", "Uganda", "Tanzania", "Rwanda", "Ghana", "Nigeria", "South Africa"],
    supportedCurrencies: ["KES", "UGX", "TZS", "RWF", "USD"],
    feePercent: 1.4,
    feeFixed: 0,
    isActive: false,
    isAvailable: true,
    environment: "sandbox",
    displayOrder: 3,
    fields: [
      { fieldName: "public_key", fieldLabel: "Public Key", fieldType: "password", placeholder: "FLWPUBK-...", isRequired: true, sortOrder: 1, helpText: "Flutterwave public key" },
      { fieldName: "secret_key", fieldLabel: "Secret Key", fieldType: "password", placeholder: "FLWSECK-...", isRequired: true, sortOrder: 2, helpText: "Flutterwave secret key" },
      { fieldName: "encryption_key", fieldLabel: "Encryption Key", fieldType: "password", placeholder: "Your encryption key", isRequired: true, sortOrder: 3, helpText: "Found in your Flutterwave dashboard" },
      { fieldName: "environment", fieldLabel: "Environment", fieldType: "select", placeholder: "", isRequired: true, sortOrder: 4, helpText: "Sandbox for testing, Live for real payments", fieldOptions: "sandbox,live", defaultValue: "sandbox" },
    ],
  },
  {
    code: "mpesa",
    name: "M-Pesa Daraja (Safaricom)",
    displayName: "Pay with M-Pesa",
    description: "Pay directly from your M-Pesa via STK push. Kenya only.",
    logo: "/icons/mpesa.svg",
    category: "mobile_money",
    supportedCountries: ["Kenya"],
    supportedCurrencies: ["KES"],
    feePercent: 1,
    feeFixed: 0,
    isActive: false,
    isAvailable: true,
    environment: "sandbox",
    displayOrder: 4,
    fields: [
      { fieldName: "consumer_key", fieldLabel: "Consumer Key", fieldType: "password", placeholder: "Daraja consumer key", isRequired: true, sortOrder: 1, helpText: "From Safaricom Daraja portal" },
      { fieldName: "consumer_secret", fieldLabel: "Consumer Secret", fieldType: "password", placeholder: "Daraja consumer secret", isRequired: true, sortOrder: 2, helpText: "From Safaricom Daraja portal" },
      { fieldName: "business_shortcode", fieldLabel: "Business Shortcode", fieldType: "text", placeholder: "174379", isRequired: true, sortOrder: 3, helpText: "Your Lipa Na M-Pesa shortcode" },
      { fieldName: "passkey", fieldLabel: "Passkey", fieldType: "password", placeholder: "Lipa Na M-Pesa passkey", isRequired: true, sortOrder: 4, helpText: "From Safaricom Daraja portal" },
      { fieldName: "environment", fieldLabel: "Environment", fieldType: "select", placeholder: "", isRequired: true, sortOrder: 5, helpText: "Sandbox for testing, Live for real payments", fieldOptions: "sandbox,live", defaultValue: "sandbox" },
    ],
  },
  {
    code: "mtn_momo",
    name: "MTN Mobile Money",
    displayName: "Pay with MTN Mobile Money",
    description: "Pay directly from your MTN Mobile Money account.",
    logo: "/icons/mtn.svg",
    category: "mobile_money",
    supportedCountries: ["Uganda", "Rwanda", "Ghana", "Cameroon"],
    supportedCurrencies: ["UGX", "RWF", "GHS"],
    feePercent: 1.5,
    feeFixed: 0,
    isActive: false,
    isAvailable: true,
    environment: "sandbox",
    displayOrder: 5,
    fields: [
      { fieldName: "subscription_key", fieldLabel: "Subscription Key", fieldType: "password", placeholder: "Your MTN MoMo subscription key", isRequired: true, sortOrder: 1, helpText: "Primary or secondary subscription key" },
      { fieldName: "api_user_id", fieldLabel: "API User ID", fieldType: "password", placeholder: "API user UUID", isRequired: true, sortOrder: 2, helpText: "MTN MoMo API user ID" },
      { fieldName: "api_key", fieldLabel: "API Key", fieldType: "password", placeholder: "Your API key", isRequired: true, sortOrder: 3, helpText: "MTN MoMo API key" },
      { fieldName: "environment", fieldLabel: "Environment", fieldType: "select", placeholder: "", isRequired: true, sortOrder: 4, helpText: "Sandbox for testing, Live for real payments", fieldOptions: "sandbox,live", defaultValue: "sandbox" },
    ],
  },
  {
    code: "pesapal",
    name: "Pesapal",
    displayName: "Pay with Pesapal",
    description: "Pay with M-Pesa, Visa, Mastercard, Airtel Money via Pesapal secure checkout.",
    logo: "/icons/pesapal.svg",
    category: "card_mobile",
    supportedCountries: ["Kenya", "Uganda", "Tanzania", "Rwanda", "Malawi", "Zambia"],
    supportedCurrencies: ["KES", "UGX", "TZS", "USD"],
    feePercent: 3,
    feeFixed: 0,
    isActive: false,
    isAvailable: true,
    environment: "sandbox",
    displayOrder: 6,
    fields: [
      { fieldName: "consumer_key", fieldLabel: "Consumer Key", fieldType: "password", placeholder: "Pesapal consumer key", isRequired: true, sortOrder: 1, helpText: "From Pesapal merchant dashboard" },
      { fieldName: "consumer_secret", fieldLabel: "Consumer Secret", fieldType: "password", placeholder: "Pesapal consumer secret", isRequired: true, sortOrder: 2, helpText: "From Pesapal merchant dashboard" },
      { fieldName: "ipn_id", fieldLabel: "IPN ID", fieldType: "text", placeholder: "IPN registration ID (optional)", isRequired: false, sortOrder: 3, helpText: "Leave empty to auto-register" },
      { fieldName: "environment", fieldLabel: "Environment", fieldType: "select", placeholder: "", isRequired: true, sortOrder: 4, helpText: "Sandbox for testing, Live for real payments", fieldOptions: "sandbox,live", defaultValue: "sandbox" },
    ],
  },
  {
    code: "stripe",
    name: "Stripe",
    displayName: "Pay with Card (Stripe)",
    description: "Pay securely with Visa, Mastercard, American Express via Stripe.",
    logo: "/icons/stripe.svg",
    category: "international_card",
    supportedCountries: ["International"],
    supportedCurrencies: ["USD", "EUR", "GBP"],
    feePercent: 2.9,
    feeFixed: 0.30,
    isActive: false,
    isAvailable: true,
    environment: "sandbox",
    displayOrder: 7,
    fields: [
      { fieldName: "publishable_key", fieldLabel: "Publishable Key", fieldType: "password", placeholder: "pk_test_...", isRequired: true, sortOrder: 1, helpText: "Stripe publishable key" },
      { fieldName: "secret_key", fieldLabel: "Secret Key", fieldType: "password", placeholder: "sk_test_...", isRequired: true, sortOrder: 2, helpText: "Stripe secret key" },
      { fieldName: "webhook_secret", fieldLabel: "Webhook Secret", fieldType: "password", placeholder: "whsec_...", isRequired: true, sortOrder: 3, helpText: "Stripe webhook signing secret" },
      { fieldName: "environment", fieldLabel: "Environment", fieldType: "select", placeholder: "", isRequired: true, sortOrder: 4, helpText: "Sandbox for testing, Live for real payments", fieldOptions: "sandbox,live", defaultValue: "sandbox" },
    ],
  },
  {
    code: "paypal",
    name: "PayPal",
    displayName: "Pay with PayPal",
    description: "Pay securely using your PayPal account or debit/credit card.",
    logo: "/icons/paypal.svg",
    category: "international_wallet",
    supportedCountries: ["International"],
    supportedCurrencies: ["USD", "EUR", "GBP"],
    feePercent: 2.9,
    feeFixed: 0.30,
    isActive: false,
    isAvailable: true,
    environment: "sandbox",
    displayOrder: 8,
    fields: [
      { fieldName: "client_id", fieldLabel: "Client ID", fieldType: "password", placeholder: "PayPal client ID", isRequired: true, sortOrder: 1, helpText: "From PayPal developer dashboard" },
      { fieldName: "client_secret", fieldLabel: "Client Secret", fieldType: "password", placeholder: "PayPal client secret", isRequired: true, sortOrder: 2, helpText: "From PayPal developer dashboard" },
      { fieldName: "environment", fieldLabel: "Environment", fieldType: "select", placeholder: "", isRequired: true, sortOrder: 3, helpText: "Sandbox for testing, Live for real payments", fieldOptions: "sandbox,live", defaultValue: "sandbox" },
    ],
  },
  {
    code: "coinbase",
    name: "Coinbase Commerce",
    displayName: "Pay with Crypto",
    description: "Pay with Bitcoin, Ethereum, USDT, USDC and other cryptocurrencies.",
    logo: "/icons/coinbase.svg",
    category: "cryptocurrency",
    supportedCountries: ["International"],
    supportedCurrencies: ["BTC", "ETH", "USDT", "USDC", "USD"],
    feePercent: 1,
    feeFixed: 0,
    isActive: false,
    isAvailable: true,
    environment: "live",
    displayOrder: 9,
    fields: [
      { fieldName: "api_key", fieldLabel: "API Key", fieldType: "password", placeholder: "Coinbase Commerce API key", isRequired: true, sortOrder: 1, helpText: "From Coinbase Commerce dashboard" },
      { fieldName: "webhook_secret", fieldLabel: "Webhook Secret", fieldType: "password", placeholder: "Webhook shared secret", isRequired: true, sortOrder: 2, helpText: "For verifying webhook signatures" },
    ],
  },
  {
    code: "bank_transfer",
    name: "Bank Transfer",
    displayName: "Pay via Bank Transfer",
    description: "Transfer payment directly to our bank account and submit your reference.",
    logo: "/icons/bank.svg",
    category: "bank_transfer",
    supportedCountries: ["South Sudan", "Uganda", "Kenya", "Tanzania", "International"],
    supportedCurrencies: ["SSP", "UGX", "KES", "USD"],
    feePercent: 0,
    feeFixed: 0,
    isActive: false,
    isAvailable: true,
    environment: "live",
    displayOrder: 10,
    fields: [
      { fieldName: "bank_name", fieldLabel: "Bank Name", fieldType: "text", placeholder: "e.g. Equity Bank", isRequired: true, sortOrder: 1, helpText: "Name of the bank" },
      { fieldName: "account_name", fieldLabel: "Account Name", fieldType: "text", placeholder: "Account holder name", isRequired: true, sortOrder: 2, helpText: "Name on the bank account" },
      { fieldName: "account_number", fieldLabel: "Account Number", fieldType: "text", placeholder: "Bank account number", isRequired: true, sortOrder: 3, helpText: "Bank account number" },
      { fieldName: "branch", fieldLabel: "Branch", fieldType: "text", placeholder: "Branch name", isRequired: false, sortOrder: 4, helpText: "Bank branch" },
      { fieldName: "swift_code", fieldLabel: "SWIFT Code", fieldType: "text", placeholder: "SWIFT/BIC code", isRequired: false, sortOrder: 5, helpText: "For international transfers" },
      { fieldName: "additional_instructions", fieldLabel: "Additional Instructions", fieldType: "textarea", placeholder: "Any extra instructions for students...", isRequired: false, sortOrder: 6, helpText: "Shown to students on checkout" },
    ],
  },
];

async function main() {
  console.log("Seeding payment gateways...");

  for (const gw of gateways) {
    const { fields, ...gatewayData } = gw;

    await prisma.paymentGateway.upsert({
      where: { code: gw.code },
      update: {
        name: gatewayData.name,
        displayName: gatewayData.displayName,
        description: gatewayData.description,
        logo: gatewayData.logo,
        category: gatewayData.category,
        supportedCountries: gatewayData.supportedCountries,
        supportedCurrencies: gatewayData.supportedCurrencies,
        feePercent: gatewayData.feePercent,
        feeFixed: gatewayData.feeFixed,
        isAvailable: gatewayData.isAvailable,
        displayOrder: gatewayData.displayOrder,
      },
      create: {
        code: gatewayData.code,
        name: gatewayData.name,
        displayName: gatewayData.displayName,
        description: gatewayData.description,
        logo: gatewayData.logo,
        category: gatewayData.category,
        supportedCountries: gatewayData.supportedCountries,
        supportedCurrencies: gatewayData.supportedCurrencies,
        feePercent: gatewayData.feePercent,
        feeFixed: gatewayData.feeFixed,
        isActive: gatewayData.isActive,
        isAvailable: gatewayData.isAvailable,
        environment: gatewayData.environment,
        displayOrder: gatewayData.displayOrder,
      },
    });

    for (const field of fields) {
      await prisma.gatewayCredentialField.upsert({
        where: {
          gatewayCode_fieldName: {
            gatewayCode: gw.code,
            fieldName: field.fieldName,
          },
        },
        update: {
          fieldLabel: field.fieldLabel,
          fieldType: field.fieldType,
          placeholder: field.placeholder || null,
          isRequired: field.isRequired,
          sortOrder: field.sortOrder,
          helpText: field.helpText || null,
          fieldOptions: (field as Record<string, unknown>).fieldOptions as string || null,
          defaultValue: field.defaultValue || null,
        },
        create: {
          gatewayCode: gw.code,
          fieldName: field.fieldName,
          fieldLabel: field.fieldLabel,
          fieldType: field.fieldType,
          placeholder: field.placeholder || null,
          isRequired: field.isRequired,
          sortOrder: field.sortOrder,
          helpText: field.helpText || null,
          fieldOptions: (field as Record<string, unknown>).fieldOptions as string || null,
          defaultValue: field.defaultValue || null,
        },
      });
    }

    console.log(`  ✓ ${gw.name}`);
  }

  console.log("Done! Seeded", gateways.length, "gateways.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
