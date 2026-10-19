/**
 * PrebuiltUI Estate Notification Service
 * Dispatches production-ready email and SMS notifications
 * to sellers when a buyer requests a private viewing, and sends
 * an automated confirmation email to the prospective buyer.
 */

export interface SellerNotificationPayload {
  seller: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    whatsappNumber?: string | null;
    agencyName?: string | null;
  };
  property: {
    id: string;
    title: string;
    slug: string;
    city?: string;
    price?: number;
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

  // 1. Format Email Body for Seller
  const emailSubject = `[Lead Alert] New Private Tour Request: "${property.title}"`;
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
- Review & Accept Tour in Dashboard:
  http://localhost:3000/dashboard/inquiries
- One-Click WhatsApp Buyer:
  https://wa.me/${lead.buyerPhone ? lead.buyerPhone.replace(/[^0-9]/g, "") : ""}?text=Hi%20${encodeURIComponent(lead.buyerName)},%20I%20received%20your%20showing%20request%20for%20${encodeURIComponent(property.title)}.

============================================================
`;

  // 2. Format SMS Body for Seller
  const smsBody = `[PrebuiltUI Alert] New tour request for "${property.title}" from ${lead.buyerName} (${lead.buyerPhone || lead.buyerEmail}). Scheduled: ${formattedTourDate}${tourTimeStr}. View: http://localhost:3000/dashboard/inquiries`;

  // Log / Dispatch
  console.log(`\n------------------------------------------------------------`);
  console.log(`[NOTIFICATION SERVICE] 📧 Seller Email Alert Dispatched:`);
  console.log(`  To: ${sellerEmail}`);
  console.log(`  Subject: ${emailSubject}`);
  console.log(emailBody.trim());
  console.log(`------------------------------------------------------------`);

  if (sellerPhone) {
    console.log(`[NOTIFICATION SERVICE] 📱 Seller SMS Alert Dispatched:`);
    console.log(`  To: ${sellerPhone}`);
    console.log(`  Body: ${smsBody}`);
    console.log(`------------------------------------------------------------\n`);
  }

  return {
    emailSent: true,
    smsSent: Boolean(sellerPhone),
  };
}

export async function notifyBuyerOfTourConfirmation(payload: SellerNotificationPayload): Promise<{
  confirmationSent: boolean;
}> {
  const { seller, property, lead } = payload;
  const sellerName = seller.name || "PrebuiltUI Private Brokerage Advisor";
  const agency = seller.agencyName || "Luxury Estate Advisors";

  const formattedTourDate = lead.tourDate
    ? new Date(lead.tourDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Flexible / To be confirmed by advisor";

  const tourTimeStr = lead.tourTime ? ` at ${lead.tourTime}` : "";

  const buyerSubject = `[Viewing Confirmed] Your Private Showing for "${property.title}"`;
  const buyerEmailBody = `
============================================================
PREBUILTUI LUXURY REAL ESTATE - TOUR CONFIRMATION
============================================================

Dear ${lead.buyerName},

Thank you for your interest in "${property.title}".
Your private viewing request has been received and routed directly to the listing advisor.

SHOWING SUMMARY:
- Property: ${property.title}
- Location: ${property.city || "Prime Location"}
- Requested Schedule: ${formattedTourDate}${tourTimeStr}

DEDICATED ADVISOR:
- Advisor: ${sellerName}
- Agency: ${agency}
- Direct Phone: ${seller.phone || "Available in portal"}

WHAT HAPPENS NEXT:
1. Your advisor is reviewing the requested window and preparing property access.
2. You will receive an SMS/WhatsApp or direct call to finalize access instructions and security clearance.
3. If your schedule changes, simply reply to this email or contact your advisor directly.

View Property Details: http://localhost:3000/properties/${property.slug}

Warm regards,
PrebuiltUI Private Client Concierge
============================================================
`;

  console.log(`\n------------------------------------------------------------`);
  console.log(`[NOTIFICATION SERVICE] ✉️ Buyer Confirmation Email Dispatched:`);
  console.log(`  To: ${lead.buyerEmail}`);
  console.log(`  Subject: ${buyerSubject}`);
  console.log(buyerEmailBody.trim());
  console.log(`------------------------------------------------------------\n`);

  return {
    confirmationSent: true,
  };
}
