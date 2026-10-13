import { PrismaClient, ResourceType, ResourceStatus, ReservationStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing records to allow idempotent re-runs
  await prisma.reservation.deleteMany();
  await prisma.resource.deleteMany();

  const resourcesData = [
    {
      name: "Innovation Boardroom Alpha",
      type: ResourceType.ROOM,
      capacity: 20,
      description: "Flagship executive boardroom equipped with dual 85-inch 4K displays, Polycom conference bar, and motorized blinds.",
      status: ResourceStatus.AVAILABLE,
      imageUrl: null,
    },
    {
      name: "Agile Huddle Room Beta",
      type: ResourceType.ROOM,
      capacity: 6,
      description: "Comfortable glass-walled room designed for hybrid team standups and client video check-ins.",
      status: ResourceStatus.AVAILABLE,
      imageUrl: null,
    },
    {
      name: "Creative Design Studio",
      type: ResourceType.ROOM,
      capacity: 12,
      description: "Collaborative workshop space with floor-to-ceiling whiteboards, high-res color-calibrated monitors, and soundproofing.",
      status: ResourceStatus.AVAILABLE,
      imageUrl: null,
    },
    {
      name: "4K Laser Projector Pro",
      type: ResourceType.EQUIPMENT,
      capacity: 1,
      description: "5,000-lumen ultra-bright portable laser projector with wireless screen mirroring and HDR support.",
      status: ResourceStatus.AVAILABLE,
      imageUrl: null,
    },
    {
      name: "AR/VR Spatial Dev Rig",
      type: ResourceType.EQUIPMENT,
      capacity: 1,
      description: "High-spec workstation with dual RTX 4090 GPUs, Apple Vision Pro, and Meta Quest 3 test units.",
      status: ResourceStatus.AVAILABLE,
      imageUrl: null,
    },
    {
      name: "Studio Podcast Microphone Kit",
      type: ResourceType.EQUIPMENT,
      capacity: 2,
      description: "Shure SM7B broadcast mic package with Cloudlifter and Focusrite Scarlett audio interface.",
      status: ResourceStatus.MAINTENANCE,
      imageUrl: null,
    },
    {
      name: "Executive Hybrid Van",
      type: ResourceType.VEHICLE,
      capacity: 7,
      description: "Luxury 7-passenger VIP van for executive airport transfers, client meetings, and tech delegation transport.",
      status: ResourceStatus.AVAILABLE,
      imageUrl: null,
    },
    {
      name: "Operations Logistics Shuttle",
      type: ResourceType.VEHICLE,
      capacity: 3,
      description: "Spacious commercial utility van equipped with cargo tie-downs for hardware and server transport.",
      status: ResourceStatus.AVAILABLE,
      imageUrl: null,
    },
  ];

  const createdResources = [];
  for (const item of resourcesData) {
    const res = await prisma.resource.create({
      data: item,
    });
    createdResources.push(res);
  }

  console.log(`✅ Created ${createdResources.length} resources.`);

  // Create sample reservations around current day
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  const boardroom = createdResources.find((r) => r.name.includes("Boardroom Alpha"));
  const huddle = createdResources.find((r) => r.name.includes("Huddle Room Beta"));
  const projector = createdResources.find((r) => r.name.includes("Projector"));
  const van = createdResources.find((r) => r.name.includes("Executive Hybrid Van"));

  const sampleReservations = [
    {
      resourceId: boardroom!.id,
      bookerName: "Sarah Jenkins",
      bookerEmail: "sarah.jenkins@primewave.com",
      title: "Q4 Strategy & Engineering All-Hands",
      startTime: new Date(y, m, d, 9, 0, 0),
      endTime: new Date(y, m, d, 10, 30, 0),
      status: ReservationStatus.CONFIRMED,
    },
    {
      resourceId: boardroom!.id,
      bookerName: "Marcus Vance",
      bookerEmail: "marcus.vance@primewave.com",
      title: "Client Architecture Review - TechCorp",
      startTime: new Date(y, m, d, 14, 0, 0),
      endTime: new Date(y, m, d, 15, 30, 0),
      status: ReservationStatus.CONFIRMED,
    },
    {
      resourceId: huddle!.id,
      bookerName: "Niroshan Perera",
      bookerEmail: "niroshan.p@primewave.com",
      title: "Mobile App Sprint Planning",
      startTime: new Date(y, m, d, 10, 0, 0),
      endTime: new Date(y, m, d, 11, 0, 0),
      status: ReservationStatus.CONFIRMED,
    },
    {
      resourceId: projector!.id,
      bookerName: "Elena Rostova",
      bookerEmail: "elena.r@primewave.com",
      title: "Product Launch Demo Rehearsal",
      startTime: new Date(y, m, d, 11, 0, 0),
      endTime: new Date(y, m, d, 13, 0, 0),
      status: ReservationStatus.CONFIRMED,
    },
    {
      resourceId: van!.id,
      bookerName: "Kamal Wickramasinghe",
      bookerEmail: "kamal.w@primewave.com",
      title: "Airport Transfer - Overseas Delegates",
      startTime: new Date(y, m, d + 1, 8, 30, 0),
      endTime: new Date(y, m, d + 1, 11, 0, 0),
      status: ReservationStatus.CONFIRMED,
    },
  ];

  for (const res of sampleReservations) {
    await prisma.reservation.create({
      data: res,
    });
  }

  console.log(`✅ Created ${sampleReservations.length} sample reservations.`);
  console.log("✨ Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
