import { PrismaClient, PropertyType, ListingType, PropertyStatus, InquiryStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing records to ensure idempotent, clean seed
  await prisma.inquiry.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", 12);
  const agentPasswordHash = await bcrypt.hash("agent123", 12);
  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  const buyerPasswordHash = await bcrypt.hash("buyer123", 12);

  console.log("👤 Creating user accounts (Admin, Agents, Buyer)...");

  // 1. Admin
  const admin = await prisma.user.create({
    data: {
      name: "Alexander Wright",
      email: "admin@prebuiltui.com",
      password: adminPasswordHash,
      role: Role.ADMIN,
      phone: "+1 (555) 019-2831",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    },
  });

  // 2. Agents
  const agentSarah = await prisma.user.create({
    data: {
      name: "Sarah Jenkins",
      email: "sarah.jenkins@prebuiltui.com",
      password: agentPasswordHash,
      role: Role.AGENT,
      phone: "+1 (555) 234-5678",
      agencyName: "PrebuiltUI Private Brokerage",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    },
  });

  const agentMarcus = await prisma.user.create({
    data: {
      name: "Marcus Vance",
      email: "marcus.vance@prebuiltui.com",
      password: agentPasswordHash,
      role: Role.AGENT,
      phone: "+1 (555) 876-5432",
      agencyName: "Vance & Partners Luxury Real Estate",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    },
  });

  // 3. Buyer
  const buyer = await prisma.user.create({
    data: {
      name: "Eleanor Sterling",
      email: "buyer@prebuiltui.com",
      password: buyerPasswordHash,
      role: Role.BUYER,
      phone: "+1 (555) 432-1098",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    },
  });

  console.log("🏰 Seeding 10 luxury properties...");

  const propertiesData = [
    {
      title: "The Glass Horizon Villa",
      slug: "the-glass-horizon-villa-beverly-hills",
      description:
        "Perched above Beverly Hills, The Glass Horizon Villa is an architectural triumph with floor-to-ceiling motorized glass walls, an infinity edge pool overlooking downtown Los Angeles, wine cellar, wellness spa, and an expansive motor court.",
      price: 18500000,
      propertyType: PropertyType.VILLA,
      listingType: ListingType.FOR_SALE,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 6,
      bathrooms: 8,
      areaSqFt: 11200,
      garage: 4,
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
      amenities: [
        "Infinity Pool",
        "Smart Home Automation",
        "Wine Cellar",
        "Home Theater",
        "Spa & Sauna",
        "Private Helipad Access",
        "Electric Vehicle Charger",
      ],
      featured: true,
      agentId: agentSarah.id,
    },
    {
      title: "Billionaire's Row Sky Penthouse",
      slug: "billionaires-row-sky-penthouse-manhattan",
      description:
        "Occupying the entire 78th and 79th floors on Central Park South, this duplex penthouse commands 360-degree views of Manhattan, Central Park, and the Hudson River. Features custom Calacatta marble, private elevator landing, and 14-foot ceilings.",
      price: 34000000,
      propertyType: PropertyType.PENTHOUSE,
      listingType: ListingType.FOR_SALE,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 5,
      bathrooms: 6,
      areaSqFt: 8400,
      garage: 2,
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
      amenities: [
        "24/7 Doorman & Concierge",
        "Private Elevator",
        "Central Park Views",
        "Valet Parking",
        "Fitness Pavilion",
        "Indoor Lap Pool",
      ],
      featured: true,
      agentId: agentMarcus.id,
    },
    {
      title: "Villa Bellissima Oceanfront Retreat",
      slug: "villa-bellissima-oceanfront-retreat-miami",
      description:
        "Direct Atlantic ocean frontage on Star Island with 120 feet of deepwater yacht dockage. Features lush Mediterranean landscaping, private cabanas, outdoor kitchen, and seamless indoor-outdoor coastal living.",
      price: 24750000,
      propertyType: PropertyType.VILLA,
      listingType: ListingType.FOR_SALE,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 7,
      bathrooms: 9,
      areaSqFt: 12800,
      garage: 6,
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
      amenities: [
        "Private Yacht Dock",
        "Resort Pool",
        "Gated Security",
        "Outdoor Chef Kitchen",
        "Tennis Court",
        "Smart Lighting",
      ],
      featured: true,
      agentId: agentSarah.id,
    },
    {
      title: "The Nordic Minimalist Pavilion",
      slug: "the-nordic-minimalist-pavilion-aspen",
      description:
        "Modern architectural masterpiece nestled into the slopes of Red Mountain in Aspen. Heated stone terraces, ski-in/ski-out convenience, timber framing, and floor-to-ceiling glass framing snowcapped peaks.",
      price: 16200000,
      propertyType: PropertyType.HOUSE,
      listingType: ListingType.FOR_SALE,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 5,
      bathrooms: 6,
      areaSqFt: 7600,
      garage: 3,
      address: "810 Red Mountain Road",
      city: "Aspen",
      state: "CO",
      zipCode: "81611",
      latitude: 39.1911,
      longitude: -106.8175,
      images: [
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85",
      ],
      amenities: [
        "Ski-in / Ski-out",
        "Outdoor Heated Jacuzzi",
        "Heated Driveway",
        "Custom Fireplace",
        "Custom Cedar Sauna",
      ],
      featured: false,
      agentId: agentMarcus.id,
    },
    {
      title: "The Tribeca Loft Sanctuary",
      slug: "the-tribeca-loft-sanctuary-new-york",
      description:
        "Historic cast-iron architecture re-imagined by renowned designers. Exposed brick, 13-foot timber ceilings, keyed elevator entry, oversized industrial sash windows, and bespoke Italian kitchen finishes.",
      price: 28500,
      propertyType: PropertyType.APARTMENT,
      listingType: ListingType.FOR_RENT,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 3,
      bathrooms: 3,
      areaSqFt: 3800,
      garage: 1,
      address: "68 Franklin Street, 4th Fl",
      city: "New York",
      state: "NY",
      zipCode: "10013",
      latitude: 40.7188,
      longitude: -74.0048,
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=85",
      ],
      amenities: [
        "Direct Keyed Elevator",
        "Cast Iron Details",
        "Gaggenau Appliances",
        "24hr Virtual Doorman",
      ],
      featured: false,
      agentId: agentSarah.id,
    },
    {
      title: "Modernist Hilltop Oasis",
      slug: "modernist-hilltop-oasis-austin",
      description:
        "Sited atop Mount Bonnell with panoramic vistas of Lake Austin. Featuring rammed-earth walls, cantilevered negative-edge pool, private boat slip, and carbon-neutral geothermal heating and cooling.",
      price: 9400000,
      propertyType: PropertyType.HOUSE,
      listingType: ListingType.FOR_SALE,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 4,
      bathrooms: 5,
      areaSqFt: 6200,
      garage: 3,
      address: "3804 Mount Bonnell Rd",
      city: "Austin",
      state: "TX",
      zipCode: "78731",
      latitude: 30.3182,
      longitude: -97.7725,
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      ],
      amenities: [
        "Lake Views",
        "Solar & Geothermal",
        "Negative Edge Pool",
        "Private Boat Slip",
        "Outdoor BBQ Pavilion",
      ],
      featured: false,
      agentId: agentMarcus.id,
    },
    {
      title: "The Pacific Coastline Estate",
      slug: "the-pacific-coastline-estate-malibu",
      description:
        "Private gated compound with deeded path to Malibu's premier surf beach. Master wing features dual baths, panoramic Pacific ocean deck, and detached two-bedroom guest house.",
      price: 21900000,
      propertyType: PropertyType.VILLA,
      listingType: ListingType.FOR_SALE,
      status: PropertyStatus.PENDING,
      bedrooms: 6,
      bathrooms: 7,
      areaSqFt: 9800,
      garage: 4,
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
      amenities: [
        "Private Beach Access",
        "Separate Guest House",
        "Ocean View Deck",
        "Wine Cellar",
        "Lush Gardens",
      ],
      featured: true,
      agentId: agentSarah.id,
    },
    {
      title: "Emerald Bay Skyline Penthouse",
      slug: "emerald-bay-skyline-penthouse-miami",
      description:
        "Spectacular sky mansion atop Biscayne Bay with private rooftop plunge pool, summer kitchen, and wrap-around terrace boasting sunset and sunrise vistas over Miami skyline.",
      price: 18500,
      propertyType: PropertyType.PENTHOUSE,
      listingType: ListingType.FOR_RENT,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 4,
      bathrooms: 4,
      areaSqFt: 5100,
      garage: 2,
      address: "1000 Biscayne Blvd, PH-55",
      city: "Miami",
      state: "FL",
      zipCode: "33132",
      latitude: 25.7844,
      longitude: -80.1901,
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=85",
      ],
      amenities: [
        "Private Rooftop Plunge Pool",
        "24/7 Security & Concierge",
        "Biscayne Bay Views",
        "Helipad Access",
      ],
      featured: false,
      agentId: agentMarcus.id,
    },
    {
      title: "Cheyne Walk Georgian Residence",
      slug: "cheyne-walk-georgian-residence-boston",
      description:
        "Historic Beacon Hill landmark brownstone meticulously restored. Features herringbone French oak flooring, hand-carved marble fireplaces, private landscaped courtyard garden, and custom elevator.",
      price: 11800000,
      propertyType: PropertyType.HOUSE,
      listingType: ListingType.FOR_SALE,
      status: PropertyStatus.SOLD,
      bedrooms: 5,
      bathrooms: 6,
      areaSqFt: 6900,
      garage: 2,
      address: "74 Mount Vernon St",
      city: "Boston",
      state: "MA",
      zipCode: "02108",
      latitude: 42.3588,
      longitude: -71.0678,
      images: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85",
      ],
      amenities: [
        "Courtyard Garden",
        "Original Fireplaces",
        "Private Elevator",
        "Library & Study",
      ],
      featured: false,
      agentId: agentSarah.id,
    },
    {
      title: "The Azure Waterfront Apartment",
      slug: "the-azure-waterfront-apartment-seattle",
      description:
        "Modern luxury living over Puget Sound with unobstructed views of the Olympic Mountains. Includes gas fireplace, chef's kitchen with Sub-Zero suite, and two premier underground garage spots.",
      price: 8200,
      propertyType: PropertyType.APARTMENT,
      listingType: ListingType.FOR_RENT,
      status: PropertyStatus.AVAILABLE,
      bedrooms: 2,
      bathrooms: 2,
      areaSqFt: 2150,
      garage: 2,
      address: "1900 1st Ave, Unit 1802",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      latitude: 47.6101,
      longitude: -122.3421,
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=85",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85",
      ],
      amenities: [
        "Puget Sound Views",
        "Sub-Zero Appliances",
        "Fitness Center",
        "Resident Wine Locker",
      ],
      featured: false,
      agentId: agentMarcus.id,
    },
  ];

  const createdProperties = [];
  for (const propertyData of propertiesData) {
    const prop = await prisma.property.create({
      data: propertyData,
    });
    createdProperties.push(prop);
  }

  console.log(`✅ Created ${createdProperties.length} luxury properties`);

  console.log("⭐ Creating sample user Favorites...");
  await prisma.favorite.create({
    data: {
      userId: buyer.id,
      propertyId: createdProperties[0].id, // Beverly Hills Villa
    },
  });

  await prisma.favorite.create({
    data: {
      userId: buyer.id,
      propertyId: createdProperties[1].id, // Manhattan Sky Penthouse
    },
  });

  await prisma.favorite.create({
    data: {
      userId: buyer.id,
      propertyId: createdProperties[2].id, // Miami Oceanfront
    },
  });

  console.log("📬 Creating sample client Inquiries...");
  await prisma.inquiry.create({
    data: {
      propertyId: createdProperties[0].id,
      userId: buyer.id,
      name: "Eleanor Sterling",
      email: "buyer@prebuiltui.com",
      phone: "+1 (555) 432-1098",
      message:
        "I am looking to schedule a private walkthrough of The Glass Horizon Villa for next Tuesday. Is an NDA required beforehand?",
      tourDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: InquiryStatus.PENDING,
    },
  });

  await prisma.inquiry.create({
    data: {
      propertyId: createdProperties[1].id,
      userId: buyer.id,
      name: "Eleanor Sterling",
      email: "buyer@prebuiltui.com",
      phone: "+1 (555) 432-1098",
      message:
        "Please provide the floor plans and HOA prospectus for the Central Park South penthouse duplex.",
      status: InquiryStatus.CONTACTED,
    },
  });

  await prisma.inquiry.create({
    data: {
      propertyId: createdProperties[4].id,
      name: "Dr. Julian Hayes",
      email: "julian.hayes@medicalgroup.com",
      phone: "+1 (555) 901-2345",
      message:
        "Inquiring about 12-month lease terms for the Tribeca loft starting next month. Can furnishings be included?",
      tourDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: InquiryStatus.PENDING,
    },
  });

  console.log("\n🎉 Seed complete! Summary of test accounts:");
  console.log("--------------------------------------------------");
  console.log("👑 ADMIN:  admin@prebuiltui.com         | PW: admin123");
  console.log("💼 AGENT:  sarah.jenkins@prebuiltui.com | PW: agent123");
  console.log("💼 AGENT:  marcus.vance@prebuiltui.com   | PW: agent123");
  console.log("👤 BUYER:  buyer@prebuiltui.com         | PW: buyer123");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
