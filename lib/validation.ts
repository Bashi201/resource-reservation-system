import { z } from "zod";
import { ResourceType, ResourceStatus, ReservationStatus } from "@prisma/client";

export const resourceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Resource name must be at least 2 characters long")
    .max(100, "Resource name cannot exceed 100 characters"),
  type: z.nativeEnum(ResourceType, {
    message: "Resource type must be ROOM, EQUIPMENT, or VEHICLE",
  }),
  description: z.string().trim().max(500, "Description cannot exceed 500 characters").optional().nullable(),
  capacity: z
    .number({ message: "Capacity must be a number" })
    .int("Capacity must be an integer")
    .min(1, "Capacity must be at least 1")
    .max(1000, "Capacity cannot exceed 1000"),
  status: z.nativeEnum(ResourceStatus).default(ResourceStatus.AVAILABLE),
  imageUrl: z.string().trim().optional().nullable(),
});

export const updateResourceSchema = resourceSchema.partial();

export const reservationSchema = z
  .object({
    resourceId: z.string().min(1, "Please select a valid resource"),
    userId: z.string().trim().optional().nullable(),
    bookerName: z
      .string()
      .trim()
      .min(2, "Booker name must be at least 2 characters long")
      .max(100, "Booker name cannot exceed 100 characters"),
    bookerEmail: z
      .string()
      .trim()
      .email("Please provide a valid corporate or personal email address"),
    title: z
      .string()
      .trim()
      .min(3, "Reservation title/purpose must be at least 3 characters long")
      .max(150, "Reservation title cannot exceed 150 characters"),
    startTime: z.coerce.date({
      message: "Invalid start time format",
    }),
    endTime: z.coerce.date({
      message: "Invalid end time format",
    }),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "End time must be later than start time",
    path: ["endTime"],
  })
  .refine(
    (data) => {
      // Must be at least 15 minutes long
      const diffMs = data.endTime.getTime() - data.startTime.getTime();
      return diffMs >= 15 * 60 * 1000;
    },
    {
      message: "Reservation duration must be at least 15 minutes",
      path: ["endTime"],
    }
  );

export const updateReservationSchema = z
  .object({
    title: z.string().trim().min(3).max(150).optional(),
    userId: z.string().trim().optional().nullable(),
    bookerName: z.string().trim().min(2).max(100).optional(),
    bookerEmail: z.string().trim().email().optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    status: z.nativeEnum(ReservationStatus).optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.startTime < data.endTime;
      }
      return true;
    },
    {
      message: "End time must be later than start time",
      path: ["endTime"],
    }
  );

export const userSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please provide a valid email address"),
  username: z.string().trim().min(2, "Username must be at least 2 characters"),
  password: z.string().trim().min(4, "Password must be at least 4 characters").optional(),
  department: z.string().trim().default("Engineering"),
  role: z.string().trim().default("Team Member"),
  roleTier: z.enum(["admin", "user"]).default("user"),
  avatarUrl: z.string().trim().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const updateUserSchema = userSchema.partial();

