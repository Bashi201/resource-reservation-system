import { format, addDays } from "date-fns";

const BASE_URL = "http://localhost:3000";

async function runE2ETests() {
  console.log("🚀 Starting Full End-to-End System & API Verification Matrix...\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${details ? ` -> ${details}` : ""}`);
      failed++;
    }
  }

  // 1. Create Resource
  console.log("--- 1. Resource Management Tests ---");
  const createResourceRes = await fetch(`${BASE_URL}/api/resources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "E2E Innovation Hub " + Date.now(),
      type: "ROOM",
      capacity: 18,
      description: "Equipped with 8K Smartboard and acoustic baffling.",
      status: "AVAILABLE",
    }),
  });

  const createdResource = await createResourceRes.json();
  assert(
    createResourceRes.status === 201 && createdResource.id,
    "Test 1: Create Resource via API",
    `Status: ${createResourceRes.status}`
  );

  // 2. Fetch Resources Catalog
  const listResourcesRes = await fetch(`${BASE_URL}/api/resources`);
  const resourceList = await listResourcesRes.json();
  const foundCreated = resourceList.some((r: { id: string }) => r.id === createdResource.id);
  assert(
    listResourcesRes.status === 200 && foundCreated,
    "Test 2: Resource appears in catalog immediately",
    `Found: ${foundCreated}`
  );

  console.log("\n--- 2. Booking Workflow & Conflict Detection Tests ---");
  const testDate = addDays(new Date(), 10 + Math.floor(Math.random() * 50));
  const dateStr = format(testDate, "yyyy-MM-dd");

  const slot10to12Start = new Date(`${dateStr}T10:00:00Z`);
  const slot10to12End = new Date(`${dateStr}T12:00:00Z`);

  // 3. Valid Booking
  const booking1Res = await fetch(`${BASE_URL}/api/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resourceId: createdResource.id,
      bookerName: "Dr. Sanduni Perera",
      bookerEmail: "sanduni.p@primewave.com",
      title: "AI Research Synthesis",
      startTime: slot10to12Start.toISOString(),
      endTime: slot10to12End.toISOString(),
    }),
  });
  const booking1 = await booking1Res.json();
  assert(
    booking1Res.status === 201 && booking1.id,
    "Test 3: Valid Booking creation",
    `Status: ${booking1Res.status}`
  );

  // 4. Overlapping Booking (11:00 to 13:00 on same resource -> must be rejected)
  const slot11to13Start = new Date(`${dateStr}T11:00:00Z`);
  const slot11to13End = new Date(`${dateStr}T13:00:00Z`);

  const overlapRes = await fetch(`${BASE_URL}/api/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resourceId: createdResource.id,
      bookerName: "Rohan Dias",
      bookerEmail: "rohan.d@primewave.com",
      title: "Conflicting Team Standup",
      startTime: slot11to13Start.toISOString(),
      endTime: slot11to13End.toISOString(),
    }),
  });
  const overlapData = await overlapRes.json();
  assert(
    overlapRes.status === 409 && overlapData.error && overlapData.error.includes("already reserved"),
    "Test 4: Overlapping Booking rejected with 409 Conflict and informative reason",
    `Response: ${JSON.stringify(overlapData)}`
  );

  // 5. Back-to-Back Consecutive Booking (12:00 to 14:00 on same resource -> MUST SUCCEED)
  const slot12to14Start = new Date(`${dateStr}T12:00:00Z`);
  const slot12to14End = new Date(`${dateStr}T14:00:00Z`);

  const backToBackRes = await fetch(`${BASE_URL}/api/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resourceId: createdResource.id,
      bookerName: "Tariq Mansoor",
      bookerEmail: "tariq.m@primewave.com",
      title: "Consecutive Hardware Architecture Review",
      startTime: slot12to14Start.toISOString(),
      endTime: slot12to14End.toISOString(),
    }),
  });
  const backToBackData = await backToBackRes.json();
  assert(
    backToBackRes.status === 201 && backToBackData.id,
    "Test 5: Back-to-Back Booking succeeds (boundary times do not clash)",
    `Status: ${backToBackRes.status}`
  );

  // 6. Inverted Time Validation (End time earlier than start time -> MUST FAIL 400)
  const invertedRes = await fetch(`${BASE_URL}/api/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resourceId: createdResource.id,
      bookerName: "Test Booker",
      bookerEmail: "invalid@primewave.com",
      title: "Inverted Time Meeting",
      startTime: slot10to12End.toISOString(),
      endTime: slot10to12Start.toISOString(),
    }),
  });
  assert(
    invertedRes.status === 400,
    "Test 6: Inverted time range rejected with 400 Validation Error",
    `Status: ${invertedRes.status}`
  );

  // 7. Booking on Different Resource at Exact Same Time (MUST SUCCEED)
  const otherResource = resourceList.find((r: { id: string; status: string }) => r.id !== createdResource.id && r.status === "AVAILABLE");
  if (otherResource) {
    const diffResourceRes = await fetch(`${BASE_URL}/api/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resourceId: otherResource.id,
        bookerName: "Natasha Roman",
        bookerEmail: "natasha.r@primewave.com",
        title: "Parallel Meeting on Different Asset",
        startTime: slot10to12Start.toISOString(),
        endTime: slot10to12End.toISOString(),
      }),
    });
    assert(
      diffResourceRes.status === 201,
      "Test 7: Different resource booking at same time succeeds without clash",
      `Status: ${diffResourceRes.status}`
    );
  }

  // 8. Cancellation and Slot Free-Up Test
  console.log("\n--- 3. Cancellation & Lifecycle Tests ---");
  // Cancel booking1 (10:00 to 12:00)
  const cancelRes = await fetch(`${BASE_URL}/api/reservations/${booking1.id}`, {
    method: "DELETE",
  });
  const cancelData = await cancelRes.json();
  assert(
    cancelRes.status === 200 && cancelData.success === true,
    "Test 8a: Soft cancel reservation successfully",
    `Status: ${cancelRes.status}`
  );

  // Now attempt to re-book that exact same slot (10:00 to 12:00) -> MUST NOW SUCCEED
  const rebookRes = await fetch(`${BASE_URL}/api/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resourceId: createdResource.id,
      bookerName: "Kasun Jayasuriya",
      bookerEmail: "kasun.j@primewave.com",
      title: "Re-booked Freed Slot Session",
      startTime: slot10to12Start.toISOString(),
      endTime: slot10to12End.toISOString(),
    }),
  });
  const rebookData = await rebookRes.json();
  assert(
    rebookRes.status === 201 && rebookData.id,
    "Test 8b: Freed slot immediately re-bookable by another reservation",
    `Status: ${rebookRes.status}`
  );

  // 9. Update Reservation (Modify title / details with self-exclusion)
  const updateRes = await fetch(`${BASE_URL}/api/reservations/${rebookData.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Updated Re-booked Session Title",
      bookerName: "Kasun Jayasuriya (Senior)",
    }),
  });
  const updateData = await updateRes.json();
  assert(
    updateRes.status === 200 && updateData.title === "Updated Re-booked Session Title",
    "Test 9: Update reservation details with self-exclusion pass",
    `Title: ${updateData.title}`
  );

  // 10. Empty / Invalid Inputs
  console.log("\n--- 4. Form Validation & Bad Request Tests ---");
  const invalidEmailRes = await fetch(`${BASE_URL}/api/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resourceId: createdResource.id,
      bookerName: "Bad Data",
      bookerEmail: "not-an-email",
      title: "Hi",
      startTime: slot10to12Start.toISOString(),
      endTime: slot10to12End.toISOString(),
    }),
  });
  assert(
    invalidEmailRes.status === 400,
    "Test 10: Invalid email and short title rejected with 400 Validation Error",
    `Status: ${invalidEmailRes.status}`
  );

  console.log("\n==============================================");
  console.log(`E2E System Verification Matrix Results:`);
  console.log(`Total Checks: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log("==============================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ETests().catch((err) => {
  console.error("E2E Test Error:", err);
  process.exit(1);
});
