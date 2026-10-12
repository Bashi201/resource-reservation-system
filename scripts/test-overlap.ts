import { prisma } from "../lib/db";
import { checkReservationOverlap } from "../lib/overlap";
import { ResourceType, ResourceStatus, ReservationStatus } from "@prisma/client";

async function runTests() {
  console.log("🧪 Starting Overlap Algorithm Verification Tests...\n");

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` (${detail})` : ""}`);
      failedCount++;
    }
  }

  // Setup isolated test resource
  const testResource = await prisma.resource.create({
    data: {
      name: "TEST_SUITE_ROOM_" + Date.now(),
      type: ResourceType.ROOM,
      capacity: 10,
      status: ResourceStatus.AVAILABLE,
    },
  });

  const secondaryResource = await prisma.resource.create({
    data: {
      name: "TEST_SUITE_ROOM_2_" + Date.now(),
      type: ResourceType.ROOM,
      capacity: 5,
      status: ResourceStatus.AVAILABLE,
    },
  });

  const baseDate = new Date(2027, 0, 15, 0, 0, 0);

  const t = (hours: number, minutes: number = 0) => {
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hours, minutes, 0);
  };

  try {
    // 1. Create baseline reservation: 10:00 to 12:00
    const baseline = await prisma.reservation.create({
      data: {
        resourceId: testResource.id,
        bookerName: "Test Suite Lead",
        bookerEmail: "tester@primewave.com",
        title: "Baseline Reservation",
        startTime: t(10, 0),
        endTime: t(12, 0),
        status: ReservationStatus.CONFIRMED,
      },
    });

    // Test 1: Exact match overlap (10:00 to 12:00)
    const test1 = await checkReservationOverlap({
      resourceId: testResource.id,
      startTime: t(10, 0),
      endTime: t(12, 0),
    });
    assert(test1.hasConflict === true, "1. Exact match overlap should be rejected as conflict");

    // Test 2: Partial start overlap (09:00 to 10:30)
    const test2 = await checkReservationOverlap({
      resourceId: testResource.id,
      startTime: t(9, 0),
      endTime: t(10, 30),
    });
    assert(test2.hasConflict === true, "2. Partial start overlap (09:00 - 10:30) should be rejected as conflict");

    // Test 3: Partial end overlap (11:30 to 13:00)
    const test3 = await checkReservationOverlap({
      resourceId: testResource.id,
      startTime: t(11, 30),
      endTime: t(13, 0),
    });
    assert(test3.hasConflict === true, "3. Partial end overlap (11:30 - 13:00) should be rejected as conflict");

    // Test 4: Enclosing time overlap (09:00 to 13:00)
    const test4 = await checkReservationOverlap({
      resourceId: testResource.id,
      startTime: t(9, 0),
      endTime: t(13, 0),
    });
    assert(test4.hasConflict === true, "4. Enclosing time overlap (09:00 - 13:00) should be rejected as conflict");

    // Test 5: Nested inside overlap (10:30 to 11:30)
    const test5 = await checkReservationOverlap({
      resourceId: testResource.id,
      startTime: t(10, 30),
      endTime: t(11, 30),
    });
    assert(test5.hasConflict === true, "5. Nested inside overlap (10:30 - 11:30) should be rejected as conflict");

    // Test 6: Back-to-back before (08:30 to 10:00) - MUST PASS
    const test6 = await checkReservationOverlap({
      resourceId: testResource.id,
      startTime: t(8, 30),
      endTime: t(10, 0),
    });
    assert(test6.hasConflict === false, "6. Back-to-back before (08:30 - 10:00) must SUCCEED with NO conflict");

    // Test 7: Back-to-back after (12:00 to 13:30) - MUST PASS
    const test7 = await checkReservationOverlap({
      resourceId: testResource.id,
      startTime: t(12, 0),
      endTime: t(13, 30),
    });
    assert(test7.hasConflict === false, "7. Back-to-back after (12:00 - 13:30) must SUCCEED with NO conflict");

    // Test 8: Different resource at exact same time (10:00 to 12:00) - MUST PASS
    const test8 = await checkReservationOverlap({
      resourceId: secondaryResource.id,
      startTime: t(10, 0),
      endTime: t(12, 0),
    });
    assert(test8.hasConflict === false, "8. Different resource at exact same time must SUCCEED with NO conflict");

    // Test 9: Cancelled booking slot reuse
    // Create a cancelled booking from 14:00 to 16:00
    await prisma.reservation.create({
      data: {
        resourceId: testResource.id,
        bookerName: "Cancelled Booker",
        bookerEmail: "cancel@primewave.com",
        title: "Cancelled Booking",
        startTime: t(14, 0),
        endTime: t(16, 0),
        status: ReservationStatus.CANCELLED,
      },
    });

    const test9 = await checkReservationOverlap({
      resourceId: testResource.id,
      startTime: t(14, 0),
      endTime: t(16, 0),
    });
    assert(test9.hasConflict === false, "9. Overlap with CANCELLED reservation must SUCCEED (slot successfully freed)");

    // Test 10: Self-exclusion on update
    const test10 = await checkReservationOverlap({
      resourceId: testResource.id,
      startTime: t(10, 0),
      endTime: t(12, 0),
      excludeReservationId: baseline.id,
    });
    assert(test10.hasConflict === false, "10. Self-exclusion during edit of same reservation must SUCCEED");

    console.log(`\n================================`);
    console.log(`Total tests run: ${passedCount + failedCount}`);
    console.log(`Passed: ${passedCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log(`================================\n`);

    if (failedCount > 0) {
      throw new Error(`${failedCount} tests failed`);
    }
  } finally {
    // Clean up test records
    await prisma.reservation.deleteMany({
      where: {
        resourceId: { in: [testResource.id, secondaryResource.id] },
      },
    });
    await prisma.resource.deleteMany({
      where: {
        id: { in: [testResource.id, secondaryResource.id] },
      },
    });
    await prisma.$disconnect();
  }
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
