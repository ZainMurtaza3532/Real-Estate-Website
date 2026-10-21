import {
  PrismaClient,
  PropertyType,
  ListingType,
  ListingStatus,
  InquiryStatus,
  Role,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting production-grade database seed...");

  // 1. Clear existing records in foreign-key safe order
  await prisma.inquiry.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Hash passwords with bcrypt (cost 12)
  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  const sellerPasswordHash = await bcrypt.hash("seller123", 12);
  const buyerPasswordHash = await bcrypt.hash("buyer123", 12);

  console.log("👤 Creating Users (1 Super Admin, 2 Verified Sellers, 1 Buyer)...");

  // 1 Super Admin Account
  const admin = await prisma.user.create({
    data: {
      name: "Alexander Wright",
      email: "admin@havenstone.com",
      password: adminPasswordHash,
      role: Role.ADMIN,
      isVerified: true,
      phone: "+1 (555) 019-2831",
      whatsappNumber: "+15550192831",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    },
  });

  // Seller 1
  const sellerSarah = await prisma.user.create({
    data: {
      name: "Sarah Jenkins",
      email: "seller.sarah@havenstone.com",
      password: sellerPasswordHash,
      role: Role.SELLER,
      isVerified: true,
      phone: "+1 (555) 234-5678",
      whatsappNumber: "+15552345678",
      agencyName: "HavenStone Prime Estates",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    },
  });

  // Seller 2
  const sellerMarcus = await prisma.user.create({
    data: {
      name: "Marcus Vance",
      email: "seller.marcus@havenstone.com",
      password: sellerPasswordHash,
      role: Role.SELLER,
      isVerified: true,
      phone: "+1 (555) 876-5432",
      whatsappNumber: "+15558765432",
      agencyName: "Vance & Partners Global Real Estate",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    },
  });

  // Sample Buyer
  const buyer = await prisma.user.create({
    data: {
      name: "Eleanor Sterling",
      email: "buyer@havenstone.com",
      password: buyerPasswordHash,
      role: Role.BUYER,
      isVerified: true,
      phone: "+1 (555) 432-1098",
      whatsappNumber: "+15554321098",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    },
  });

  console.log("🏰 Seeding 6 Sample Verified Luxury Properties...");

  const propertiesData = [
    {
      title: "The Glass Horizon Villa",
      slug: "the-glass-horizon-villa-beverly-hills",
      description:
        "Perched above Beverly Hills, The Glass Horizon Villa is an architectural triumph featuring motorized floor-to-ceiling glass walls, a cantilevered infinity-edge pool overlooking downtown Los Angeles, private sommelier cellar, wellness spa, and an expansive motor court.",
      price: 18500000,
      currency: "USD",
      propertyType: PropertyType.VILLA,
      listingType: ListingType.FOR_SALE,
      listingStatus: ListingStatus.APPROVED,
      bedrooms: 6,
      bathrooms: 8,
      areaSqFt: 11200,
      garageSpaces: 4,
      yearBuilt: 2023,
      address: "14820 Skyline Crest Way",
      city: "Beverly Hills",
      state: "CA",
      zipCode: "90210",
      latitude: 34.0736,
      longitude: -118.4004,
      images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
      ],
      videoTourUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      amenities: [
        "Infinity Pool",
        "Smart Home Automation",
        "Wine Cellar",
        "Home Theater",
        "Spa & Sauna",
        "Private Helipad Access",
        "EV Charging Hub",
      ],
      featured: true,
      viewsCount: 1420,
      sellerId: sellerSarah.id,
    },
    {
      title: "Billionaire's Row Sky Penthouse",
      slug: "billionaires-row-sky-penthouse-manhattan",
      description:
        "Occupying the full 78th and 79th floors on Central Park South, this duplex penthouse commands 360-degree unobstructed vistas of Manhattan, Central Park, and the Hudson River. Boasts custom Calacatta marble, direct elevator vestibule, and 14-foot soaring ceilings.",
      price: 34000000,
      currency: "USD",
      propertyType: PropertyType.APARTMENT,
      listingType: ListingType.FOR_SALE,
      listingStatus: ListingStatus.APPROVED,
      bedrooms: 5,
      bathrooms: 6,
      areaSqFt: 8400,
      garageSpaces: 2,
      yearBuilt: 2022,
      address: "220 Central Park South, PH-78",
      city: "New York",
      state: "NY",
      zipCode: "10019",
      latitude: 40.7667,
      longitude: -73.9801,
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=85",
      ],
      videoTourUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      amenities: [
        "24/7 Doorman & Concierge",
        "Private Keyed Elevator",
        "Central Park Panoramic Views",
        "Valet Parking",
        "Fitness Pavilion",
        "Indoor Lap Pool",
      ],
      featured: true,
      viewsCount: 2850,
      sellerId: sellerMarcus.id,
    },
    {
      title: "Villa Bellissima Oceanfront Compound",
      slug: "villa-bellissima-oceanfront-compound-miami",
      description:
        "Direct Atlantic ocean frontage on Star Island with 120 feet of deepwater yacht dockage. Features lush Mediterranean grounds, private cabanas, summer kitchen, and seamless indoor-outdoor coastal living tailored for mega-yacht owners.",
      price: 24750000,
      currency: "USD",
      propertyType: PropertyType.VILLA,
      listingType: ListingType.FOR_SALE,
      listingStatus: ListingStatus.APPROVED,
      bedrooms: 7,
      bathrooms: 9,
      areaSqFt: 12800,
      garageSpaces: 6,
      yearBuilt: 2021,
      address: "42 Star Island Drive",
      city: "Miami Beach",
      state: "FL",
      zipCode: "33139",
      latitude: 25.7781,
      longitude: -80.1506,
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85",
      ],
      videoTourUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      amenities: [
        "Private 120ft Yacht Dock",
        "Resort Pool",
        "Gated Security Perimeter",
        "Outdoor Chef Kitchen",
        "Regulation Tennis Court",
        "Smart Ambient Lighting",
      ],
      featured: true,
      viewsCount: 980,
      sellerId: sellerSarah.id,
    },
    {
      title: "The Summit Commercial Tech Tower",
      slug: "the-summit-commercial-tech-tower-austin",
      description:
        "Prime Class-A commercial office tower located in downtown Austin. Features LEED Platinum sustainability certification, state-of-the-art keynote auditorium, high-capacity fiber backbone, and private executive boardroom with rooftop terrace.",
      price: 42000000,
      currency: "USD",
      propertyType: PropertyType.COMMERCIAL,
      listingType: ListingType.FOR_SALE,
      listingStatus: ListingStatus.APPROVED,
      bedrooms: 0,
      bathrooms: 12,
      areaSqFt: 45000,
      garageSpaces: 120,
      yearBuilt: 2024,
      address: "500 Congress Avenue",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      latitude: 30.2672,
      longitude: -97.7431,
      images: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=85",
      ],
      videoTourUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      amenities: [
        "LEED Platinum Certified",
        "High-Speed Destination Elevators",
        "Keynote Auditorium",
        "Rooftop Executive Deck",
        "120 EV Charging Bays",
        "24/7 Armed Security",
      ],
      featured: true,
      viewsCount: 1890,
      sellerId: sellerMarcus.id,
    },
    {
      title: "Aspen Crest Private Mountain Estate Plot",
      slug: "aspen-crest-private-mountain-estate-plot",
      description:
        "Unprecedented 14.5-acre alpine land parcel perched high on Red Mountain with shovel-ready approved architectural plans for a 15,000 sqft contemporary estate. Unrivaled 360-degree mountain privacy and deeded ski-in/ski-out rights.",
      price: 14500000,
      currency: "USD",
      propertyType: PropertyType.PLOT,
      listingType: ListingType.FOR_SALE,
      listingStatus: ListingStatus.APPROVED,
      bedrooms: 0,
      bathrooms: 0,
      areaSqFt: 631620,
      garageSpaces: 0,
      yearBuilt: null,
      address: "890 Red Mountain Vista",
      city: "Aspen",
      state: "CO",
      zipCode: "81611",
      latitude: 39.1911,
      longitude: -106.8175,
      images: [
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85",
      ],
      videoTourUrl: null,
      amenities: [
        "Shovel-Ready Engineered Plans",
        "Ski-in / Ski-out Access",
        "360-Degree Mountain Views",
        "Natural Spring Water Rights",
        "Private Gated Access Road",
      ],
      featured: false,
      viewsCount: 640,
      sellerId: sellerSarah.id,
    },
    {
      title: "The Pacific Coastline Architectural Estate",
      slug: "the-pacific-coastline-estate-malibu",
      description:
        "Private gated compound on Broad Beach with deeded direct beach stairway. Includes a detached two-bedroom guest pavilion, cantilevered oceanfront teak deck, commercial-grade open kitchen, and state-of-the-art acoustic cinema.",
      price: 21900000,
      currency: "USD",
      propertyType: PropertyType.HOUSE,
      listingType: ListingType.FOR_SALE,
      listingStatus: ListingStatus.APPROVED,
      bedrooms: 6,
      bathrooms: 7,
      areaSqFt: 9800,
      garageSpaces: 4,
      yearBuilt: 2022,
      address: "31200 Broad Beach Rd",
      city: "Malibu",
      state: "CA",
      zipCode: "90265",
      latitude: 34.0381,
      longitude: -118.8687,
      images: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85",
      ],
      videoTourUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      amenities: [
        "Direct Beach Access",
        "Detached Guest House",
        "Ocean View Deck",
        "Wine Tasting Room",
        "Acoustic Home Cinema",
        "Lush Tropical Gardens",
      ],
      featured: true,
      viewsCount: 3120,
      sellerId: sellerMarcus.id,
    },
  ];

  const createdProperties = [];
  for (const propertyData of propertiesData) {
    const prop = await prisma.property.create({
      data: propertyData,
    });
    createdProperties.push(prop);
  }

  console.log(`✅ Created ${createdProperties.length} verified luxury properties.`);

  // 3. Seed Favorites
  console.log("⭐ Creating Sample Buyer Favorites...");
  await prisma.favorite.create({
    data: {
      userId: buyer.id,
      propertyId: createdProperties[0].id, // Beverly Hills Villa
    },
  });

  await prisma.favorite.create({
    data: {
      userId: buyer.id,
      propertyId: createdProperties[1].id, // Manhattan Penthouse
    },
  });

  // 4. Seed Inquiries / Leads (Linking Property, Seller, and Buyer)
  console.log("📬 Creating Sample Inquiries & Marketplace Leads...");
  await prisma.inquiry.create({
    data: {
      propertyId: createdProperties[0].id,
      sellerId: sellerSarah.id,
      buyerId: buyer.id,
      buyerName: "Eleanor Sterling",
      buyerEmail: "buyer@havenstone.com",
      buyerPhone: "+1 (555) 432-1098",
      message:
        "I am looking to schedule a private walkthrough of The Glass Horizon Villa for next Tuesday. Is proof of funds or an NDA required prior to arrival?",
      tourDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      tourTime: "02:00 PM",
      status: InquiryStatus.NEW,
    },
  });

  await prisma.inquiry.create({
    data: {
      propertyId: createdProperties[1].id,
      sellerId: sellerMarcus.id,
      buyerId: buyer.id,
      buyerName: "Eleanor Sterling",
      buyerEmail: "buyer@havenstone.com",
      buyerPhone: "+1 (555) 432-1098",
      message:
        "Please provide the condominium board prospectus and private elevator maintenance schedule for the Central Park South penthouse.",
      tourDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      tourTime: "11:00 AM",
      status: InquiryStatus.SCHEDULED,
    },
  });

  await prisma.inquiry.create({
    data: {
      propertyId: createdProperties[3].id, // Commercial Tech Tower
      sellerId: sellerMarcus.id,
      buyerName: "Harrison Vance Capital Partners",
      buyerEmail: "investments@vancecapital.com",
      buyerPhone: "+1 (555) 789-0123",
      message:
        "Requesting current tenant rent-roll, triple-net lease terms, and cap rate models for the Summit Commercial Tech Tower.",
      status: InquiryStatus.CONTACTED,
    },
  });

  console.log("\n🎉 Database Seed Complete! Account Credentials:");
  console.log("===============================================================");
  console.log("👑 ADMIN:   admin@havenstone.com          | Password: admin123");
  console.log("💼 SELLER:  seller.sarah@havenstone.com   | Password: seller123");
  console.log("💼 SELLER:  seller.marcus@havenstone.com  | Password: seller123");
  console.log("👤 BUYER:   buyer@havenstone.com          | Password: buyer123");
  console.log("===============================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
