/**
 * PrebuiltUI Estate Notification Service
 * Dispatches simulated & production-ready email and SMS notifications
 * to sellers when a buyer requests a private viewing or submits an inquiry.
 */

export interface SellerNotificationPayload {
  seller: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    whatsappNumber?: string | null;
  };
  property: {
    id: string;
    title: string;
    slug: string;
    city?: string;
  };
  lead: {
    id: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone?: string | null;
    tourDate?: Date | null;
    tourTime?: string | null;
    message: string;
  };
}

export async function notifySellerOfNewInquiry(payload: SellerNotificationPayload): Promise<{
  emailSent: boolean;
  smsSent: boolean;
}> {
  const { seller, property, lead } = payload;
  const sellerEmail = seller.email || "seller@prebuiltui.com";
  const sellerPhone = seller.phone || seller.whatsappNumber || null;
  const sellerName = seller.name || "Luxury Property Advisor";

  const formattedTourDate = lead.tourDate
    ? new Date(lead.tourDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Flexible / To be coordinated";

  const tourTimeStr = lead.tourTime ? ` at ${lead.tourTime}` : "";

  // 1. Format Email Body
  const emailSubject = `[PrebuiltUI Lead Alert] New Private Tour Request: "${property.title}"`;
  const emailBody = `
============================================================
PREBUILTUI LUXURY REAL ESTATE - NEW LEAD NOTIFICATION
============================================================

Hello ${sellerName},

A prospective luxury buyer has just scheduled a private viewing for your residence:
Residence: "${property.title}" (${property.city || "Exclusive Collection"})

BUYER DETAILS:
- Name:  ${lead.buyerName}
- Email: ${lead.buyerEmail}
- Phone: ${lead.buyerPhone || "Not provided"}

VIEWING DETAILS:
- Requested Date: ${formattedTourDate}${tourTimeStr}

BUYER'S SPECIAL REQUEST / NOTE:
"${lead.message}"

QUICK ACTIONS:
- Review & Accept Tour in Agent Dashboard:
  http://localhost:3000/dashboard/inquiries
- One-Click WhatsApp Buyer:
  https://wa.me/${lead.buyerPhone ? lead.buyerPhone.replace(/[^0-9]/g, "") : ""}?text=Hi%20${encodeURIComponent(lead.buyerName)},%20I%20received%20your%20showing%20request%20for%20${encodeURIComponent(property.title)}.

============================================================
`;

  // 2. Format SMS Body
  const smsBody = `[PrebuiltUI Alert] New tour request for "${property.title}" from ${lead.buyerName} (${lead.buyerPhone || lead.buyerEmail}). Scheduled: ${formattedTourDate}${tourTimeStr}. View details: http://localhost:3000/dashboard/inquiries`;

  // 3. Execution / Simulation
  console.log(`\n------------------------------------------------------------`);
  console.log(`[NOTIFICATION SERVICE] 📧 Email Notification Triggered:`);
  console.log(`  To: ${sellerEmail}`);
  console.log(`  Subject: ${emailSubject}`);
  console.log(emailBody.trim());
  console.log(`------------------------------------------------------------`);

  if (sellerPhone) {
    console.log(`[NOTIFICATION SERVICE] 📱 SMS Notification Triggered:`);
    console.log(`  To: ${sellerPhone}`);
    console.log(`  Body: ${smsBody}`);
    console.log(`------------------------------------------------------------\n`);
  } else {
    console.log(`[NOTIFICATION SERVICE] ℹ️ Seller has no phone number on file for SMS dispatch.\n`);
  }

  return {
    emailSent: true,
    smsSent: Boolean(sellerPhone),
  };
}
